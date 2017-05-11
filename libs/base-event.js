'use strict';

class BaseEvent {

  constructor() {
    this._defaultPrevented = false;
  }

  preventDefault() {
    this._defaultPrevented = true;
  }

  isDefaultPrevented() {
    return this._defaultPrevented;
  }

}

module.exports = BaseEvent;
