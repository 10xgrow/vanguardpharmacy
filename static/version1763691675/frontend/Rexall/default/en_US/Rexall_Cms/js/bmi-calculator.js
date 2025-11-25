'use strict'
require(['jquery', 'accessibilityUtils'], function($, accessibilityUtils) {
    $('.bmi-calculator-cta-button-calculate').click(function() {
        var feet = parseInt($('.bmi-calculator-height-feet').val());
        var inches = parseInt($('.bmi-calculator-height-inches').val());
        var weight = parseInt($('.bmi-calculator-weight').val());
        var bmi = weight / Math.pow((feet * 12) + inches, 2) * 703;

        if ($('#bmi-calculator-form').valid()) {
            $('.bmi-calculator-results-container').show();
            $('.bmi-calculator-results-definition').html(Math.round(bmi * 10) / 10);
            accessibilityUtils.forceElementFocus('.bmi-calculator-results-container');
        }
    });

    $('.bmi-calculator-cta-button-reset').click(function(e) {
        e.preventDefault();

        $('.bmi-calculator-form').trigger("reset");
        $('.bmi-calculator-results-container').hide();
        $('#bmi-calculator-form').validation('clearError');
    });

    $('.bmi-calculator-input').keydown(function(event) {
        if (event.keyCode >= 8 && event.keyCode <= 9 ||
            event.keyCode >= 37 && event.keyCode <= 40 ||
            event.keyCode === 46 ||
            event.keyCode >= 48 && event.keyCode <= 57) {
            return true;
        } else {
            return false;
        }
    });
});