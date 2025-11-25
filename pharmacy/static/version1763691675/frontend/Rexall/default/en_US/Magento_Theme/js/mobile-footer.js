'use strict';

require([
    'jquery'
], function($) {
    $(document).ready(function() {
        let $navTitleContainer = $('.footer-nav-title-container');
        let $accordionList = $('.footer-accessible-accordion');

        if ($(window).width() >= 768) {
            $navTitleContainer.appendTo($('.js-accessible-accordion-item.first-item'));
        } else {
            $navTitleContainer.appendTo($accordionList);
        }

        $(window).on('resize', function() {
            if ($(window).width() >= 768) {
                $navTitleContainer.appendTo($('.js-accessible-accordion-item.first-item'));
            } else {
                $navTitleContainer.appendTo($accordionList);
            }
        }).trigger('resize');
    });
});