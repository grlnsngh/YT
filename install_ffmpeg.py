#!/usr/bin/env python3
"""
FFmpeg Auto-Installer for Windows
Downloads and installs FFmpeg automatically
"""

import os
import sys
import urllib.request
import zipfile
import shutil
from pathlib import Path

def download_ffmpeg():
    """Download and install FFmpeg for Windows"""
    
    # Get the directory where this script is located
    app_dir = Path(__file__).parent
    
    # FFmpeg download URL for Windows
    ffmpeg_url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    
    print("🔄 Downloading FFmpeg...")
    
    # Download the zip file
    zip_path = app_dir / "ffmpeg_temp.zip"
    
    try:
        # Download with progress
        def show_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = min(100, (downloaded / total_size) * 100)
                print(f"\r📥 Progress: {percent:.1f}%", end="", flush=True)
        
        urllib.request.urlretrieve(ffmpeg_url, zip_path, show_progress)
        print("\n✅ Download completed!")
        
        # Extract the zip file
        print("📂 Extracting FFmpeg...")
        extract_dir = app_dir / "ffmpeg_temp"
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Find ffmpeg.exe in the extracted files
        ffmpeg_exe = None
        for root, dirs, files in os.walk(extract_dir):
            if "ffmpeg.exe" in files:
                ffmpeg_exe = Path(root) / "ffmpeg.exe"
                break
        
        if ffmpeg_exe and ffmpeg_exe.exists():
            # Copy ffmpeg.exe to the app directory
            target_path = app_dir / "ffmpeg.exe"
            shutil.copy2(ffmpeg_exe, target_path)
            print(f"✅ FFmpeg installed to: {target_path}")
            
            # Clean up temporary files
            shutil.rmtree(extract_dir, ignore_errors=True)
            zip_path.unlink(missing_ok=True)
            
            return True
        else:
            print("❌ Could not find ffmpeg.exe in downloaded package")
            return False
            
    except Exception as e:
        print(f"❌ Error downloading FFmpeg: {e}")
        return False
    
    finally:
        # Clean up on any error
        if zip_path.exists():
            zip_path.unlink(missing_ok=True)
        if extract_dir.exists():
            shutil.rmtree(extract_dir, ignore_errors=True)

def check_ffmpeg():
    """Check if FFmpeg is already available"""
    
    app_dir = Path(__file__).parent
    local_ffmpeg = app_dir / "ffmpeg.exe"
    
    # Check local ffmpeg.exe first
    if local_ffmpeg.exists():
        print("✅ Local FFmpeg found!")
        return True
    
    # Check system PATH
    try:
        import subprocess
        result = subprocess.run(["ffmpeg", "-version"], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ System FFmpeg found!")
            return True
    except:
        pass
    
    print("⚠️ FFmpeg not found")
    return False

if __name__ == "__main__":
    print("🎬 FFmpeg Auto-Installer")
    print("=" * 30)
    
    if not check_ffmpeg():
        print("📥 Installing FFmpeg...")
        if download_ffmpeg():
            print("🎉 FFmpeg installation completed successfully!")
            print("🔄 Please restart your YouTube downloader app.")
        else:
            print("❌ FFmpeg installation failed.")
            print("📝 Manual installation instructions:")
            print("1. Download FFmpeg from: https://ffmpeg.org/download.html")
            print("2. Extract and add to your system PATH")
            print("3. Or place ffmpeg.exe in this folder")
    else:
        print("✅ FFmpeg is already available!")
