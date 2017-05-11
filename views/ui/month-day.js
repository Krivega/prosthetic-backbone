'use strict';

const View = require('views/view');

const DAYS_MAP = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31
};

module.exports = View.extend({

  events: {
    'change [name=month]': 'onMonthChange'
  },

  render: function() {
    this.onMonthChange();
  },

  _addDay: function($select, value) {
    if ($select.has('option[value=' + value + ']').length) return;
    $select.append('<option value=' + value + '>' + value + '</option>');
  },

  onMonthChange: function() {
    const month = Number(this.$('[name=month]').val());
    const daysInMonth = DAYS_MAP[month];
    // Mutate options list, but not destroy entirely to avoid losing valid selection
    const $days = this.$('[name=day]');
    const $daySelectOptions = this.$('[name=day] option');
    if (daysInMonth === 28) {
      $daySelectOptions.remove('[value=29],[value=30],[value=31]');
    } else if (daysInMonth === 30) {
      $daySelectOptions.remove('[value=31]');
      this._addDay($days, 29);
      this._addDay($days, 30);
    } else {
      this._addDay($days, 29);
      this._addDay($days, 30);
      this._addDay($days, 31);
    }
  }

});
