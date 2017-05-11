/*
 * @fileOverview Wrapper for JWPlayer
 *
 */
'use strict';

// jshint ignore:start
/*
Embed settings example

jwplayer('jwplayer-player').setup({
  flashplayer: '/js/jwplayer/jwplayer.flash.swf',
  width: 610,
  height: 342,
  primary: 'flash',
  autostart: true,
  playlist: [{
    image: "//assets.football.com/topic/51678099-0f48-5d50-98df-b4d85fb061eb1422457296.3978-thmb-630x354-img.jpg?1422460274",
    sources: [{
      file: "rtmp://stream.football.com/cfx/st/flv:topic/51678099-0f48-5d50-98df-b4d85fb061eb1422457296.3978-630x354.flv?1422460274",
      type: 'rtmp'
    }, {
      file: "//assets.football.com/topic/51678099-0f48-5d50-98df-b4d85fb061eb1422457296.3978-mp4630x354.mp4?1422460274"
    }, {
      file: "//assets.football.com/topic/51678099-0f48-5d50-98df-b4d85fb061eb1422457296.3978-webm630x354.webm?1422460274"
    }]
  }]
});
*/
// jshint ignore:end

const _ = require('underscore');
const config = require('config');
const vent = require('runtime/vent');
const utils = require('utils');
const View = require('views/view');
const jwplayer = require('jwplayer');
const videoStackController = require('./video-players-stack');

global.jwplayer = jwplayer;
jwplayer.key = config.jwplayerKey;

const POSTER_SIZE = '980x480';
const FORMATS_AUDIO = ['high', 'low'];
const FORMATS_VIDEO = ['mp4hd720', 'webmhd720', 'webm630x354', 'mp4630x354', 'webmhvga', 'mp4hvga'];
const RTMP_FORMATS = ['flvhd720', '630x354', 'flvhvga'];

