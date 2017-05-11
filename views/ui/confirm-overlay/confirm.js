'use strict';

const View = require('views/view');
const template = require('ui/confirm/templates/confirm-overlay.nunj');

const BUTTON_NAMES = {
  yes:  _t('confirm'),
  no: _t('cancel')
};

module.exports = View.extend({

  events: {
    'click .js-confirm': 'onConfirmClick',
    'click .js-cancel': 'onCancelClick'
  },

  template: template,

  render: function() {
    this.renderData({
      message: this.getMessage(),
      buttonNames: this.getButtonNames()
    });
    return this.renderDone();
  },

  getButtonNames: function() {
    return this.options.buttonNames || BUTTON_NAMES;
  },

  getMessage: function() {
    return this.options.message;
  },

  setMessage: function(message) {
    this.options.message = message;
  },

  onConfirmClick: function() {
    this.trigger('confirm');
  },

  onCancelClick: function() {
    this.trigger('cancel');
  }

});
