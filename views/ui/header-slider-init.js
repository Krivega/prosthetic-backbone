'use strict';

const View = require('views/view');
const $ = require('jquery');

const SLIDER_RADIO_NAME = 'sliderHeaderRadioItem';
const SLIDER_CHANGE_INTERVAL = 7000;

module.exports = new(View.extend({

  el: '.js-slider-header',

  events: {
    'click .js-slider-header-prev': 'onPrevClick',
    'click .js-slider-header-next': 'onNextClick',
    'change [name=sliderHeaderRadioItem]': 'onChangeRadio'
  },

  initialize: function() {
    this.radios = this.$('input[name=' + SLIDER_RADIO_NAME + ']');
    this.slidesCount = this.radios.length;

    if (this.slidesCount > 1) {
      this.setTimer();

      this.listenTo(this, 'slide:change', this.setTimer);
    }
  },

  setTimer: function() {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    this.timer = window.setTimeout(this.onNextClick.bind(this), SLIDER_CHANGE_INTERVAL);
  },

  getCurrentSlide: function() {
    return this.$('input[name=' + SLIDER_RADIO_NAME + ']:checked').index();
  },

  onChangeRadio: function() {
    this.trigger('slide:change');
  },

  onPrevClick: function() {
    const currentSlide = this.getCurrentSlide();
    const prevSlideIndex = (currentSlide - 1) < 0 ? this.slidesCount - 1 : currentSlide - 1;

    $(this.radios[prevSlideIndex]).prop('checked', true);

    this.trigger('slide:change');
  },

  onNextClick: function() {
    const currentSlide = this.getCurrentSlide();
    const nextSlideIndex = (currentSlide + 1) > (this.slidesCount - 1) ? 0 : currentSlide + 1;

    $(this.radios[nextSlideIndex]).prop('checked', true);

    this.trigger('slide:change');
  }

}))();
