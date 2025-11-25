'use strict';

define([
    'jquery',
    'mage/translate',
    'inputmask'
], function($, $t) {
    return function(options, form) {
        const tooltips = $('.tooltip');

        tooltips.each(function(i, tooltip) {
            const tooltipText = $('.tooltip-text');
            const toggleTooltipVisibility = () => {
                tooltipText.toggleClass('visible');
                tooltipText.attr('aria-hidden', !tooltipText.hasClass('visible'));
            };

            tooltip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();

                    toggleTooltipVisibility();
                }

                if (e.key === 'Escape') {
                    e.preventDefault();

                    toggleTooltipVisibility();
                }
            });

            tooltip.addEventListener('focus', () => {
                toggleTooltipVisibility();
            });

            tooltip.addEventListener('focusout', (e) => {
                if (tooltipText.hasClass('visible')) {
                    toggleTooltipVisibility();
                }
            });
        });

        $("#bewell-number").inputmask({
            "mask": "999999 9999999999999"
        });

        form = $(form);
        var origForm = form.serialize();

        $(window).on('beforeunload', function() {
            var submitted = dataLayer.filter(x => x.event === "formSubmission").length;

            if (form.serialize() !== origForm) {
                if (!submitted) {
                    dataLayer.push({
                        'event': 'formAbandonment',
                        'formId': 'smokingCessationNewsletterForm',
                        'formName': 'Smoking Cessation Newsletter Form'
                    });
                }
            }
        });


        form.on('submit', function(e) {
            e.preventDefault();

            var captchaValid = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : true;

            if (form.valid() && captchaValid) {
                $.ajax({
                    url: form.attr('action'),
                    data: form.serialize(),
                    cache: false,
                    method: 'POST',
                    success: function(data) {
                        if (typeof data === typeof {} && data.success) {
                            form.trigger('reset');
                            dataLayer.push({
                                'event': 'formSubmission',
                                'formId': 'smokingCessationNewsletterForm',
                                'formName': 'Smoking Cessation Newsletter Form'
                            });
                            alert($t('You have successfully subscribed to the Rexall Smoking Cessation Newsletter.'));
                        } else {
                            alert(data.error_message);
                        }
                    }
                });
            }
        });
    };
});