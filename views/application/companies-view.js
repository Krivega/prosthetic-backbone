'use strict';

const View = require('views/view');
const Overlay = require('views/ui/overlay');
const CompanyProfile = require('views/person/company-profile');

module.exports = View.extend({

  events: {
    'click .js-overlay-view-company': 'onViewCompany'
  },

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.company = new CompanyProfile();

    this.overlay = new Overlay({
      model: this.options.overlayModel
    });

    this.listenTo(this.overlay, 'show:finished', this.onOverlayShow);
  },

  render: function() {
    this.overlay.render();
  },

  onViewCompany: function(e) {
    const id = this.$(e.currentTarget).data('id');
    const model = this.collection.get(id);
    if (!model) return;
    this.company.setModel(model);
    this.overlay.show(this.company);
  },

  onOverlayShow: function() {
    this.company.render();
  }

});
