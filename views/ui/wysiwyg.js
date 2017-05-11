'use strict';

const _ = require('underscore');
const $ = require('jquery'); // jshit ignore:line
const View = require('views/view');
const config = require('config'); // jshit ignore:line
const wysiwygTemplate = require('ui/wysiwyg/templates/wysiwyg.nunj');
const WysiwygCommandsView = require('./wysiwyg-commands');
const wysiwygTranslator = require('./wysiwyg/translator');

module.exports = View.extend({

  defaults: {
    hasCharacterMeter: false
  },

  template: wysiwygTemplate,

  /**
   * Options
   * @property {boolean} [hasCharacterMeter]
   * @property {boolean} [actions]
   */
  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.options = _.extend({}, this.defaults, this.options);
    this.hasCharacterMeter = this.options.hasCharacterMeter;

    _.bindAll(this, 'initWysiwyg', 'onChange', 'onResize',
      'onBlur', 'onFocus', 'onLoad');

    this.wysiwygCommandsView = new WysiwygCommandsView({
      directoryId: this.options.directoryId,
      renderData: this.options.renderData
    });
  },

  reload: function() {
    if (this.isLoaded()) {
      this.state = 'inited';
      this.options.value = this.val();
      this.render();
    }
  },

  render: function() {
    if (this.isLoaded()) return this; // don't render twice

    const renderOpts = this.getRenderOptions();
    this.renderTemplate(renderOpts);

    this.$textarea = this.$('.js-textarea');
    this.$toolbarPanel = this.$('.js-toolbar-panel');
    this.requireWysiwyg();
    if (this.needToRenderWysiwygCommandsView()) {
      this.wysiwygCommandsView.setEditor(this.editor);
      this.setElementToSubView(this.$el, this.wysiwygCommandsView);
    }
    return this.renderDone();
  },

  needToRenderWysiwygCommandsView: function() {
    return this.isInsertAssetActionEnabled();
  },

  isInsertAssetActionEnabled: function() {
    return this.isActionEnabled('insertAsset');
  },

  isActionEnabled: function(action) {
    const additionalActions = this.options.additionalActions || {};
    return !!additionalActions[action];
  },

  /**
   * Copy some attributes from original textarea
   */
  getRenderOptions: function() {
    const input = this.$('textarea')[0];
    const options = _.pick(input, 'name', 'placeholder');
    options.hasCharacterMeter = this.hasCharacterMeter;
    options.actions = this.options.actions || {};
    options.additionalActions = this.options.additionalActions || {};
    return options;
  },

  val: function(value) {
    if (typeof value === 'undefined') {
      if (this.isLoaded()) {
        return wysiwygTranslator.translateFromWysiwyg(this.editor.getValue());
      } else {
        return this.$textarea.val();
      }
    } else {
      if (this.isLoaded()) {
        this.editor.setValue(value);
        // need this hack since for some reason img tag is not rendered without this timeout
        setTimeout(() => {
          this.editor.setValue(
            wysiwygTranslator.translateForWysiwyg(value, this.options.renderData)
          );
        }, 500);
      } else {
        this.$textarea.val(value);
      }
      return this;
    }
  },

  getRenderData: function() {
    if (!this.isLoaded()) {
      return [];
    }
    return {
      assets: this.wysiwygCommandsView.getUsedAssetsData()
    };
  },

  focus: function() {
    if (this.isLoaded()) {
      if (this.editor) this.editor.focus();
    } else {
      this.$('.js-textarea').focus();
    }
    return this;
  },

  requireWysiwyg: function() {
    if (this.isLoaded()) return;
    this.initWysiwyg();
    return this;
  },

  getWysiwygOptions: function() {
    return {
      name: 'wysiwyg-iframe', // iframe class,
      style: false, // don't copy textarea style,
      autoLink: true,
      useLineBreaks: false,
      supportTouchDevices: true,
      stylesheets: ['/css/style.css'],
      parserRules: config.wysihtml5ParserRules,
      toolbar: this.$toolbarPanel.removeClass('is-hidden').hide().get(0)
    };
  },

  trimTags: function(value) {
    if (!value) {
      return '';
    }
    return value.replace(/<\/?[^>]+>/gi, '');
  },

  remove: function() {
    const $body = $(this.editor.composer.element);

    $body.off('keyup');

    return View.prototype.remove.call(this);
  },

  initWysiwyg: function() {
    const wysihtml5 = require('wysihtml5'); // jshint ignore:line
    this.$('.js-insert-link').click(this.onInsertLinkClick);
    this.editor = new wysihtml5.Editor(
      this.$textarea.get(0),
      this.getWysiwygOptions()
    );
    this.editor.resizeHeight = this.resizeEditorHeight.bind(this);
    this.editor.on('load', this.onLoad);
  },

  initResize: function() {
    const $body = $(this.editor.composer.element);
    this.stopResize();
    this.resizeTimer = setInterval(this.onResize, 1000);
    $body.on('keydown keyup', this.onResize);

    // Prevent img resize controls on click
    $body.on('mousedown', 'img', function() {
      $(this).attr('contenteditable', false);
    }).on('mouseup', 'img', function() {
      $(this).removeAttr('contenteditable');
    });
    return this;
  },

  stopResize: function() {
    const $body = $(this.editor.composer.element);
    if (this.resizeTimer) clearInterval(this.resizeTimer);
    $body.off('keydown keyup', this.onResize);
    $body.off('mousedown mouseup');
    return this;
  },

  resizeEditorHeight: function(height) {
    const offsetHeight = this.editor.composer.element.offsetHeight;
    const iframe = this.editor.composer.iframe;
    $(iframe).height(offsetHeight + height);
  },

  onBlur: function() {
    this.onChange();
    this.stopResize();
  },

  onFocus: function() {
    this.initResize();
  },

  onChange: function() {
    if (this.hasCharacterMeter) {
      const val = this.trimTags(this.editor.getValue());
      if (val.length > 2000) {
        this.$('.js-chars-left').parent().removeClass('is-hidden');
        this.$('.js-chars-left').html(_t('noCharsLeft', val.length - 2000));
      } else {
        this.$('.js-chars-left').parent().addClass('is-hidden');
      }
    }

    this.trigger('editor:change');
  },

  onKeyUp: function() {
    this.trigger('editor:keyup');
  },

  onLoad: function() {
    const $body = $(this.editor.composer.element);

    this.editor.on('focus', this.onFocus);
    this.editor.on('blur', this.onBlur);

    if (this.hasCharacterMeter) {
      this.onChange();
      this.editor.on('change', this.onChange);
      this.editor.on('newword:composer', this.onChange);
    }
    this.$el.removeClass('is-loading').removeClass('is-active');
    // Needed for resize
    $body.css({
      overflow: 'hidden'
    }); // hide scroll

    $body.on('keyup', this.onKeyUp.bind(this));

    this.trigger('load');
  },

  onResize: function() {
    const height = this.editor.composer.element.offsetHeight;
    const iframe = this.editor.composer.iframe;
    if ($(iframe).height() !== height) {
      $(iframe).height(height); // + 15
    }
  }

});
