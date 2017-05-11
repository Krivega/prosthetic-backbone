'use strict';

const View = require('views/view');
const vent = require('runtime/vent');

const REMOVE_LOADING_TIMEOUT = 8000; // 8 sec

const LinksManager = View.extend({

  events: {
    'click .js-btn-link': 'onLinkClick'
  },

  navigationDisabled: false,
  loaderTimeout: null,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.setElement($body);
    this.removeLoaderFromButtonLinks();
    vent.on('form-state-handler:unload-confirmation-shown', this.onPageUnload.bind(this));
  },

  removeLoaderFromButtonLinks: function() {
    if (this.loaderTimeout) clearTimeout(this.loaderTimeout);
    this.$('.js-btn-link').removeClass('is-loading');
  },

  addLoader: function($el) {
    if (this.isTargetBlank($el)) return;
    if (this.loaderTimeout) clearTimeout(this.loaderTimeout);
    $el.toggleClass('is-loading', this.isWithLoader($el));
    this.loaderTimeout = setTimeout(() => {
      $el.removeClass('is-loading');
    }, REMOVE_LOADING_TIMEOUT);
  },

  isTargetBlank: function($el) {
    const target = $el.attr('target');
    return target && target === '_blank';
  },

  isWithLoader: function($el) {
    const href = $el.attr('href');
    // prevent loader on hash links
    return !href || href.indexOf('#') !== 0;
  },

  isNavigationDisabled: function() {
    return this.navigationDisabled;
  },

  disableNavigation: function() {
    this.navigationDisabled = true;
  },

  enableNavigation: function() {
    this.navigationDisabled = false;
  },

  onPageUnload: function() {
    this.removeLoaderFromButtonLinks();
  },

  onLinkClick: function(e) {
    if (this.isNavigationDisabled()) {
      e.preventDefault();
      e.stopPropagation();
    }
    // do not add loader if with ctrl
    if (!e.ctrlKey) {
      this.removeLoaderFromButtonLinks();
      this.addLoader(this.$(e.currentTarget));
    }
  }

});

module.exports = new LinksManager({
  el: $document
});
