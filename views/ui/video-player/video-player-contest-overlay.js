'use strict';

const View = require('views/view');
const Model = require('models/model');
const VideoPlayer = require('views/ui/video-player/video-player');
const VideoPlayerContest = require('views/video-contest/contest-videos/contest-videos-view');
const Overlay = require('views/ui/overlay');
const isDesktop = require('features').isDesktop();

module.exports = View.extend({

  events: {
    click: 'onClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    if (isDesktop) {
      this.videoPlayer = new VideoPlayerContest({
        model: this.model,
        player: {
          width: '100%',
          aspectratio: '16:9'
        }
      });
    } else {
      this.videoPlayer = new VideoPlayer({
        model: this.model,
        player: {
          width: '100%',
          aspectratio: '16:9'
        }
      });
    }

    if (isDesktop) {
      this.overlay = new Overlay({
        model: new Model({
          title: this.model.get('name')
        }),
        withoutStack: true,
        mods: ['stretch']
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
