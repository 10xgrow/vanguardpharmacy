'use strict';
require(['jquery'], function($) {
    var provinceSelectorDropdown = $('.province-selector-wrapper .accessible-accordion-content');

    $(document).click(function(e) {
        e.stopPropagation();

        var target = $(e.target);

        if (provinceSelectorDropdown.is(':visible')) {
            if (!target.parents('.province-selector-wrapper').length) {
                toggleProvinceSelector();
            }
        }
    });

    $(document).on('keydown', function(e) {
        if (e.which == 27) {
            if (provinceSelectorDropdown.is(':visible')) {
                toggleProvinceSelector();
            }
        }
    });

    function toggleProvinceSelector() {
        provinceSelectorDropdown.hide();
        $('.province-selector-wrapper .js-accessible-accordion-item').removeClass('is-active');
        $('.province-selector-wrapper .js-accessible-accordion-title').attr('aria-expanded', 'false');
    }
});