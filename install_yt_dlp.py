import os
import sys
import urllib.request

YT_DLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
YT_DLP_FILENAME = "yt-dlp.exe"


def download_yt_dlp(dest_folder="."):
    dest_path = os.path.join(dest_folder, YT_DLP_FILENAME)
    if os.path.exists(dest_path):
        print(f"{YT_DLP_FILENAME} already exists. Skipping download.")
        return
    print(f"Downloading yt-dlp.exe from {YT_DLP_URL} ...")
    try:
        urllib.request.urlretrieve(YT_DLP_URL, dest_path)
        print(f"Downloaded yt-dlp.exe to {dest_path}")
    except Exception as e:
        print(f"Failed to download yt-dlp.exe: {e}")
        sys.exit(1)


if __name__ == "__main__":
    download_yt_dlp()
