'use strict';

const View = require('views/view');
const Gallery = require('views/ui/gallery/gallery');

module.exports = View.extend({

  events: {
    'click .js-wysiwyg-asset': 'onWysiwygAssetClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.galleryAssetsCollection = this.collection.clone();
    this.galleryAssetsCollection.reset([]);
    this.gallery = new Gallery({
      collection: this.galleryAssetsCollection,
      title: this.title
    });
  },

  render: function() {
    this.gallery.render();

    return this.renderDone();
  },

  onWysiwygAssetClick: function(e) {
    const assetId = this.$(e.currentTarget).data('id');
    const asset = this.collection.get(assetId);
    if (asset) {
      this.galleryAssetsCollection.reset([asset]);
      this.gallery.show(0);
    }
  }

});
