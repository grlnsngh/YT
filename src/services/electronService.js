// Service for handling Electron API interactions
class ElectronService {
  constructor() {
    this.api = window.electronAPI;
  }

  offDownloadProgress() {
    if (!this.isAvailable()) return;
    this.api.removeAllListeners('download-progress');
  }

  offDownloadComplete() {
    if (!this.isAvailable()) return;
    this.api.removeAllListeners('download-complete');
  }

  offFormatsReceived() {
    if (!this.isAvailable()) return;
    this.api.removeAllListeners('formats-received');
  }

  isAvailable() {
    return !!this.api;
  }

  async downloadVideo(url, format) {
    if (!this.isAvailable()) {
      throw new Error('Electron API not available');
    }
    return await this.api.downloadVideo(url, format);
  }

  async getVideoInfo(url) {
    if (!this.isAvailable()) {
      throw new Error('Electron API not available');
    }
    return await this.api.getVideoInfo(url);
  }

  async chooseDownloadFolder() {
    if (!this.isAvailable()) {
      throw new Error('Electron API not available');
    }
    return await this.api.chooseDownloadFolder();
  }

  onDownloadProgress(callback) {
    if (!this.isAvailable()) return;
    this.api.onDownloadProgress(callback);
  }

  onDownloadComplete(callback) {
    if (!this.isAvailable()) return;
    this.api.onDownloadComplete(callback);
  }

  onFormatsReceived(callback) {
    if (!this.isAvailable()) return;
    this.api.onFormatsReceived(callback);
  }
}

export const electronService = new ElectronService();
