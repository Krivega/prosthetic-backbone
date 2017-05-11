'use strict';

const _ = require('underscore');

const threshold = 150; //required min distance traveled to be considered swipe
const restraint = 100; // maximum distance allowed at the same time in perpendicular direction

const SwipeDetect = function() {};

_.extend(SwipeDetect.prototype, {

  on: function($el, callback, options = {
    movePreventDefault: true
  }) {
    let startX;
    let startY;
    $el.on('touchstart', function(e) {
      // e.preventDefault();
      const touchobj = e.originalEvent.changedTouches[0];
      startX = touchobj.pageX;
      startY = touchobj.pageY;
    });

    $el.on('touchmove', function(e) {
      if (options.movePreventDefault) {
        e.preventDefault(); // prevent scrolling when inside el
      }
    });

    $el.on('touchend', function(e) {
      let swipeDirection;
      const touchobj = e.originalEvent.changedTouches[0];
      // get horizontal dist traveled by finger while in contact with surface
      const distX = touchobj.pageX - startX;
      // get vertical dist traveled by finger while in contact with surface
      const distY = touchobj.pageY - startY;
      // 2nd condition for horizontal swipe met
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        // if dist traveled is negative, it indicates left swipe
        swipeDirection = (distX < 0) ? 'left' : 'right';
        // 2nd condition for vertical swipe met
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        // if dist traveled is negative, it indicates up swipe
        swipeDirection = (distY < 0) ? 'up' : 'down';
      }

      if (swipeDirection) {
        e.preventDefault();
        callback(swipeDirection);
      }
    });
  },

  off: function($el) {
    $el.off('touchstart');
    $el.off('touchmove');
    $el.off('touchend');
  },

  onUp: function(el, callback, options) {
    this.on(el, (swipeDirection) => {
      if (swipeDirection === 'up') {
        return callback();
      }
    }, options);
  },

  onDown: function(el, callback, options) {
    this.on(el, (swipeDirection) => {
      if (swipeDirection === 'down') {
        return callback();
      }
    }, options);
  }

});

const swipeDetect = new SwipeDetect();

module.exports = swipeDetect;
