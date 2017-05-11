'use strict';

const _ = require('underscore');
const View = require('views/view');
const DatepickerView = require('views/ui/datepicker');

module.exports = View.extend({

  pickers: null,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.pickers = {};

  },

  render: function() {
    this.$('[type=date]').each(this.renderPicker.bind(this));
    return this;
  },

  remove: function() {
    for (let item in this.pickers) {
      this.picker[item].remove();
    }
    return View.prototype.initialize.apply(this, arguments);
  },

  renderPicker: function(index, el) {
    let picker = new DatepickerView({
      el: el,
      onShow: this.onPickerShow.bind(this)
    });
    this.pickers[el.name] = picker.render();
  },

  closePickers: function() {
    for (let item in this.pickers) {
      this.pickers[item].hide();
    }
  },

  getDateFormatted: function(name) {
    if (!this.pickers[name]) return '';
    return this.pickers[name].getDateFormatted();
  },

  isValid: function(name) {
    if (!this.pickers[name]) return false;
    return this.pickers[name].isValid();
  },

  getDatesFormatted: function() {
    const dates = {};
    for (let item in this.pickers) {
      dates[item] = this.pickers[item].getDateFormatted();
    }
    return dates;
  },

  getPicker: function(name) {
    return this.pickers[name];
  },

  val: function(name, date, options) {
    if (!this.pickers[name]) return;
    return this.pickers[name].val(date, options);
  },

  fill: function(data) {
    _.each(data, (value, name) => {
      this.val(name, value, {
        format: true
      });
      if (this.pickers[name]) delete data[name];
    }, this);
  },

  onPickerShow: function() {
    this.trigger('datepicker:show');
  }

});
