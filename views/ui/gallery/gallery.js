'use strict';

const View = require('views/view');
const vent = require('runtime/vent');
const overlayManager = require('runtime/overlay-manager');
const Slides = require('views/ui/slider/slides');
const Previews = require('views/ui/slider/previews');
const template = require('ui/gallery/gallery.nunj');

module.exports = View.extend({

  template: template,
  events: {
    'click .js-gallery-close': 'onClickClose'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.title = this.options.title;
    this.sliderOptions = {
      loop: this.collection.length > 1
    };

    this.slides = new Slides({
      collection: this.collection,
      autoPlayVideo: true,
      slider: this.sliderOptions,
      isStretch: true,
      showCaption: true
    });

    this.previews = new Previews({
      collection: this.collection,
      hidePreviewCaption: false,
      isAlwaysActive: false,
      slider: this.sliderOptions
    });

    this.listenTo(this.slides, 'slides:ready', this.onSlidesReady);
    this.listenTo(this.slides, 'slide:click', this.onSlideClick);
    this.listenTo(this.slides, 'slide:change', this.onSlidesSlideChange);
    this.listenTo(this.previews, 'slide:change', this.onPreviewsSlideChange);
    this.listenTo(this.collection, 'reset', this.render);
  },

  render: function() {
    this.renderTemplate({
      title: this.title
    });
    this.$el.appendTo('body').hide();
    this.subRender('.js-content', this.slides);
    this.subRender('.js-footer', this.previews);

    this.renderDone();
  },

  show: function(index) {
    $document.on(this.getEventName('keyup'), this.onKeyUp.bind(this));
    $body.css('overflow', 'hidden');

    this.setIndex();
    this.$el.fadeIn();
    this.slides.render();
    this.previews.render();

    this.slides.val(index);
    this.previews.val(index);
    this.onSlideChange(index);

    return this;
  },

  setIndex: function() {
    const index = overlayManager.getIndex();
    this.$el.css({
      'z-index': index,
      position: 'relative'
    });
    return this;
  },

  close: function() {
    $document.off(this.getEventName('keyup'));
    this.$el.fadeOut();
    $body.css('overflow', 'auto');
    this.slides.stopPlayingVideo();
    return this;
  },

  onSlidesReady: function() {
    vent.trigger('video:init');
  },

  onSlidesSlideChange: function(resolvedIndex) {
    this.previews.val(resolvedIndex);
    this.onSlideChange(resolvedIndex);
  },

  onPreviewsSlideChange: function(resolvedIndex) {
    this.slides.val(resolvedIndex);
    this.onSlideChange(resolvedIndex);
  },

  onClickClose: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.close();
    return false;
  },

  onSlideClick: function(model) {
    if (!model.isFinishedMedia()) {
      this.close();
    }
  },

  /**
   * Slides change event handler
   * @param  {number} activeIndex Index of new slide, 1-based due to slider looping
   */
  onSlideChange: function(activeIndex) {
    let activeModel = this.collection.getActiveModel();
    if (activeModel) activeModel.disableActive();

    activeModel = this.collection.at(activeIndex);
    activeModel.enableActive();
  },

  onKeyUp: function(e) {
    // close on ESC
    if (e.keyCode === 27) {
      this.close();
    }
    return true;
  }

});
