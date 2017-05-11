'use strict';

/**
 * @class VideosStackController
 */
class VideosStackController {

  addVideo(videoView) {
    this._initVideoListeners(videoView);
  }

  _initVideoListeners(videoView) {
    videoView.on('video:starting', this._onVideoStarting.bind(this));
  }

  _handleVideoStart(videoView) {
    if (!this._isActiveView(videoView)) {
      this._pauseActiveVideoView();
    }
    this.activeVideoView = videoView;
  }

  _isActiveView(view) {
    return this.activeVideoView && this.activeVideoView.cid === view.cid;
  }

  _pauseActiveVideoView() {
    if (this.activeVideoView) {
      this.activeVideoView.pause();
      delete this.activeVideoView;
    }
  }

  _onVideoStarting(view) {
    this._handleVideoStart(view);
  }

}
/**
 * It should be initiated only once
 * @type {VideosStackController}
 */
const videosStackController = new VideosStackController();

module.exports = videosStackController;
