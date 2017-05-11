/**
 * View for block width Edit, Delete actions
 */
'use strict';

const View = require('views/view');
const template = require('blocks/edit-item/edit-item.nunj');

module.exports = View.extend({
  template: template,
  events: {
    'click .js-edit': 'onEdit',
    'click .js-delete': 'onDelete'
  },

  render: function() {
    this.renderTemplate();
    this.$('.js-content').html(this.renderContent());
    this.toggleActions();
    return this;
  },

  renderContent: function() {
    // defined in child classes
  },

  toggleActions: function() {
    this.$('.js-edit').toggleClass('is-hidden', !this.isEditable());
    this.$('.js-delete').toggleClass('is-hidden', !this.isRemovable());
  },

  getEditFormElement: function() {
    return this.$('.js-edit-item-form');
  },

  startEdit: function() {
    this.$('.js-content').addClass('is-hidden');
    this.getEditFormElement().removeClass('is-hidden');
  },

  stopEdit: function() {
    this.$('.js-content').removeClass('is-hidden');
    this.getEditFormElement().addClass('is-hidden');
  },

  linkForm: function(form) {
    form.itemView = this;
    form.setElement(this.getEditFormElement());
  },

  /**
   * Redefined in child classes
   * @returns {boolean}
   */
  isEditable: function() {
    return true;
  },

  /**
   * Redefined in child classes
   * @returns {boolean}
   */
  isRemovable: function() {
    return true;
  },

  onEdit: function() {
    this.trigger('edit', this.model, this);
    return false;
  },

  onDelete: function() {
    this.trigger('delete', this.model, this);
  }

});
