'use strict';

const _ = require('underscore');
const wysiwygTranslator = require('views/ui/wysiwyg/translator');

const SYNC_INTERVAL = 500;

class WysiwygAssetsSynchronizer {

  /**
   * @param {Object} options
   * @property options.usedAssetsController
   * @property options.editor
   * @property options.interval
   */
  constructor(options = {}) {
    this.usedAssetsController = null;
    this.wysiwygEditor = null;
    this._syncInterval = null;
    this.interval = options.interval || SYNC_INTERVAL;
    if (options.usedAssetsController) {
      this.setUsedAssetsController(options.usedAssetsController);
    }
    if (options.editor) {
      this.setWysiwygEditor(options.editor);
    }
  }

  setUsedAssetsController(usedAssetsController) {
    this.usedAssetsController = usedAssetsController;
  }

  setWysiwygEditor(wysiwygEditor) {
    this.wysiwygEditor = wysiwygEditor;
  }

  start() {
    this._setSyncInterval();
  }

  stop() {
    this._clearSyncInterval();
  }

  sync() {
    const usedAssetIdsInEditor = this._getUsedAssetIdsInEditor();
    this._removeUnusedAssetsFromController(usedAssetIdsInEditor);
  }

  /**
   *
   * @private
   */
  _setSyncInterval() {
    this._clearSyncInterval();
    this._syncInterval = setInterval(this.sync.bind(this), this.interval);
  }

  /**
   *
   * @private
   */
  _clearSyncInterval() {
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
    }
  }

  /**
   *
   * @returns Array
   * @private
   */
  _getUsedAssetIdsInEditor() {
    const assets = wysiwygTranslator.getUsedAssetsDataFromWysiwyg(this.wysiwygEditor.getValue());
    return _.map(assets, asset => asset.id);
  }

  /**
   *
   * @param usedAssetIdsInEditor
   * @private
   */
  _removeUnusedAssetsFromController(usedAssetIdsInEditor) {
    _.each(this.usedAssetsController.getAssetsData(), (asset) => {
      if (_.indexOf(usedAssetIdsInEditor, asset.id) === -1) {
        this.usedAssetsController.removeAsset(asset.id);
      }
    });
  }

}

module.exports = WysiwygAssetsSynchronizer;
