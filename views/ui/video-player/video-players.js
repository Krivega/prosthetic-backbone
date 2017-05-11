'use strict';

const View = require('views/view');
const router = require('runtime/router');
const features = require('features');
const vent = require('runtime/vent');

const resizeEventName = require('utils').getEvents().changeWindow;

module.exports = View.extend({
  timeoutResize: null,
  _lastInViewInOverlay: null,
  isFullscreen: false,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    if (this.options.overlay) {
      this.handleResizeInit();

      this.listenTo(vent, 'video:fullscreen', this.onFullscreen);
      $window.on(this.getEventName(resizeEventName), this.onResize.bind(this));
    }
  },

  remove: function() {
    $window.off(this.getEventName(resizeEventName));
    return View.prototype.remove.apply(this, arguments);
  },

  render: function() {
    this.initVideoPlayersOnPage();
    return View.prototype.render.apply(this, arguments);
  },

  initVideoPlayersOnPage: function() {
    this.$('.js-video-player').each((index, el) => {
      const $el = this.$(el);
      const id = $el.data('id');
      if (id) {
        this.createVideoPlayer(id, $el)
          .then(this.initVideoPlayer.bind(this));
      }
    });
  },

  createVideoPlayer: function(videoId, $el) {
    const model = this.collection.get(videoId);
    if (!model) {
      return this;
    }
    return new Promise((resolve) => {
      require.ensure([], () => {
        let VideoPlayer;
        if (this.options.overlay) {
          VideoPlayer = require('./video-player-contest-overlay');
        } else {
          VideoPlayer = require('./video-player');
        }
        const videoPlayerView = new VideoPlayer({
          model: model,
          player: {
            width: '100%',
            aspectratio: '16:9'
          }
        });
        resolve({
          videoPlayerView,
          $el
        });
      });
    });
  },

  initVideoPlayer: function(options) {
    this.setElementToSubView(options.$el, options.videoPlayerView);
    if (!this.options.overlay) {
      options.videoPlayerView.init();
    }
  },

  hasViewInOverlay: function() {
    return features.isDesktop();
  },

  handleResizeInit: function() {
    this._lastInViewInOverlay = this.hasViewInOverlay();
  },

  handleResize: function() {
    if (this.isFullscreen) {
      return;
    }
    if (this._lastInViewInOverlay !== this.hasViewInOverlay()) {
      router.reload();
    }
    this._lastInViewInOverlay = this.hasViewInOverlay();
  },

  onResize: function() {
    if (this.timeoutResize) {
      clearTimeout(this.timeoutResize);
    }
    this.timeoutResize = setTimeout(this.handleResize.bind(this), 1000);
  },

  onFullscreen: function(playerView) {
    this.isFullscreen = playerView.isFullscreen();
  }

});
