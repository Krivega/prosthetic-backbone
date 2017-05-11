'use strict';

const ValidationModel = require('models/application/validation-model');
const FormDefinitions = require('models/application/form-constructor-definitions');

module.exports = ValidationModel.extend({

  apiURL: '/requests/:directoryId/forms/:formId/',

  lockedAttrs: {
    directoryId: true,
    formId: true
  },

  constructor: function(data) {
    this.initSubModels(data);
    return ValidationModel.prototype.constructor.apply(this, arguments);
  },

  initSubModels: function(data) {
    this.formDefinitions = new FormDefinitions(data.formDefinition);
    delete data.formDefinition;
    return this;
  },

  validatedAttrs: function() {
    return this.formDefinitions.getValidatedAttrs();
  },

  getTemplateData: function() {
    return {
      fields: this.formDefinitions.getFields()
    };
  },

  getSuccessUrl: function() {
    return this.replaceURLParams('/myteam/:directoryId/requests/:id/success/');
  },

  getPhoneFields: function() {
    return this.formDefinitions.getFieldsByType('tel');
  },

  getDateFields: function() {
    return this.formDefinitions.getFieldsByType('date');
  },

  hasCaptchaField: function() {
    return this.formDefinitions.hasField('captcha');
  }

});
