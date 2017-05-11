/**
 *  Box to hide/show content and dynamically load it
 */
'use strict';

var View = require('views/view');
var PreloaderView = require('views/application/preloader');

module.exports = View.extend({
  events: {
    'click .js-toggle-title': 'onClick'
  },

  isOpened: false,
  isLoaded: true,

  preloader: null,

  /**
   * Options
   * @property {Boolean} remote Data loaded from remote source, use preloader
   * @property {Boolean} opened Set this option to 'true' to open box by default
   */
  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    if (this.options.remote) {
      this.isLoaded = false;
      this.preloader = new PreloaderView();
    }
  },

  render: function() {
    if (this.options.opened) this.open();
    if (this.preloader) this.preloader.setElement(this.el);
    return this;
  },

  onClick: function() {
    this.toggleContent(this.isOpened);
  },

  toggleContent: function(hide) {
    if (hide) {
      this.close();
    } else {
      this.open();
    }
    return this;
  },

  toggleTitle: function(hide) {
    this.$('.js-toggle-title').toggleClass('is-hidden', hide);
    return this;
  },

  open: function() {
    if (this.isLoaded) {
      this.$el.addClass('is-open');
      this.isOpened = true;
    } else {
      this.load();
    }
  },

  close: function() {
    this.$el.removeClass('is-open');
    this.isOpened = false;
  },

  isOpenedBox: function() {
    return this.isOpened;
  },

  load: function() {
    this.preloader.showPreloader();
    this.trigger('onLoad', this);
  },

  loadFinished: function() {
    this.loadAlways();

    this.isLoaded = true;
    this.open();
  },

  loadAlways: function() {
    this.preloader.hidePreloader();
  }

});
