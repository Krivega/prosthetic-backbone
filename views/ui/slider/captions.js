'use strict';

const _ = require('underscore');
const SwiperListView = require('./swiper-list');
const CaptionItem = require('views/ui/slider/caption');
const template = require('elements/slider/templates/captions.nunj');

module.exports = SwiperListView.extend({

  template: template,
  itemView: CaptionItem,
  className: 'captions',
  listSelector: '.js-captions-list',

  postRender: function() {
    if (this.needToRenderSwiper()) {
      this.renderSwiper();
      this.toggle(this.swiper.activeIndex || 0);
    } else {
      this.toggleSubViews();
    }
  },

  getSwiperOptions: function() {
    return {
      mode: 'horizontal',
      wrapperClass: 'captions__wrapper',
      slideClass: 'captions__caption',
      loop: this.isLoopEnabled(),
      calculateHeight: true,
      onSlideChangeEnd: this.onSlideChangeEnd.bind(this)
    };
  },

  toggleSubViews: function() {
    this.toggle(false);
    _.each(this.getSubviews(), function(subView) {
      subView.toggle(true);
    });
  },

  val: function(resolvedIndex) {
    if (!this.hasSwiper()) return;
    this.toggle(resolvedIndex);
    this.swiper.swipeTo(resolvedIndex, 300, false);
  },

  toggle: function(resolvedIndex) {
    const model = this.collection.at(resolvedIndex);
    if (model) {
      this.$el.toggleClass('is-hidden', model.isEmptyCaption());
    }
  },

  onSlideChangeEnd: function(slide) {
    const resolvedIndex = this.resolveIndex(slide.activeIndex);
    this.trigger('slide:change', resolvedIndex);
  }

});
