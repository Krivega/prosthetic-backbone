'use strict';

const View = require('views/view');
const $ = require('jquery');
const _ = require('underscore');
const utils = require('utils');
const template = require('site/partials/alert-info.nunj');
const vent = require('runtime/vent');

const Alerts = View.extend({

  events: {
    'click .js-close': 'onClickClose',
    'click .js-alert-action': 'onClickAlertAction',
  },

  initialize: function() {
    this.listenTo(vent, 'ajax:remove', this.showAlertsAjax);
    this.listenTo(vent, 'alert:message', this.showAlert);
    this.listenTo(vent, 'alert:form-errors', this.showAlerts);
  },

  showAlert: function(data, options) {
    options = options || {};
    const token = data.token || data.body;
    if (!token) return false;
    data.message = _t(token, data.params);
    const content = template.render(data);
    let $el;
    if (options.isStatic) {
      $el = this.$('.js-alert-place-static');
    } else {
      if (options.isBottom) {
        $el = this.$('.js-alert-place-bottom-fixed');
      } else {
        $el = this.$('.js-alert-place-fixed');
      }
    }
    if (!options.isNotEmpty) $el.empty();
    $el.append(content);
    if (options.autoHide) {
      if (data.id) {
        setTimeout(this.hideAlertById.bind(this, data.id), 5000);
      } else {
        throw new TypeError('alert: id is required');
      }
    }
    return false;
  },

  showAlerts: function(data) {
    _.each(data.messages, function(data) {
      this.showAlert(data, {
        isNotEmpty: true
      });
    }, this);
    return this;
  },

  showAlertsAjax: function(response) {
    let errorData;
    // 400 responses are proccessed in forms
    if (response.status !== 400) {
      errorData = utils.formatErrors(response);
      this.showAlerts(errorData);
    }
    return this;
  },

  hideAlerts: function() {
    this.$('.js-alert-place-static').empty();
    this.$('.js-alert-place-fixed').empty();
  },

  hideAlert: function($alert) {
    const id = $alert.data('id');
    $alert.slideUp(400, function() {
      $alert.remove();
    });
    if (id) vent.trigger('alerts:hide-alert:' + id);
  },

  hideAlertById: function(id) {
    const $alert = this.$('.js-alert[data-id=' + id + ']');
    $alert.slideUp(400, function() {
      $alert.remove();
    });
    vent.trigger('alerts:hide-alert:' + id);
  },

  onClickClose: function(e) {
    e.preventDefault();
    e.stopPropagation();
    const $alert = this.$(e.currentTarget).parents('.js-alert:first');
    this.hideAlert($alert);
  },

  onClickAlertAction: function(e) {
    e.preventDefault();
    e.stopPropagation();
    const $el = this.$(e.currentTarget);
    const $alert = $el.parents('.js-alert:first');
    const id = $el.data('id');
    this.hideAlert($alert);
    if (id) vent.trigger('alerts:action-alert:' + id);

  }

});

module.exports = new Alerts({
  el: $('.js-alert-place')
});
