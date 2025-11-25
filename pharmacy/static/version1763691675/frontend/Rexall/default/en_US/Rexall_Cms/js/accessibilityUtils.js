'use strict';
define(['jquery', 'breakpoints'], function($) {
    var focusTargetSelector = '.js-focus-target';

    function scrollTo(scrollTarget, transitionDuration) {
        var scrollElement = $('html, body'),
            targetPosition = 0;

        transitionDuration = typeof transitionDuration !== 'undefined' ? transitionDuration : 300;

        switch (true) {
            case $.isNumeric(scrollTarget):
                targetPosition = scrollTarget;
                break;

            case $(scrollTarget).length > 0:
                var landingPageHeader = $('header.js-header'),
                    breakpoints = new Breakpoints(),
                    offset = landingPageHeader.length === 0 ?
                    breakpoints.isAtLeast('lg') ? 0 : $('.header.content').outerHeight() :
                    landingPageHeader.outerHeight();

                if (offset !== 0) {
                    offset += $('.header-location').outerHeight() + $('.mobile-province-selector .province-accordion > .accessible-accordion-item').outerHeight();
                }

                targetPosition = Math.round($(scrollTarget).offset().top - offset);
                break;

            default:
                targetPosition = 0;
        }

        return scrollElement.animate({
            scrollTop: targetPosition
        }, transitionDuration);
    }

    function forceElementFocus(focusTarget, wrapper) {
        focusTarget = $(focusTarget);
        wrapper = typeof wrapper !== 'undefined' && $(wrapper).get(0) instanceof HTMLElement ? $(wrapper).eq(0) : focusTarget;

        if (focusTarget.get(0) instanceof HTMLElement) {
            focusTarget = focusTarget.eq(0);
            if (!focusTarget.is(':input, a[href]') && !focusTarget.attr('tabindex')) {
                focusTarget.attr('tabindex', -1).data('addedTabIndex', true);
            }

            focusTarget.on('blur.force-focus focusout.force-focus', function() {
                if (focusTarget.data('addedTabIndex')) {
                    focusTarget.removeAttr('tabindex');
                }
                wrapper.removeClass('has-focus');

                focusTarget.off('blur.force-focus focusout.force-focus');
            }).trigger('focus');
            wrapper.addClass('has-focus');
        }
    }

    // Avoid focusing on large content areas to avoid issues where the screen jumps on mobile after the scroll animation.
    // Focusing on the first readable content item that fits on the screen is a preferable workaround.
    function scrollToAndFocus(scrollTarget, focusTarget, transitionDuration) {
        scrollTarget = $(scrollTarget);
        focusTarget = $(focusTarget);

        if (!focusTarget.length) {
            focusTarget = findFocusTarget(scrollTarget);
        }

        scrollTo(scrollTarget, transitionDuration).promise().done(function() {
            forceElementFocus(focusTarget, scrollTarget);
        });
    }

    function findFocusTarget(wrapper) {
        wrapper = $(wrapper);
        var element = wrapper.find(focusTargetSelector).addBack(focusTargetSelector).filter(':visible');
        return element.length ? element.eq(0) : wrapper;
    }

    return {
        focusTargetSelector: focusTargetSelector,
        scrollTo: scrollTo,
        forceElementFocus: forceElementFocus,
        scrollToAndFocus: scrollToAndFocus,
        findFocusTarget: findFocusTarget
    };
});