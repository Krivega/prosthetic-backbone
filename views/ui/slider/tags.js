'use strict';

const _ = require('underscore');
const SwiperListView = require('./swiper-list');
const TagItem = require('views/ui/slider/tag');
const template = require('elements/slider/templates/tags.nunj');

module.exports = SwiperListView.extend({

  template: template,
  itemView: TagItem,
  className: 'tags',
  listSelector: '.js-tags-list',

  postRender: function() {
    if (this.needToRenderSwiper()) {
      this.renderSwiper();
      this.val(this.swiper.activeIndex || 0);
    } else {
      this.toggleSubViews();
    }
  },

  getSwiperOptions: function() {
    return {
      mode: 'horizontal',
      wrapperClass: 'tags__wrapper',
      slideClass: 'tags__tag',
      loop: this.isLoopEnabled(),
      calculateHeight: true,
      onSlideChangeEnd: this.onSlideChangeEnd.bind(this)
    };
  },

  toggleSubViews: function() {
    this.toggle(false);
    _.invoke(this.getSubviews(), 'toggle', true);
  },

  val: function(resolvedIndex) {
    if (!this.hasSwiper()) return;
    this.toggle(resolvedIndex);
    this.swiper.swipeTo(resolvedIndex, 300, false);
  },

  toggle: function(resolvedIndex) {
    const model = this.collection.at(resolvedIndex);
    if (model) {
      this.$el.toggleClass('is-hidden', !model.hasAssetTags());
    }
  },

  onSlideChangeEnd: function(slide) {
    const resolvedIndex = this.resolveIndex(slide.activeIndex);
    this.trigger('slide:change', resolvedIndex);
  }

});
