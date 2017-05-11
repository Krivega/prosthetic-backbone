'use strict';

const _ = require('underscore');
const utils = require('utils');
const View = require('views/view');
const Model = require('models/ui/datepicker-select');
const DATE_FORMAT = require('libs/datetime-formats').getServerFormat();

const template = require('ui/datepicker-select/templates/datepicker-select.nunj');

module.exports = View.extend({

  lastChangedName: null,

  template,

  events: {
    'change select': 'onChange'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    const modelOpts = _.pick(this.options, 'startYear', 'endYear', 'minDate', 'maxDate');
    this.model = new Model(modelOpts);
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    this.renderTemplate({
      name: this.options.name,
      label: this.options.label,
      labelDescription: this.options.labelDescription,
      mods: this.options.mods,
      readonly: this.options.readonly,
      compactOnMobile: this.options.compactOnMobile
    });
    this.$error = this.$('.js-error');
    this.setFocusLastChanged();
    return this.renderDone();
  },

  disableField: function(disable) {
    if (this.options.readonly !== disable) {
      this.options.readonly = disable;
      this.render();
    }
  },

  setOptions: function(options) {
    this.options = _.extend(this.options, options);
    return this;
  },

  setFocusLastChanged: function() {
    if (this.lastChangedName) {
      this.$('[name=' + this.lastChangedName + ']').focus();
    }
    return this;
  },

  setDate: function(date) {
    date = utils.createDate(_.isString(date) ? utils.formatDateToServer(date, true) : date);

    this.model.setData({
      day: date.date(),
      month: date.month() + 1,
      year: date.year()
    });

    return this;
  },

  getDate: function() {
    if (!this.isValid()) return null;
    const data = this.model.getData();
    const date = new Date(data.year, data.month - 1, data.day);

    return utils.convertNativeDateToMoment(date);
  },

  setYear: function(year = '') {
    this.model.set('year', year);
  },

  getDataSelects: function() {
    return utils.serializeObject(this.$el);
  },

  reset: function(options = {
    silent: false
  }) {
    this.val('', options);
  },

  val: function(date, options = {
    silent: false
  }) {
    if (date !== undefined) {
      this.setDate(date);
      if (!options.silent) {
        this.trigger('change', this.getDate());
      }
    }
    return this.getDate();
  },

  getDateFormatted: function() {
    if (!this.isValid()) return '';
    const date = this.getDate();
    return utils.formatDateToServer(utils.formatDateObject(date, DATE_FORMAT));

  },

  deleteDatepickerFields: function(data) {
    if (data) {
      delete data.year;
      delete data.month;
      delete data.day;
    }
  },

  isValid: function() {
    const data = this.model.getData();

    const hasAllFilledItems = _.keys(data).length === 3;

    let allItemsAreNotEmpty = true;
    _.each(data, (item) => {
      const itemIsNotEmpty = !!item;
      allItemsAreNotEmpty = allItemsAreNotEmpty && itemIsNotEmpty;
    });

    return hasAllFilledItems && allItemsAreNotEmpty;
  },

  setToModel: function() {
    const data = this.getDataSelects();
    this.model.set(data);
  },

  /**
   * @param {string?} message
   */
  toggleError(message) {
    const show = !!message;
    this.$error.toggleClass('is-visible', show);
    if (show) {
      this.$error.text(message);
    }
  },

  /**
   * Alias for compability with Validation form
   * @param message
   */
  showError: function(message) {
    this.toggleError(message);
  },

  onChange: function(e) {
    e.stopPropagation();
    this.lastChangedName = e.currentTarget.name;
    this.setToModel();
    const date = this.getDate();
    if (date) {
      this.setDate(date);
      this.trigger('change', date);
    }
  }
});
