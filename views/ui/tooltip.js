'use strict';

const $ = require('jquery');
const events = require('utils').getEvents();
const View = require('views/view');
const TapOrSwipeMixin = require('views/application/tap-or-swipe-mixin');
const template = require('ui/tooltip/tooltip.nunj');

module.exports = View.extend(TapOrSwipeMixin).extend({

  template,

  className: 'tooltip is-hidden',

  // target element. Must have attribute rel="tooltip" and title="some" for text
  $target: null,

  initialize: function() {
    if (events.isTouchEvent) {
      this.$el.appendTo('body');
      this.initTapOrSwipeListeners();
      $window.on(this.getEventName(events.changeWindow), this.onChangeWindow.bind(this));
      $document.on(this.getEventName(events.touchMove), this.onTouchMove.bind(this));
    }
  },

  render: function(tooltip) {
    this.renderData({
      tooltip: tooltip
    });
  },

  showNewTooltip: function($target) {
    this.render($target.attr('title'));
    // reset and show before calculations
    this.$el
      .removeAttr('style')
      .removeClass('is-hidden');

    const offset = $target.offset();
    const bottom = offset.top + $target.outerHeight();
    let left = offset.left + ($target.outerWidth() - this.$el.outerWidth()) / 2;
    left = left < 0 ? 0 : left;

    this.$el.css({
      top: bottom,
      left: left
    });
    this.$target = $target;
  },

  removePreviousTooltip: function() {
    this.$target = null;
    this.$el.addClass('is-hidden');
  },

  remove: function() {
    this.removePreviousTooltip();
    this.removeTapOrSwipeListeners();
    $window.off(this.getEventName(events.changeWindow));
    $window.off(this.getEventName(events.touchMove));
    return View.prototype.remove.apply(this, arguments);
  },

  onChangeWindow: function() {
    this.removePreviousTooltip();
  },

  onTouchMove: function() {
    this.removePreviousTooltip();
  },

  onTap: function(e) {
    const $target = $(e.target);
    // for close on second click
    const isSameTarget = this.$target && this.$target[0] === $target[0];

    // remove in all cases
    this.removePreviousTooltip();

    if ($target.attr('rel') !== 'tooltip' || isSameTarget) {
      return;
    }

    this.showNewTooltip($target);
  },

  onSwipe: function() {
    this.removePreviousTooltip();
  }
});
