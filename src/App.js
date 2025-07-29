import React, { useEffect, useRef, useState } from "react";
import { getUserFriendlyStatus } from "./utils/statusMessages";
import "./App.css";

// Custom hooks
import { useDownloader } from "./hooks/useDownloader";
import { useDownloadHistory } from "./hooks/useDownloadHistory";

// Services
import { electronService } from "./services/electronService";

// Components
import URLInput from "./components/URLInput";
import VideoInfoCard from "./components/VideoInfoCard";
import FormatSelection from "./components/FormatSelection";
import DownloadPathSelector from "./components/DownloadPathSelector";
import ProgressSection from "./components/ProgressSection";
import StatusMessage from "./components/StatusMessage";
import DownloadHistory from "./components/DownloadHistory";

function App() {
  const {
    // State
    url,
    format,
    isDownloading,
    isGettingInfo,
    progress,
    maxProgress,
    downloadSpeed,
    eta,
    status,
    availableFormats,
    downloadPath,
    videoInfo,
    downloaded,
    total,
    // Actions
    setUrl,
    setFormat,
    setIsDownloading,
    setIsGettingInfo,
    setStatus,
    setAvailableFormats,
    setDownloadPath,
    setVideoInfo,
    // Helpers
    handleProgressUpdate,
    resetDownloadState,
    clearURL,
    clearVideoInfo,
    lastSpeedUpdateRef,
  } = useDownloader();

  const { downloadHistory, addToHistory, clearHistory, copyToClipboard } =
    useDownloadHistory();

  // Track post-processing state robustly
  const [isPostProcessing, setIsPostProcessing] = useState(false);

  useEffect(() => {
    // Check if electronAPI is available
    if (!electronService.isAvailable()) {
      setStatus(
        "⚠️ Electron API not detected. Make sure you are running this in Electron, not a web browser."
      );
      return;
    }

    // Set up event listeners with current functions

    const progressHandler = (progressData) => {
      // If status contains 'processing', 'merging', or 'ffmpeg', set post-processing state
      const rawStatus = progressData.status
        ? progressData.status.toLowerCase()
        : "";
      // Post-processing state logic
      if (
        rawStatus.includes("processing") ||
        rawStatus.includes("merging") ||
        rawStatus.includes("ffmpeg")
      ) {
        setIsPostProcessing(true);
      } else {
        setIsPostProcessing(false);
      }
      // Always update speed/eta/progress with the original status
      handleProgressUpdate(progressData);
      // Only update the user-facing status message for display
      const userFriendlyStatus = getUserFriendlyStatus(rawStatus);
      if (userFriendlyStatus) {
        setStatus(userFriendlyStatus);
      }
    };

    const completeHandler = (result) => {
      setIsDownloading(false);
      setIsPostProcessing(false);
      if (result.success) {
        setStatus("✅ Download completed successfully!");
        clearURL(); // Auto-clear URL after successful download
        // Attach video title if available
        let historyEntry = { ...result };
        if (!historyEntry.title && videoInfo && videoInfo.title) {
          historyEntry.title = videoInfo.title;
        }
        addToHistory(historyEntry);
        resetDownloadState();
      } else {
        resetDownloadState();
        setStatus(`Error: ${result.error}`);
      }
    };

    const formatsHandler = (formats) => {
      console.log("Formats received:", formats);
      setAvailableFormats(formats);
      // Automatically select the first (best quality) format
      if (formats.length > 0) {
        setFormat(formats[0].id);
      }
    };

    electronService.onDownloadProgress(progressHandler);
    electronService.onDownloadComplete(completeHandler);
    electronService.onFormatsReceived(formatsHandler);

    // Only set a default message if status is empty (first load)
    setStatus((prev) =>
      prev && prev.trim()
        ? prev
        : "✅ Ready! Enter a YouTube URL to get started."
    );

    // Cleanup: remove listeners on unmount or dependency change
    return () => {
      electronService.offDownloadProgress();
      electronService.offDownloadComplete();
      electronService.offFormatsReceived();
    };
  }, [
    handleProgressUpdate,
    resetDownloadState,
    clearURL,
    addToHistory,
    setStatus,
    setAvailableFormats,
    setFormat,
  ]);

  const handleDownload = async () => {
    if (!url.trim()) {
      setStatus("Please enter a valid YouTube URL");
      return;
    }

    // If no format is selected or availableFormats is empty, use 'bestvideo+bestaudio/best' for highest quality
    let chosenFormat = format;
    if (!chosenFormat || !availableFormats.length) {
      chosenFormat = "bestvideo+bestaudio/best";
      setFormat("bestvideo+bestaudio/best");
    }

    setIsDownloading(true);
    resetDownloadState();
    setStatus("Starting download...");

    try {
      await electronService.downloadVideo(url, chosenFormat);
      // Progress updates will come via onDownloadProgress events
      // Completion will come via onDownloadComplete events
    } catch (error) {
      console.log("Download error occurred:", error.message);
      setStatus(`Error starting download: ${error.message}`);
      setIsDownloading(false);
    }
  };

  const handleGetInfo = async () => {
    if (!url.trim()) {
      setStatus("Please enter a valid YouTube URL");
      return;
    }

    setIsGettingInfo(true);
    setStatus("Getting video information...");
    clearVideoInfo(); // Clear previous video info

    try {
      const result = await electronService.getVideoInfo(url);
      if (result.success) {
        setVideoInfo(result); // Store all video info
        setStatus("✅ Video information loaded successfully");
        // Formats will be set via the onFormatsReceived event listener
      } else {
        setStatus(`Error getting video info: ${result.error}`);
        setAvailableFormats([]); // Clear formats on error
        setVideoInfo(null);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setAvailableFormats([]); // Clear formats on error
      setVideoInfo(null);
    } finally {
      setIsGettingInfo(false);
    }
  };

  const handleChooseFolder = async () => {
    try {
      const result = await electronService.chooseDownloadFolder();
      if (result.success) {
        setDownloadPath(result.path);
        setStatus(`Download folder changed to: ${result.path}`);
      }
    } catch (error) {
      setStatus(`Error choosing folder: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isDownloading && !isGettingInfo && url.trim()) {
      handleGetInfo();
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setStatus("Download history cleared");
  };

  const handleCopyUrl = async (urlToCopy) => {
    const result = await copyToClipboard(urlToCopy);
    setStatus(result.message);
  };

  // Only show progress bar if downloading and not post-processing
  const showProgressBar = isDownloading && !isPostProcessing;

  // Progress value: if post-processing, keep at 100%, otherwise use progress directly
  const progressValue = isPostProcessing ? 100 : progress;

  // Download button label
  let downloadButtonLabel = "Download Video";
  if (isDownloading) {
    downloadButtonLabel = isPostProcessing ? "Processing..." : "Downloading...";
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎥 YouTube Video Downloader</h1>
        <p>Free YouTube video downloader powered by yt-dlp</p>
      </header>

      <main className="App-main">
        <div className="download-section">
          <URLInput
            url={url}
            onUrlChange={setUrl}
            onKeyPress={handleKeyPress}
            onGetInfo={handleGetInfo}
            isDownloading={isDownloading}
            isGettingInfo={isGettingInfo}
          />

          <VideoInfoCard videoInfo={videoInfo} />

          <FormatSelection
            availableFormats={availableFormats}
            selectedFormat={format}
            onFormatChange={setFormat}
            isDownloading={isDownloading}
          />

          <DownloadPathSelector
            downloadPath={downloadPath}
            onChooseFolder={handleChooseFolder}
            isDownloading={isDownloading}
          />

          <button
            onClick={handleDownload}
            disabled={isDownloading || !url.trim()}
            className={`download-button ${isDownloading ? "downloading" : ""}`}
          >
            {downloadButtonLabel}
          </button>

          {/* Show a clear processing indicator when in post-processing phase */}
          {isPostProcessing && (
            <div
              className="processing-indicator"
              style={{
                margin: "16px 0",
                fontWeight: "bold",
                color: "#f39c12",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                className="processing-spinner"
                style={{ marginRight: 8 }}
              ></div>
              Processing video... Please wait while we merge audio and video.
            </div>
          )}

          {/* Show progress bar only during download, keep at 100% if processing */}
          {console.log("downloadSpeed:", downloadSpeed)}
          {console.log("eta:", eta)}
          {showProgressBar && (
            <ProgressSection
              isDownloading={isDownloading}
              status={status}
              progress={progressValue}
              downloadSpeed={downloadSpeed}
              eta={eta}
              downloaded={downloaded}
              total={total}
            />
          )}

          <StatusMessage status={status} isDownloading={isDownloading} />
        </div>

        <DownloadHistory
          downloadHistory={downloadHistory}
          onClearHistory={handleClearHistory}
          onCopyUrl={handleCopyUrl}
        />
      </main>

      <footer className="App-footer">
        <p>Built with Electron + React + yt-dlp</p>
        <p>⚠️ Please respect copyright laws and use responsibly</p>
      </footer>
    </div>
  );
}

export default App;
