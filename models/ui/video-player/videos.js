'use strict';

const Collection = require('models/collection');
const VideoModel = require('./video');

module.exports = Collection.extend({
  model: VideoModel
});
