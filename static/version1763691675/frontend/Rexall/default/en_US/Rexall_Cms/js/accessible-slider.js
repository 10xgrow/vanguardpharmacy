'use strict';

define([
    'jquery',
    'mage/translate',
    'breakpoints',
    'AccessibleSlick'
], function($, $t, breakpoints) {
    /**
     * Adjust breakpoint config:
     * - Get value by named breakpoint {@see getBreakpointValues}
     * - Make breakpoint values compatible with slick js mobileFirst responsive mode {@see responsiveFirstBreakpointSizeCompatibility}
     */
    function filterMobileFirstResponsiveBreakpointSizeSlickOptions(options, element) {
        if (Array.isArray(options.slickOptions.responsive)) {
            options = $.extend({}, options);

            options.slickOptions.responsive = responsiveFirstBreakpointSizeCompatibility(
                options,
                getBreakpointValues(options.slickOptions.responsive)
            );
        }

        return options;
    }

    /**
     * Allow named breakpoints to be used instead of numbers. eg: 'xs', 'md', 'lg', etc. See 'breakpoints' dependency
     */
    function getBreakpointValues(breakpointList) {
        var output = [];

        $.each(breakpointList, function(index, configObject) {
            try {
                var updatedBreakpoint = $.extend({}, configObject);

                if ('string' === $.type(updatedBreakpoint.breakpoint)) {
                    var breakpointValue = breakpoints.getSizeByName(updatedBreakpoint.breakpoint);
                    updatedBreakpoint.breakpoint = breakpointValue === null ? updatedBreakpoint.breakpoint : breakpointValue;
                }

                output.push(updatedBreakpoint);
            } catch (error) {
                // ignore
                output.push(configObject);
            }
        });

        return output;
    }

    /**
     * Adjust responsive first breakpoint sizes to be compatible with slick js mobileFirst responsive mode
     *
     * Slick does comparison in such a way which leads to off by 1 errors with responsive first breakpoint sizes.
     * eg: 1200 should be xlarge breakpoint size:
     *
     * slick internal logic:
     * windowWidth > providedBreakpointSize
     * Which is the same as: 1200 > 1200 // false
     *
     * To fix this we subtract 1 from each breakpoint value: 1200 > 1199 // true
     */
    function responsiveFirstBreakpointSizeCompatibility(options, breakpointList) {
        if (!options.slickOptions.mobileFirst) {
            return breakpointList;
        }

        var output = [];

        $.each(breakpointList, function(index, configObject) {
            try {
                var updatedBreakpoint = $.extend({}, configObject);

                updatedBreakpoint.breakpoint--;

                output.push(updatedBreakpoint);
            } catch (error) {
                // ignore
                output.push(configObject);
            }
        });

        return output;
    }

    var sliderUniqueInstanceAttributeName = 'data-slider-instance-id';

    /**
     * Limit certain options to select child elements of slider. This allows cleaner and more bug free configs
     * while also allowing us to select items which may not be present before the slider is initialized.
     */
    function filterChildElementSlickOptions(options, element) {
        options = $.extend({}, options);

        $.each(options.limitOptionsToChildren, function(index, settingName) {
            scopeUpdateSelectorSetting(options.slickOptions, settingName);

            if (Array.isArray(options.slickOptions.responsive) && options.slickOptions.responsive.length > 0) {
                $.each(options.slickOptions.responsive, function(index, responsiveSizeConfig) {
                    scopeUpdateSelectorSetting(responsiveSizeConfig.settings, settingName);
                });
            }
        });

        function scopeUpdateSelectorSetting(settingObject, settingName) {
            if ('string' === $.type(settingObject[settingName]) && settingObject[settingName].length > 0) {
                settingObject[settingName] = '[' + sliderUniqueInstanceAttributeName + '="' + options.uniqueInstanceId + '"] ' + settingObject[settingName];
            }
        }

        return options;
    }

    function applyConfigFilters(config, element, filters) {
        config = $.extend({}, config);

        $.each(filters, function(index, value) {
            config = 'function' === $.type(value) ? value(config, element) : config;
        });

        return config;
    }

    /**
     * Workaround for slick js bug.
     *
     * When resizing the browser window while there aren't enough
     * slider items to slide, the slider track position isn't
     * calculated correctly. This fix undoes the bad calculation.
     *
     * https://github.com/kenwheeler/slick/issues/3256
     */
    function slickPositionCalculationBugFix(element) {
        element.on('setPosition', function(event, slickInstance) {
            if (slickInstance.slideCount <= slickInstance.options.slidesToShow) {
                slickInstance.$slideTrack.css({
                    'transform': 'translate3d(0px, 0px, 0px)'
                });
            }
        });
    }

    /**
     * Fix incorrect active state on slides when there is an even number of slides,
     * center mode, and infinite mode are active.
     *
     * The active slides would be shifted to the right by one slide. The first slide wasn't
     * considered "active" when it should be. Additionally, the slide after the last active
     * slide was incorrectly marked as "active".
     *
     * For example if you have 2 slides per page, the bug would mean slides 2 and 3
     * are indicated as active when 1 & 2 are supposed to be active.
     */
    function slickCenterModeActiveSlideFix(element) {
        function isIssuePresent() {
            return pub.callSlickMethod(element, ['slickGetOption', 'centerMode']) === true &&
                pub.callSlickMethod(element, ['slickGetOption', 'infinite']) === true &&
                pub.callSliderMethod(element, ['canSlide']) &&
                isSlideCountEven();
        }

        function isSlideCountEven() {
            return !(pub.callSliderMethod(element, ['getSlickObject']).slideCount % 2);
        }

        function updateSlidesActiveState() {
            // slide settings can change via the responsive option so we must always check them
            var hasIssue = isIssuePresent();
            if (hasIssue) {
                var slides = pub.callSliderMethod(element, ['getSlickSlides']);

                slides.filter('.slick-active')
                    .first()
                    .prev()
                    .addClass('slick-active')
                    .attr('aria-hidden', false);

                slides.filter('.slick-active')
                    .last()
                    .removeClass('slick-active')
                    .attr('aria-hidden', true);
            }

            return hasIssue;
        }

        var hasIssues = updateSlidesActiveState();

        if (hasIssues) {
            element.AccessibleSlick('updateSlidesTabIndex');
        }

        if (hasIssues || pub.callSlickMethod(element, ['slickGetOption', 'responsive']) !== null) {
            element.on('afterChange', function() {
                // allow slick to update position first
                setTimeout(function() {
                    if (element.hasClass('slick-initialized')) {
                        updateSlidesActiveState();
                    }
                });
            });

            element.on('reInit', function() {
                updateSlidesActiveState();
                element.AccessibleSlick('updateSlidesTabIndex');
            });
        }
    }

    var sliderInstanceIndex = 0;

    function init(config, node) {
        var sliderContainer = $(node);

        config = $.extend(true, {
            slickOptions: {
                dots: true,
                mobileFirst: true,
                arrows: true,
                autoplaySpeed: 8000,
                appendArrows: '.slick-list'
            },
            limitOptionsToChildren: [
                'appendArrows',
                'appendDots',
                'prevArrow',
                'nextArrow'
            ],
            uniqueInstanceId: sliderInstanceIndex++,
            filters: [
                filterMobileFirstResponsiveBreakpointSizeSlickOptions,
                filterChildElementSlickOptions
            ]
        }, config);

        sliderContainer.each(function(index, element) {
            element = $(element);

            var itemConfig = applyConfigFilters(config, element, config.filters);

            slickPositionCalculationBugFix(element);

            element.attr(sliderUniqueInstanceAttributeName, config.uniqueInstanceId);

            element.AccessibleSlick(itemConfig);

            slickCenterModeActiveSlideFix(element, config.slickOptions);
        });

        return sliderContainer;
    }

    var pub = {
        init: init,
        'accessible-slider': init, // used by data-mage-init
        'callSliderMethod': function(element, argsArray) {
            if (!Array.isArray(argsArray)) {
                throw new TypeError('`argsArray` parameter must be an array');
            }

            element = $(element);

            return element.AccessibleSlick.apply(element, argsArray);
        },
        'callSliderMethodArray': function(elements, argsArray) {
            if (!Array.isArray(argsArray)) {
                throw new TypeError('`argsArray` parameter must be an array');
            }

            return $.map(elements, function(element) {
                element = $(element);

                return element.AccessibleSlick.apply(element, argsArray);
            }.bind(this));
        },
        'getSliderElementPreInit': function(element, options) {
            element = $(element);

            return options.sliderElement ?
                element.find(options.sliderElement).addBack(options.sliderElement).eq(0) :
                element;
        },
        'getSliderElement': function(element) {
            return $(element).AccessibleSlick('getSliderElement');
        },
        'callSlickMethod': function(element, argsArray) {
            if (!Array.isArray(argsArray)) {
                throw new TypeError('`argsArray` parameter must be an array');
            }

            var sliderElement = $(element).AccessibleSlick('getSliderElement');

            return sliderElement.slick.apply(sliderElement, argsArray);
        },
        'refreshSliderPosition': function(element) {
            return $(element).AccessibleSlick('getSliderElement').slick('setPosition');
        }
    };

    return pub;
});