module.exports = View.extend({

  defaults: {
    flashplayer: '/jwplayer/jwplayer.flash.swf',
    width: '100%',
    height: '100%'
  },

  id: function() {
    return 'player-' + this.model.cid;
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.listenTo(vent, 'video:init', this.onVideoInit);
  },

  remove: function() {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.remove();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  render: function() {
    const id = this.getId();
    if (this.el.id !== id) this.el.id = id;
    return this.renderDone();
  },
  /**
   * Initialize and run player
   */
  init: function() {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.setup(this.getPlayerOptions());
      videoStackController.addVideo(this);
    }
  },

  getPlayerOptions: function() {
    const options = _.extend({}, this.defaults, this.options.player, {
      events: {
        onPlay: this.onVideoStarting.bind(this),
        onComplete: this.completeVideo.bind(this),
        onError: this.onPlaybackError.bind(this),
        onFullscreen: this.onFullscreen.bind(this)
      }
    });
    options.playlist = this.getPlaylist();
    return options;
  },

  getId: function() {
    return _.result(this, 'id');
  },

  getInstance: function() {
    return jwplayer(this.getId());
  },

  getPlaylist: function() {
    const playlist = [];
    const item = {};
    const media = this.model.getVideoPlaylist ? this.model.getVideoPlaylist() : [];
    let poster;
    let sources = [];

    if (media) {
      poster = media[POSTER_SIZE];
      if (poster) {
        item.image = utils.getFullMediaSrc(poster.name);
      }

      sources = sources.concat(this.getSources(media, FORMATS_AUDIO));
      sources = sources.concat(this.getSources(media, FORMATS_VIDEO));
      item.sources = sources.concat(this.getStreamingSources(media));

      playlist.push(item);
    }
    return playlist;
  },

  setMedia: function(media) {
    this.options.media = media;
  },

  setDimensions: function(dimensions) {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.resize(dimensions.width, dimensions.height);
    }
  },

  /**
   * When video complete don't exit full screen
   */
  completeVideo: function() {
    this.stop();
    this.trigger('video:complete');
  },

  /**
   * Get sources to player over HTTP
   */
  getSources: function(mediaList, format) {
    const files = _.pick(mediaList, format);

    return _.map(files, (file, key) => {
      return {
        file: utils.getFullVideoSrc(file.name),
        label: this.getQualityLabel(key)
      };
    }, this);
  },

  /**
   * Get sources to player over RTMP streaming
   */
  getStreamingSources: function(mediaList) {
    const files = _.pick(mediaList, RTMP_FORMATS);

    return _.map(files, (file, key) => {
      return {
        file: config.streamingURL + 'flv:' + file.name,
        label: this.getQualityLabel(key),
        type: 'rtmp'
      };
    }, this);
  },

  /**
   * Stops the player (returning it to the idle state) and unloads the currently playing media file.
   */
  stop: function() {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.stop();
    }
  },

  /**
   * Toggles playback of the player. If the state is set true the player will start playing,
   * if set false the player will pause and if omitted, the player will toggle playback.
   */
  play: function() {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.play(true);
    }
  },

  /**
   * Toggles playback of the player. If the state is set true the player will pause,
   * if set false the player will start playing and if omitted, the player will toggle playback.
   */
  pause: function() {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      if (this.isBuffering()) {
        this.stop();
      } else if (jwplayerInstance.pause) {
        jwplayerInstance.pause(true);
      }
    }
  },

  toggleMute: function(mute) {
    const jwplayerInstance = this.getInstance();
    if (jwplayerInstance) {
      jwplayerInstance.setMute(mute);
    }
  },

  isBuffering: function() {
    return this.getPlayerStatus() === 'BUFFERING';
  },

  /**
   * Note: JW7 will return playback states in lower case. If you are using JW6,
   * states will be returned in all capital letters. We suggest using toUpperCase()
   * if this affects your API setup.
   * Statuses:
   * idle - either playback has not started or playback was stopped
   *        (due to a stop() call or an error). Either the play or the error icon is visible
   *        in the display.
   *
   * buffering - user pressed play, but sufficient data to start playback has to be loaded first.
   *             The buffering icon is visible in the display.
   * playing - the video is currently playing. No icon is visible in the display.
   * paused - the video is currently paused. The play icon is visible in the display.
   */
  getPlayerStatus: function() {
    const jwplayerInstance = this.getInstance();
    let status = jwplayerInstance && jwplayerInstance.getState && jwplayerInstance.getState();
    if (status) {
      status = status.toUpperCase();
    }
    return status;
  },

  isFullscreen: function() {
    const jwplayerInstance = this.getInstance();
    return jwplayerInstance &&
      jwplayerInstance.getFullscreen &&
      jwplayerInstance.getFullscreen();
  },

  /**
   * Return label for quality selector
   */
  getQualityLabel: function(quality) {
    switch (quality) {
      case 'webmhvga':
      case 'mp4hvga':
      case 'flvhvga':
      case 'low':
        return 'LD';

      case 'webm630x354':
      case 'mp4630x354':
      case '630x354':
      case 'low':
        return 'SD';

      case 'mp4hd720':
      case 'webmhd720':
      case 'flvhd720':
      case 'high':
        return 'HD';
    }
  },

  tryToDowngradeQuality: function() {
    const jwplayerInstance = this.getInstance();
    let qualityLevels;
    let currentQuality;
    if (jwplayerInstance) {
      qualityLevels = jwplayerInstance.getQualityLevels();
      currentQuality = jwplayerInstance.getCurrentQuality();
      if (currentQuality < qualityLevels.length - 1) {
        jwplayerInstance.setCurrentQuality(currentQuality + 1);
        return true;
      }
    }
    return false;
  },

  isFileCouldNotBePlayedError: function(error) {
    if (!error) return false;
    if (error.type !== 'jwplayerError') return false;
    return error.message === 'Error loading media: File could not be played';
  },

  onVideoInit: function() {
    this.init();
  },

  onPlaybackError: function(error) {
    if (this.isFileCouldNotBePlayedError(error)) {
      this.tryToDowngradeQuality();
    }
  },

  onVideoStarting: function() {
    this.trigger('video:starting', this);
  },

  onFullscreen: function() {
    vent.trigger('video:fullscreen', this);
  }

});
