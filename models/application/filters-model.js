'use strict';

const _ = require('underscore');
const utils = require('utils');
const Model = require('../model');

const MIN_ITEMS_PER_FILTERING = 1;

module.exports = Model.extend({

  defaults: {
    limit: 5,
    offset: 0,
    page: 1
  },

  lockedAttrs: {
    limit: true,
    offset: true,
    total: true
  },

  pagination: true,
  paginationMore: false,

  ignoredAttrs: ['limit', 'offset', 'page', 'total', 'directoryId'],

  initialize: function() {
    Model.prototype.initialize.apply(this, arguments);
    if (this.paginationMore) this.lockedAttrs.offset = false;
  },

  parse: function(data) {
    if (data.limit) data.limit = +data.limit;
    if (data.offset) data.offset = +data.offset;
    if (data.page) data.page = +data.page;

    return data;
  },

  getFilterUrlAttrs: function() {
    return this.toJSON();
  },

  toJSON: function() {
    let data = Model.prototype.toJSON.apply(this, arguments);
    data = _.omit(data, 'total');
    if (this.paginationMore) {
      data = _.omit(data, 'page');
    } else if (!this.pagination) {
      data = _.omit(data, 'limit', 'offset', 'page');
    }
    if (+data.page === 1) {
      delete data.page;
    }
    return utils.filterEmptyObject(data);
  },

  getTemplateData: function() {
    const data = Model.prototype.getTemplateData.apply(this, arguments);
    data.page = this.getPage();
    data.maxPage = this.getMaxPage();
    data.hasPrev = this.hasPrev();
    data.hasNext = this.hasNext();
    data.isFiltered = this.isFiltered();
    return data;
  },

  prevPage: function() {
    const page = this.getPage() - 1;
    this.toPage(page);
  },

  /**
   * For load more we need to change offset silently
   * @param silent
   */
  nextPage: function(silent) {
    const page = this.getPage() + 1;
    this.toPage(page, silent);
  },

  toPage: function(page, silent) {
    this.set({
      page: page,
      offset: this._getPageOffset(page)
    }, {
      silent: !!silent
    });
  },

  getMaxPage: function() {
    if (this.get('total') && this.get('limit')) {
      return Math.ceil(this.get('total') / this.get('limit'));
    }
    return 1;
  },

  hasPrev: function() {
    return this.getPage() > 1;
  },

  hasPages: function() {
    return true;
  },

  hasNext: function() {
    return this.getPage() < this.getMaxPage();
  },

  getPage: function() {
    return this.get('page') || this.defaults.page;
  },

  hasPagination: function() {
    return this.hasPrev() || this.hasNext();
  },

  hasMore: function() {
    return this.hasNext();
  },

  /**
   * Return 'true' if model contains applied filters
   * @return {Boolean}
   */
  isFiltered: function() {
    const ignoredAttrs = _.isFunction(this.ignoredAttrs) ?
      this.ignoredAttrs(this.attributes) : this.ignoredAttrs;
    let attrs = _.omit(this.attributes, ignoredAttrs);
    attrs = this._filterDefaultValues(attrs);
    attrs = utils.filterEmptyObject(attrs);
    return !_.isEmpty(attrs);
  },

  /**
   * Filter keys that contain values equal to defaults
   */
  _filterDefaultValues: function(obj) {
    const keys = Object.keys(obj);

    _.each(keys, function(key) {
      if (this.defaults[key] && this.defaults[key] === obj[key]) delete obj[key];
    }, this);

    return obj;
  },

  /**
   * Calculate offset for specified page
   * @return {number}
   */
  _getPageOffset: function(page) {
    const limit = this.get('limit');
    return limit * Math.abs(page - 1);
  },

  updateTotal: function(total) {
    if (total !== this.get('total')) {
      this.set('total', total, {
        silent: true
      });
      this.trigger('totalChanged');
    }
  },

  isFilterable: function() {
    return this.isFiltered() || this.get('total') > MIN_ITEMS_PER_FILTERING;
  },

  resetFilters: function(options) {
    this.clear(options);
  }

});
