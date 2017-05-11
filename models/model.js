'use strict';
/*
 *  Generic Model
 */

const Backbone = require('backbone');
const _ = require('underscore');
const config = require('../config');
const utils = require('../utils');

module.exports = Backbone.Model.extend(/** @lends BaseModel.prototype */ {

  apiURL: null,

  lockedAttrs: {},

  _initialAttributes: {},

  access: {},

  /**
   * @class BaseModel
   * @augments Backbone.Model
   * @property {string} apiURL
   * @property {object} lockedAttrs - cannot remove attributes
   * @property {object} _initialAttributes - add attribute when init
   * @property {object} access
   * @constructor
   * @name BaseModel
   */
  constructor: function() {
    Backbone.Model.prototype.constructor.apply(this, arguments);
    this._initialAttributes = _.clone(this.attributes);
  },

  /**
   * @description Check access to business logic
   *
   * @param {object} user
   * @param {string} method - method name
   * @return {boolean}
   */
  checkAccess: function(user, method, options) {
    const methodName = this.access[method];
    if (methodName && this[methodName]) {
      return this[methodName].call(this, user, options);
    } else {
      return false;
    }
  },

  /**
   * @description Get language
   * Unfortunately, session is a model itself
   * so we need to resolve circular dependency
   *
   * @return {string}
   */
  language: function() {
    return _t('lang');
  },

  /**
   * @description Get taxonomy Root from runtime session
   * Unfortunately, session is a model itself
   * so we need to resolve circular dependency
   *
   * @return {string}
   */
  taxonomyRoot: function() {
    // Unfortunately, session is a model itself
    // so we need to resolve circular dependency
    return require('runtime/session').get('taxonomyRoot');
  },

  /**
   * @description Get root url
   *
   * @return {string}
   */
  urlRoot: function() {
    const apiURL = this.replaceURLParams();

    if (!apiURL) return;
    return this.getUrl(apiURL);
  },

  /**
   * @description Replace params in url
   *
   * @params {string} url
   * @params {object} additionalAttrs
   * @params {object} options
   * @return {string}
   */
  replaceURLParams: function(url, additionalAttrs, options) {
    options = options || {};
    url = url || _.result(this, 'apiURL');
    if (!this.url) return '';

    const attrs = _.clone(this.attributes || {});

    if (additionalAttrs) _.extend(attrs, additionalAttrs);

    if (options.langUrl) return utils.formatLangUrl(url, attrs);

    return utils.formatUrl(url, attrs);
  },

  /**
   * @description Get url to api
   *
   * @params {string} url
   * @return {string} url to api
   */
  getUrl: function(url) {
    return config.apiURL + '/api/' + _.result(this, 'language') + (url || '');
  },

  /**
   * @description Call Backbone.Model.prototype.url method
   * and add slash if model is not new
   *
   * @params {string} url
   * @return {string}
   */
  url: function() {
    const url = Backbone.Model.prototype.url.call(this);
    return this.isNew() ? url : url + '/';
  },

  /**
   * @description Override Backbone sync method
   * Added a syncMethod property to options object
   * which change HTTP request method
   *
   * @params {string} method - the CRUD method
   * @params {BaseModel} model - the model to be saved
   * @params {object} options – success and error callbacks,
   * and all other jQuery request options
   * @params {string} options.syncMethod - specified HTTP request method
   * @return {object} xhr
   */
  sync: function(method, model, options) {
    if (options.syncMethod && options.syncMethod !== method) {
      if (options.syncMethod === 'POST') {
        method = 'create';
      } else if (options.syncMethod === 'PUT') {
        method = 'update';
      }
    }
    return Backbone.Model.prototype.sync.apply(this, [method, model, options]);
  },

  /**
   * @description toJSON method wrapper
   *
   * @return {object} JSON object
   */
  collectData: function() {
    return this.toJSON();
  },

  /**
   * @description Clear all attributes(without locked attributes) on the model, firing `"change"`.
   *
   * @param {object} options - set method options
   * @return {object} model
   */
  clear: function(options) {
    const lockedAttrs = _.isFunction(this.lockedAttrs) ?
      this.lockedAttrs(this.attributes) : this.lockedAttrs;

    const attrs = {};
    for (let key in this.attributes) {
      if (lockedAttrs[key]) continue;
      attrs[key] = void 0;
    }
    return this.set(attrs, _.extend({}, options, {
      unset: true
    }));
  },

  /**
   * @description Reset model data
   *
   * @param {object} data - new data
   * @param {object} options
   * @param {boolean} options.parse - need parse
   * @return {BaseModel} model
   */
  reset: function(data, options) {
    this.clear(options);
    if (options && options.parse) data = this.parse(data, options);
    return this.set(data, options);
  },

  /**
   * @description Clone model with apiURL
   *
   * @return {BaseModel} model
   */
  clone: function() {
    const modelClone = Backbone.Model.prototype.clone.apply(this, arguments);
    modelClone.apiURL = this.apiURL;
    return modelClone;
  },

  /**
   * @description Get template data
   *
   * @return {object} data attributes with specify parameters
   * if model on collection then added next parameters:
   * collectionLength, collectionIndex, isFirst, isLast
   */
  getTemplateData: function() {
    const data = _.clone(this.attributes);
    if (this.collection) {
      data.collectionLength = this.getCollectionLength();
      data.collectionIndex = this.getCollectionIndex();
      data.isFirst = this.isFirst();
      data.isLast = this.isLast();
    }
    return data;
  },

  /**
   * @description Set parse data
   *
   * @param {object} data
   * @param {object} options
   * @return {BaseModel} model
   */
  setWithParse: function(data, options) {
    data = this.parse(data, options);

    return this.set(data, options);
  },

  /**
   * @description Remove model from collection
   *
   * @return {BaseModel} model
   */
  remove: function() {
    return this.collection.remove(this);
  },

  /**
   * @description Returns collection length
   *
   * @return {number} length
   */
  getCollectionLength: function() {
    return this.collection.length;
  },

  /**
   * @description Get model index in collection
   *
   * @param {object?} options
   * @param {boolean} options.from1 - index + 1
   * @return {number} index
   */
  getCollectionIndex: function(options) {
    options = options || {};
    let index = this.collection.indexOf(this);
    if (options.from1) index++;
    return index;
  },

  /**
   * @description Returns true if model first in collection
   *
   * @return {boolean}
   */
  isFirst: function() {
    const collectionIndex = this.getCollectionIndex();
    return collectionIndex === 0;
  },

  /**
   * @description Returns true if model last in collection
   *
   * @return {boolean}
   */
  isLast: function() {
    const collectionIndex = this.getCollectionIndex();
    const collectionLength = this.getCollectionLength();
    return collectionIndex === collectionLength - 1;
  },

  /**
   * @description This method will be overwritten in application/ajax-model-mixin
   *
   * @returns {boolean}
   */
  filter: function(filters, options) {
    return this.setNotRendered(!utils.isMatch(this.toJSON(), filters), options);
  },

  isLoading: function() {
    return false;
  },

  /**
   * @description Set rendered state model for filter rendered
   *
   * @return {boolean}
   */
  setNotRendered: function(_isNotRendered, options) {
    return this.set('_isNotRendered', !!_isNotRendered, options);
  },

  /**
   * @description Returns true if model  not rendered
   *
   * @return {boolean}
   */
  isNotRendered: function() {
    return !!this.get('_isNotRendered');
  },

  /**
   * @description Returns properties with which model was created.
   *
   * @param {string} attr - property name
   * @return {*}
   */
  initial: function(attr) {
    if (attr == null || !this._initialAttributes) return null;
    return this._initialAttributes[attr];
  }

});
