'use strict';

// mixin that provide hooks for determine swipes or taps on mobiles
// usage: override onTap and onSwipe methods

const events = require('utils').getEvents();

const NOOP = function() {};
const TAP_THRESHOLD = 20; // distance for tap

module.exports = {

  touchX: null,
  touchY: null,

  initTapOrSwipeListeners: function() {
    $document.on(this.getEventName(events.touchStart), this.onTapOrSwipeTouchStart.bind(this));
    $document.on(this.getEventName(events.touchEnd), this.onTapOrSwipeTouchEnd.bind(this));
  },

  removeTapOrSwipeListeners: function() {
    $document.off(this.getEventName(events.touchStart));
    $document.off(this.getEventName(events.touchEnd));
  },

  onTapOrSwipeTouchStart: function(e) {
    const touchobj = e.originalEvent.changedTouches[0];
    this.touchX = touchobj.pageX;
    this.touchY = touchobj.pageY;
  },

  onTapOrSwipeTouchEnd: function(e) {
    const touchobj = e.originalEvent.changedTouches[0];

    const dx = touchobj.pageX - this.touchX;
    const dy = touchobj.pageY - this.touchY;
    const distance = Math.abs(dx) + Math.abs(dy);

    if (distance < TAP_THRESHOLD) {
      this.onTap(e);
    } else {
      this.onSwipe(e);
    }
  },

  // override this
  onTap: NOOP,
  onSwipe: NOOP
};
