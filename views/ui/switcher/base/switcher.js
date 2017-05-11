'use strict';

const _ = require('underscore');
const View = require('views/view');
const Model = require('models/model');
const template = require('ui/switcher/switcher.nunj');

module.exports = View.extend({

  className: 'switcher',

  template: template,

  events: {
    click: 'onClick'
  },

  defaultOptions: {
    labelOn: _t('on'),
    labelOff: _t('off'),
    isActive: false,
    isDropdownToggle: false
  },

  constructor: function(options = {}) {
    if (options.isDropdownToggle) {
      this.className += ' is-dropdown-toggle';
    }
    return View.prototype.constructor.apply(this, arguments);
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.options = _.defaults({}, this.options, this.defaultOptions);

    this.model = new Model({
      isActive: !!this.options.value,
      labelOn: this.options.labelOn,
      labelOff: this.options.labelOff
    });
    this.toggleSwitch();
    this.listenTo(this.model, 'change', this.toggleSwitch);
  },

  render: function() {
    this.renderTemplate();
    return this.renderDone();
  },

  toggleSwitch: function() {
    this.$el.toggleClass('is-active', this.getValue());
  },

  val: function(value) {
    if (value !== undefined) {
      this.model.set('isActive', value);
      return this;
    }
    return this.getValue();
  },

  toggleValue: function() {
    this.val(!this.getValue());
  },

  getValue: function() {
    return this.model.get('isActive');
  },

  toggleDropdown: function(hide) {
    this.$el.toggleClass('is-dropdown-active', !hide);
  },

  onClick: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.toggleValue();
    this.trigger('change', this.getValue());
  }

});
