'use strict';

const _ = require('underscore');
const Model = require('../../../model');
/** @var {PermissionsNameGenerator} permissionsNameGenerator */
const permissionsNameGenerator = require('./helpers/name-generator');
/** @var {PermissionsEventSubscriber} permissionsEventSubscriber */
const permissionsEventSubscriber = require('./permissions-event-subscriber');

let currentUser;
if (typeof window !== 'undefined') {
  currentUser = require('../../../../runtime/current-user');
}

/**
 * This is a middleware for models to work easily with permissions
 * @class PermissionsChecker
 */
module.exports = Model.extend({

  initialize: function(data, options) {
    options = options || {};
    data = data || {};
    Model.prototype.initialize.apply(this, arguments);

    /** add debounce to prevent triggering of the same events many times. */
    this._delegatePermissionChangeToBaseModel =
      _.debounce(this._delegatePermissionChangeToBaseModel.bind(this), 100);
    this.model = options.model || data.model;
  },

  /**
   * @param {string} permission
   * @param {object} authData
   * @returns {boolean|undefined}
   */
  checkPermission: function(permission, authData) {
    if (!this._hasPermissionValue(permission, authData)) {
      // set to false here to prevent unnecessary change event.
      this._setPermissionValue(permission, false, authData, {
        silent: true
      });
      if (this._checkUserAccessToDirectory(authData.directoryId)) {
        this._checkUserPermission(permission, authData);
      }
    }
    return this._getPermissionValue(permission, authData);
  },

  /**
   * Checks whether user has access to all (if any is false) or at least to one (if any is true)
   * permissions by provided authData
   *
   * @param {array} permissions
   * @param {object} authData
   * @param {boolean} any - check if any permission is true, by default check if all permission
   * @returns {boolean|undefined}
   */
  checkPermissions: function(permissions, authData, any) {
    let hasAllPermissions = true;
    let hasAnyPermission = false;
    _.each(permissions, function(permission) {
      const needDenialValue = permission[0] === '!';
      if (needDenialValue) {
        permission = permission.replace('!', '');
      }

      const hasPermission = !needDenialValue && this.checkPermission(permission, authData);
      hasAllPermissions = hasPermission && hasAllPermissions;
      hasAnyPermission = hasPermission || hasAnyPermission;
    }, this);
    if (any) {
      return hasAnyPermission;
    }
    return hasAllPermissions;
  },

  /**
   * @param {string} permission
   * @param {object} authData
   * @return {boolean|undefined}
   * @private
   */
  _getPermissionValue: function(permission, authData) {
    const fieldName = permissionsNameGenerator.fieldName(permission, authData);
    return this.get(fieldName);
  },

  /**
   * @param {string} permission
   * @param {boolean} value
   * @param authData {object}
   * @param options {object?}
   * @returns {PermissionsChecker}
   * @private
   */
  _setPermissionValue: function(permission, value, authData, options) {
    const fieldName = permissionsNameGenerator.fieldName(permission, authData);
    return this.set(fieldName, value, options);
  },

  /**
   * Checks whether permission has been already set
   *
   * @param {string} permission
   * @param {object} authData
   * @returns {boolean}
   * @private
   */
  _hasPermissionValue: function(permission, authData) {
    return this._getPermissionValue(permission, authData) !== undefined;
  },

  /**
   * Check user permission and handle with call callback
   *
   * @param {string} permission
   * @param {object} authData
   * @returns {PermissionsChecker}
   * @private
   */
  _checkUserPermission: function(permission, authData) {
    const hasPermission = currentUser.hasPermission(permission, authData);

    if (typeof hasPermission === 'boolean') {
      this._onUserPermissionLoaded(permission, hasPermission, authData);
    } else {
      hasPermission.then((hasPermission) => {
        this._onUserPermissionLoaded(permission, hasPermission, authData);
      });
    }
    return this;
  },

  /**
   * @param {number} directoryId
   * @returns {boolean}
   * @private
   */
  _checkUserAccessToDirectory: function(directoryId) {
    return currentUser.isAccessAllowed(directoryId);
  },

  /**
   * Callback for user permission deferred
   *
   * @param {string} permission
   * @param {boolean} hasPermission
   * @param {object} authData
   * @returns {PermissionsChecker}
   * @private
   */
  _onUserPermissionLoaded: function(permission, hasPermission, authData) {
    const oldPermissionValue = this._getPermissionValue(permission, authData);
    if (oldPermissionValue !== hasPermission) {
      this._setPermissionValue(permission, hasPermission, authData);
      this._delegatePermissionChangeToBaseModel(permission, hasPermission);
    }
    return this;
  },

  /**
   * Trigger permission change event for base model.
   *
   * @param {string} permission
   * @param {boolean} hasPermission
   * @returns {PermissionsChecker}
   * @private
   */
  _delegatePermissionChangeToBaseModel: function(permission, hasPermission) {
    if (this.model) {
      permissionsEventSubscriber.publishChange(this.model, permission, hasPermission);
    }
    return this;
  }

});
