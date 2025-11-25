'use strict';
define(['jquery', 'mage/translate'], function($, $t) {
    return function(validationWidget) {
        var enhancedMageValidation = {
            /**
             * @param {*} error
             * @param {*} element
             */
            options: {
                errorPlacement: function(error, element) {
                    var errorPlacement = element,
                        fieldWrapper,
                        messageBox;

                    // use custom element to display error message
                    if (element.attr('data-errors-message-box')) {
                        messageBox = $(element.attr('data-errors-message-box'));
                        messageBox.html(error);

                        return;
                    }

                    // logic for field wrapper
                    fieldWrapper = element.closest('.addon');

                    if (fieldWrapper.length) {
                        errorPlacement = fieldWrapper.after(error);
                    }
                    errorPlacement.after(error);
                }
            }
        }

        var escapeRegExp = function(string) {
                return string.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&');
            },
            allInvalidChars = '#$%*+<>=@[\\]^_`{|}~',
            nameInvalidChars = allInvalidChars.replaceAll(new RegExp("[" + escapeRegExp("'-") + "]", 'g'), ''),
            cityInvalidChars = allInvalidChars.replaceAll(new RegExp("[" + escapeRegExp("'-.") + "]", 'g'), ''),
            addressInvalidChars = allInvalidChars.replaceAll(new RegExp("[" + escapeRegExp("'-#(),./") + "]", 'g'), ''),
            commentInvalidChars = allInvalidChars.replaceAll(new RegExp("[" + escapeRegExp("\"'-.?!,;:()&") + "]", 'g'), '');

        $.validator.addMethod(
            'validate-no-invalid-all-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(allInvalidChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', allInvalidChars)
        );

        $.validator.addMethod(
            'validate-no-invalid-name-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(nameInvalidChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', nameInvalidChars)
        );

        $.validator.addMethod(
            'validate-no-invalid-city-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(cityInvalidChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', cityInvalidChars)
        );

        $.validator.addMethod(
            'validate-no-invalid-address-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(addressInvalidChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', addressInvalidChars)
        );

        $.validator.addMethod(
            'validate-no-invalid-comment-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(commentInvalidChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', commentInvalidChars)
        );

        $.validator.addMethod(
            'validate-no-exceed-length',
            function(value) {
                return value.length <= 500;
            },
            $.mage.__('The message should not exceed 500 characters')
        );

        $.validator.addMethod(
            'validate-be-well-card-number',
            function(value, element) {
                $(element).addClass('maximum-length-19').addClass('minimum-length-19');

                return $.validator.methods['validate-length'].apply(this, arguments);
            },
            $t('Please enter your 19 digit card number.')
        );

        $.validator.addMethod('validate-postal-code', function(value) {
            // Define the postal code format (A1A 1A1 or A1A1A1)
            var postalCodePattern = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/;
            // Check if value matches the postal code format
            return postalCodePattern.test(value);
        }, $.mage.__('Format postal code as A1A 1A1 or A1A1A1.'));

        return function(mageValidation) {
            $.widget('mage.validation', mageValidation, enhancedMageValidation);

            return $.mage.validation;
        }
    };
});