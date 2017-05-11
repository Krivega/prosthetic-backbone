'use strict';

const Model = require('models/model');

module.exports = Model.extend({
  getVideoPlaylist: function() {
    return this.get('media');
  }
});
