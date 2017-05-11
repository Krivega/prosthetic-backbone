'use strict';

var $ = require('jquery');
var config = require('config');
var View = require('views/view');
var wysiwygYoutubeTemplate = require('ui/wysiwyg/templates/wysiwyg-youtube.nunj');

module.exports = View.extend({

  events: {
    'click .js-emoticon': 'onEmoticonClick'
  },

  template: wysiwygYoutubeTemplate,

  onEmoticonClick: function(e) {
    var emoticon = $(e.currentTarget).data('emoticon');
    e.preventDefault();
    e.stopPropagation();
    this.editor.currentView.element.focus();
    if (this.caretBookmark) {
      this.editor.composer.selection.setBookmark(this.caretBookmark);
      this.caretBookmark = null;
    }
    this.editor.composer.commands.exec('insertHTML',
      '<svg class="icon--small">' +
        '<use xmlns:xlink="http://www.w3.org/1999/xlink"' +
            ' xlink:href="#icon-emo' + emoticon + '"></use>' +
      '</svg>'
    );
    this.trigger('close');
  },

  render: function() {
    this.$el.html(this.template.render({emoticons: config.emoticons}));
    return this;
  },

  setEditor: function(editor) {
    this.editor = editor;
    return this;
  },

  setBookmark: function(caretBookmark) {
    this.caretBookmark = caretBookmark;
    return this;
  }

});
