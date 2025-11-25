'use strict';

define(['jquery'], function($) {
    return function() {
        var escapeRegExp = function(string) {
                return string.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&');
            },
            allInvalidChars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
            allInvalidRCNChars = '#$%\*+<=>@[\\]^_`{|}~',
            allInvalidDonationChars = '#%\*+<=>@[\\]^_`{|}~',
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
            'validate-no-invalid-rcn-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(allInvalidRCNChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', allInvalidRCNChars)
        );

        $.validator.addMethod(
            'validate-no-invalid-donation-characters',
            function(value) {
                var test = new RegExp("[" + escapeRegExp(allInvalidDonationChars) + "]");

                return !(test.test(value));
            },
            $.mage.__('The following characters are not allowed: %s').replace('%s', allInvalidDonationChars)
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
            'validate-one-field-dob',
            function(value) {
                const dobRegex = /^\d{2}-\d{2}-\d{4}$/;

                if (!dobRegex.test(value)) {
                    return false;
                }

                const parts = value.split('-');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);

                const date = new Date(year, month, day);

                if (
                    date.getFullYear() !== year ||
                    date.getMonth() !== month ||
                    date.getDate() !== day
                ) {
                    return false;
                }

                var today = new Date();
                today.setHours(0, 0, 0, 0);

                if (date > today) {
                    return false;
                }

                return true;
            },
            $.mage.__('Please enter a valid Date of Birth.')
        );

        $.validator.addMethod(
            'validate-length',
            function(value, element, param) {
                return value.length <= param;
            },
            function(param) {
                return $.mage.__('This field exceeds the maximum length allowed (' + param + ' characters).');
            }
        );

        $.validator.addMethod('validate-postal-code', function(value) {
            // Define the postal code format (A1A 1A1 or A1A1A1)
            var postalCodePattern = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/;
            // Check if value matches the postal code format
            return postalCodePattern.test(value);
        }, $.mage.__('Please enter a valid postal code.'));

        $.validator.addMethod('validate-postal-code-short', function(value) {
            // Define the postal code format (A1A 1A1 or A1A1A1)
            var postalCodePattern = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/;
            // Check if value matches the postal code format
            return postalCodePattern.test(value);
        }, $.mage.__('Please enter a valid postal code.'));

        return $.mage.validation;
    };
});