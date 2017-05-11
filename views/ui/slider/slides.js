'use strict';

const _ = require('underscore');
const d = require('libs/default-value');
const utils = require('utils');
const SwiperListView = require('./swiper-list');
const SlideItem = require('views/ui/slider/slide');

const template = require('elements/slider/templates/slider.nunj');

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
}

const supportsOrientationChange = 'onorientationchange' in window;
const resizeEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

module.exports = SwiperListView.extend({

  template: template,
  itemView: SlideItem,
  className: 'slider',
  listSelector: '.js-slider-list',
  isStretch: false,

  events: _.extend({
    'click .js-slider-prev': 'onClickPrev',
    'click .js-slider-next': 'onClickNext',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave'
  }, SwiperListView.prototype.events),

  initialize: function() {
    SwiperListView.prototype.initialize.apply(this, arguments);

    this.itemOptions.showActionZoom = this.options.showActionZoom || false;
    this.itemOptions.showCaption = this.options.showCaption || false;
    this.isStretch = this.options.isStretch || false;
    $window.on(this.getEventName(resizeEvent), this.onResize.bind(this));
  },

  remove: function() {
    $window.off(this.getEventName(resizeEvent));
    return SwiperListView.prototype.remove.apply(this, arguments);
  },

  postRender: function() {
    if (this.isStretch) {
      this.$el.addClass('is-stretch');
    }
    if (this.needToRenderSwiper()) {
      this.renderSwiper();
    } else {
      if (this.hasSwiper()) {
        this.removeSwiper();
      }
      this.slidesReady();

      this.responsiveImages();
    }
    this.hideActions(0);
  },

  getSwiperOptions: function() {
    return {
      mode: 'horizontal',
      wrapperClass: 'slider__wrapper',
      slideClass: 'slider__slide',
      slideDuplicateClass: 'js-swiper-duplicate',
      loop: this.isLoopEnabled(),
      simulateTouch: false,
      onSlideChangeEnd: this.onSlideChangeEnd.bind(this),
      onSwiperCreated: this.onSwiperCreated.bind(this),
      onSlideClick: this.onSwiperSlideClick.bind(this)
    };
  },

  needToRenderSwiper: function() {
    return this.collection.length >= this.minItemsToShow();
  },

  updateSwiper: function() {
    SwiperListView.prototype.updateSwiper.apply(this, arguments);
    if (this.hasSwiper()) {
      this.responsiveImages(this.swiper);
    } else {
      this.responsiveImages();
    }
  },

  stopPlayingVideo: function() {
    _.invoke(this.subviews, 'stopVideo');
  },

  showActions: function(speed) {
    this.toggleActions(speed, false);
  },

  hideActions: function(speed) {
    this.toggleActions(speed, true);
  },

  toggleActions: function(speed, hide) {
    speed = d(speed, 300);
    if (hide) {
      this.$('.js-slider-prev').fadeOut(speed);
      this.$('.js-slider-next').fadeOut(speed);
    } else {
      this.$('.js-slider-prev').fadeIn(speed);
      this.$('.js-slider-next').fadeIn(speed);
    }
  },

  prevSlide: function() {
    if (!this.hasSwiper()) return;
    this.swiper.swipePrev();
  },

  nextSlide: function() {
    if (!this.hasSwiper()) return;
    this.swiper.swipeNext();
  },

  /**
   * Buttons next/prev control for non-loop version
   */
  toggleButtons: function() {
    if (!this.isLoopEnabled()) {
      this.$('.js-slider-next').toggleClass('is-hidden', this.isLastSlide());
      this.$('.js-slider-prev').toggleClass('is-hidden', this.isFirstSlide());
    }
  },

  isLastSlide: function() {
    return this.hasSwiper() && this.swiper.activeIndex === this.collection.length - 1;
  },

  isFirstSlide: function() {
    return this.hasSwiper() && this.swiper.activeIndex === 0;
  },

  slidesReady: function() {
    this.trigger('slides:ready');
  },

  val: function(resolvedIndex, speed) {
    if (!this.hasSwiper()) return;
    this.swiper.swipeTo(resolvedIndex, d(speed, 0), false);
    this.toggleButtons();
  },

  responsiveImages: function(swiper) {
    const sizes = {
      width: this.$el.outerWidth(),
      height: this.$el.outerHeight()
    };
    let slides;

    if (this.hasSwiper()) {
      slides = swiper.slides;
    } else {
      slides = this.$list.children();
    }

    _.each(slides, (slide) => {
      const $img = this.$(slide).find('.js-slider-image');
      if ($img.data('is-loaded')) {
        this.responsiveImage($img, sizes, slide);
        return true;
      }
      $img.on('load', () => {
        $img.data('is-loaded', true);
        this.responsiveImage($img, sizes, slide);
      });
    }, this);
  },

  responsiveCaption: function(sizes, slide) {
    const $caption = $body.find(slide).find('.js-caption');
    $caption.css({
      width: sizes.width + 'px',
      marginLeft: -(sizes.width / 2) + 'px'
    });
  },

  responsiveImage: function($img, wrapperSizes, slide) {
    if ($img.length !== 1) return;
    // reset styles rules
    $img.css({
      width: '',
      height: ''
    });
    const img = $img[0];
    const ownerWidth = wrapperSizes.width;
    const ownerHeight = wrapperSizes.height;
    const srcWidth = img.naturalWidth;
    const srcHeight = img.naturalHeight;
    if (!this.isStretch && srcWidth < ownerWidth && srcHeight < ownerHeight) return;
    const sizes = calculateAspectRatioFit(srcWidth, srcHeight, ownerWidth, ownerHeight);
    this.responsiveCaption(sizes, slide);
    // set styles rules
    $img.css({
      width: sizes.width + 'px',
      height: sizes.height + 'px'
    });
  },

  onResize: function() {
    this.responsiveImages(this.swiper);
  },

  onMouseEnter: function() {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (utils.isSupportTouch() || !this.hasSwiper()) return;
    this.showActions();
  },

  onMouseLeave: function() {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      this.hideActions();
    }, 5000);
  },

  onClickPrev: function(e) {
    e.preventDefault();
    this.prevSlide();
  },

  onClickNext: function(e) {
    e.preventDefault();
    this.nextSlide();
  },

  onSwiperCreated: function(swiper) {
    this.$('.js-swiper-duplicate .js-video-player').empty();
    this.slidesReady();
    this.responsiveImages(swiper);
  },

  onSwiperSlideClick: function(swiper, e) {
    const $el = this.$(e.target);
    const model = this.collection.getActiveModel();
    this.trigger('slide:click', model);
    if ($el.hasClass('js-action-zoom')) {
      this.trigger('action:zoom', model);
    }
  },

  onSlideChangeEnd: function() {
    if (!this.hasSwiper()) return;
    if (this.isLoopEnabled()) {
      this.swiper.fixLoop();
    }
    this.toggleButtons();

    this.trigger('slide:change', this.resolveIndex(this.swiper.activeIndex));
  }

});
