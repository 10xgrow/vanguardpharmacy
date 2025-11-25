'use strict';
define(['jquery'], function($) {
    return function() {
        $.widget('mage.validation', $.mage.validation, {
            options: {
                // Ensure aria-invalid and aria-describedby attributes are always removed correctly.
                //
                // Reproducing issue:
                // - A field is invalid after the user attempts to submit
                // - The user corrects all validation errors and re-submits
                // - The form is now valid but the aria-invalid and aria-describedby attributes persist
                //
                // Core magento code removes these attributes when the `invalid-form` event is triggered.
                // As the event name indicates, this event is only triggered when the form is invalid.
                // This means once the form is valid, it will not clean up the aria attributes it added.
                unhighlight: function(element, errorClass, validClass) {
                    element = 'radio' === element.type ? this.findByName(element.name) : $(element);

                    element.removeClass(errorClass)
                        .addClass(validClass)
                        .removeAttr('aria-invalid aria-describedby');
                }
            },
            _listenFormValidate: function() {
                $('form').on('invalid-form.validate', function(event, validation) {
                    // magento functionality does not consider focusInvalid and forces focus
                    if (this.options.focusInvalid) {
                        this.listenFormValidateHandler.apply(event.target, arguments);
                    } else {
                        if (validation.successList.length) {
                            $.each(validation.successList, function() {
                                $(event.target)
                                    .removeAttr('aria-describedby')
                                    .removeAttr('aria-invalid');
                            });
                        }
                    }
                }.bind(this));
            }
        });

        return $.mage.validation;
    };
});