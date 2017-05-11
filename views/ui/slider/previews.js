'use strict';

const _ = require('underscore');
const utils = require('utils');
const d = require('libs/default-value');
const SwiperListView = require('./swiper-list');
const PreviewItem = require('views/ui/slider/preview');

const template = require('elements/slider/templates/previews.nunj');

const slideActiveClass = 'previews__preview--active';

module.exports = SwiperListView.extend({

  template: template,
  itemView: PreviewItem,
  className: 'previews',
  listSelector: '.js-previews-list',
  active: 0, // index of last active element

  events: _.extend({
    'click .js-previews-prev': 'onClickPrev',
    'click .js-previews-next': 'onClickNext',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave'
  }, SwiperListView.prototype.events),

  render: function() {
    if (this.needToRenderSwiper()) {
      return SwiperListView.prototype.render.apply(this, arguments);
    } else {
      this.toggle(true);
    }
    return this.renderDone();
  },

  postRender: function() {
    if (this.collection.isNotEmpty()) {
      this.toggle(false);
      this.renderSwiper();
    } else {
      this.toggle(true);
    }
    this.hideActions(0);
  },

  updateSwiper: function() {
    SwiperListView.prototype.updateSwiper.apply(this, arguments);

    this.hideActions(0);
  },

  getSwiperOptions: function() {
    return {
      mode: 'horizontal',
      wrapperClass: 'previews__wrapper',
      slideClass: 'previews__preview',
      slideActiveClass: slideActiveClass,
      slidesPerView: 'auto',
      // should be always false
      loop: false,
      // onSlideChangeEnd: _.bind(this.onSlideChange, this),
      // onResistanceBefore: _.bind(this.onSlideChange, this),
      // onResistanceAfter: _.bind(this.onSlideChange, this),
      onSlideClick: _.bind(this.onClickPreview, this)
    };
  },

  isLoopEnabled: function() {
    return false;
  },

  markAsUnViewed: function(assetIds) {
    _.invoke(this.subviews, 'markAsViewed');
    _.each(assetIds, function(assetId) {
      const model = this.collection.get(assetId);
      if (model) {
        const subView = this.findSubviewByModel(model);
        if (subView) {
          subView.markAsUnViewed();
        }
      }
    }, this);
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
      this.$('.js-previews-prev').fadeOut(speed);
      this.$('.js-previews-next').fadeOut(speed);
    } else {
      this.$('.js-previews-prev').fadeIn(speed);
      this.$('.js-previews-next').fadeIn(speed);
    }
  },

  prevSlide: function() {
    this.slideTo(this.getPrevIndexSlideTo());
    this.toggleActiveLabels();
  },

  nextSlide: function() {
    this.slideTo(this.getNextIndexSlideTo());
    this.toggleActiveLabels();
  },

  getPrevIndexSlideTo: function() {
    const visibleLength = this.visibleLength();
    const length = this.collection.length;
    let index = this.getSwiperActiveIndex() - visibleLength;
    if (index < 0 && -1 * index === visibleLength) {
      index = length - visibleLength;
    }
    if (index < 0) {
      index = 0;
    }
    return index;
  },

  getNextIndexSlideTo: function() {
    const visibleLength = this.visibleLength();
    const length = this.collection.length;
    let index = this.swiper.activeIndex + visibleLength;
    if (index >= length) {
      index = 0;
    }
    return index;
  },

  visibleLength: function() {
    if (!this.hasSwiper()) return;
    const visibleLength = this.swiper.visibleSlides.length;
    const widthSlide = this.swiper.getFirstSlide().getWidth();
    const width = this.swiper.width;
    const visibleLengthPossible = Math.floor(width / widthSlide);
    return visibleLength > visibleLengthPossible ? visibleLengthPossible : visibleLength;
  },

  getSwiperActiveIndex: function() {
    return this.swiper.activeIndex;
  },

  val: function(resolvedIndex) {
    if (!this.hasSwiper()) return;
    this.showPreview(resolvedIndex, {
      silent: true
    });
  },

  showPreview: function(resolvedIndex, options) {
    this.slideTo(resolvedIndex);
    this.setUserActivatedIndex(resolvedIndex, options);
    this.toggleActiveLabels();
  },

  slideTo: function(resolvedIndex) {
    if (!this.hasSwiper()) return;
    this.swiper.swipeTo(resolvedIndex, 300, false);
  },

  toggleActiveLabels: function() {
    this.toggleClassActive(this.getUserActivatedPreview());
  },

  toggleClassActive: function(preview) {
    if (!this.isAlwaysActive()) {
      this.$('.' + slideActiveClass).removeClass(slideActiveClass);
      this.$(preview).addClass(slideActiveClass);
    }
  },

  isAlwaysActive: function() {
    return !!this.options.isAlwaysActive;
  },

  setUserActivatedIndex: function(resolvedIndex, options = {}) {
    if (this.userActivatedIndex !== resolvedIndex) {
      this.userActivatedIndex = resolvedIndex;
      if (!options.silent) {
        this.triggerActiveSlideChanged();
      }
    }
  },

  triggerActiveSlideChanged: function() {
    this.trigger('slide:change', this.resolveIndex(this.getUserActivatedIndex()));
  },

  getUserActivatedPreview: function() {
    return this.swiper.getSlide(this.getUserActivatedIndex());
  },

  /**
   * Returns index of active slide activated by clicking on preview or setting withing val
   * @returns {integer}
   */
  getUserActivatedIndex: function() {
    return this.userActivatedIndex;
  },

  onMouseEnter: function() {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (!this.hasSwiper()) return;
    const visibleLength = this.visibleLength();
    const length = this.collection.length;
    if (visibleLength === length || utils.isSupportTouch()) return;
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

  onClickPreview: function(preview) {
    const slideIndex = preview.clickedSlideIndex;
    // index can be -1 if slide that was clicked is not in slides
    if (slideIndex !== -1) {
      const resolvedIndex = this.resolveIndex(slideIndex);
      this.showPreview(resolvedIndex);
      this.trigger('preview:click', this.resolveIndex(resolvedIndex));
    }
  }

});
