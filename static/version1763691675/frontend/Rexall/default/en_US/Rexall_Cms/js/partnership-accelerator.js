'use strict';
require(['jquery', 'accessibilityUtils'], function($, accessibilityUtils) {
    let mobileLink = $('a[href="#mobile-app"]'),
        otherOptionsLink = $('a[href="#otherOptions"]');

    otherOptionsLink.click(function() {
        accessibilityUtils.scrollToAndFocus($('.otherOptions:first'), 'slow');
    });

    mobileLink.click(function() {
        accessibilityUtils.scrollTo($('#mobile-app'), 'slow');
    });
});