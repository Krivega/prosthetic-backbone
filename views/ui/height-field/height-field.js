'use strict';

/**
 * @usage:
 * <div class="js-height-field"
 *      data-name="verticalJump" data-value="{{ verticalJump }}" data-label="jump"></div>
 */

const View = require('views/view');
const utils = require('utils');
const HeightModel = require('models/ui/height-field/height-field');
const keycodeHandler = require('libs/keycode-handler');

const template = require('ui/height-field/height-field.nunj');

module.exports = View.extend({

  template,

  events: {
    'keyup [type=formattedNumber]': 'onFormatInputKeydown',
    'change [name=height-feet]': 'onInputFeetChange',
    'keyup [name=height-feet]': 'onInputFeetChange',
    'change [name=height-inch]': 'onInputInchChange',
    'keyup [name=height-inch]': 'onInputInchChange',
    'change [name=height-metric]': 'onInputMetricChange',
    'keyup [name=height-metric]': 'onInputMetricChange',
    'change [name=height-dimention]': 'onDimentionChange'
  },

  initialize: function(options) {
    this.model = this.model || new HeightModel(options);
    View.prototype.initialize.apply(this, arguments);
  },

  render: function() {
    this.renderTemplate();
    this.renderDone();
  },

  toggleBlocks: function() {
    const isMetric = this.model.isMetric();
    this.$('.js-inches-values').toggleClass('is-hidden', isMetric);
    this.$('.js-metric-values').toggleClass('is-hidden', !isMetric);
  },

  val: function(value) {
    if (value === undefined) {
      return this.model.getValue();
    } else {
      this.model.setWithParse({
        value
      });
      this.updateValues();
    }
  },

  updateValues: function() {
    this.alterInput(this.$('input[name=height-feet]'), this.model.getFeetValue(), true);
    this.alterInput(this.$('input[name=height-inch]'), this.model.getInchValue());
    this.alterInput(this.$('input[name=height-metric]'), this.model.getMetricValue());
  },

  alterInput: function($input, fieldValue, isFormat = false) {
    $input.val(fieldValue);
    if (isFormat) {
      this.formatInputNumberValue($input[0]);
    }
  },

  onFormatInputKeydown: function(e) {
    this.formatInputNumberValue(e.currentTarget, !keycodeHandler.isTabKeyEvent(e));
  },

  formatInputNumberValue: function(target, isTab) {
    const options = this.$(target).data();
    options.isIgnoreCaret = !isTab;
    utils.formatInputNumberValue(target, options);
  },

  onDimentionChange: function(e) {
    this.model.setDimention(e.currentTarget.value);
    this.updateValues();
    this.toggleBlocks();
  },

  onInputFeetChange: function(e) {
    const feetVal = utils.getOnlyNumber(e.currentTarget.value);
    this.model.setFootAndInchData(feetVal, this.model.getInchValue());
  },

  onInputInchChange: function(e) {
    const inchVal = +e.currentTarget.value;
    this.model.setFootAndInchData(this.model.getFeetValue(), inchVal);
  },

  onInputMetricChange: function(e) {
    this.model.setMetricData(e.currentTarget.value);
  }

});
