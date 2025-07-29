
const { app, BrowserWindow, dialog, shell } = require("electron/main");
const path = require("node:path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const config = require("./src/config.json");

const { getCurrentDownloadDir, setCustomDownloadPath } = require("./src/services/utils.js");
const { registerIpcHandlers } = require("./src/services/ipcHandlers.js");
const downloadService = require("./src/services/downloadService.js");

let mainWindow = null;

let ytdlpCommand = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
  });

  // In development, load from localhost. In production, load the built files.
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    // Load from React dev server
    mainWindow.loadURL("http://localhost:3000");
    // Open DevTools in development
    mainWindow.webContents.openDevTools();

    // Log when page loads
    mainWindow.webContents.once("did-finish-load", () => {
      console.log("React app loaded successfully");
    });

    // Handle load failures
    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error("Failed to load React app:", errorCode, errorDescription);
        // If localhost:3000 fails, show an error
        if (errorCode === -102) {
          // ERR_CONNECTION_REFUSED
          mainWindow.loadFile(path.join(__dirname, "error.html"));
        }
      }
    );
  } else {
    mainWindow.loadFile(path.join(__dirname, "build/index.html"));
  }
}


// Register IPC handlers in a separate module
const ytdlpCommandRef = { value: null };
function helpersFactory() {
  return {
    downloadVideo: (url, format) => downloadService.downloadVideo(ytdlpCommand, url, format, mainWindow),
    getVideoInfo: (url) => downloadService.getVideoInfo(ytdlpCommand, url),
  };
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  createWindow();

  // Check if yt-dlp is available
  const ytdlpResult = await downloadService.checkYtDlp(__dirname);
  if (ytdlpResult.found) {
    ytdlpCommand = ytdlpResult.command;
    ytdlpCommandRef.value = ytdlpCommand;
    // Also check if FFmpeg is available for merging
    const ffmpegAvailable = await downloadService.checkFFmpeg(__dirname);
    if (!ffmpegAvailable) {
      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "FFmpeg Not Found",
        message: "FFmpeg is not installed on your system.",
        detail:
          "The app will work fine, but high-quality videos (4K, 1440p) may download as separate video and audio files.\n\nFor automatic merging, install FFmpeg:\n\n1. Download: https://ffmpeg.org/download.html\n2. Extract and add to your system PATH\n3. Restart the app\n\nOr place ffmpeg.exe in this folder:\n" +
          __dirname,
        buttons: ["Continue"],
      });
    }
  } else {
    ytdlpCommand = null;
    ytdlpCommandRef.value = null;
    dialog.showErrorBox(
      "yt-dlp not found",
      "yt-dlp is required but not found on your system.\n\n" +
        "SOLUTION:\n" +
        "1. Download yt-dlp.exe from: https://github.com/yt-dlp/yt-dlp/releases\n" +
        "2. Place yt-dlp.exe in this folder: " +
        __dirname +
        "\n" +
        "3. Restart the application\n\n" +
        "OR install Python and run: pip install yt-dlp"
    );
  }

  // Register all IPC handlers
  registerIpcHandlers(mainWindow, ytdlpCommandRef, helpersFactory());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
