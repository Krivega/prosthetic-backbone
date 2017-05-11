'use strict';

const View = require('views/view');
const AssetCaptionFormOverlay = require('views/elements/assets/asset-form/asset-caption-form-overlay'); // jshint ignore:line

module.exports = View.extend({

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.assetCaptionFormOverlay = new AssetCaptionFormOverlay();
    this.assets = {};
    this.listenTo(this.assetCaptionFormOverlay, 'save', this.onAssetCaptionFormSave);
    this.listenTo(this.assetCaptionFormOverlay, 'asset:remove', this.onAssetCaptionFormRemove);
  },

  render: function() {
    this.setElementToSubView(this.$el, this.assetCaptionFormOverlay);
    return this.renderDone();
  },

  addAsset: function(asset) {
    this.assets[asset.get('id')] = asset;
  },

  getAssets: function() {
    return this.assets;
  },

  showAssetForm: function(assetId) {
    const asset = this._getAssetById(assetId);
    if (asset) {
      this.assetCaptionFormOverlay.showAssetForm(asset.toJSON());
    }
  },

  updateAssetCaption: function(data) {
    const asset = this._getAssetById(data.id);
    asset.set('caption', data.caption);
  },

  _getAssetById: function(id) {
    return this.assets[id];
  },

  onAssetCaptionFormSave: function(data) {
    this.updateAssetCaption(data);
  },

  onAssetCaptionFormRemove: function(data) {
    this.trigger('asset:remove', data.id);
  }

});
