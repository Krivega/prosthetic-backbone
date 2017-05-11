'use strict';

var _ = require('underscore');
var View = require('views/view');
var fdSlider = require('plugins/fd-slider');
var template = require('ui/slider-control/templates/slider-control.nunj');
module.exports = View.extend({
  template: template,

  events: _.defaults({
    'click .js-slider-control-plus': 'onPlusClick',
    'click .js-slider-control-minus': 'onMinusClick'
  }, View.prototype.events),

  render: function() {
    this.options.id = this.cid;
    this.renderTemplate(this.options);
    this.val(this.options.value || 0);
    var input = this.$('input')[0];
    this.slider = fdSlider.createSlider(_.extend({
      inp: input,
      callbacks: {
        change: [_.bind(this.onChange, this)],
        update: [_.bind(this.onChange, this)]
      }
    }, this.options));
    return this;
  },

  onChange: function(e) {
    this.trigger('change', e.value);
  },

  onMinusClick: function() {
    this.slider.stepDown();
  },

  onPlusClick: function() {
    this.slider.stepUp();
  },

  val: function(val) {
    var $input = this.$('input');
    if (val === undefined) return $input.val();
    $input.val(val);
    if (this.slider) this.slider.setValueSet();
  },

  redraw: function() {
    if (this.slider) this.slider.onResize();
  }

});
