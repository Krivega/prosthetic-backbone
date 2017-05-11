'use strict';

/**
 * @description This is a mixin for model that are loading via ajax
 *              if (singleLoading set to true, model won't be loaded 2nd time,
 *              you can redefine load method to load via POST, PUT etc...;
 * @note Call initAjaxListeners on initialize!
 * @type {{singleLoading: boolean, loaded: boolean, loading: boolean, load: Function, canBeLoaded:
 *   Function, isSingleLoading: Function, isLoading: Function, isLoaded: Function}}
 * @mixin AjaxModelMixin
 */

module.exports = {

  singleLoading: false, // model won't be loaded 2nd time
  loaded: false,
  loading: false,
  error: false,

  // call this method in the initializing your model
  initAjaxListeners: function() {
    this.listenTo(this, 'request', this.onRequest);
    this.listenTo(this, 'sync', this.onSync);
    this.listenTo(this, 'error', this.onError);
  },

  onRequest: function() {
    this.isLoaded(false);
    this.isLoading(true);
    this.isError(false);
  },

  onSync: function() {
    this.isLoaded(true);
    this.isLoading(false);
  },

  onError: function() {
    this.onSync();
    this.isError(true);
  },

  load: function(options) {
    if (this.canBeLoaded()) {
      return this.fetch(options);
    }
    return this;
  },

  canBeLoaded: function() {
    if (this.isLoading()) return false;
    return !(this.isLoaded() && this.isSingleLoading());
  },

  isSingleLoading: function() {
    return this.singleLoading;
  },

  isLoading: function(loading) {
    if (loading === undefined) {
      return this.loading;
    }
    this.loading = loading;
    return this;
  },

  isLoaded: function(loaded) {
    if (loaded === undefined) {
      return this.loaded;
    }
    this.loaded = loaded;
    return this;
  },

  isError: function(error) {
    if (error === undefined) {
      return this.error;
    }
    this.error = error;
    return this;
  }

};
