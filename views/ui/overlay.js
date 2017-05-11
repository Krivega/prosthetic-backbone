'use strict';

const utils = require('utils');

const View = require('views/view');
const PreloaderView = require('views/application/preloader');
const scroller = require('views/ui/scroller');

const OverlayHeaderView = require('./overlay/overlay-header');

const overlayManager = require('runtime/overlay-manager');
const formStatesHandler = require('views/application/form-handlers/form-states-handler');

const template = require('ui/overlay/templates/overlay.nunj');

const STATUS_CLOSED = 0;
const STATUS_SHOWN = 1;

module.exports = View.extend({

  // js-overlay usable in others modules
  className: 'overlay js-overlay',

  template: template,

  isAttachment: false,

  contentView: null,
  index: 1000,
  indexInManager: null,
  status: STATUS_CLOSED,

  $wrapper: null,
  $scroller: null,

  renderingContent: false,

  events: {
    click: 'onClick',
    'click .js-overlay-close': 'onClickClose',
    'click .js-overlay-action': 'onClickAction',
    'click .js-overlay-action-checkbox': 'onClickActionCheckbox'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.options.mods = this.options.mods || [];
    if (this.options.withoutStack) {
      this.options.mods.push('without-stack');
    }
    this.overlayHeaderView = new OverlayHeaderView({
      model: this.model,
      hasDropDown: this.options.hasDropDown,
      mods: this.options.mods
    });
    this.preloaderView = new PreloaderView();
    if (!this.options.withoutStack) {
      this.listenTo(overlayManager, 'active:change', this.onChangeActvieOverlay);
    }

    if (this.options.content) {
      this.initialContentView = new this.options.content();
      this.listenTo(this.initialContentView, 'all', this.trigger);
    }
  },

  remove: function() {
    $document.off(this.getEventName('keyup.overlay'));
    this.removeFromManager();
    this._unFreezeScroll();
    return View.prototype.remove.apply(this, arguments);
  },

  render: function() {
    if (this.initialContentView) {
      this.initialContentView.render();
    }
    if (this.isAttachment) return this;
    this.$el.appendTo('body').hide();
    if (this.options.mods) {
      const mods = utils.parseCssMods('overlay', this.options.mods);
      this.$el.addClass(mods);
    }
    this.renderTemplate({
      mods: this.options.mods
    });
    this.subRender('.js-overlay-header', this.overlayHeaderView);
    this.$wrapper = this.$('.js-overlay-wrapper');
    this.$scroller = this.$('.js-overlay-scroller');
    this.isAttachment = true;
    this.setElementToSubView(this.preloaderView);
    this.preloaderView.hidePreloader();
    return this;
  },

  isRenderingContent: function(renderingContent) {
    if (renderingContent === undefined) {
      return this.renderingContent;
    }
    this.renderingContent = renderingContent;
    return this;
  },

  show: function(contentView) {
    if (this.isRenderingContent()) return this;
    this.removeFromManager({
      silent: true
    });
    this.setIndex();
    this.isRenderingContent(true);

    let contentToShow = contentView;

    if (!contentView && this.initialContentView) {
      contentToShow = this.initialContentView;
    }

    if (this.contentView !== contentToShow) {
      this.removeSubview(this.contentView);
      this.contentView = contentToShow;
      this.subRender('.js-overlay-content', this.contentView);
    }
    this.status = STATUS_SHOWN;
    this.trigger('show:started');
    $document.on(this.getEventName('keyup.overlay'), this.onKeyUp.bind(this));

    if (!this.isClosed()) {
      this.$el.fadeIn({
        complete: () => {
          this._freezeScroll();
          this.isRenderingContent(false);
          this.addToManager();
          this.contentView.trigger('overlay:show');
          this.trigger('show:finished');
        }
      });
    }
    return this;
  },

  close: function(options = {}) {
    return new Promise((resolve) => {
      if (this.status === STATUS_CLOSED) {
        resolve();
        return;
      }
      if (this.isRenderingContent() && !options.force) {
        resolve();
        return;
      }

      if (this.needToPreventUnload()) {
        resolve();
        return;
      }

      this.status = STATUS_CLOSED;
      this.isRenderingContent(false);

      if (!options.silent) {
        this.trigger('close', this);
      }

      $document.off(this.getEventName('keyup.overlay'));

      this.removeFromManager({
        silent: options.silentRemoveFromManager
      });
      this._unFreezeScroll();

      this.$el.fadeOut({
        complete: () => {
          this.contentView.trigger('overlay:close');
          resolve();
        }
      });
    });
  },

  _freezeScroll: function() {
    scroller.freezeScroll();
    return this;
  },

  _unFreezeScroll: function() {
    const sizeOvelrays = overlayManager.sizeActiveOvelrays();
    if (sizeOvelrays === 0) {
      scroller.unFreezeScroll();
    }
    return this;
  },

  toggleAction: function(action, hide) {
    this.$('.js-overlay-action[data-id=' + action + ']').toggleClass('is-hidden', hide);
    return this;
  },

  getScrollerBlock: function() {
    return this.$scroller;
  },

  startLoading: function() {
    this.preloaderView.showPreloader();
  },

  stopLoading: function() {
    this.preloaderView.hidePreloader();
  },

  isShown: function() {
    return this.status === STATUS_SHOWN;
  },

  isClosed: function() {
    return this.status === STATUS_CLOSED;
  },

  isFormShown: function() {
    return this.contentView && this.contentView.isForm();
  },

  needConfirmUnload: function() {
    if (this.isFormShown()) {
      return this.contentView.isFormStateChanged();
    }
    return false;
  },

  /**
   * Returns true if need to prevent overlay unload (close)
   * @returns {boolean}
   */
  needToPreventUnload: function() {
    let preventUnload = false;
    if (this.needConfirmUnload()) {
      if (!formStatesHandler.showConfirmation()) {
        preventUnload = true;
      }
    }
    return preventUnload;
  },

  setIndex: function() {
    this.index = overlayManager.getIndex();
    this.$el.css({
      'z-index': this.index
    });
    return this;
  },

  setTitle: function(title) {
    this.model.set('title', title);
    return this;
  },

  setIndent: function(position) {
    const defaultIndent = 3;
    const indent = 5 * position + defaultIndent;
    this.$wrapper.css({
      'margin-top': `${indent}rem`,
      height: `calc(100% - ${indent + 3}rem)`
    });

    this.contentView.trigger('overlay:change-position');

    return this;
  },

  getIndex: function() {
    return this.index;
  },

  addToManager: function() {
    if (!this.options.withoutStack) {
      overlayManager.setActiveOverlay(this, this.index);
    }
    return this;
  },

  removeFromManager: function(options) {
    if (!this.options.withoutStack) {
      overlayManager.unsetActiveOverlay(this, options);
    }
    return this.$el;
  },

  isActive: function() {
    if (this.options.withoutStack) {
      return true;
    }
    const activeOverlay = overlayManager.getLastActiveOverlay();
    return this.cid === activeOverlay.cid;
  },

  onChangeActvieOverlay: function() {
    const overlayIndex = overlayManager.getOverlayIndex(this);
    if (this.isClosed()) {
      return;
    }
    const sizeOvelrays = overlayManager.sizeActiveOvelrays();
    let addClasses = '';
    let removeClasses = '';

    if (overlayIndex === 0) {
      addClasses += ' is-last';
    } else {
      removeClasses += ' is-last';
    }

    if (sizeOvelrays > 1) {
      if (this.isActive()) {
        removeClasses += ' is-inactive';
      } else {
        addClasses += ' is-inactive';
      }
    } else {
      removeClasses += ' is-inactive';
    }

    this.$el.removeClass(removeClasses).addClass(addClasses);

    if (this.indexInManager !== overlayIndex) {
      this.setIndent(overlayIndex);
      this.indexInManager = overlayIndex;
    }
  },

  onClick: function(e) {
    if (e.currentTarget === e.target) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    }
  },

  onClickClose: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.close();
  },

  onClickAction: function(e) {
    e.preventDefault();
    e.stopPropagation();
    const data = this.$(e.currentTarget).data();
    this.trigger('action:' + data.id, data);
  },

  onClickActionCheckbox: function(e) {
    e.stopPropagation();

    if (this.$(e.target).is('label')) {
      // do not handle labels, it fires again on checkbox
      return;
    }

    const data = this.$(e.currentTarget).data();
    this.trigger('action:change:' + data.id, data);
  },

  onKeyUp: function(e) {
    // close on ESC
    if (e.keyCode === 27 && this.isActive()) {
      this.close();
    }
  }

});
