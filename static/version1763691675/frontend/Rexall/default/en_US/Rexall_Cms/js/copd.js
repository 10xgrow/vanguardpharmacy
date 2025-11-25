'use strict';
require(['jquery', 'accessibilityUtils'], function($, accessibilityUtils) {
    let whatIsCopd = $('a[href="#whatIsCopd"]'),
        speakWithPharmacist = $('a[href="#speakWithPharmacist"]'),
        copdResources = $('a[href="#resources"]');

    whatIsCopd.click(function() {
        accessibilityUtils.scrollTo($('#whatIsCopd'), 'slow');
    });

    speakWithPharmacist.click(function() {
        accessibilityUtils.scrollTo($('#speakWithPharmacist'), 'slow');
    });

    copdResources.click(function() {
        accessibilityUtils.scrollTo($('#resources'), 'slow');
    });
});