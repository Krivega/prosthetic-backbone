'use strict';

const _ = require('underscore');
const $ = require('jquery');
const features = require('features');
const overlayManager = require('runtime/overlay-manager');
const HEIGHT_FLOAT_TOP_HEADER = 40;
const HEIGHT_FROM_MOBILE_APP_MESSAGE = 60;

const FREESE_SCROLL_CLASS = 'is-freeze-scroll';

const isFromMobileAppMessage = $html.hasClass('is-from-mobile-app-message');

const Scroller = function() {};

_.extend(Scroller.prototype, {

  scrollTopPosition: 0,
  scrollSize: 0,
  _isFreezeScroll: false,

  defaults: function() {
    const options = {
      scrollerBlock: 'html, body',
      callback: undefined,
      paddingTop: 0,
      duration: 500,
      notTakeFloatPanel: false
    };

    const activeOverlay = overlayManager.getLastActiveOverlay();

    if (activeOverlay) {
      options.scrollerBlock = activeOverlay.getScrollerBlock();
      options.notTakeFloatPanel = true;
    }

    return options;
  },

  floatPanelOffsetTop: function() {
    let offsetTop = $('.js-panel-actions:visible').outerHeight() || 0;

    if (!features.isMobile()) {
      offsetTop += HEIGHT_FLOAT_TOP_HEADER;
    }
    if (isFromMobileAppMessage) {
      offsetTop += HEIGHT_FROM_MOBILE_APP_MESSAGE;
    }

    return offsetTop;
  },

  /**
   *  @description Scroll to element
   *
   *  @param {*} [hashOrEl=location.hash] jQuery object or selector
   *  @param {object} [options]
   */
  scrollTo: function(hashOrEl, options = {}) {
    _.defaults(options, this.defaults());

    let paddingTop = options.paddingTop;
    let callback = options.callback;
    let $to;
    let top;
    const $scrollerBlock = this.getScrollerBlock(options);

    if (hashOrEl && typeof hashOrEl === 'object') {
      $to = hashOrEl;
    } else if (hashOrEl) {
      $to = $(hashOrEl);
    } else {
      $to = $(location.hash);
    }

    if ($to.length === 0) {
      return;
    }

    if (options.notTakeFloatPanel === false) {
      paddingTop += this.floatPanelOffsetTop();
    }

    top = Math.ceil($to.offset().top) - paddingTop;
    $scrollerBlock.animate({
      scrollTop: top
    }, options.duration, () => {
      if (callback) {
        callback();
        callback = null;
      }
    });
  },

  scrollByValue: function(value, options = {}) {
    _.defaults(options, this.defaults());

    let callback = options.callback;
    const $scrollerBlock = this.getScrollerBlock(options);

    $scrollerBlock.animate({
      scrollTop: value
    }, options.duration, () => {
      if (callback) {
        callback();
        callback = null;
      }
    });
  },

  getElementOffsetTop: function($el) {
    let offsetTop = $el.offset().top;
    if (this.isOverlayOpen()) {
      offsetTop += this.getScrollTop();
    }
    return offsetTop;
  },

  getScrollTop: function() {
    if (this.isOverlayOpen()) {
      return this.getScrollerBlock().scrollTop();
    }
    return $document.scrollTop();
  },

  getScrollContainerHeight: function() {
    if (this.isOverlayOpen()) {
      return this.getScrollerBlock().height();
    }
    return window.innerHeight;
  },

  isOverlayOpen: function() {
    return overlayManager.getLastActiveOverlay();
  },

  getScrollerBlock: function(options = {}) {
    _.defaults(options, this.defaults());
    if (options.scrollerBlock === 'object') {
      return options.scrollerBlock;
    }
    return $(options.scrollerBlock);
  },

  freezeScroll: function() {
    this._isFreezeScroll = true;
    this.scrollTopPosition = $document.scrollTop();
    this.scrollSize = this.getScrollSize();
    $html.addClass(FREESE_SCROLL_CLASS);
  },

  unFreezeScroll: function() {
    this._isFreezeScroll = false;
    $html.removeClass(FREESE_SCROLL_CLASS);
    if (this.scrollTopPosition) {
      this.scrollByValue(this.scrollTopPosition, {
        duration: 0,
        callback: () => {
          this.checkScrollTopPosition();
        }
      });
    }
  },

  hasFreezeScroll: function() {
    return this._isFreezeScroll;
  },

  getScrollSize: function() {
    if (document.scrollingElement) {
      return document.scrollingElement.scrollHeight;
    } else {
      $document.height();
    }
  },

  checkScrollTopPosition: function() {
    const currentScrollTopPosition = $document.scrollTop();
    const scrollSize = this.getScrollSize();

    if (!this.hasFreezeScroll() &&
      this.scrollSize && this.scrollSize === scrollSize &&
      this.scrollTopPosition && this.scrollTopPosition !== currentScrollTopPosition) {
      this.checkScrollTopPositionInterval = setTimeout(() => {
        this.scrollByValue(this.scrollTopPosition, {
          duration: 0,
          callback: () => {
            this.checkScrollTopPosition();
          }
        });
      }, 50);
    } else {
      clearInterval(this.checkScrollTopPositionInterval);
      this.checkScrollTopPositionInterval = null;
    }
  }

  // disableScroll: function() {
  //   function preventDefault(e) {
  //     e = e || window.event;
  //     if (e.preventDefault) {
  //       e.preventDefault();
  //     }
  //     e.returnValue = false;
  //   }

  //   function preventDefaultForScrollKeys(e) {
  //     // left: 37, up: 38, right: 39, down: 40,
  //     // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
  //     const keys = {
  //       37: 1,
  //       38: 1,
  //       39: 1,
  //       40: 1
  //     };
  //     if (keys[e.keyCode]) {
  //       preventDefault(e);
  //       return false;
  //     }
  //   }
  //   window.onwheel = preventDefault; // modern standard
  //   window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  //   window.ontouchmove = preventDefault; // mobile
  //   document.onkeydown = preventDefaultForScrollKeys;
  // },

  // enableScroll: function() {

  //   window.onmousewheel = document.onmousewheel = null;
  //   window.onwheel = null;
  //   window.ontouchmove = null;
  //   document.onkeydown = null;
  // }

});

const scroller = new Scroller();

module.exports = scroller;
