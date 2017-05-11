'use strict';

const View = require('views/view');
const VideoPlayer = require('views/ui/video-player/video-player');
const template = require('elements/slider/templates/slide.nunj');

module.exports = View.extend({

  template: template,
  className: 'slider__slide',
  videoPlayer: null,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.showActionZoom = this.options.showActionZoom;
    this.showCaption = this.options.showCaption;
  },

  render: function() {
    this.renderTemplate({
      showActionZoom: this.showActionZoom,
      showCaption: this.showCaption
    });
    this.initVideoPlayer();
    if (this.videoPlayer) {
      this.subRender('.js-video-player', this.videoPlayer);
    }
    return this.renderDone();
  },

  initVideoPlayer: function() {
    if (!this.videoPlayer) {
      if (this.model.isFinishedMedia()) {
        this.videoPlayer = new VideoPlayer({
          model: this.model,
          media: this.model.get('media')
        });

        this.listenTo(this.model, 'change:isActive', this.onActiveChange);
      }
    }
  },

  isNeedToAutoPlayVideo: function() {
    return this.options.autoPlayVideo;
  },

  stopVideo: function() {
    if (this.videoPlayer) {
      this.videoPlayer.stop();
    }
  },

  onActiveChange: function(model, value) {
    if (value) {
      if (this.isNeedToAutoPlayVideo()) {
        this.videoPlayer.play();
      }
    } else {
      this.videoPlayer.pause();
    }
  }

});
