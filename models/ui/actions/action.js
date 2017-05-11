'use strict';

const Model = require('models/model');

module.exports = Model.extend({

  idAttribute: '_noId',

  defaults: {
    confirmation: false,
    main: false,
    overlay: false,
    custom: false // invoke 'methodName' without confirmation or api
  },

  parse: function(data) {
    if (data.apiURL) {
      this.apiURL = data.apiURL;
    }
    return data;
  },

  getTemplateData: function() {
    const data = Model.prototype.getTemplateData.apply(this, arguments);
    data.actionURL = this.getActionURL();

    return data;
  },

  getActionURL: function() {
    if (this.isConfirmationRequired()) return '';
    if (this.isCustom()) return '';
    if (this.get('disabled')) return '';
    return this.get('actionURL');
  },

  confirm: function() {
    if (this.isConfirmationRequired()) {
      this.trigger('confirm', this);
    }
  },

  customAction: function() {
    if (this.isCustom()) {
      this.trigger('custom', this);
    }
  },

  isConfirmationRequired: function() {
    return this.get('confirmation');
  },

  isCustom: function() {
    return this.get('custom');
  },

  isOverlay: function() {
    return this.get('overlay');
  }

});
