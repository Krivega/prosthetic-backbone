/**
 *  Form with loader on submit
 *  Requires preloader block placed in form
 */
'use strict';

const ValidationForm = require('views/application/validation-form');

module.exports = ValidationForm.extend({

  onSuccess: function(model) {
    this.inLoadingDone(model);
    return ValidationForm.prototype.onSuccess.apply(this, arguments);
  },

  onError: function() {
    this.inLoadingHide();
    return ValidationForm.prototype.onError.apply(this, arguments);
  },

  inLoading: function() {
    if (!this.$('.js-preloader')) return;
    this.getBlock().addClass('is-loading');
    this.$('.js-preloader').removeClass('is-hidden').addClass('is-loading');
  },

  inLoadingHide: function() {
    if (!this.$('.js-preloader')) return;
    this.getBlock().removeClass('is-loading');
    this.$('.js-preloader').addClass('is-hidden').removeClass('is-loading').removeClass('is-done');
  },

  inLoadingDone: function(model) {
    if (!this.$('.js-preloader')) return;
    this.$('.js-preloader').removeClass('is-loading').addClass('is-done');
    if (!this.needToWaitForReload()) {
      setTimeout(() => {
        this.getBlock().removeClass('is-loading');
        this.$('.js-preloader').removeClass('is-done');
        this.trigger('loading-done', model);
      }, 2500);
    }
  },

  getBlock: function() {
    if (this.$el.hasClass('js-preloader-block')) {
      return this.$el;
    } else {
      return this.$('.js-preloader-block');
    }
  }

});
