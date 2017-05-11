/**
 * @fileOverview Base class for asset
 */
'use strict';

const Model = require('models/model');
const assetMixin = require('../assets/_helpers/asset-mixin');
const assetsConstants = require('../../constants/assets/assets');

const Asset = Model.extend(assetMixin).extend({
  defaults: function() {
    return {
      // TODO @adokuchaev: maybe NOT_INITIALIZE=1 by default for do not start player?
      status: assetsConstants.statuses.FINISHED,
      type: assetsConstants.types.IMAGE,
      uploadError: false
    };
  },

  setUploadSuccess: function() {
    return this.set('uploadError', false);
  },

  setUploadError: function() {
    return this.set('uploadError', true);
  },

  isUploadError: function() {
    return this.get('uploadError');
  }

});

module.exports = Asset;
