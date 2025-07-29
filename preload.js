const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script is running...')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Download video
  downloadVideo: (url, format) => {
    // Clean logging to avoid URL corruption  
    return ipcRenderer.invoke('download-video', url, format)
  },
  
  // Get video information
  getVideoInfo: (url) => {
    // Remove the console.log that was causing URL corruption
    return ipcRenderer.invoke('get-video-info', url)
  },
  
  // Check if yt-dlp is available
  checkYtDlp: () => {
    console.log('checkYtDlp called')
    return ipcRenderer.invoke('check-yt-dlp')
  },
  
  // Open downloads folder
  openDownloadsFolder: () => ipcRenderer.invoke('open-downloads-folder'),
  
  // Select download path
  selectDownloadPath: () => ipcRenderer.invoke('select-download-path'),
  
  // Choose download folder
  chooseDownloadFolder: () => ipcRenderer.invoke('choose-download-folder'),
  
  // Listen for download progress updates
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, data) => callback(data))
  },
  
  // Listen for download completion
  onDownloadComplete: (callback) => {
    ipcRenderer.on('download-complete', (event, result) => callback(result))
  },
  
  // Listen for video formats
  onFormatsReceived: (callback) => {
    ipcRenderer.on('formats-received', (event, formats) => callback(formats))
  },
  
  // Remove listeners (cleanup)
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

console.log('electronAPI exposed successfully')

// Also expose version information for display
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded in preload')
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
