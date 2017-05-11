'use strict';

const _ = require('underscore');
const formStatesHandler = require('./form-states-handler');

/**
 * @class FormState
 * @type {FormState}
 * @property {Form} form
 */
module.exports = class FormState {

  constructor(options) {
    this.form = options.form;
    this.state(null);
    formStatesHandler.addFormState(this);
  }

  state(value) {
    if (value !== undefined) {
      this._state = value;
    }
    return this._state;
  }

  isStateEmpty() {
    return this.state() === null;
  }

  saveState() {
    this.state(this.getForm().getStateData());
  }

  updateState() {
    if (!this.isStateEmpty()) {
      this.state(this.getForm().getStateData());
    }
  }

  removeState() {
    if (!this.isStateEmpty()) {
      this.state(null);
      formStatesHandler.removeFormState(null);
    }
  }

  isFormStateChanged() {
    if (this.isStateEmpty()) {
      return false;
    }
    return !_.isEqual(this.state(), this.getForm().getStateData());
  }

  /**
   * @returns Form
   */
  getForm() {
    return this.form;
  }

};
