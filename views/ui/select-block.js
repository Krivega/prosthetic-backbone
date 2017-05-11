'use strict';

var View = require('views/view');

module.exports = View.extend({

  isHiden: null,

  events: {
    'click .js-select-block-selected': 'toggle',
    'click .js-select-block-toggle': 'toggle',
    'click .js-select-block-close': 'toggle',
    'click .js-select-block-item': 'onSelect'
  },
  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.isHiden = true;
  },

  render: function() {
    if (this.$('.js-select-block-input').length > 0) {
      this.name = this.$('.js-select-block-input')[0].name;
    }
  },

  toggle: function() {
    this.$el.toggleClass('is-active');
    this.isHiden = !this.isHiden;
    if (!this.isHiden) this.trigger('show');
    if (this.isHiden) this.trigger('hide');
  },

  onSelect: function(e) {
    var $el = this.$(e.currentTarget);
    var value = $el.data('value');
    this.val(value);
    this.toggle();
  },

  val: function(value) {
    if (!value) {
      return this.$('.js-select-block-input').val();
    }
    var $selectedEl = this.$('[data-value=' + value + ']');
    this.$('.js-select-block-selected').html($selectedEl.html());
    this.$('.js-select-block-input').val(value);
    this.trigger('select:' + this.name, value);
  }

});
