'use strict';

const $ = require('jquery');
const View = require('views/view');
const FloatPanel = require('./float-panel');
const vent = require('runtime/vent');

module.exports = View.extend({

  events: {
    'click .js-collapsible-dropdown-toggle': 'toggleCollapsible',
    'click .js-dropdown-toggle': 'onToggleDropdownClick',
    'click .js-close': 'hideAll'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.floatPanel = new FloatPanel({
      dynamicFloat: this.options.dynamicFloat
    });
    $document.on(this.getEventName('click'), this.onClickDocument.bind(this));
    vent.on('action-bar:show', this.onShowActionbar.bind(this));
    return this;
  },

  remove: function() {
    $document.off(this.getEventName('click'));
    return View.prototype.remove.apply(this, arguments);
  },

  render: function() {
    this.initFloatPanel();
    return this.renderDone();
  },

  initFloatPanel: function() {
    if (this.$el.hasClass('is-float')) {
      this.setElementToSubView(this.floatPanel);
    }
  },

  resetFloats: function() {
    if (this.$el.hasClass('is-float') && this.floatPanel) {
      this.floatPanel.reset();
    }
  },

  toggleCollapsible: function() {
    const isHidden = this.$('.js-collapsible-dropdown-block').hasClass('is-hidden');
    this.$('.js-collapsible-dropdown-toggle').toggleClass('is-active', isHidden);
    this.$('.js-collapsible-dropdown-block')
      .toggleClass('is-hidden', !isHidden)
      .toggleClass('is-active', isHidden);
  },

  toggleDropdown: function(dropdown) {
    const $dropdown = this.$('.js-dropdown-toggle[data-dropdown=' + dropdown + ']');
    this._toggle($dropdown);
  },

  _toggle: function($dropdown) {
    const dropdown = $dropdown.data('dropdown');
    const $dropdownBlock = this.$('.js-dropdown-block[data-dropdown=' + dropdown + ']');
    const isHidden = $dropdownBlock.hasClass('is-hidden');
    let offsetLeft;
    this.hideAll();

    if (isHidden) {
      $dropdown.addClass('is-active');
      $dropdown.find('.button.is-dropdown-toggle').addClass('is-active');
      $dropdownBlock.css({
        left: 0
      }); //reset before offset calculation
      $dropdownBlock.removeClass('is-hidden');
      offsetLeft = $dropdown.offset().left - $dropdownBlock.offset().left;
      if (offsetLeft < 0) {
        $dropdownBlock.css({
          left: offsetLeft + 'px'
        });
      }
    }
    this.rePositionDropdownContent();
  },

  rePositionDropdownContent: function() {
    const windowHeight = $window.height();
    const $wrap = this.$('.js-panel-actions-wrap');
    const isScrollableContent = $wrap.height() > windowHeight;
    const heightContent = windowHeight - 100;

    this.$('.js-list-actions-content').height(isScrollableContent ? heightContent : 'auto');
    this.$('.js-list-actions-content').toggleClass('is-scrollable', isScrollableContent);
  },

  hideAll: function() {
    this.$('.js-dropdown-toggle').removeClass('is-active');
    this.$('.js-dropdown-block').addClass('is-hidden').removeClass('is-active');
    this.$('.button.is-dropdown-toggle').removeClass('is-active');
    this.$('.js-collapsible-dropdown-block').addClass('is-hidden');
    this.rePositionDropdownContent();
    this.resetFloats();
  },

  onShowActionbar: function() {
    this.resetFloats();
  },

  onClickDocument: function(e) {
    const $el = $(e.target);
    const $parents = $el.parents();

    if ($el.hasClass('is-no-close-dropdown')) return;
    if ($parents.filter('.is-no-close-dropdown').length > 0) return;

    if ($el.hasClass('js-collapsible-dropdown-toggle')) return;
    if ($parents.filter('.js-collapsible-dropdown-toggle').length > 0) return;

    if ($parents.filter('.js-dropdown-block:visible').length !== 1) {
      this.hideAll();
    }
  },

  onToggleDropdownClick: function(e) {
    const $dropdown = this.$(e.currentTarget);
    this._toggle($dropdown);
    return false;
  }

});
