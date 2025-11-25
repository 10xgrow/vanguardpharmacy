'use strict';
define(['jquery', 'accessibilityUtils', 'mage/translate'], function($, accessibilityUtils, $t) {
    var ACCESSIBILITY = true,
        doc = $(document);

    doc.on('click', 'a.js-skip-link, a[data-button-type][href^="#"]', function(event) {
        event.preventDefault();

        var clickedElement = $(event.currentTarget),
            scrollTarget = $(clickedElement.attr('href'));

        if (scrollTarget.length) {
            if (clickedElement.is('.skip-link') || ACCESSIBILITY) {
                accessibilityUtils.scrollToAndFocus(
                    scrollTarget,
                    clickedElement.data('focus-target'),
                    clickedElement.data('transition-duration')
                );
            } else {
                accessibilityUtils.scrollTo(
                    scrollTarget,
                    clickedElement.data('transition-duration')
                );
            }
        }
    });

    doc.on('click', 'a.js-immediate-focus', function(event) {
        event.preventDefault();

        var clickedElement = $(event.currentTarget),
            target = $(clickedElement.attr('href'));

        if (clickedElement.data('focus-target')) {
            var newTarget = target.find(clickedElement.data('focus-target'));

            target = newTarget.length ? newTarget.first() : target;
        }

        accessibilityUtils.forceElementFocus(target);
    });

    function addNewWindowScreenReaderText(container) {
        container.find('a[target="_blank"]').not('#map a').each(function(index, element) {
            element = $(element);

            if (element.find('.screenreader-only').length === 0) {
                var screenReaderText = $('<span class="screenreader-only" />').text(' ' + $t('(opens in a new window)'));

                element.append(screenReaderText);
            }
        });
    }

    addNewWindowScreenReaderText(doc);

    doc.on('loadedBanner', function(event) {
        addNewWindowScreenReaderText($(event.target));
    });

    function scrollToAnchor() {
        var target;
        try {
            target = $(window.location.hash);
        } catch (error) {
            // Ignore invalid selector error
        }

        if (target && target.length) {
            if (ACCESSIBILITY) {
                accessibilityUtils.scrollToAndFocus(target);
            } else {
                accessibilityUtils.scrollTo(target);
            }
        }
    }

    if ('complete' === document.readyState) {
        scrollToAnchor();
    } else {
        $(window).on('load', function() {
            scrollToAnchor();
        });
    }

    return scrollToAnchor;
});