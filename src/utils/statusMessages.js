// src/utils/statusMessages.js
// Utility for mapping yt-dlp/ffmpeg status lines to user-friendly messages

export function getUserFriendlyStatus(status) {
  // Extraction and info
  if (status.startsWith('[youtube] extracting url')) return 'Extracting video URL...';
  if (status.startsWith('[youtube]') && status.includes('downloading webpage')) return 'Loading video page...';
  if (status.startsWith('[youtube]') && status.includes('downloading tv client config')) return 'Loading video config...';
  if (status.startsWith('[youtube]') && status.includes('downloading tv player api json')) return 'Loading player info...';
  if (status.startsWith('[youtube]') && status.includes('downloading ios player api json')) return 'Loading iOS player info...';
  if (status.startsWith('[youtube]') && status.includes('downloading m3u8 information')) return 'Loading stream info...';
  if (status.startsWith('[info]') && status.includes('downloading')) return 'Preparing download...';
  if (status.startsWith('destination:')) return 'Saving video file...';
  // Download progress
  if (status.startsWith('[download]')) {
    return 'Downloading...';
  }
  if (status.startsWith('[download]') && status.includes('in')) {
    return 'Download complete.';
  }
  // Processing/merging
  if (
    status.startsWith('[merger]') ||
    status.includes('merging') ||
    status.includes('processing') ||
    status.includes('ffmpeg')
  ) {
    return 'Processing video... Please wait while we merge audio and video.';
  }
  if (status.startsWith('deleting original file')) return '';
  // Default: show nothing for technical/unknown lines
  return '';
}
