'use strict';

const $ = require('jquery');
const View = require('views/view');
const MediaLibraryOverlay = require('views/elements/assets/media-library/media-library-overlay');
const UsedAssetsController = require('./insert-asset/used-assets-controller');
const AssetsSynchronizer = require('./insert-asset/asssets-synchronizer');

module.exports = View.extend({

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.assetsMediaLibraryOverlay = new MediaLibraryOverlay({
      directoryId: this.options.directoryId
    });
    const renderData = this.options.renderData || {};
    this.usedAssetsController = new UsedAssetsController({
      directoryId: this.options.directoryId,
      assetsData: renderData.assets
    });
    this.assetsSynchronizer = new AssetsSynchronizer({
      usedAssetsController: this.usedAssetsController
    });
    this.listenTo(this.assetsMediaLibraryOverlay, 'select create', this.onAssetSelect);
    this.listenTo(this.usedAssetsController, 'asset:remove', this.onAssetRemoveClick);
    this.listenTo(this.usedAssetsController, 'asset:change:status', this.onAssetStatusChange);
  },

  render: function() {
    this.setElementToSubView(this.$el, this.assetsMediaLibraryOverlay);
    this.setElementToSubView(this.$el, this.usedAssetsController);
    return this.renderDone();
  },

  remove: function() {
    this.assetsSynchronizer.stop();
    return View.prototype.remove.apply(this, arguments);
  },

  showMediaLibraryOverlay: function() {
    this.assetsMediaLibraryOverlay.showMediaLibraryOverlay();
  },

  insertAsset: function(assetModel) {
    this.editor.currentView.element.focus();
    if (this.caretBookmark) {
      this.editor.composer.selection.setBookmark(this.caretBookmark);
      this.caretBookmark = null;
    }
    this.insertAssetToEditor(assetModel);
    this.usedAssetsController.addAsset(assetModel.clone());
    this.editor.resizeHeight(160);
    this.trigger('asset:insert');
  },

  removeAsset: function(assetId) {
    this.usedAssetsController.removeAsset(assetId);
    this.removeAssetInEditor(assetId);
  },

  removeAssetInEditor: function(assetId) {
    const $el = $('<div></div>');
    $el.html(this.editor.getValue());
    $el.find(`img[data-id=${assetId}]`).remove();
    this.editor.setValue($el.html());
  },

  updateAssetInEditor: function(assetModel) {
    const $el = $('<div></div>');
    $el.html(this.editor.getValue());
    const assetSrc = this.getAssetImage(assetModel);
    $el.find(`img[data-id=${assetModel.get('id')}]`).attr('src', assetSrc);
    this.editor.setValue($el.html());
  },

  insertAssetToEditor: function(assetModel) {
    this.editor.composer.commands.exec('insertImage', this.getInsertAssetData(assetModel));
  },

  getInsertAssetData: function(assetModel) {
    return {
      src: this.getAssetImage(assetModel),
      'data-id': assetModel.get('id'),
      class: 'wysiwyg__asset'
    };
  },

  getAssetImage: function(assetModel) {
    if (assetModel.isProcessing()) {
      return '/img/image-placeholder.jpg';
    }
    return assetModel.getImage('320x160');
  },

  setEditor: function(editor) {
    this.editor = editor;
    this.editor.on('load', this.onEditorLoad.bind(this));
    this.editor.on('image:click', this.onAssetClick.bind(this));
    this.assetsSynchronizer.setWysiwygEditor(this.editor);
    return this;
  },

  setBookmark: function(caretBookmark) {
    this.caretBookmark = caretBookmark;
    return this;
  },

  showAssetCaptionForm: function(assetId) {
    this.usedAssetsController.showAssetCaptionForm(assetId);
  },

  setUsedAssetsData: function(assets) {
    return this.usedAssetsController.setAssetsData(assets);
  },

  syncronizeUsedAssetsWithAssetsInEditor: function() {
    // @todo need to this since user can manually remove asset;
  },

  getUsedAssetsData: function() {
    return this.usedAssetsController.getAssetsData();
  },

  onEditorLoad: function() {
    this.assetsSynchronizer.start();
  },

  onAssetSelect: function(assetModel) {
    this.insertAsset(assetModel);
    this.showAssetCaptionForm(assetModel.get('id'));
  },

  onAssetClick: function(imageTarget) {
    const assetId = $(imageTarget).data('id');
    this.showAssetCaptionForm(assetId);
  },

  onAssetRemoveClick: function(assetId) {
    this.removeAsset(assetId);
  },

  onAssetStatusChange: function(data) {
    this.updateAssetInEditor(data);
  }

});
