'use strict';

const $ = require('jquery');
const View = require('views/view');
const scroller = require('views/ui/scroller');

module.exports = View.extend({

  events: {
    'click .js-dropdown-toggle': 'toggle',
    'click .js-close': 'onClickClose',
    'click .js-item': 'onItemClick'
  },

  initialize: function() {
    $document.on(this.getEventName('click'), this.onClickDocument.bind(this));
    return View.prototype.initialize.apply(this, arguments);
  },

  remove: function() {
    $document.off(this.getEventName('click'));
    return View.prototype.remove.apply(this, arguments);
  },

  show: function(dataDropdown) {
    let $dropdown = this.$('.js-dropdown-toggle');
    let $dropdownBlock = this.$('.js-dropdown-block');
    if (dataDropdown) {
      $dropdown = $dropdown.filter('[data-dropdown=' + dataDropdown + ']');
      $dropdownBlock = $dropdownBlock.filter('[data-dropdown=' + dataDropdown + ']');
    }
    this._show($dropdown, $dropdownBlock);
  },

  hide: function(dataDropdown) {
    let $dropdown = this.$('.js-dropdown-toggle');
    let $dropdownBlock = this.$('.js-dropdown-block');
    if (dataDropdown) {
      $dropdown = $dropdown.filter('[data-dropdown=' + dataDropdown + ']');
      $dropdownBlock = $dropdownBlock.filter('[data-dropdown=' + dataDropdown + ']');
    }
    this._hide($dropdown, $dropdownBlock);
  },

  _show: function($dropdown, $block) {
    $dropdown.addClass('is-active');
    $block.removeClass('is-hidden').addClass('is-active');
    this.scrollToDropdown($block);
  },

  _hide: function($dropdown, $block) {
    $dropdown.removeClass('is-active');
    $block.addClass('is-hidden').removeClass('is-active');
  },

  toggle: function(e) {
    let $dropdown = this.$('.js-dropdown-toggle');
    if (e && e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      $dropdown = this.$(e.currentTarget);
    }
    this.toggleDropdown($dropdown);
    return false;
  },

  toggleDropdown: function($dropdown) {
    const isClose = $dropdown.hasClass('js-close');
    let dropdown = $dropdown.data('dropdown');
    let $dropdownBlock;
    if (isClose) {
      $dropdownBlock = $dropdown.parents('.js-dropdown-block:first');
      dropdown = $dropdownBlock.data('dropdown');
      $dropdown = this.$('.js-dropdown-toggle[data-dropdown=' + dropdown + ']');
    }
    if (dropdown) {
      $dropdownBlock = this.findDropDownBlockByData(dropdown);
    } else {
      $dropdownBlock = this.$('.js-dropdown-block');
      $dropdown = this.$('.js-dropdown-toggle');
    }
    const isShow = $dropdownBlock.hasClass('is-hidden');
    if (isShow) {
      if (dropdown) this._hide(this.$('.js-dropdown-toggle'), this.$('.js-dropdown-block'));
      this._show($dropdown, $dropdownBlock);
      this.trigger('show', dropdown);
      return this;
    }
    this._hide($dropdown, $dropdownBlock);
    this.trigger('hide', dropdown);
  },

  findDropDownBlockByData: function(dataDropDown) {
    if (!dataDropDown) return this.$('.js-dropdown-block');
    return this.$('.js-dropdown-block[data-dropdown=' + dataDropDown + ']');
  },

  scrollToDropdown: function($block) {
    const topYPositionBlock = scroller.getElementOffsetTop($block);
    const bottomYPositionBlock = topYPositionBlock + $block.outerHeight();
    const heightWindow = scroller.getScrollContainerHeight();
    const scrollTop = scroller.getScrollTop();
    const scrollTopPositionBlock = bottomYPositionBlock - heightWindow;
    if (scrollTopPositionBlock > scrollTop) {
      scroller.scrollByValue(scrollTopPositionBlock + 10); //10 for beauty
    }
  },

  onClickDocument: function(e) {
    let $dropdown;
    let $dropdownBlock;
    const $el = $(e.target);
    if ($el.hasClass('is-no-close-dropdown')) return;
    if ($el.parents().filter('.is-no-close-dropdown').length > 0) return;
    if ($el.parents().filter('.js-dropdown-block:visible').length !== 1) {
      $dropdownBlock = this.$('.js-dropdown-block');
      $dropdown = this.$('.js-dropdown-toggle');
      this._hide($dropdown, $dropdownBlock);
    }
  },

  onClickClose: function(e) {
    const $dropdown = this.$(e.currentTarget);
    this.toggleDropdown($dropdown);
  },

  onItemClick: function(e) {
    const val = $(e.currentTarget).data('value');
    this.trigger('click:item', val);
  }
});
