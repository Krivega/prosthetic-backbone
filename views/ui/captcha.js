'use strict';

const config = require('config');
const currentUser = require('runtime/current-user');
const View = require('views/view');

const template = require('ui/captcha/templates/captcha.nunj');

const STUB_CAPTCHA_RESPONSE = 'stub';

const SCRIPT_ID = 'captcha-script';

const SCRIPT_STATUS_NO_LOAD = 0;
const SCRIPT_STATUS_LOAD = 1;
const SCRIPT_STATUS_LOADED = 2;

module.exports = View.extend({

  template: template,
  captchaId: undefined,
  loadedScript: SCRIPT_STATUS_NO_LOAD,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    if (!this.options.form) {
      throw 'Сurrent form need to necessarily to pass';
    }

    this.listenTo(this.options.form, 'error', this.onErrorForm);
  },

  render: function() {
    this.renderDone();
    this.loadRecaptchaScript();
    return this;
  },

  _render: function() {
    this.renderTemplate();
    this.renderCaptcha();
  },

  val: function() {
    return this.isLoadedScript() ? this.getCaptchaResponseId() : '';
  },

  resetRecaptcha: function() {
    this.renderCaptchaIfNotInitialized();
    this.getGoogleRecaptcha().reset(this.captchaId);
  },

  getPrivateFieldsNames: function() {
    return ['g-recaptcha-response'];
  },

  renderCaptcha: function() {

    this.clearCaptchaBox();
    this.renderGoogleRecaptcha();
  },

  renderCaptchaIfNotInitialized: function() {
    if (this._rendered() && !this._isCaptchaInitialized()) {
      this.renderCaptcha();
    }
  },

  renderGoogleRecaptcha: function() {
    this.captchaId = this.getGoogleRecaptcha().render(
      this.$('.js-captcha-box')[0],
      this.getCaptchaConfigs()
    );
  },

  clearCaptchaBox: function() {
    this.$('.js-captcha-box').empty();
  },

  getCaptchaConfigs: function() {
    return {
      sitekey: config.googleReCaptchaKey,
      callback: this.hideError.bind(this)
    };
  },

  getCaptchaResponseId: function() {
    if (currentUser.canBypassCaptcha()) {
      return this.generateStubCaptchaResponse();
    }
    this.renderCaptchaIfNotInitialized();
    return this.getGoogleRecaptchaResponseById(this.captchaId);
  },

  getGoogleRecaptchaResponseById: function(captchaId) {
    return this.getGoogleRecaptcha().getResponse(captchaId);
  },

  hideError: function() {
    this.$('.js-error').removeClass('is-visible');
  },

  getGoogleRecaptcha: function() {
    return window.grecaptcha;
  },

  generateStubCaptchaResponse: function() {
    return STUB_CAPTCHA_RESPONSE;
  },

  _isCaptchaInitialized: function() {
    return this.captchaId !== undefined;
  },

  _rendered: function() {
    return this.isLoaded();
  },

  isLoadedScript: function() {
    return this.loadedScript === SCRIPT_STATUS_LOADED;
  },

  isLoadScript: function() {
    return this.loadedScript === SCRIPT_STATUS_LOAD;
  },

  removeScriptIfExist: function() {
    const script = document.getElementById(SCRIPT_ID);

    if (script) {
      script.parentNode.removeChild(script);
    }
  },

  loadRecaptchaScript: function() {
    if (!this.isLoadedScript() && !this.isLoadScript()) {
      this.removeScriptIfExist();

      this.loadedScript = SCRIPT_STATUS_LOAD;

      window.onRecaptchaLoaded = () => {
        if (!this.isLoadedScript()) {
          this._render();
          this.loadedScript = SCRIPT_STATUS_LOADED;
        }
      };

      const script = document.createElement('script');

      script.type = 'text/javascript';
      script.id = SCRIPT_ID;
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';

      document.getElementsByTagName('head')[0].appendChild(script);
    } else if (this.isLoadedScript()) {
      this._render();
    }
  },

  onRecaptchaLoaded: function() {
    if (this._rendered()) {
      this.resetRecaptcha();
    }
  },

  onErrorForm: function() {
    this.resetRecaptcha();
  }
});
