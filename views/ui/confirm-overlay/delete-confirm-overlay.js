'use strict';

const ConfirmOverlayView = require('./confirm-overlay');

module.exports = ConfirmOverlayView.extend({

  title: _t('deleteConfirmation'),
  message: _t('areYouSureYouWantToDeleteThis')

});
