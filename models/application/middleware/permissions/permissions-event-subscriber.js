'use strict';

/** @const {PermissionsNameGenerator} permissionsNameGenerator */
const permissionsNameGenerator = require('./helpers/name-generator');

/**
 * @class PermissionsEventSubscriber
 */
module.exports = {

  /**
   * @param context
   * @param model
   * @param permission
   * @param callback
   */
  subscribeOnChange: function(context, model, permission, callback) {
    const eventName = permissionsNameGenerator.changeEventName(permission);
    context.listenTo(model, eventName, callback);
  },

  /**
   *
   * @param context
   * @param model
   * @param permission
   * @param callback
   */
  subscribeOnceOnChange: function(context, model, permission, callback) {
    const eventName = permissionsNameGenerator.changeEventName(permission);
    context.listenToOnce(model, eventName, callback);
  },

  /**
   * @param {object} model
   * @param {string} permission
   * @param {boolean} value
   */
  publishChange: function(model, permission, value) {
    model.trigger(permissionsNameGenerator.changeEventName(permission), value);
    model.trigger(permissionsNameGenerator.changeEventName(), {
      permission,
      value
    });
  }

};
