// src/services/downloadService.js
// Handles yt-dlp, ffmpeg, and download logic for Electron main process

const path = require("node:path");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const { getCurrentDownloadDir } = require("./utils");

// Check if yt-dlp is available
async function checkYtDlp(appDir) {
  return new Promise((resolve) => {
    const possibleCommands = [
      path.join(appDir, "yt-dlp.exe"),
      "yt-dlp",
      "python -m yt_dlp",
      "py -m yt_dlp",
      "python3 -m yt_dlp",
    ];
    let commandIndex = 0;
    function tryNextCommand() {
      if (commandIndex >= possibleCommands.length) {
        resolve({ found: false, command: null });
        return;
      }
      const cmd = possibleCommands[commandIndex];
      let mainCmd, cmdArgs;
      if (cmd.includes(" ")) {
        const args = cmd.split(" ");
        mainCmd = args.shift();
        cmdArgs = [...args, "--version"];
      } else {
        mainCmd = cmd;
        cmdArgs = ["--version"];
      }
      const ytdlp = spawn(mainCmd, cmdArgs);
      ytdlp.on("close", (code) => {
        if (code === 0) {
          resolve({ found: true, command: cmd });
        } else {
          commandIndex++;
          tryNextCommand();
        }
      });
      ytdlp.on("error", () => {
        commandIndex++;
        tryNextCommand();
      });
    }
    tryNextCommand();
  });
}

// Check if system FFmpeg is available (synchronous)
function checkSystemFFmpeg() {
  try {
    const { execSync } = require("child_process");
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Check if FFmpeg is available (async)
async function checkFFmpeg(appDir) {
  return new Promise((resolve) => {
    const localFFmpeg = path.join(appDir, "ffmpeg.exe");
    if (fs.existsSync(localFFmpeg)) {
      resolve(true);
      return;
    }
    const ffmpeg = spawn("ffmpeg", ["-version"]);
    ffmpeg.on("close", (code) => {
      resolve(code === 0);
    });
    ffmpeg.on("error", () => resolve(false));
  });
}

// Download video using yt-dlp
async function downloadVideo(ytdlpCommand, url, format, mainWindow) {
  return new Promise((resolve, reject) => {
    if (!ytdlpCommand) {
      resolve({ success: false, error: "yt-dlp command not set", url });
      return;
    }
    const downloadDir = getCurrentDownloadDir();
    let mainCmd, cmdArgs;
    if (ytdlpCommand.includes(" ")) {
      const args = ytdlpCommand.split(" ");
      mainCmd = args.shift();
      cmdArgs = [
        ...args,
        url,
        "-f",
        format,
        "-o",
        path.join(downloadDir, "%(title)s.%(ext)s"),
      ];
    } else {
      mainCmd = ytdlpCommand;
      cmdArgs = [
        url,
        "-f",
        format,
        "-o",
        path.join(downloadDir, "%(title)s.%(ext)s"),
      ];
    }
    let errorOutput = "";
    const ytdlp = spawn(mainCmd, cmdArgs);
    function handleProgressData(data) {
      const text = data.toString();
      errorOutput += text;
      const progressRegex = /\[download\]\s+(\d{1,3}\.\d)% of ([0-9.]+[KMG]?i?B)(?: at\s+([^ ]+\/s))?(?: ETA ([^\n\r]+))?/;
      const match = text.match(progressRegex);
      function parseBytes(str) {
        if (!str) return null;
        const units = {
          B: 1,
          KB: 1024,
          MB: 1024 * 1024,
          GB: 1024 * 1024 * 1024,
        };
        const m = str.match(/([0-9.]+)\s*([KMG]?i?B)/i);
        if (!m) return null;
        let num = parseFloat(m[1]);
        let unit = m[2].toUpperCase().replace("IB", "B");
        return num * (units[unit] || 1);
      }
      if (match && mainWindow) {
        const percent = parseFloat(match[1]);
        const total = parseBytes(match[2]);
        const downloaded = total && percent ? (percent / 100) * total : null;
        const speed = match[3] || null;
        const eta = match[4] || null;
        let status = text.replace(/^\[download\]/, "").trim();
        mainWindow.webContents.send("download-progress", {
          progress: percent,
          downloaded,
          total,
          status,
          speed,
          eta,
        });
      } else if (mainWindow) {
        // Try to extract percent from any [download] line
        const percentMatch = text.match(/\[download\]\s+(\d{1,3}\.\d)%/);
        let progress = undefined;
        if (percentMatch) {
          progress = parseFloat(percentMatch[1]);
        }
        let status = text.replace(/^\[download\]/, "").trim();
        mainWindow.webContents.send("download-progress", progress !== undefined ? { progress, status } : { status });
      }
    }
    ytdlp.stderr.on("data", handleProgressData);
    ytdlp.stdout.on("data", handleProgressData);
    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, url });
      } else {
        resolve({ success: false, error: errorOutput || "yt-dlp failed", url });
      }
    });
    ytdlp.on("error", (err) => {
      resolve({
        success: false,
        error: "Failed to start yt-dlp: " + err.message,
        url,
      });
    });
  });
}

// Get video information
async function getVideoInfo(ytdlpCommand, url) {
  return new Promise((resolve, reject) => {
    if (!ytdlpCommand) {
      reject(new Error("yt-dlp command not set"));
      return;
    }
    let mainCmd, cmdArgs;
    if (ytdlpCommand.includes(" ")) {
      const args = ytdlpCommand.split(" ");
      mainCmd = args.shift();
      cmdArgs = [...args, "-j", "--no-playlist", url];
    } else {
      mainCmd = ytdlpCommand;
      cmdArgs = ["-j", "--no-playlist", url];
    }
    let output = "";
    let errorOutput = "";
    const ytdlp = spawn(mainCmd, cmdArgs);
    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });
    ytdlp.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    ytdlp.on("close", (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve(info);
        } catch (err) {
          reject(new Error("Failed to parse yt-dlp output: " + err.message));
        }
      } else {
        reject(
          new Error("yt-dlp exited with code " + code + ": " + errorOutput)
        );
      }
    });
    ytdlp.on("error", (err) => {
      reject(new Error("Failed to start yt-dlp: " + err.message));
    });
  });
}

// Auto-download FFmpeg using Python script
async function downloadFFmpeg(appDir, mainWindow) {
  // ...copy logic from main.js, but use appDir and mainWindow as params...
}

module.exports = {
  checkYtDlp,
  checkSystemFFmpeg,
  checkFFmpeg,
  downloadVideo,
  getVideoInfo,
  downloadFFmpeg,
};
