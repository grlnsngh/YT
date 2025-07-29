/**
 * Helpers for video/audio format size calculation and processing.
 * @module formatHelpers
 */

const { spawn } = require('child_process');

/**
 * Get the size string for a given format (video+audio or single).
 * @param {string} ytdlpCommand - The yt-dlp command to use.
 * @param {string} formatString - The format selector string.
 * @param {string} url - The video URL.
 * @returns {Promise<string>} Size string (e.g., '36.0 MB', 'unknown size').
 */
async function getSizeForFormat(ytdlpCommand, formatString, url) {
  // If this is a merged format (video+audio), get size for each part and sum
  const match = formatString.match(/^bestvideo\[height=(\d+)\]\+bestaudio/);
  if (match) {
    const height = match[1];
    // Get bestvideo[height=...] and bestaudio separately
    const videoFormat = `bestvideo[height=${height}]`;
    const audioFormat = `bestaudio`;
    const [videoSize, audioSize] = await Promise.all([
      getSizeForFormatSingle(ytdlpCommand, videoFormat, url),
      getSizeForFormatSingle(ytdlpCommand, audioFormat, url)
    ]);
    let totalBytes = 0;
    if (!isNaN(videoSize)) totalBytes += videoSize;
    if (!isNaN(audioSize)) totalBytes += audioSize;
    let sizeStr = 'unknown size';
    if (totalBytes > 0) {
      sizeStr = totalBytes > 1024*1024*1024
        ? (totalBytes/1024/1024/1024).toFixed(2)+" GB"
        : (totalBytes/1024/1024).toFixed(1)+" MB";
    }
    return sizeStr;
  }
  // Otherwise, just get size for the format as a whole
  const bytes = await getSizeForFormatSingle(ytdlpCommand, formatString, url);
  let sizeStr = 'unknown size';
  if (!isNaN(bytes) && bytes > 0) {
    sizeStr = bytes > 1024*1024*1024
      ? (bytes/1024/1024/1024).toFixed(2)+" GB"
      : (bytes/1024/1024).toFixed(1)+" MB";
  }
  return sizeStr;
}

/**
 * Get the size in bytes for a single format (uses filesize then filesize_approx).
 * @param {string} ytdlpCommand - The yt-dlp command to use.
 * @param {string} formatString - The format selector string.
 * @param {string} url - The video URL.
 * @returns {Promise<number>} Size in bytes, or NaN if unknown.
 */
async function getSizeForFormatSingle(ytdlpCommand, formatString, url) {
  return new Promise((resolve) => {
    let mainCmd, args;
    if (ytdlpCommand.includes(' ')) {
      const parts = ytdlpCommand.split(' ');
      mainCmd = parts.shift();
      args = [...parts, '-f', formatString, '--no-download', '--print', '%(filesize)d', '--print', '%(filesize_approx)d', url];
    } else {
      mainCmd = ytdlpCommand;
      args = ['-f', formatString, '--no-download', '--print', '%(filesize)d', '--print', '%(filesize_approx)d', url];
    }
    let output = '';
    const proc = spawn(mainCmd, args);
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.on('close', (code) => {
      let bytes = NaN;
      if (code === 0 && output) {
        // Try to find the first valid number in output (filesize, then filesize_approx)
        const lines = output.trim().split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const n = parseInt(line, 10);
          if (!isNaN(n) && n > 0) {
            bytes = n;
            break;
          }
        }
      }
      resolve(bytes);
    });
    proc.on('error', () => resolve(NaN));
  });
}

module.exports = {
  getSizeForFormat,
  getSizeForFormatSingle
};
