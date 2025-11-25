'use strict';

define(['jquery', 'mage/translate', 'jquery-ui-modules/widget', 'slick'], function($, $t) {
    $.widget('rexall.AccessibleSlick', {
        options: {
            // @link: http://kenwheeler.github.io/slick/
            slickOptions: {
                accessibility: false, // not changeable for accessibility reasons. See filterDisallowedSlickOptions()
                draggable: false, // not changeable for accessibility reasons. See filterDisallowedSlickOptions()
                prevArrow: '<button class="slick-prev" type="button"><span class="screenreader-only">' + $t('Previous Slide') + '</span></button>',
                nextArrow: '<button class="slick-next" type="button"><span class="screenreader-only">' + $t('Next Slide') + '</span></button>',
            },
            ariaLive: false,
            controlsContainer: null,
            sliderElement: null,
            dotText: '<span class="screenreader-only">' + $t('Slide {{number}}') + '</span>',
            pausePlayContainer: null,
            pausePlayInsertMethod: 'append',
            pausePlayText: [
                $t('pause'),
                $t('play')
            ],
            pausePlayButtonHtml: '<button class="slick-pause-play-button {{pausePlayButtonJsClassName}}" type="button" data-text=\'{{textJson}}\'>' +
                '<span class="play-icon" aria-hidden="true"></span>' +
                '<span class="sr-text screenreader-only {{pausePlayButtonTextJsClassName}}">{{currentButtonText}}</span>' +
                '</button>',
            pausePlayButtonJsClassName: 'js-slick-pause-play-button',
            pausePlayButtonTextJsClassName: 'js-slick-pause-play-button-text',
            focusableSlideChildElements: 'a, :input, [tabindex]'
        },
        optionFilters: [
            filterDisallowedSlickOptions,
            filterControlsContainerOptions
        ],
        controlsContainer: undefined,
        pausePlayContainer: undefined,
        pausePlayButton: undefined,
        sliderElement: undefined,
        _createWidget: function(options, element) {
            options = this._filterOptions(
                $.extend({}, options),
                element
            );

            this._super(options, element);
        },
        _create: function() {
            this.sliderElement = this.options.sliderElement ? this._findElement(this.options.sliderElement) : this.element;

            if (!this.sliderElement.length) {
                throw new Error('Slider element could not be found within slider using selector: "' + this.options.sliderElement + '"');
            }

            this.controlsContainer = this.options.controlsContainer ? this._findElement(this.options.controlsContainer) : this.element;

            this._initEvents();
            this._initSlick(this.options.slickOptions);

            if (this.options.slickOptions.autoplay && this.canSlide()) {
                this.pausePlayContainer = this.options.pausePlayContainer ? this._findElement(this.options.pausePlayContainer) : this.controlsContainer;
                this._initPausePlayButton();
            }
        },
        _destroy: function() {
            this._destroyPausePlayButton()
                ._resetSlidesTabIndex()
                ._destroySlick();
        },
        _filterOptions: function(options, element) {
            options = $.extend({}, options);

            $.each(this.optionFilters, function(index, value) {
                options = 'function' === typeof value ? value(options, element) : options;
            }.bind(this));

            return options;
        },
        _initEvents: function() {
            this._on(this.sliderElement, {
                'afterChange': this._afterChangeHandler,
                'init': this._initHandler,
                'breakpoint': this._breakpointEventHandler
            });

            var timeout;

            this._on(window, {
                // Prevent autoplay pause/play button from being added to it's own slide.
                // It seems to mostly be an issue when resizing while responsive settings
                // are present, but it's added for all cases just in case.
                //
                // Slick gives us no event listeners before it rebuilds the slider, so we use
                // the same delay they do but add our listener first
                'resize': function() {
                    clearTimeout(timeout);
                    timeout = window.setTimeout(function() {
                        this._destroyPausePlayButton();

                        // Rebuild again after slick is done rebuilding.
                        //
                        // We need to re-build here because we may destroy it at a time when slick doesn't
                        // trigger any events we can utilize. Re-building the button each time makes it reliable.
                        window.setTimeout(function() {
                            if (this.getSlickObject().options.autoplay && this.canSlide()) {
                                this._initPausePlayButton();
                            }
                        }.bind(this));
                    }.bind(this), 50);
                }
            });

            var elementListeners = {
                'slickPlay': this._playHandler,
                'slickPause': this._pauseHandler
            };

            elementListeners['click .' + this.options.pausePlayButtonJsClassName] = this._pausePlayClickHandler;

            this._on(this.element, elementListeners);

            return this;
        },
        _initHandler: function() {
            this.updateSlidesTabIndex();
            this.resetDotsAriaHidden();
            this._initSlickDots(this.options.dotText);
        },
        canSlide: function() {
            var slick = this.getSlickObject();

            return slick.slideCount > slick.options.slidesToShow;
        },
        _afterChangeHandler: function() {
            if (this.sliderElement.hasClass('slick-initialized')) {
                // allow fixes from compass slider to be applied first
                setTimeout(function() {
                    if (this.options.slickOptions.dots) {
                        this.resetDotsAriaHidden(this.getSlickDots());
                    }
                    this.updateSlidesTabIndex(this.getSlickSlides());
                }.bind(this), 1);
            }
        },
        _breakpointEventHandler: function() {
            this._initSlickDots(this.options.dotText);
        },
        _findElement: function(target) {
            return this.element.find(target).addBack(target).eq(0);
        },
        _initSlick: function(options) {
            this.sliderElement.slick(options);
            return this;
        },
        _destroySlick: function() {
            this.sliderElement.slick('unslick');

            return this;
        },
        getSlickSlides: function() {
            return this.sliderElement.find('.slick-slide');
        },
        getSlickDots: function() {
            return this.controlsContainer.find('.slick-dots li');
        },
        getSlickDotButtons: function() {
            return this.getSlickDots().find('button');
        },
        getControlsContainer: function() {
            return this.controlsContainer;
        },
        _initSlickDots: function(dotText) {
            setTimeout(function() { // wait for slider to initialize
                var slickObject = this.getSlickObject();

                if (slickObject.options.autoplay || !this.options.ariaLive) {
                    this.resetAriaLive();
                }

                if (slickObject.defaults.customPaging === slickObject.options.customPaging) {
                    var dotTextTemplate = new SimpleTemplate(dotText);

                    this.getSlickDotButtons().each(function(index, element) {
                        element = $(element);
                        element.html(dotTextTemplate.parse({
                            'number': index + 1
                        }));
                    }.bind(this));
                }

            }.bind(this));

            return this;
        },
        resetDotsAriaHidden: function() {
            this.getSlickDots().removeAttr('aria-hidden');

            return this;
        },
        resetAriaLive: function() {
            this.sliderElement.find('[aria-live]').removeAttr('aria-live');

            return this;
        },
        updateSlidesTabIndex: function() {
            var slides = this.getSlickSlides();
            this._disableSlideChildTabbing()
                ._resetSlidesTabIndex(slides.filter('[aria-hidden="false"]'));

            return this;
        },
        _disableSlideChildTabbing: function(slides) {
            slides = slides || this.getSlickSlides();
            slides.find(this.options.focusableSlideChildElements).attr('tabindex', '-1');

            return this;
        },
        _resetSlidesTabIndex: function(slides) {
            slides = slides || this.getSlickSlides();
            slides.find(this.options.focusableSlideChildElements).removeAttr('tabindex');

            return this;
        },
        _initPausePlayButton: function() {
            var template = new SimpleTemplate(this.options.pausePlayButtonHtml);
            this.pausePlayButton = $(template.parse({
                'pausePlayButtonJsClassName': this.options.pausePlayButtonJsClassName,
                'pausePlayButtonTextJsClassName': this.options.pausePlayButtonTextJsClassName,
                'textJson': JSON.stringify(this.options.pausePlayText),
                'currentButtonText': this.options.pausePlayText[0]
            }));

            this.pausePlayContainer[this.options.pausePlayInsertMethod](this.pausePlayButton);

            if (this.isSlickPaused()) {
                this.pausePlayButton.addClass('state-paused');
            }

            this._updatePausePlayButtonText();

            return this;
        },
        _destroyPausePlayButton: function() {
            this.pausePlayButton && this.pausePlayButton.remove();

            return this;
        },
        _pausePlayClickHandler: function(event) {
            event.preventDefault();
            this.isSlickPaused() ? this.element.trigger('slickPlay') : this.element.trigger('slickPause');
        },
        _pauseHandler: function() {
            this.pauseSlider();
        },
        pauseSlider: function() {
            this.sliderElement.slick('slickPause');
            this.pausePlayButton.addClass('state-paused');
            this._updatePausePlayButtonText();
            this.element.trigger('afterSlickPause', [this, this.element]);

            return this;
        },
        _playHandler: function() {
            this.playSlider();
        },
        playSlider: function() {
            this.sliderElement.slick('slickPlay');
            this.pausePlayButton.removeClass('state-paused');
            this._updatePausePlayButtonText();
            this.element.trigger('afterSlickPlay', [this, this.element]);

            return this;
        },
        _updatePausePlayButtonText: function() {
            try {
                this.pausePlayButton.find('.' + this.options.pausePlayButtonTextJsClassName).text(
                    this.options.pausePlayText[Number(this.isSlickPaused())]
                );
            } catch (e) {
                // ignore
            }
        },
        isSlickPaused: function() {
            return this.getSlickObject().paused;
        },
        getSlickObject: function() {
            return this.sliderElement.slick('getSlick');
        },
        getSliderElement: function() {
            return this.sliderElement;
        }
    });

    function SimpleTemplate(html) {
        var replacePlaceholder = function(haystack, needle, replacement) {
            return haystack.replace(
                new RegExp(escapeForRegExp('{{' + needle + '}}'), 'g'),
                replacement
            );
        };

        var escapeForRegExp = function(string) {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        };

        this.parse = function(options) {
            var outputHtml = html;

            $.each(options, function(property, value) {
                outputHtml = replacePlaceholder(outputHtml, property, value);
            }.bind(this));

            return outputHtml;
        };
    }

    /**
     * Remove slick config options which hurt accessibility
     *
     * @param {Object} options
     * @param {jQuery} element
     * @returns {Object}
     */
    function filterDisallowedSlickOptions(options, element) {
        options = $.extend({}, options);
        var forbidden = [
            'accessibility', // Slick's accessibility doesn't do things correctly
            'draggable' // Make clicking links easier for users with poor motor skills or who are shaky
        ];

        $.each(forbidden, function(index, value) {
            try {
                delete options.slickOptions[value];
            } catch (e) {
                // ignore
            }
        });

        return options;
    }

    /**
     * Automatically set options.controlsContainer to avoid bugs.
     *
     * @param {Object} options
     * @param {jQuery} element
     * @returns {Object}
     */
    function filterControlsContainerOptions(options, element) {
        if (!options.controlsContainer) {
            var controlContainerElement = ['appendArrows', 'appendDots'].reduce(
                function(accumulatedValue, currentValue) {
                    if (options.slickOptions && options.slickOptions[currentValue]) {
                        var item = options.slickOptions[currentValue];

                        if ('string' === typeof options.slickOptions[currentValue]) {
                            item = $(item);
                        }

                        if (item instanceof jQuery) {
                            return accumulatedValue.add(item);
                        }
                    }

                    return accumulatedValue;
                },
                $()
            );

            if (controlContainerElement.length) {
                options = $.extend({}, options);

                options.controlsContainer = controlContainerElement;
            }
        }

        return options;
    }

    return $.rexall.AccessibleSlick;
});