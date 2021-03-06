'use strict';

const utils = require('utils');

class TitlizeFieldHandler {

  /**
   * @property {Array} fieldNames - fields names that should be capitalized
   */
  constructor(fieldNames = []) {
    //noinspection JSUnresolvedVariable
    this.fieldNames = fieldNames;
  }

  /**
   * Converts jquery object ot Element object
   * or returns given Element object
   *
   * @param element {Element|jQuery}
   * @returns {Element}
   * @private
   */
  static _prepareElement(element) {
    if (element.jquery !== undefined) {
      element = element.get(0);
    }
    return element;
  }

  /**
   * Handle Change Event:
   * @param {Event} e
   * @returns {TitlizeFieldHandler}
   */
  handle(e) {
    if (e && e.currentTarget) {
      this.processElementValue(e.currentTarget);
    }
    return this;
  }

  /**
   * Titlize value of element if it is not ignoring element
   *
   * @param element {Element|jQuery}
   */
  processElementValue(element) {
    element = TitlizeFieldHandler._prepareElement(element);
    const elementValue = element.value;
    if (elementValue && this._needHandleElement(element)) {
      const capitalizedValue = utils.capitalize(elementValue);
      if (capitalizedValue !== elementValue) {
        element.value = capitalizedValue;
      }
    }
  }

  /**
   * @param element
   * @returns {*|boolean}
   * @private
   */
  _needHandleElement(element) {
    return this._isHandledFieldName(element.name);
  }

  /**
   * if handled names were not defined returns true
   * Otherwise checks if name is in white list
   *
   * @param name
   * @returns {boolean}
   * @private
   */
  _isHandledFieldName(name) {
    return this.fieldNames.indexOf(name) !== -1;
  }

}

module.exports = TitlizeFieldHandler;
