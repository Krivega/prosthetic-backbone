/*
 *  Generic Collection
 */
'use strict';

const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('jquery');
const config = require('../config');
const utils = require('../utils');

module.exports = Backbone.Collection.extend(/** @lends BaseCollection.prototype */{

  apiURL: undefined,

  /**
   * @class BaseCollection
   * @augments Backbone.Collection
   * @property {string} apiURL
   * @constructor
   * @name BaseCollection
   */
  initialize: function(models, options) {
    this.options = options || {};
  },

  /**
   * Extend self instance options property
   *
   * @param {object} options
   * @return {object} this
   */
  extendOptions: function(options) {
    _.extend(this.options, options);
    return this;
  },

  /**
   * Get language
   * Unfortunately, session is a model itself
   * so we need to resolve circular dependency
   * @return {string}
   */
  language: function() {
    return _t('lang');
  },

  /**
   * Get taxonomy Root from runtime session
   * Unfortunately, session is a model itself
   * so we need to resolve circular dependency
   * @return {string}
   */
  taxonomyRoot: function() {
    return require('runtime/session').taxonomyRoot();
  },

  /**
   * Replace Backbone.Model.prototype.url method
   * Get url to api
   *
   * @params {string} url
   * @return {string} url to api
   */
  url: function() {
    let apiURL = _.result(this, 'apiURL');

    apiURL = utils.formatUrl(apiURL, this.options);

    return config.apiURL + '/api/' +
      _.result(this, 'language') +
      apiURL;
  },

  /**
   * override Backbone.Collection.prototype.fetch method
   * added filters support
   *
   * @params {object} options
   * @return {object} deferred or xhr
   */
  fetch: function(options) {
    const filters = this.getFilters(options);
    let defered;

    if (_.isObject(filters) && !_.isEmpty(filters)) {
      options = options || {};
      options.data = _.extend(filters, options.data);
    } else if (!filters) {
      defered = new $.Deferred();
      defered.resolve();
      return defered;
    }
    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  /**
   * override Backbone.Collection.prototype._prepareModel method
   * Create new model with additional attributes from method getAttributes
   * and add it to collection
   *
   * @params {object} attrs
   * @params {object} options
   * @return {object} model
   */
  _prepareModel: function(attrs, options) {
    const attributes = this.getAttributes(attrs, _.extend({}, this.options, options));
    options = options ? _.clone(options) : {};

    if (_.isObject(attributes) && !_.isEmpty(attributes)) {
      attrs = attrs || {};
      attrs = _.extend(attributes, attrs);
    }
    return Backbone.Collection.prototype._prepareModel.call(this, attrs, options);
  },

  /**
   * Returns arguments for collection.fetch
   *
   * @return {object}
   */
  getFilters: function(options) { // jshint ignore:line
    return {};
  },

  /**
   * Returns arguments for collection._prepareModel
   *
   * @return {object}
   */
  getAttributes: function(attrs, options) { // jshint ignore:line
    return {};
  },

  validateModels: function() {
    let isValid = true;
    this.each(function(model) {
      isValid = !model.validate() && isValid;
    });
    return isValid;
  },

  /**
   * Validate all models in collection
   * @deprecated
   * @return {boolean}
   */

  // TODO @adokuchaev: this do not work as expected,
  // its return true everywhere, cause in Model
  // toValidate: function(validatedAttrs, attrs) {...}
  // - expect validatedAttrs for comparison logic.
  // Use validateForm() on subviews instead.
  toValidateModels: function() {
    let isValid = true;
    this.each(function(model) {
      isValid = !!model.toValidate().isValid && isValid;
    });
    return isValid;
  },

  collectData: function() {
    return this.invoke('collectData');
  },

  /**
   * collection update
   *
   * @return {object} xhr
   */
  updateAll: function(options) {
    return Backbone.sync('update', this, options);
  },

  /**
   * Clone collection with api url
   *
   * @return {object} new collection
   */
  clone: function() {
    const collectionClone = Backbone.Collection.prototype.clone.apply(this, arguments);
    collectionClone.apiURL = this.apiURL;
    return collectionClone;
  },

  /**
   * Get list of template date from each models
   *
   * @return {array}
   */
  getTemplateData: function() {
    return {
      length: this.length,
      items: this.map(function(model) {
        if (model.getTemplateData) {
          return model.getTemplateData();
        } else {
          return model.toJSON();
        }
      })
    };
  },

  /**
   * This method will be overwritten in application/ajax-model-mixin
   *
   * @returns {boolean}
   */
  isLoading: function() {
    return false;
  },

  /**
   * This method check length property
   *
   * @returns {boolean}
   */
  isNotEmpty: function() {
    return this.length > 0;
  },

  /**
   * Set parse data
   *
   * @param {object} data
   * @param {object} options
   * @returns {object} model
   */
  setWithParse: function(data, options) {
    data = this.parse(data, options);
    return this.set(data, options);
  },

  /**
   * Move model to new position
   * @param {BaseModel} model
   * @param {number} position
   * @returns {BaseCollection}
   */
  move: function(model, position) {
    this.remove(model, {
      silent: true
    });
    this.add(model, {
      at: position,
      silent: true
    });
    this.trigger('move', model, position);
  },

  filterModels: function(filters, options) {
    return this.invoke('filter', filters, options);
  }

});
