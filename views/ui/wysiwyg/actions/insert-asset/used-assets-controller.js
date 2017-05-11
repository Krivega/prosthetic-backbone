'use strict';

const _ = require('underscore');
const View = require('views/view');
const AssetsCollection = require('models/pages/assets');
const AssetStatusUpdater = require('views/elements/assets/media-library/asset-status-updater');
const AssetCaptionFormOverlay = require('views/elements/assets/asset-form/asset-caption-form-overlay'); // jshint ignore:line

module.exports = View.extend({

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.assetCaptionFormOverlay = new AssetCaptionFormOverlay();
    const assets = _.map(this.options.assetsData, (item) => {
      return _.extend(item.asset, {
        caption: item.caption
      });
    });
    this.assetsCollection = new AssetsCollection(assets);
    this.assetsStatusUpdater = new AssetStatusUpdater({
      directoryId: this.options.directoryId,
      assetsCollection: this.assetsCollection
    });
    this.listenTo(this.assetCaptionFormOverlay, 'save', this.onAssetCaptionFormSave);
    this.listenTo(this.assetCaptionFormOverlay, 'asset:remove', this.onAssetCaptionFormRemove);
    this.listenTo(this.assetsCollection, 'add remove', this.onAssetsCollectionChange);
    this.listenTo(this.assetsCollection, 'change:status', this.onAssetStatusChange);
  },

  render: function() {
    this.setElementToSubView(this.$el, this.assetCaptionFormOverlay);
    return this.renderDone();
  },

  setAssetsData: function(assets) {
    return this.assetsCollection.reset(assets);
  },

  addAsset: function(asset) {
    this.assetsCollection.add(asset.toJSON());
  },

  removeAsset: function(assetId) {
    this.assetsCollection.remove(assetId);
  },

  getAssetsData: function() {
    return this.assetsCollection.map((asset) => {
      return {
        id: asset.get('id'),
        caption: asset.get('caption')
      };
    });
  },

  getAssets: function() {
    return this.assetsCollection;
  },

  getAssetMedia: function(assetId, suffix) {
    const asset = this._getAssetById(assetId);
    return asset.getImage(suffix);
  },

  showAssetCaptionForm: function(assetId) {
    const asset = this._getAssetById(assetId);
    if (asset) {
      this.assetCaptionFormOverlay.showAssetForm(asset.toJSON());
    }
  },

  updateAssetsStatuses: function() {
    this.assetsStatusUpdater.update();
  },

  updateAssetCaption: function(data) {
    const asset = this._getAssetById(data.id);
    asset.set('caption', data.caption);
  },

  _getAssetById: function(id) {
    return this.assetsCollection.get(id);
  },

  onAssetsCollectionChange: function() {
    this.updateAssetsStatuses();
  },

  onAssetCaptionFormSave: function(data) {
    this.updateAssetCaption(data);
  },

  onAssetCaptionFormRemove: function(data) {
    this.trigger('asset:remove', data.id);
  },

  onAssetStatusChange: function(data) {
    this.trigger('asset:change:status', data);
  }

});
