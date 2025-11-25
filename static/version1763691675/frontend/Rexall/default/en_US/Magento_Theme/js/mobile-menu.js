'use strict';

require([
    'jquery',
    'accessible-expandable-menu',
    'accessible-accordion'
], function($) {
    var mobileNavTopLevelContainer = $('.js-mobile-nav-container'),
        mobileMenuInner = $('.js-mobile-nav-container .js-menu-inner'),
        html = $('html');

    mobileNavTopLevelContainer.accessibleExpandableMenu({
        menuItemSelector: '.js-mobile-nav-container-inner',
        menuItemToggleSelector: '.js-menu-trigger',
        focusOnOpenSelector: '.js-menu-inner'
    });

    mobileNavTopLevelContainer.on('afterMenuStateChange', function(event, stateVal, item) {
        if (item.is('.js-mobile-nav-container-inner')) {
            html.toggleClass('no-overflow', stateVal);
        }
    });

    mobileMenuInner.accessibleExpandableMenu({
        closeButton: mobileMenuInner.find('.js-menu-close'),
        moveFocusOnEscape: false
    });

    mobileMenuInner.on('afterMenuStateChange', function(event, stateVal) {
        mobileMenuInner.closest('.js-menu')
            .toggleClass('show-sub', stateVal);
    });

    mobileMenuInner.find('.js-header-mobile-accordion').each(function(index, element) {
        element = $(element);

        var title = element.find('.js-header-mobile-accordion-title'),
            button = $('<button />', {
                'class': 'header-mobile-accordion-title ' + title.attr('class'),
                'html': title.html(),
                'type': 'button'
            });

        title.before(button)
            .remove();

        element.accessibleAccordion({
            accordionItemSelector: '.js-header-mobile-accordion-item',
            accordionTitleSelector: '.js-header-mobile-accordion-title',
            accordionContentSelector: '.js-header-mobile-accordion-content'
        });
    });
});