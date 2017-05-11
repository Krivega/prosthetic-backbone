'use strict';

const _ = require('underscore');
const utils = require('utils');
const scroller = require('views/ui/scroller');
const features = require('features');
const View = require('views/view');
const $ = require('jquery');
require('jquery.datepick');

const SERVER_DATE_FORMAT = 'YYYY-MM-DD';
/*
 * Padding for field label
 * */
const DEFAULT_SCROLL_PADDING = 40;

module.exports = View.extend({

  _isFreezeChangeInput: false,

  /**
   * Initialize accept same options as datepicker
   * @param  {object} options Datepicker options
   */

  /**
   * Create date picker for date fields
   * Format defined by current locale. See utils.js for details
   */
  render: function(options = {}) {
    const $input = this.$el;
    const hasScrollOnMobile = this.options.hasScrollOnMobile || false;
    const $inputParent = this.$el.parent();
    let pickerOptions;
    const dateFormat = utils.getDatePickerFormat({
      isPicker: true
    });
    const placeholderFormat = dateFormat;
    const $pickerContainer = (options && options.container) ? options.container : $input
      .parents('.field:first')
      .append('<div class="js-picker-container"></div>')
      .find('.js-picker-container');
    const isDisable = $input.prop('disabled') || $input.prop('readonly');
    // Disable for non-system fields
    if ($pickerContainer.length === 0) return;

    $input.attr('type', 'text');
    $input.attr('data-type', 'date');
    $input.attr('placeholder', placeholderFormat);

    // convert date format for picker

    const value = $input.val();
    $input.val(utils.formatDate(value, 'picker'));

    pickerOptions = {
      dateFormat: dateFormat,
      showOtherMonths: true,
      integral: true,
      constrainInput: false,
      yearRange: '-100:+1',
      popupContainer: $pickerContainer,
      monthNames: [
        'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.',
        'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
      ],
      monthNamesShort: [
        'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.',
        'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
      ],
      prevText: '<svg class="icon"><use xlink:href="#icon-prev" /></svg>',
      prevJumpText: '<svg class="icon"><use xlink:href="#icon-prev" /></svg>',
      nextText: '<svg class="icon"><use xlink:href="#icon-next" /></svg>',
      nextJumpText: '<svg class="icon"><use xlink:href="#icon-next" /></svg>',
      closeText: '<svg class="icon"><use xlink:href="#icon-close" /></svg>',
      renderer: _.extend($.datepick.defaultRenderer, {
        picker: '<div class="datepick">' +
          '{months}' +
          '<div class="datepick-clear-fix"></div>' +
          '<div class="datepick-close">{link:close}</div>' +
          '<div class="datepick-clear-fix"></div>' +
          '</div>'
      }),
      onSelect: (dates) => {
        $input.change();
        this.trigger('change', dates[0]);
      },
      showSpeed: 0,
      showAnim: false,
      onShow: (e) => {
        if (_.isFunction(options.onShow)) {
          options.onShow(e);
        }

        if (hasScrollOnMobile && features.isMobile()) {
          scroller.scrollTo($pickerContainer);
        }
      },
      onClose: (e) => {
        if (_.isFunction(options.onClose)) {
          options.onClose(e);
        }

        if (hasScrollOnMobile && features.isMobile()) {
          scroller.scrollTo($input, {
            paddingTop: this.options.scrollPadding || DEFAULT_SCROLL_PADDING
          });
        }
      }
    };

    if (this._isDatepickerInput($inputParent)) {
      $inputParent.addClass('is-datepicker');
      pickerOptions.showOnFocus = false;
      pickerOptions.showTrigger = $inputParent.find('.js-datepicker-toggle');

      if (this.options.hideKeybordWhenTriggered) {
        this.$(pickerOptions.showTrigger).on('click', () => {
          document.activeElement.blur();
        });
      }
    }

    if ($input.attr('min')) pickerOptions.minDate = $input.attr('min');
    if ($input.attr('max')) pickerOptions.maxDate = $input.attr('max');
    _.extend(pickerOptions, this.options);

    // those parameters are disabled until we fix validating of input date
    // see onBlur.
    //delete pickerOptions.minDate;
    //delete pickerOptions.maxDate;

    $input.datepick(pickerOptions);

    if (isDisable) $input.datepick('disable');

    $input.on('update', (e, value) => {
      this._setDatePickerDate(value);
    });

    $input.on('change', this.onChangeInput.bind(this));

    return this;
  },

  _isDatepickerInput: function($inputParent) {
    return $inputParent.hasClass('input') && $inputParent.find('.js-datepicker-toggle').length > 0;
  },

  hide: function() {
    this.$el.datepick('hide');
  },

  setOptions: function(options) {
    this.options = _.extend(this.options, options);
    this.$el.datepick('option', options);
    return this;
  },

  setHighlighted: function(dates) {
    this.$el.datepick('setHighlightedDates', dates, true);
    return this;
  },

  setDate: function(date) {
    if (_.isString(date)) {
      date = utils.formatDateToServer(date, true);
    }
    date = utils.convertMomentToNativeDate(utils.createDate(date));
    this._setDatePickerDate(date);
    return this;
  },

  getDate: function() {
    const date = this._getDatePickerDate();
    if (date) {
      return utils.convertNativeDateToMoment(date[0]);
    }
    return null;
  },

  _setDatePickerDate: function(date) {
    this.$el.datepick('setDate', date);
  },

  _getDatePickerDate: function() {
    return this.$el.datepick('getDate');
  },

  val: function(date, options) {
    options = options || {};
    if (date) {
      if (options.format) {
        date = utils.formatDate(date, 'picker');
      }
      return this.setDate(date);
    }
    return this.getDate();
  },

  getDateFormatted: function() {
    const date = this.getDate();
    if (!this.getInputDate()) return '';
    if (!this.isValid()) return '';
    return utils.formatDateToServer(utils.formatDateObject(date, SERVER_DATE_FORMAT));
  },

  isValid: function() {
    const date = this.getDate();
    return !!date && date.isValid();
  },

  toValidDate: function(date, format) {
    if ((format === 'DD' || format === 'MM') &&
      format.length > date.toString().length) return true;
    if (format === 'DD') return date <= 31 && date > 0;
    return utils.toValidDate(date, format);
  },

  getInputDate: function() {
    const validSeparators = ['/', '.', ',', ' ', '-'];
    const $input = this.$el;
    const valDate = $input.val();
    if (!valDate) return '';

    const formatParts = utils.getDatePickerFormatParts();
    let dateParts;

    for (let i = 0; i < validSeparators.length; i++) {
      dateParts = valDate.split(validSeparators[i]);
      if (dateParts.length === 3) break;
    }

    for (let i = 0; i < dateParts.length; i++) {
      dateParts[i] = '' + utils.getOnlyNumber(dateParts[i]);
      let diffDigits = formatParts[i].length - dateParts[i].length;
      if (diffDigits === 2 && formatParts[i] === 'YYYY') {
        if (dateParts[i] < 50) {
          dateParts[i] = '20' + dateParts[i];
        } else {
          dateParts[i] = '19' + dateParts[i];
        }
      } else if (diffDigits > 0) {
        for (let j = 0; j < diffDigits; j++) {
          dateParts[i] = '0' + dateParts[i];
        }
      }
    }

    if (dateParts.length !== 3 || !this.isValidInputDate(dateParts)) return '';

    return dateParts.join(utils.getDatePickerSeparatorFormat());
  },

  isValidInputDate: function(dateParts) {
    const formatParts = utils.getDatePickerFormatParts();
    let isValid = true;

    for (let i = 0; i < formatParts.length; i++) {
      isValid = isValid && !!this.toValidDate(dateParts[i], formatParts[i]);
      if (!isValid) break;
    }
    return isValid;
  },

  getErrorElement: function() {
    return this.$el.parents('.js-field:first').find('.js-error');
  },

  showError: function() {
    const $fieldMessage = this.getErrorElement();

    if ($fieldMessage) {
      $fieldMessage
        .append('<div>' + _t('invalidDate') + '</div>')
        .addClass('is-visible');
    }
    return this;
  },

  hideError: function() {
    this.getErrorElement().empty().removeClass('is-visible');
    return this;
  },

  validate: function() {
    const inputDate = this.getInputDate();
    this.hideError();
    if (!inputDate) {
      this.showError();
      this.$el.datepick('clear');
      return false;
    } else {
      this.setDate(inputDate);
      if (!this.isValid()) {
        this.showError();
        this.$el.datepick('clear');
        return false;
      }
      return true;
    }
  },

  onChangeInput: function() {
    if (this._isFreezeChangeInput === false) {
      this._isFreezeChangeInput = true;
      this.validate();
      this._isFreezeChangeInput = false;
    }

  }
});
