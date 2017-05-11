'use strict';

const _ = require('underscore');
const Collection = require('../collection');

module.exports = Collection.extend({

  // If set to true - filtering will occur on client
  clientSide: false,

  setFiltersModel: function(model) {
    this.filtersModel = model;
    this.listenTo(this.filtersModel, 'change', this.onFiltersModelChange);
  },

  getFilters: function() {
    return this.filtersModel.toJSON();
  },

  loadMore: function() {
    this.filtersModel.nextPage(true);
    return this.load({
      reset: false,
      remove: false
    });
  },

  load: function(options) {
    this.abortCurrentRequest();
    options = _.extend({
      reset: true,
      remove: true
    }, options);

    if (options.remove) this.trigger('request:remove');

    this.fetchXHR = this.fetch(options);
    return this;
  },

  isLoading: function() {
    return this.fetchXHR && this.fetchXHR.readyState > 0 && this.fetchXHR.readyState < 4;
  },

  abortCurrentRequest: function() {
    if (this.isLoading()) {
      this.fetchXHR.abort();
    }
  },

  parse: function(response) {
    if (response && response.items !== undefined && response.total !== undefined) {
      this.filtersModel.updateTotal(response.total);
      return response.items;
    }
    return response;
  },

  getTemplateData: function() {
    const data = Collection.prototype.getTemplateData.apply(this, arguments);

    if (this.clientSide) {
      const filters = this.filtersModel.toJSON();
      if (!_.isEmpty(filters)) {
        data.items = _.invoke(this.applyFilters(filters), 'toJSON');
        data.length = data.items.length;
      }
    }

    data.directoryId = this.options.directoryId;
    return data;
  },

  applyFilters: function(filters) {
    return this.where(filters);
  },

  hasMore: function() {
    return this.filtersModel.hasMore();
  },

  onFiltersModelChange: function() {
    if (this.clientSide) {
      const filters = this.filtersModel.toJSON();
      // silent for disable item render because next=>reset=> render all
      this.filterModels(filters, {
        silent: true
      });
      this.trigger('reset');
      return this;
    }
    this.load();
    return this;
  }

});
