'use strict';

const View = require('views/view');
const template = require('site/partials/action-bar.nunj');
/** @const {PermissionsChecker|*} PermissionsChecker */
const PermissionsChecker = require('../../models/application/middleware/permissions/permissions-checker'); // jshint ignore:line

const vent = require('runtime/vent');
const PanelActionsView = require('views/ui/panel-actions');

module.exports = View.extend({

  template: template,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.permissionsChecker = new PermissionsChecker();
    this.panelActionsView = new PanelActionsView();
    this.listenTo(this.permissionsChecker, 'change', this.checkPermissions);
    this.listenTo(this.model, 'sync', this.render);
  },

  render: function() {
    this.renderTemplate();
    this.renderPanelActions();
    this.checkPermissions();
    this.toggleActionBar();
    this.renderDone();
  },

  renderPanelActions: function() {
    this.setElementToSubView('.js-panel-actions', this.panelActionsView);
  },

  checkPermissions: function() {
    this.$('[data-action-permissions]').each((index, el) => {
      this.checkElementPermissions(this.$(el));
    });
  },

  checkElementPermissions: function($el) {
    const authData = this.getElementAuthData($el);
    const permissions = this.getElementPermissionsArray($el);
    const isAnyPermissionRequired = this.isAnyPermissionRequired($el);
    const hasPermission = this.getPermissionsChecker().checkPermissions(
      permissions, authData, isAnyPermissionRequired
    );
    $el.toggleClass('is-hidden', !hasPermission);
    this.toggleActionBar();
    return this;
  },

  toggleActionBar: function() {
    const isShow = !(!this.model.isPrivate() && !this.hasActiveActions());
    this.toggle(!isShow);
    if (isShow) {
      vent.trigger('action-bar:show');
      this.panelActionsView.resetFloats();
    }
  },

  hasActiveActions: function() {
    let hasActive = false;
    this.$('.js-action-bar-item').each((index, el) => {
      if (!this.$(el).hasClass('is-hidden')) {
        hasActive = true;
        return true;
      }
    });
    return hasActive;
  },

  getElementAuthData: function($el) {
    const treeElementId = $el.data('treeElementId') || this.model.get('treeElementId');
    const directoryId = $el.data('directoryId') || this.model.get('directoryId');
    const serviceId = $el.data('serviceId') || this.model.get('serviceId');
    const serviceType = $el.data('serviceType') || this.model.get('serviceType');
    return {
      directoryId: directoryId,
      treeElementId: treeElementId,
      serviceType: serviceType,
      serviceId: serviceId
    };
  },

  getElementPermissionsArray: function($el) {
    const permissions = $el.data('action-permissions');
    const permissionsSeparator = this.getPermissionsSeparator($el);
    return permissions.split(permissionsSeparator);
  },

  getPermissionsSeparator: function($el) {
    let permissions = $el.data('permissions') || '';
    let separator = ',';
    if (permissions.search(/\|\|/) !== -1) {
      separator = '||';
    }
    return separator;
  },

  isAnyPermissionRequired: function($el) {
    return this.getPermissionsSeparator($el) === '||';
  },

  /**
   * @returns {PermissionsChecker}
   */
  getPermissionsChecker: function() {
    return this.permissionsChecker;
  }

});
