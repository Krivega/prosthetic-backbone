'use strict';

const _ = require('underscore');
const vent = require('runtime/vent');

const confirmationMessage = _t(
  'There is unsaved data, if you leave the page the data will be lost.'
);

/**
 * @class FormStatesHandler
 * @property {Array} formStates
 */
class FormStatesHandler {

  constructor() {
    this.formStates = [];
    this.confirmUnload = false;
    this.initListeners();
  }

  initListeners() {
    $window.on(
      `beforeunload.form-state-handler`,
      this.onBeforeunloadWindow.bind(this)
    );
    vent.on('links-manager:click', this.onLinkClick.bind(this));
  }

  addFormState(formState) {
    this.formStates.push(formState);
    this.formStates = _.unique(this.formStates);
    this.resetConfirmUnload();
  }

  removeFormState(formState) {
    this.formStates = _.without(this.formStates, formState);
  }

  hasChangedFormState() {
    return _.find(this.formStates, (formState) => {
      return formState.isFormStateChanged();
    });
  }

  needConfirmUnload() {
    return !this.confirmUnload && this.hasChangedFormState();
  }

  resetConfirmUnload() {
    this.confirmUnload = false;
  }

  showConfirmation() {
    return window.confirm(confirmationMessage);
  }

  onBeforeunloadWindow(e) {
    if (this.needConfirmUnload()) {
      setTimeout(() => {
        vent.trigger('form-state-handler:unload-confirmation-shown');
      }, 100);
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage; // Gecko, WebKit, Chrome <34
    }
  }

  onLinkClick(e) {
    if (this.needConfirmUnload()) {
      this.resetConfirmUnload();
      if (!this.showConfirmation()) {
        e.preventDefault();
        return this;
      }
      this.confirmUnload = true;
    }
  }

}
/**
 * It should be initiated only once
 * @type {FormStatesHandler}
 */
const formStatesHandler = new FormStatesHandler();

module.exports = formStatesHandler;
