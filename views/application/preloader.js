'use strict';

const View = require('views/view');
const _ = require('underscore');
const scroller = require('views/ui/scroller');

module.exports = View.extend({

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.views = [];
    if (this.options.view) this.setView(this.options.view);
    if (this.options.views) this.setViews(this.options.views);
    if (this.options.model) this.setModel(this.options.model);
    if (this.options.collection) this.setCollection(this.options.collection);
    if (this.options.successCallback) this.setSuccessCallback(this.options.successCallback);
    this.timeout = this.options.timeout || 0;

    this.showPreloader();
    this.refreshStatus();
  },

  setSuccessCallback: function(callback) {
    this.successCallback = callback;
    return this;
  },

  processSuccessCallback: function() {
    if (this.successCallback) this.successCallback();
    return this;
  },

  togglePreloader: function(hide) {
    if (hide) {
      this.hidePreloader();
    } else {
      this.showPreloader();
    }
    return this;
  },

  scrollToPreloader: function() {
    scroller.scrollTo(this.$el);
  },

  setPreloaderLoadingText: function(val) {
    this.$('.js-preloader-text-loading').text(val);
    return this;
  },

  showPreloader: function(options = { isNeedToScroll: false }) {
    if (this._getPreloaderBlock().length !== 0) {
      this._getPreloaderBlock().addClass('is-loading');
      this._getPreloader().addClass('is-loading').removeClass('is-hidden');
    }

    if (options.isNeedToScroll) {
      this.scrollToPreloader();
    }

    return this;
  },

  hidePreloader: function() {
    if (this._getPreloaderBlock().length !== 0) {
      if (this.options.showDone) {
        this._hideWithDone();
      } else {
        if (this.timeout) {
          setTimeout(this._hidePreloader.bind(this), this.timeout);
        } else {
          this._hidePreloader();
        }
      }
    }
    return this;
  },

  _hidePreloader: function() {
    this._getPreloaderBlock().removeClass('is-loading');
    this._getPreloader().removeClass('is-loading').addClass('is-hidden');
    this.processSuccessCallback();
  },

  _hideWithDone: function() {
    this.showDone();
    this._getPreloaderBlock().fadeOut({
      duration: 2000,
      complete: () => {
        this._getPreloaderBlock().fadeIn(200);
        this._getPreloaderBlock().removeClass('is-loading');
        this._getPreloader().removeClass('is-done');
      }
    });
  },

  showDone: function() {
    this._getPreloader().removeClass('is-loading').removeClass('is-hidden').addClass(
      'is-done');
  },

  _getPreloaderBlock: function() {
    if (this.$el.hasClass('js-preloader-block')) {
      return this.$el;
    } else {
      return this.$('.js-preloader-block').first();
    }
  },

  _getPreloader: function() {
    return this._getPreloaderBlock().find('.js-preloader').first();
  },

  /**
   * this will method listen to views only once
   * use in widgets, for waiting until view is not rendered
   *
   * @param views
   */
  setViews: function(views) {
    const _this = this;
    if (!_.isArray(views)) views = [views];
    _.each(views, function(view) {
      _this.addView(view);
    });
  },

  addView: function(view) {
    this.listenTo(view, 'renderDone', this.onViewLoaded);
    this.views.push(view);
  },

  /**
   * use this method when you have one view,
   * and need to listen for a ajax loading
   * @param view
   */
  setView: function(view) {
    this.listenTo(view, 'loading', this.showPreloader);
    this.listenTo(view, 'renderDone', this.hidePreloader);
  },

  setCollection: function(collection) {
    this.listenTo(collection, 'request', this.showPreloader);
    this.listenTo(collection, 'sync error', this.hidePreloader);
    if (collection.isLoading()) this.showPreloader();
  },

  setModel: function(model) {
    this.listenTo(model, 'request', this.showPreloader);
    this.listenTo(model, 'sync error', this.hidePreloader);
    if (model.isLoading()) this.showPreloader();
  },

  refreshStatus: function() {
    this.state = 'loaded';
    _.each(this.views, (view) => {
      if (view.state !== undefined && view.state !== 'loaded') {
        this.state = view.state;
      }
    });
    return this;
  },

  onViewLoaded: function() {
    this.refreshStatus();
    if (this.isLoaded()) {
      this.hidePreloader();
    }
  }

});
