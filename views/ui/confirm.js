'use strict';

const _ = require('underscore');
const utils = require('utils');
const View = require('views/view');
const template = require('ui/confirm/confirm.nunj');

module.exports = View.extend({

  options: {
    isAutoHide: false,
    isNotWrap: false,
    isNotBorder: false,
    isNoHideOnConfirm: false,
    forPersonDashboard: false
  },

  template: template,

  events: {
    'click .js-confirm': 'onConfirm',
    'click .js-cancel': 'onCancel'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.initModelListeners();
  },

  initModelListeners: function() {
    if (this.model) {
      this.listenTo(this.model, 'confirmationError', this.onConfirmationError);
    }
  },

  render: function() {
    this.renderTemplate(this.options);
    if (this.options.isAutoHide) this.hide();
  },

  show: function() {
    this.toggle(false);
  },

  hide: function() {
    this.toggle(true);
  },

  toggle: function() {
    this.hideErrors();
    return View.prototype.toggle.apply(this, arguments);
  },

  hideErrors: function() {
    const $errors = this.getErrorElements();
    $errors.empty().removeClass('is-visible');
    return this;
  },

  showErrors: function(errors) {
    const $errors = this.getErrorElements();
    this.hideErrors();
    this.stopLoading();
    _.each(errors, function(error) {
      $errors.append('<div>' + _t(error.body, error.params) + '</div>')
        .addClass('is-visible');
    });
    return this;
  },

  stopLoading: function() {
    this.$('.js-confirm').toggleClass('is-loading', false);
  },

  getErrorElements: function() {
    return this.$('.js-confirm-errors');
  },

  onConfirmationError: function(response) {
    const errors = utils.formatErrors(response) || {};
    const messages = errors.messages || [];
    this.showErrors(messages);
    return this;
  },

  onConfirm: function(e) {
    this.hideErrors();
    if (this.model && this.model.confirm) this.model.confirm();
    this.trigger('confirm', e);
    if (!this.options.isNoHideOnConfirm) this.hide();
  },

  onCancel: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.hide();
    this.trigger('cancel');
  }

});
