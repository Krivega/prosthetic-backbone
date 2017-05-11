'use strict';

//var config = require('config');
var View = require('views/view');
var _ = require('underscore');
var wysiwygLinkTemplate = require('ui/wysiwyg/templates/wysiwyg-link.nunj');

module.exports = View.extend({

  events: {
    'click .js-save': 'onSaveClick',
    'click .js-cancel': 'onCancelClick',
    'keydown [name=href]': 'onKeyDown'
  },

  template: wysiwygLinkTemplate,

  render: function() {
    this.$el.html(this.template.render());
    this.$linkPlaceholder = this.$('[name=href]');
    return this;
  },

  setEditor: function(editor) {
    this.editor = editor;
    return this;
  },

  setBookmark: function(caretBookmark) {
    this.caretBookmark = caretBookmark;
    return this;
  },

  onCancelClick: function(e) {
    e.preventDefault();
    this.$linkPlaceholder.focus(false);
    this.editor.composer.selection.setBookmark(this.caretBookmark);
    this.hide();
  },

  onSaveClick: function(e) {
    e.preventDefault();
    var url = this.val();
    if (this.isValid(url)) {
      this.editor.currentView.element.focus();
      if (this.caretBookmark) {
        this.editor.composer.selection.setBookmark(this.caretBookmark);
        this.caretBookmark = null;
      }
      if (!/^(ftp|https?):\/\//.test(url)) {
        url = 'http://' + url;
      }
      this.editor.composer.commands.exec('createLink', {
        href: url
      });
      this.hide();
    } else {
      this.showErrorMessage();
    }
  },

  onKeyDown: function(e) {
    if (e.which === 13) {
      this.onSaveClick(e);
    } else {
      this.hideErrorMessage();
    }
  },

  val: function(value) {
    if (value === undefined) {
      return this.$linkPlaceholder.val();
    }
    this.$linkPlaceholder.val(value);
    return this;
  },

  isValid: function(url) {
    return (/^((ftp|https?):\/\/)?([^\.\/\\\s\t]+\.)+[^\.\/\\\s\t]{2,10}/i).test(url);
  },

  showErrorMessage: function() {
    this.$('.js-href-error').removeClass('is-hidden');
  },

  hideErrorMessage: function() {
    this.$('.js-href-error').addClass('is-hidden');
  },

  show: function() {
    this.$el.removeClass('is-hidden');
    this.$linkPlaceholder.focus();
    $document.on('click.inline_dialog', _.bind(this.onClickOutside, this));
    return this;
  },

  hide: function() {
    this.val('');
    this.$el.addClass('is-hidden');
    $document.off('click.inline_dialog');
    this.trigger('close');
    return this;
  },

  isActive: function() {
    return !this.$el.is('.is-hidden');
  },

  onClickOutside: function(e) {
    if (this.$el.has(e.target).length === 0 && document.contains(e.target)) {
      this.hide();
    }
  }

});
