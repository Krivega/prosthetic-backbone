/**
 * @fileOverview Basic view for filters panel
 */

'use strict';

const _ = require('underscore');
const utils = require('../../../utils');
const Form = require('../../application/form');

const DEBOUNCE_TIMEOUT = 300;

module.exports = Form.extend({

  serializeAndDisabled: true,

  pagination: true,

  changeDelay: DEBOUNCE_TIMEOUT,

  /** Fields that are converted to numbers */
  numericFields: false,

  /** Fields subset for this panel */
  fields: false,

  events: _.extend({
    'click .js-filter-reset': 'onClickReset'
  }, Form.prototype.events),

  initialize: function() {
    Form.prototype.initialize.apply(this, arguments);

    this.updateModelDebounced = _.throttle(this.updateModel, this.changeDelay);
    this.initModelListeners();
    this.listenTo(this, 'renderDone', this.toggleBlocks);
  },

  initModelListeners: function() {
    if (this.model) {
      this.listenTo(this.model, 'change', this.updateReset);
      this.listenTo(this.model, 'totalChanged', this.toggleFilters);
    }
    return this;
  },

  render: function() {
    this.renderTemplate();
    this.toggleBlocks();
    return this.renderDone();
  },

  toggleBlocks: function() {
    this.updateReset();
    this.toggleFilters();
  },

  updateReset: function() {
    if (this.$('.js-reset-block').length > 0) {
      this.$('.js-reset-block').toggleClass('is-hidden', !this.model.isFiltered());
    }
  },

  toggleFilters: function() {
    this.toggle(!this.model.isFilterable());
  },

  clear: function() {
    this.model.clear({
      silent: true
    });
    this.$('input').each((index, input) => {
      this.$(input).val('');
    });
    return this;
  },

  updateModel: function() {
    const data = this.serialize();

    if (!_.isEmpty(this.numericFields)) {
      _.each(this.numericFields, (field) => {
        if (_.has(data, field)) {
          data[field] = +data[field];
        }
      });
    }

    // filters are same, we don't have a need to set it again
    if (utils.isMatch(this.model.attributes, data, this.fields)) return;

    if (this.fields) {
      this.fields.forEach((field) => {
        this.model.unset(field, {
          silent: true
        });
      });
      if (this.pagination) {
        this.model.unset('page', {
          silent: true
        });
      }
    } else {
      this.model.clear({
        silent: true
      });
    }

    this.model.set(data, {
      silent: !!this.pagination,
      validate: true
    });

    if (this.pagination) {
      this.model.toPage(1);
    }
  },

  onClickReset: function() {
    this.model.reset();
    this.render();
  },

  onChange: function() {
    Form.prototype.onChange.apply(this, arguments);
    this.updateModelDebounced();
  }

});
