'use strict';

const ListView = require('views/application/list');

require('plugins/idangerous.swiper');

module.exports = ListView.extend({

  render: function() {
    this.renderTemplate();
    ListView.prototype.render.apply(this, arguments);
    this.postRender();
    return this.renderDone();
  },

  renderSwiper: function() {
    if (this.hasSwiper()) {
      this.removeSwiper();
    }
    this.swiper = this.$el.swiper(this.getSwiperOptions());
  },

  postRender: function() {
    throw Error('Post render must be defined in swiper');
  },

  getSwiperOptions: function() {
    throw Error('Get Swiper must be defined in swiper');
  },

  needToRenderSwiper: function() {
    return this.collection.length > this.minItemsToShow();
  },

  updateSwiper: function() {
    if (this.hasSwiper()) {
      this.swiper.reInit(true);
    }
  },

  hasSwiper: function() {
    return !!this.swiper;
  },

  resolveIndex: function(index) {
    const length = this.collection.length;
    index = index % length;
    if (this.isLoopEnabled()) {
      if (index === 0) index = length;
      index--;
    }
    return index;
  },

  minItemsToShow: function() {
    if (this.options.slider.minItemsToShow === undefined) {
      return 1;
    }
    return this.options.slider.minItemsToShow;
  },

  isLoopEnabled: function() {
    return !!this.options.slider.loop;
  },

  remove: function() {
    this.removeSwiper();
    ListView.prototype.remove.apply(this, arguments);
  },

  removeSwiper: function() {
    if (this.hasSwiper()) {
      this.swiper.destroy();
      delete this.swiper;
    }
  }

});
