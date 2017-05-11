'use strict';
const _ = require('underscore');
const string = require('../../../../../libs/string');

/**
 * @class PermissionsNameGenerator
 */
module.exports = {

  /**
   * Generates field name like canManageSchedule
   *
   * @param permission string
   * @param authData {object?}
   * @returns {string}
   */
  fieldName: function(permission, authData) {
    let result = string.camelize('can-' + permission);
    if (authData) {
      result += this._generateAuthKey(authData);
    }
    return result;
  },

  /**
   * @param authData {object}
   * @returns {string}
   * @private
   */
  _generateAuthKey: function(authData) {
    return (_.values(authData)).join('.');
  },

  /**
   * Returns event name for changed permission field
   * Returns general permission event name if permission is not specified
   *
   * @param permission {string?}
   * @returns {string}
   */
  changeEventName: function(permission) {
    let generalEventName = 'permissions:change';
    if (permission) {
      return generalEventName + ':' + this.fieldName(permission);
    }
    return generalEventName;
  }

};
