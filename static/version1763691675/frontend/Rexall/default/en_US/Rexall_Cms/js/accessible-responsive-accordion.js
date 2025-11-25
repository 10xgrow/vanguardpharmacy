'use strict';
define(['jquery', 'breakpoints', 'accessible-accordion'], function($, breakpoints) {
    $.widget('rexall.accessibleResponsiveAccordion', {
        options: {
            minSize: 'zero',
            maxSize: 'md', // set to null to disable max size
            accordionOptions: {}
        },
        _create: function() {
            this.observerRegistered = breakpoints.observeSize(function(breakpointInstance) {
                if (breakpointInstance.isAtLeast(this.options.minSize) && !breakpointInstance.isAtLeast(this.options.maxSize)) {
                    this.element.accessibleAccordion(this.options.accordionOptions);
                } else {
                    this._destroyAccordion();
                }
            }.bind(this));
        },
        _destroy: function() {
            breakpoints.removeObserveSize(this.observerRegistered);

            this._destroyAccordion();
        },
        _destroyAccordion: function() {
            if (typeof this.element.data('rexallAccessibleAccordion') !== 'undefined') {
                this.element.accessibleAccordion('destroy');
            }
        }
    });

    return $.rexall.accessibleResponsiveAccordion;
});