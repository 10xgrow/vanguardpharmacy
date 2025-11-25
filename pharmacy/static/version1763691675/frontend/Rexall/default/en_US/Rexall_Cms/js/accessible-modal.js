'use strict';

define(['jquery', 'mage/translate', 'jquery-ui-modules/widget'], function($, $t) {
    $.widget('rexall.accessibleModal', {
        options: {
            activeClass: 'is-active',
            bodyActiveClass: 'modal-is-active',
            modalId: '',
            overlayCloseText: $t('Close'),
            iframeSource: '',
            iframeTitle: ''
        },
        _create: function() {
            this.iframeLoaded = false;

            this.body = $('body');

            this.content = this.element.find('.js-accessible-modal-content');

            this.openButton = $();

            this._initHtml();

            this.setActiveState(false);

            this._initEvents();
        },
        _initHtml: function() {
            this.element.appendTo(this.body);

            this.content.attr({
                'role': 'dialog',
                'aria-hidden': true,
                'tabindex': -1,
            });
        },
        _initEvents: function() {
            this._on(window, {
                'keydown': this._keydownHandler,
            });

            if (this.options.modalId.length > 0) {
                var documentListeners = {};

                documentListeners['click [data-modal-open="' + this.options.modalId + '"]'] = this._openButtonClickHandler;

                this._on(document, documentListeners);
            }

            this._on(this.element, {
                'click .js-modal-close': this._closeButtonClickHandler,
                'click': this._overlayClickHandler
            });

            return this;
        },
        _keydownHandler: function(event) {
            var allowedKeys = [
                'Escape',
                'Esc' // IE 11
            ];

            if (this.isActive && allowedKeys.indexOf(event.key) !== -1) {
                this.setActiveState(false);
            }
        },
        _openButtonClickHandler: function(event) {
            event.preventDefault();

            this.setActiveState(true);
        },
        _overlayClickHandler: function(event) {
            if (this.element.is(event.target)) {
                event.preventDefault();

                this.setActiveState(false);
            }
        },
        _closeButtonClickHandler: function(event) {
            event.preventDefault();

            this.setActiveState(false);
        },
        setActiveState: function(state) {
            this.element.toggleClass(this.options.activeClass, state);

            this.content.attr('aria-hidden', !state);

            this.body.toggleClass(this.options.bodyActiveClass, state);

            this.isActive = state;

            if (this.isActive) {
                if (!this.iframeLoaded && this.options.iframeSource !== '') {
                    this.loadIframe();

                    this.iframeLoaded = true;
                }

                this.openButton = $(document.activeElement);
                this.content.trigger('focus');
            } else {
                if (this.openButton.is('body') && $('body._keyfocus').length > 0) {
                    $('.js-main-skip-link').trigger('focus');
                } else {
                    this.openButton.trigger('focus');
                }
                this.openButton = $();
            }

            this.element.trigger('modalActiveStateChanged', [state]);

            return this;
        },
        loadIframe: function() {
            var iframe = $('<iframe/>', {
                src: this.options.iframeSource,
                title: unescape(this.options.iframeTitle)
            });

            this.content.prepend(iframe);
        }
    });

    return $.rexall.accessibleModal;
});