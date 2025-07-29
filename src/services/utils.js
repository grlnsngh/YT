// src/services/utils.js
// Utility functions for Electron main process

const path = require('node:path');
const fs = require('fs');
const os = require('os');

// Use config or env for download dir
const config = require('../config.json');

let customDownloadPath = null;

function getDownloadsDir() {
  // Prefer config, fallback to default
  return config.downloadsDir || path.join(os.homedir(), 'Downloads', 'YT-Downloads');
}

function getCurrentDownloadDir() {
  const currentDir = customDownloadPath || getDownloadsDir();
  if (!fs.existsSync(currentDir)) {
    fs.mkdirSync(currentDir, { recursive: true });
  }
  return currentDir;
}

function setCustomDownloadPath(dir) {
  customDownloadPath = dir;
}

function getCustomDownloadPath() {
  return customDownloadPath;
}

module.exports = {
  getDownloadsDir,
  getCurrentDownloadDir,
  setCustomDownloadPath,
  getCustomDownloadPath,
};
