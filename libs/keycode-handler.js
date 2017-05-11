'use strict';

const _ = require('underscore');

const numberCodesKey = {
  48: 0,
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
  54: 6,
  55: 7,
  56: 8,
  57: 9,
  96: 0,
  97: 1,
  98: 2,
  99: 3,
  100: 4,
  101: 5,
  102: 6,
  103: 7,
  104: 8,
  105: 9
};

const keyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 35,
  END: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  DELETE: 46
};

const keyCodeHandler = {

  isNumberKeyEvent: function(e) {
    return this.numberFromKeyEvent(e) !== undefined;
  },

  numberFromKeyEvent: function(e) {
    const keyCode = this.getKeyCodeByEvent(e);
    return numberCodesKey[keyCode];
  },

  hasBugsBrowserEvent: function(e) {
    const keyCode = this.getKeyCodeByEvent(e);
    return [0, 229].indexOf(keyCode) !== -1;
  },

  isCopyPasteKeys: function(e) {
    const keyCode = this.getKeyCodeByEvent(e);
    if (!e.ctrlKey) return false;
    const keyCodes = [
      65, // a
      67, // c
      86, // v
      88 // x
    ];
    return keyCodes.indexOf(keyCode) !== -1;
  },

  isArrowKeyEvent: function(e) {
    const keyCode = this.getKeyCodeByEvent(e);
    const keyCodesValues = [
      keyCodes.ARROW_LEFT,
      keyCodes.ARROW_UP,
      keyCodes.ARROW_RIGHT,
      keyCodes.ARROW_DOWN
    ];
    return keyCodesValues.indexOf(keyCode) !== -1;
  },

  isEnterKeyEvent: function(e) {
    return this.getKeyCodeByEvent(e) === keyCodes.ENTER;
  },

  isArrowUpKeyEvent: function(e) {
    return this.getKeyCodeByEvent(e) === keyCodes.ARROW_UP;
  },

  isArrowDownKeyEvent: function(e) {
    return this.getKeyCodeByEvent(e) === keyCodes.ARROW_DOWN;
  },

  isEscapeKeyEvent: function(e) {
    return this.getKeyCodeByEvent(e) === keyCodes.ESCAPE;
  },

  isSpecificKeyEvent: function(e) {
    const keyCode = this.getKeyCodeByEvent(e);
    const keyCodesValues = _.values(keyCodes);
    return keyCodesValues.indexOf(keyCode) !== -1;
  },

  isTabKeyEvent: function(e) {
    return this.getKeyCodeByEvent(e) === keyCodes.TAB;
  },

  getKeyCodeByEvent: function(e) {
    return e.which || e.keyCode;
  }

};

module.exports = keyCodeHandler;
