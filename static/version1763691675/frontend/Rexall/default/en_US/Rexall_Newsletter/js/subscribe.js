define(
    [
        'jquery',
        'mage/translate',
        'mage/storage',
        'Northern_Webapi/js/model/url-builder',
        'moment',
        'rexallutil',
        'fancybox'
    ],
    function($, $t, storage, urlBuilder) {
        'use strict';

        return function(config, element) {
            $(element).on('click', function(e) {
                e.preventDefault();
                var form = $('.subscribe-form');

                var data = {},
                    PreferredInformationArray = [],
                    additionalSubscriptions;

                data.FirstName = $.trim($('#FirstName').val());
                data.LastName = $.trim($('#LastName').val());
                data.City = $.trim($('#City').val());
                data.Province = $.trim($('#Province').val());
                data.PostalCode = formatPostalCode($.trim($('#PostalCode').val()));
                data.EmailAddress = $.trim($('#EmailAddress').val());
                data.PhoneNumber = $.trim($('#PhoneNumber').val());
                data.Airmiles_Aeroplan = $.trim($('#Airmiles_Aeroplan').val());
                data.Source = 'Web';
                data.System = 'NewsLetter';

                // Check if this is the flu-specific form (has both OptIn and OptInAll checkboxes)
                var isFluForm = $('#OptInAll').length > 0;

                if (isFluForm) {
                    // Flu form: separate checkboxes
                    var fluConsent = $('#OptIn').is(':checked') ? 1 : 0;
                    var newsletterConsent = $('#OptInAll').is(':checked') ? 1 : 0;

                    data.OptIn = fluConsent;
                    data.OptInAll = newsletterConsent;
                    data.EmailSubscriber = (fluConsent === 1 || newsletterConsent === 1) ? 1 : 0;
                } else {
                    // Standard form: single checkbox for all subscriptions
                    data.OptIn = $('#OptIn').is(':checked') ? 1 : 0;
                    data.EmailSubscriber = $('#OptIn').is(':checked') ? 1 : 0;
                }

                if ($.trim($('#birthday').val()) && $.trim($('#birthmonth').val()) && $.trim($('#birthyear').val())) {
                    data.DateofBirth = $.trim($('#birthday').val()) + '-' + $.trim($('#birthmonth').val()) + '-' + $.trim($('#birthyear').val());
                } else {
                    data.DateofBirth = ' ';
                }

                if ($('#PrimaryDrugstoreRexall').is(':checked')) {
                    data.PrimaryDrugstore = 'Rexall';
                } else if ($('#PrimaryDrugstoreRexallPharmaPlus').is(':checked')) {
                    data.PrimaryDrugstore = 'Rexall Pharma Plus';
                } else if ($('#other').val()) {
                    data.PrimaryDrugstore = $.trim($('#other').val());
                }

                $('input:checkbox[name=PreferredInformation]:checked').each(function() {
                    PreferredInformationArray.push($.trim($(this).val()));
                });

                data.PreferredInformation = PreferredInformationArray;

                data.Date = moment().format('YYYY-MM-DD');

                data.Subscriptions = [];

                if (isFluForm) {
                    // Flu form logic
                    if (data.OptIn === 1 && data.OptInAll === 0) {
                        // Only Flu consent: FLUSHOT=Y only
                        data.Subscriptions.push(['Newsletters_Flu']);
                    } else if (data.OptIn === 1 && data.OptInAll === 1) {
                        // Both consents: NEWS=Y;BEAUTY=Y;FLUSHOT=Y
                        data.Subscriptions.push(['NewsLetters'], ['NewsLetters_Beauty'], ['Newsletters_Flu']);
                    }
                } else {
                    // Standard form logic: all subscriptions if opted in
                    if (data.OptIn === 1) {
                        data.Subscriptions.push(['NewsLetters'], ['NewsLetters_Beauty'], ['Newsletters_Flu']);
                    }
                }

                additionalSubscriptions = $('#AdditionalSubscriptions').val() || '';
                additionalSubscriptions = $.map(additionalSubscriptions.split(','), function(item) {
                    return item.length ? [
                        [item]
                    ] : null;
                });
                if (additionalSubscriptions.length) {
                    data.Subscriptions = $.merge(data.Subscriptions, additionalSubscriptions);
                }

                if (form.valid()) {
                    if (isFluForm) {
                        // Flu form: OptIn is mandatory
                        if (data.OptIn == 0) {
                            show_error('Please confirm that you would like to receive communications about the flu shot from Rexall.', 'There was a problem with your submission...');
                        } else if (data.EmailAddress === '') {
                            show_error('Enter an Email and try again.', 'There was a problem with your submission...');
                        } else {
                            submitForm();
                        }
                    } else {
                        // Standard form: check if OptIn has 'required' class
                        if (data.OptIn == 0 && $('#OptIn').hasClass('required')) {
                            show_error('Select the checkbox to confirm that you would like to receive the Rexall Newsletter.', 'There was a problem with your submission...');
                        } else if (data.EmailAddress === '') {
                            show_error('Enter an Email and try again.', 'There was a problem with your submission...');
                        } else {
                            submitForm();
                        }
                    }
                }

                function submitForm() {
                    if (config.salesforce_url) {
                        data.form_key = $('input[name=form_key]').val();

                        $.post(config.salesforce_url, data, function(response) {
                            if (response.error_message) {
                                show_error(response.error_message, 'There was a problem with your submission...');
                            } else if (response.success) {
                                dataLayer.push({
                                    'event': 'formSubmission',
                                    'formId': 'newsletter-form',
                                    'formName': 'Newsletter Subscribe Form'
                                });
                                window.location.href = config.success_url;
                            } else {
                                show_error($t('There was an error subscribing to the Rexall Newsletter.'));
                            }
                        });
                    } else {
                        storage.post(urlBuilder.createUrl('/newsletter/subscribe', {}), JSON.stringify(data))
                            .done(
                                function(response) {
                                    var Response = JSON.parse(response);

                                    if (Response.Status == 1) {
                                        window.location.href = config.success_url;
                                    } else if (Response.Status == 2) {
                                        show_error($t('You have already subscribed to the Rexall Newsletter.'));
                                    } else {
                                        show_error(Response.Message);
                                    }
                                }
                            );
                    }
                }
            });

            function formatPostalCode(a) {
                return a[3] == ' ' ? a : a.substr(0, 3) + ' ' + a.substr(3);
            }
        };
    }
);