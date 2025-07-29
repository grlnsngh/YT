// src/services/ipcHandlers.js
// Centralized IPC handler registration for Electron main process

const { ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { getCurrentDownloadDir, setCustomDownloadPath } = require('./utils');

function registerIpcHandlers(mainWindow, ytdlpCommandRef, helpers) {
  // Destructure helpers for downloadVideo, getVideoInfo, etc.
  const { downloadVideo, getVideoInfo } = helpers;

  ipcMain.handle('download-video', async (event, url, format) => {
    downloadVideo(url, format)
      .then((result) => {
        mainWindow.webContents.send('download-complete', result);
      })
      .catch((error) => {
        const errorResult = {
          success: false,
          error: error.message,
          url,
        };
        mainWindow.webContents.send('download-complete', errorResult);
      });
    return { success: true, message: 'Download started' };
  });

  const { getSizeForFormat } = require('./formatHelpers');
  const path = require('node:path');
  const fs = require('fs');
  const os = require('os');
  const checkSystemFFmpeg = () => {
    try {
      const { execSync } = require('child_process');
      execSync('ffmpeg -version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  };

  ipcMain.handle('get-video-info', async (event, url) => {
    try {
      const info = await getVideoInfo(url);
      if (!info || typeof info !== 'object' || !info.formats) {
        return { success: false, error: 'Invalid video info received' };
      }

      // --- Begin original processedFormats logic ---
      const processedFormats = [];
      const localFFmpeg = path.join(os.homedir(), 'YT', 'ffmpeg.exe');
      const hasFFmpeg = fs.existsSync(localFFmpeg) || checkSystemFFmpeg();
      if (info.formats && Array.isArray(info.formats)) {
        const availableVideoFormats = info.formats.filter(
          (f) => f.vcodec && f.vcodec !== 'none' && f.height && f.height > 0
        );
        const availableAudioFormats = info.formats.filter(
          (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
        );
        const videoFormats = availableVideoFormats;
        const uniqueHeights = [...new Set(videoFormats.map((f) => f.height))].sort((a, b) => b - a);
        const formatPromises = uniqueHeights.map(async (height) => {
          const formatString = `bestvideo[height=${height}]+bestaudio/best[height=${height}]`;
          const sizeStr = await getSizeForFormat(ytdlpCommandRef.value, formatString, url);
          let label = `${height}p`;
          if (height >= 2160) label += ' (4K Ultra HD)';
          else if (height >= 1440) label += ' (2K Quad HD)';
          else if (height >= 1080) label += ' (Full HD)';
          else if (height >= 720) label += ' (HD)';
          else if (height >= 480) label += ' (SD)';
          label += ` - ${sizeStr}`;
          return {
            id: formatString,
            name: label,
          };
        });
        const formatResults = await Promise.all(formatPromises);
        processedFormats.push(...formatResults);
        // Add audio-only option at the end
        if (availableAudioFormats.length > 0) {
          const bestAudio = availableAudioFormats.reduce((best, curr) => {
            if (!best) return curr;
            if ((curr.abr || 0) > (best.abr || 0)) return curr;
            return best;
          }, null);
          let audioSize = bestAudio && (bestAudio.filesize || bestAudio.filesize_approx) ?
            (bestAudio.filesize || bestAudio.filesize_approx) : 0;
          let audioSizeStr = 'unknown size';
          if (audioSize > 0) {
            if (audioSize > 1024*1024*1024) {
              audioSizeStr = (audioSize/1024/1024/1024).toFixed(2)+' GB';
            } else {
              audioSizeStr = (audioSize/1024/1024).toFixed(1)+' MB';
            }
          } else {
            audioSizeStr = await getSizeForFormat(ytdlpCommandRef.value, 'bestaudio', url);
          }
          processedFormats.push({ id: 'bestaudio', name: `Audio Only - ${audioSizeStr}` });
        }
      } else {
        processedFormats.push(
          { id: 'bestvideo[height>=2160]+bestaudio', name: '2160p (4K Ultra HD)' },
          { id: 'bestvideo[height>=1440]+bestaudio', name: '1440p (2K Quad HD)' },
          { id: 'bestvideo[height>=1080]+bestaudio', name: '1080p (Full HD)' },
          { id: 'bestvideo[height>=720]+bestaudio', name: '720p (HD)' },
          { id: 'bestvideo[height>=480]+bestaudio', name: '480p (SD)' },
          { id: 'bestaudio', name: 'Audio Only' }
        );
      }
      // --- End original processedFormats logic ---

      mainWindow.webContents.send('formats-received', processedFormats);
      return {
        success: true,
        ...info,
        formats: processedFormats,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('check-yt-dlp', async () => {
    return ytdlpCommandRef.value !== null;
  });

  ipcMain.handle('open-downloads-folder', async () => {
    const currentDownloadDir = getCurrentDownloadDir();
    shell.openPath(currentDownloadDir);
  });

  ipcMain.handle('select-download-path', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  ipcMain.handle('choose-download-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Choose Download Folder',
    });
    if (!result.canceled && result.filePaths.length > 0) {
      setCustomDownloadPath(result.filePaths[0]);
      return {
        success: true,
        path: result.filePaths[0],
      };
    }
    return {
      success: false,
      error: 'No folder selected',
    };
  });
}

module.exports = { registerIpcHandlers };
