'use strict';

define(['jquery'], function($) {
    return function() {
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

        return $.mage.validation;
    };
});