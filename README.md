# YouTube Video Downloader

A free, open-source YouTube video downloader built with Electron, React, and yt-dlp.

## 🚀 Features

- Download YouTube videos in various formats and qualities
- Audio-only downloads
- Real-time download progress
- Download history tracking
- Clean, modern React UI
- Cross-platform (Windows, macOS, Linux)

## 📋 Prerequisites

Before running this application, you need to install **yt-dlp**:

### Option 1: Install via Python (Recommended)
1. **Install Python** (if not already installed):
   - Download from [python.org](https://www.python.org/downloads/)
   - Make sure to check "Add Python to PATH" during installation

2. **Install yt-dlp**:
   ```bash
   pip install yt-dlp
   ```

### Option 2: Direct Download (Windows)
1. Download the latest yt-dlp.exe from [GitHub releases](https://github.com/yt-dlp/yt-dlp/releases)
2. Place it in a folder that's in your system PATH, or in the same folder as this app

### Option 3: Using Package Managers
- **Windows (Chocolatey)**: `choco install yt-dlp`
- **Windows (Scoop)**: `scoop install yt-dlp`
- **macOS (Homebrew)**: `brew install yt-dlp`
- **Linux (apt)**: `sudo apt install yt-dlp`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm install
npm run dev
```

### Production Mode
```bash
npm install
npm run react-build
npm start
```

## 🎯 How to Use

1. **Launch the application**
2. **Paste a YouTube URL** in the input field
3. **Click "Get Info"** to see available formats (optional)
4. **Select your preferred format** from the dropdown
5. **Click "Download Video"** to start downloading
6. **Videos are saved** to `~/Downloads/YT-Downloads/`

## 📁 Project Structure

```
youtube-downloader-electron/
├── main.js           # Electron main process
├── preload.js        # Preload script for secure IPC
├── package.json      # Dependencies and scripts
├── src/              # React application
│   ├── App.js        # Main React component
│   ├── App.css       # Styling
│   ├── index.js      # React entry point
│   └── index.css     # Global styles
└── public/           # Static assets
    └── index.html    # HTML template
```

## 🛠️ Architecture

```
Electron (Main Process)
│
├── Uses Node.js to run yt-dlp subprocess
├── Handles file system operations
├── Manages download progress
│
└── Loads React UI (Renderer Process)
    ├── URL input and validation
    ├── Format selection
    ├── Progress display
    └── Download history
```

## ⚡ Building for Distribution

```bash
npm run build
```

This will create a distributable version of the app in the `dist/` folder.

## 🔧 Configuration

Downloads are saved to: `~/Downloads/YT-Downloads/`

You can modify the download location in `main.js` by changing the `downloadsDir` variable.

## 📝 Supported Formats

- **Video**: MP4, WebM, MKV, etc.
- **Audio**: MP3, M4A, OGG, etc.
- **Quality**: 4K, 1080p, 720p, 480p, etc.

## ⚠️ Legal Notice

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Only download content you have permission to download.

## 🐛 Troubleshooting

### "yt-dlp not found" Error
- Make sure yt-dlp is installed and accessible from command line
- Try running `yt-dlp --version` in terminal to verify installation

### Download Fails
- Check if the YouTube URL is valid
- Some videos may be restricted or require authentication
- Try different format options

### Performance Issues
- Large video files may take time to download
- Check your internet connection
- Close other bandwidth-intensive applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful YouTube downloader
- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [React](https://reactjs.org/) - User interface library
