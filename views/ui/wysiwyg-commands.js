/*
 *  Inline dialog
 *  opens dialog and renders passed view inside
 */

'use strict';

const _ = require('underscore');
const View = require('views/view');

const EmoticonsView = require('./wysiwyg-emoticons');
const YoutubeView = require('./wysiwyg-youtube');
const InsertAssetView = require('./wysiwyg/actions/insert-asset');

module.exports = View.extend({

  events: {
    'click .js-insert-emoticon': 'onInsertEmoticonClick',
    'click .js-insert-youtube': 'onInsertYoutubeClick',
    'click .js-insert-asset': 'onInsertAssetClick'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.emoticonsView = new EmoticonsView();
    this.youtubeView = new YoutubeView();
    this.insertAssetView = new InsertAssetView({
      directoryId: this.options.directoryId,
      renderData: this.options.renderData
    });

    this.listenTo(this.emoticonsView, 'close', this.onActionCancel);
    this.listenTo(this.youtubeView, 'close', this.onActionCancel);
    this.listenTo(this.insertAssetView, 'close', this.onActionCancel);
  },

  render: function() {
    if (this.isRendered) return this;

    this.setElementToSubView(this.$el, this.insertAssetView);
    this.setElementToSubView('.js-emoticon-view', this.emoticonsView);
    this.setElementToSubView('.js-youtube-view', this.youtubeView);

    this.isRendered = true;
    return this;
  },

  setEditor: function(editor) {
    this.editor = editor;
    this.insertAssetView.setEditor(this.editor);
    this.emoticonsView.setEditor(this.editor);
    this.listenTo(this.editor, 'show:dialog', _.bind(this.onEditorShowDialog, this));
    return this;
  },

  hideSelfOnOtherShown: function(other) {
    if (this !== other) this.hide();
  },

  getUsedAssetsData: function() {
    return this.insertAssetView.getUsedAssetsData();
  },

  onEditorShowDialog: function() {
    this.onActionCancel();
    this.youtubeView.hide();
  },

  onClickOutside: function(e) {
    if (this.$el.has(e.target).length === 0 && document.contains(e.target)) {
      this.hide();
    }
  },

  onInsertEmoticonClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.editor) return;
    this.emoticonsView.setEditor(this.editor)
      .setBookmark(this.editor.composer.selection.getBookmark());
    this.editor.currentView.element.blur();
  },

  onInsertYoutubeClick: function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.editor) return;
    this.$currentButton = this.$(e.currentTarget);
    if (this.youtubeView.isActive()) {
      this.onActionCancel();
      this.youtubeView.hide();
      return false;
    }
    this.onActionStart();
    this.youtubeView.show();
  },

  onActionStart: function() {
    if (this.$currentButton) {
      this.$currentButton.addClass('wysihtml5-command-active');
    }
    this.editor.currentView.element.blur();
    this.editor.currentView.element.focus(false);
    return this;
  },

  onActionCancel: function() {
    if (this.$currentButton) {
      this.$currentButton.removeClass('wysihtml5-command-active');
    }
    this.editor.currentView.element.focus();
    this.$currentButton = null;
    return this;
  },

  onInsertAssetClick: function() {
    this.insertAssetView.showMediaLibraryOverlay();
  }

});
