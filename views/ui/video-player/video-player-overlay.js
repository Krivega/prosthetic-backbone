'use strict';

const View = require('views/view');
const VideoPlayer = require('views/ui/video-player/video-player');
const Overlay = require('views/ui/overlay');
const isDesktop = require('features').isDesktop();

module.exports = View.extend({

  events: {
    click: 'onClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.videoPlayer = new VideoPlayer({
      model: this.model,
      player: {
        width: '100%',
        aspectratio: '16:9'
      }
    });

    if (isDesktop) {
      this.overlay = new Overlay({
        model: this.options.overlayModel,
        withoutStack: true,
        mods: ['stretch', 'height-auto']
      });

      this.listenTo(this.overlay, 'show:finished', this.onOverlayShow);
      this.listenTo(this.overlay, 'close', this.onOverlayClose);
    }
  },

  render: function() {
    if (isDesktop) {
      this.overlay.render();
    } else {
      this.setElementToSubView(this.videoPlayer);

      this.videoPlayer.init();
    }
    return View.prototype.render.apply(this, arguments);
  },

  onClick: function() {
    if (isDesktop) {
      this.showVideo();
      return false;
    }
  },

  showVideo: function() {
    this.overlay.show(this.videoPlayer);
    this.videoPlayer.init();
  },

  onOverlayShow: function() {
    this.videoPlayer.play();
  },

  onOverlayClose: function() {
    this.videoPlayer.stop();
  }

});
