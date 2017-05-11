'use strict';

var View = require('views/view');
var ConfirmView = require('./confirm');
var DropDownView = require('./dropdown');

module.exports = View.extend({

  confirmSelector: '.js-confirm',

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    if (this.options.confirmSelector) this.confirmSelector = this.options.confirmSelector;

    this.dropDownView = new DropDownView();
    this.confirmView = new ConfirmView(this.options);

    this.listenTo(this.confirmView, 'confirm', this.onConfirm);
    this.listenTo(this.confirmView, 'cancel', this.onCancel);
    this.listenTo(this.dropDownView, 'hide', this.onCancel);
    this.listenTo(this.dropDownView, 'show', this.show);
  },

  render: function() {
    this.subRender(this.dropDownView, undefined, true);
    this.subRender(this.getConfirmElement(), this.confirmView, undefined, true);
  },

  getConfirmElement: function() {
    return this.$(this.confirmSelector);
  },

  isConfirmInDropDown: function(dataDropDown) {
    var $confirmBlock;
    var $dropDownBlock = this.dropDownView.findDropDownBlockByData(dataDropDown);
    if ($dropDownBlock.length) {
      $confirmBlock = $dropDownBlock.find(this.confirmSelector);
      return $confirmBlock.length > 0;
    }
    return false;
  },

  toggle: function(show, dropDownData) {
    if (show) {
      this.show(dropDownData);
      return this;
    }
    this.hide(dropDownData);
    return this;
  },

  toggleConfirmLoader: function(isLoading) {
    this.$('.js-confirm').toggleClass('is-loading', isLoading).prop('disabled', isLoading);
  },

  show: function(dropDownData) {
    if (this.isConfirmInDropDown(dropDownData)) {
      this.confirmView.show();
    }
    this.dropDownView.show(dropDownData);
    return this;
  },

  hide: function(dropDownData) {
    this.dropDownView.hide(dropDownData);
    if (this.isConfirmInDropDown(dropDownData)) {
      this.confirmView.hide();
    }
  },

  onConfirm: function(e) {
    this.hide();
    this.trigger('confirm', e);
  },

  onCancel: function() {
    this.hide();
    this.trigger('cancel');
  }

});
