'use strict';

const View = require('views/view');
const utils = require('utils');
const scroller = require('views/ui/scroller');

module.exports = View.extend({

  ignoreURLHash: false,

  events: {
    'click .js-tab-toggle': 'onToggleClick',
    'click .js-tab-show': 'onShowClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.ignoreURLHash = this.options.ignoreURLHash;
  },

  render: function() {
    View.prototype.render.apply(this, arguments);
    if (!this.ignoreURLHash) {
      const tab = utils.getLocationHash();
      if (tab) {
        this.showTab(tab, true);
      }
    }
  },

  val: function(value, options) {
    options = options || {};
    if (value === undefined) {
      return this.getActiveTabValue();
    }
    this.showTab(value, {
      scroll: options.withScroll,
      silent: options.silent
    });
    return this;
  },

  toggle: function(elTab, options) {
    const $tab = this.$(elTab);
    const tab = $tab.data('tab');
    const isDisable = $tab.hasClass('is-disable');
    if (!tab || isDisable) return;
    this.showTab(tab, options);
    this.trigger('change', tab);
  },

  showTab: function(tab, options = {}) {
    if (!this.isValidSelectorTab(tab)) return;
    const $tab = this.getTabElementByName(tab);
    const $tabContent = this.getTabContentByName(tab);
    if ($tab.length === 0) return;

    const hasActive = $tab.hasClass('is-active');
    const isAlltab = this.options.filtered && tab === 'all';
    if (isAlltab) {
      this.resetTabs($tab, tab);
    } else if (!hasActive || this.options.filtered) {
      this.hideTabs($tab, tab);
    }

    if (!hasActive || options.force) {
      $tab.addClass('is-active');
      if (!isAlltab) {
        $tabContent.removeClass('is-hidden');
        if (this.options.stateForFiltered) {
          $tabContent.removeClass(this.options.stateForFiltered);
        }
      }
      if (!options.silent) {
        this.trigger('show:tab', tab);
      }
    }

    if (options.scroll) {
      this.scrollToTab($tab);
    }
  },

  scrollToTab: function($tab) {
    scroller.scrollTo($tab);
  },

  enableTab: function(tab) {
    if (!this.isValidSelectorTab(tab)) return;
    const $tab = this.getTabElementByName(tab);
    $tab.removeClass('is-disable');
  },

  disableTab: function(tab) {
    if (!this.isValidSelectorTab(tab)) return;
    const $tab = this.getTabElementByName(tab);
    $tab.addClass('is-disable');
  },

  hideTabs: function($tab, tab) {
    let $tabContent = this.getTabContentByName(tab);
    $tabContent = $tabContent.siblings('.js-tab-content');

    $tab.siblings('.js-tab-toggle').removeClass('is-active');

    $tabContent.addClass('is-hidden');
  },

  resetTabs: function($tab) {
    const tabs = $tab.data('tabs');
    const $tabsContent = this.$('.js-tabs-content[data-tabs=' + tabs + ']');
    const $tabContent = $tabsContent.find('.js-tab-content');

    $tab.siblings('.js-tab-toggle').removeClass('is-active');

    $tabContent.removeClass('is-hidden');
    if (this.options.stateForFiltered) {
      $tabContent.addClass(this.options.stateForFiltered);
    }
  },

  getActiveTabValue: function() {
    return this.$('.js-tab-toggle.is-active').data('tab');
  },

  getTabElementByName: function(tab) {
    return this.$(`.js-tab-toggle[data-tab=${tab}]`);
  },

  getTabContentByName: function(tab) {
    return this.$(`.js-tab-content[data-tab=${tab}]`);
  },

  isValidSelectorTab: function(tab) {
    return /[a-zA-Z0-9]/g.test(tab);
  },

  onToggleClick: function(e) {
    e.preventDefault();
    this.toggle(e.currentTarget);
  },

  onShowClick: function(e) {
    e.preventDefault();
    this.toggle(e.currentTarget, {
      force: true
    });
  }
});
