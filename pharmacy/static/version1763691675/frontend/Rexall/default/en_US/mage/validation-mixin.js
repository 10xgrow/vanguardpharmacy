define([
    'jquery',
    'jquery-ui-modules/widget'
], function($) {
    'use strict';

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

    return function(mageValidation) {
        $.widget('mage.validation', mageValidation, enhancedMageValidation);

        return $.mage.validation;
    }
});