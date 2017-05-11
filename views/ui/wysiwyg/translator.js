'use strict';

const _ = require('underscore');
const $ = require('jquery');
const utils = require('../../../utils');

const ASSET_PLACEHOLDER_PATH = '/img/image-placeholder.jpg';
const ASSET_TEMPLATE = '<asset id="%s"></asset>';
const ASSET_TEMPLATE_REG_EXP = new RegExp(/<asset id="([a-z0-9\-]+)">/gm);
// const ASSET_TEMPLATE = '[asset:%s]';
// const ASSET_TEMPLATE_REG_EXP = new RegExp(/\[asset:([a-z0-9\-]+)\]/gm);

class WysiwygTranslator {

  translateForWysiwyg(data, renderData) {
    renderData = renderData || {};
    const assets = renderData.assets || {};
    const assetsData = {};
    _.each(assets, (item) => {
      const asset = item.asset;
      assetsData[item.id] = {
        id: item.id,
        type: asset.type,
        caption: item.caption,
        src: this._getAssetSrc(asset)
      };
    });
    data = data.replace(ASSET_TEMPLATE_REG_EXP, (match, assetId) => {
      let asset = assetsData[assetId];
      if (!asset) {
        return '';
      }
      return this._getAssetHtmlForWysiwyg(asset);
    });
    return data;
  }

  _getAssetSrc(asset) {
    if (+asset.status !== 3) {
      return ASSET_PLACEHOLDER_PATH;
    }
    if (!asset.media['320x160'] || !asset.media['320x160'].name) {
      return ASSET_PLACEHOLDER_PATH;
    }
    return utils.getFullMediaSrc(asset.media['320x160'].name);
  }

  _getAssetHtmlForWysiwyg(asset) {
    let html =
      `<img src="${asset.src}" data-id="${asset.id}" class="wysiwyg__asset js-wysiwyg-asset">`;
    // if (asset.caption) {
    //   html += asset.caption;
    // }
    return html;
  }

  translateFromWysiwyg(data) {
    const $el = $('<div></div>');
    $el.html(data);
    $el.find('img').replaceWith(function() {
      return _t(ASSET_TEMPLATE, $(this).data('id'));
    });
    return $el.html();
  }

  getUsedAssetsDataFromWysiwyg(data) {
    const $el = $('<div></div>');
    $el.html(data);
    const usedAssetsData = [];
    $el.find('img').each((index, el) => {
      const id = $(el).data('id');
      if (id) {
        usedAssetsData.push({
          id: id
        });
      }
    });
    return usedAssetsData;
  }

}

const wysiwygTranslator = new WysiwygTranslator();

module.exports = wysiwygTranslator;
