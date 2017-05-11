/**
 *  Form the supports buttons toolbar disable/enable
 *  Requires .js-form-buttons container
 *
 *  Note: probably better solution will be make it as standalone class
 *  to mixin it ot current forms, not inherit
 *
 */
'use strict';

const vent = require('runtime/vent'); // jshint ignore:line
const PreloaderForm = require('views/application/preloader-form');

module.exports = PreloaderForm.extend({

  initialize: function() {
    PreloaderForm.prototype.initialize.apply(this, arguments);
    this.listenTo(vent, 'forms:editStart', this.onGlobalEditStart); // jshint ignore:line
    this.listenTo(vent, 'forms:editStop', this.onGlobalEditStop); // jshint ignore:line
  },

  enableButtons: function() {
    this.toggleButtons(true);
  },

  disableButtons: function() {
    this.toggleButtons(false);
  },

  toggleButtons: function(state) {
    this._getButtonsBlock().find('button').prop('disabled', !state);
  },

  /** @private */
  _getButtonsBlock: function() {
    return this.$('.js-form-buttons');
  },

  /** @private */
  _globalStart: function(form) {
    if (form !== this) {
      this.onGlobalEditStart(form);
    }
  },

  /** @private */
  _globalStop: function(form) {
    if (form !== this) {
      this.onGlobalEditStop(form);
    }
  },

  onGlobalEditStart: function() {
    this.disableButtons();
  },

  onGlobalEditStop: function() {
    this.enableButtons();
  }

});
