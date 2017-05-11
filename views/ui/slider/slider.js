'use strict';

const vent = require('runtime/vent');
const View = require('views/view');

const Slides = require('views/ui/slider/slides');
const Previews = require('views/ui/slider/previews');
const Captions = require('views/ui/slider/captions');
const Gallery = require('views/ui/gallery/gallery');

module.exports = View.extend({

  initialize: function(options) {
    View.prototype.initialize.apply(this, arguments);
    this.sliderOptions = {
      loop: this.collection.length !== 1
    };
    this.title = this.options.title;
    this.collection = options.collection;
    this.collection.at(0).enableActive();
    this.assetsGalleryCollection = options.assetsGalleryCollection;

    this.slides = new Slides({
      collection: options.collection,
      autoPlayVideo: true,
      showActionZoom: true,
      slider: this.sliderOptions
    });

    this.previews = new Previews({
      collection: options.collection,
      hidePreviewCaption: false,
      isAlwaysActive: false,
      slider: this.sliderOptions
    });

    this.captions = new Captions({
      collection: options.collection,
      slider: this.sliderOptions
    });

    this.gallery = new Gallery({
      collection: this.assetsGalleryCollection,
      title: this.title
    });

    this.listenTo(this.slides, 'slides:ready', this.onSlidesReady);

    this.listenTo(this.slides, 'action:zoom', this.onActionZoom);
    this.listenTo(this.slides, 'slide:click', this.onSlideClick);
    this.listenTo(this.slides, 'slide:change', this.onSlidesSlideChange);
    this.listenTo(this.previews, 'slide:change', this.onPreviewsSlideChange);
    this.listenTo(this.captions, 'slide:change', this.onCaptionsSlideChange);
  },

  render: function() {
    this.subRender('.js-slider', this.slides);
    this.subRender('.js-previews', this.previews);
    this.subRender('.js-captions', this.captions);
    this.gallery.render();
    return this.renderDone();
  },

  /**
   * Slides change event handler
   * @param  {number} resolvedIndex Index of new slide, 1-based due to slider looping
   */
  onSlideChange: function(resolvedIndex) {
    let activeModel = this.collection.getActiveModel();
    if (activeModel) activeModel.disableActive();

    activeModel = this.collection.at(resolvedIndex);
    activeModel.enableActive();
  },

  onSlidesReady: function() {
    vent.trigger('video:init');
  },

  onSlidesSlideChange: function(resolvedIndex) {
    this.previews.val(resolvedIndex);
    this.captions.val(resolvedIndex);
    this.onSlideChange(resolvedIndex);
  },

  onPreviewsSlideChange: function(resolvedIndex) {
    this.slides.val(resolvedIndex);
    this.captions.val(resolvedIndex);
    this.onSlideChange(resolvedIndex);
  },

  onCaptionsSlideChange: function(resolvedIndex) {
    this.slides.val(resolvedIndex);
    this.previews.val(resolvedIndex);
  },

  onActionZoom: function(model) {
    this.slides.stopPlayingVideo();
    const index = this.collection.indexOf(model);
    this.gallery.show(index);
  },

  onSlideClick: function(model) {
    if (!model.isFinishedMedia()) {
      this.onActionZoom(model);
    }
  }

});
