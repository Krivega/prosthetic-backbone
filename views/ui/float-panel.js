'use strict';

const _ = require('underscore');
const changeWindowEventName = require('utils').getEvents().changeWindow;
const features = require('features');

const View = require('views/view');

const isFromMobileAppMessage = $html.hasClass('is-from-mobile-app-message');

const HEIGHT_FLOAT_TOP_HEADER = 40;
const HEIGHT_FROM_MOBILE_APP_MESSAGE = 60;

module.exports = View.extend({

  $scrollerBlock: null,
  rememberOffsetTop: null,

  events: {
    mouseup: 'onMouseup'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.throttledRePositionFloats = _.throttle(this.rePositionFloats.bind(this), 50);
    this.throttledReset = _.throttle(this.reset.bind(this), 50, {
      leading: false
    });
  },

  render: function() {
    this.$floatPanel = this.$('.js-float-panel');
    this.reset();

    this.prevWidth = $window.width();
    this.prevOrientation = window.orientation;
    this.getScrollerBlock().on(this.getEventName('scroll'), this.onScroll.bind(this));
    $window.on(this.getEventName(changeWindowEventName), this.onChangeWindow.bind(this));

    return this.renderDone();
  },

  remove: function() {
    this.getScrollerBlock().off(this.getEventName('scroll'));
    $window.off(this.getEventName(changeWindowEventName));
    return View.prototype.remove.apply(this, arguments);
  },

  reset: function() {
    const width = this.$el.outerWidth();
    this.$floatPanel.css({
      'min-width': width,
      'max-width': width
    });

    this.resetOffsetTop();
    this.rePositionFloats();
    this.resetHeight();
  },

  resetHeight: function() {
    this.$el.css('height', this.$floatPanel.height());
  },

  resetOffsetTop: function() {
    delete this.rememberOffsetTop;
  },

  rePositionFloats: function() {
    const isFloat = this.isFloat();
    this.$floatPanel.css('top', isFloat ? this.offsetTop() : 0);
    this.$floatPanel.toggleClass('is-float', isFloat);
  },

  isFloat: function() {
    const scrollTop = this.getScrollerBlock().scrollTop();
    const offsetPageTop = this.$el.offset().top;
    return scrollTop > offsetPageTop - this.offsetTop();
  },

  offsetTop: function() {
    let offsetTop = 0;
    if (this.options.dynamicFloat) {
      if (!this.rememberOffsetTop) {
        this.rememberOffsetTop = this.$el.offset().top +
          this.getScrollerBlock().scrollTop();
      }
      offsetTop = this.rememberOffsetTop;
    } else {
      if (!features.isMobile()) {
        offsetTop = HEIGHT_FLOAT_TOP_HEADER;
      }
      if (isFromMobileAppMessage) {
        offsetTop += HEIGHT_FROM_MOBILE_APP_MESSAGE;
      }
    }
    return offsetTop;
  },

  getScrollerBlock: function() {
    if (this.$scrollerBlock) {
      return this.$scrollerBlock;
    }
    let $block = $window;
    const $parrentOverlay = this.$el.parents('.js-overlay-scroller:first');

    if ($parrentOverlay && $parrentOverlay.length === 1) {
      $block = $parrentOverlay;
    }
    this.$scrollerBlock = $block;
    return $block;
  },

  onMouseup: function() {
    setTimeout(this.resetHeight.bind(this), 0);
  },

  onScroll: function() {
    this.throttledRePositionFloats();
  },

  onChangeWindow: function(e) {
    const newWidth = $window.width();
    const newOrientation = window.orientation;

    const isOldWidth = this.prevWidth === newWidth;
    const isOldOrientation = Math.abs(this.prevOrientation - newOrientation) !== 180;

    if (e.type === 'orientationchange' && isOldWidth && isOldOrientation) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(this.onChangeWindow.bind(this, e), 10);
      return;
    }

    clearTimeout(this.timeout);
    this.prevWidth = newWidth;
    this.prevOrientation = newOrientation;
    this.throttledReset(true);
  }

});
