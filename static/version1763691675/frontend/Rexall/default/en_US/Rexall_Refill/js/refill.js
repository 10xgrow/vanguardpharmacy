require(
    [
        'jquery',
        'accessibilityUtils',
        'moment',
        'mage/translate',
        'underscore',
        'mage/cookies',
        'rexallutil',
        'mage/validation',
        'jquery.inputmask'
    ],
    function ($, accessibilityUtils, moment, $t, _) {
        'use strict';

        // Allow polyfill to fail loading without breaking entire script on browsers which don't need it
        require(['https://polyfill-fastly.io/v3/polyfill.min.js?features=default%2CIntl.Locale'], $.noop, $.noop);

        var cct = $.cookie('ci_csrf_token');
        var currentStore = null;
        var successTemplate = $('#successMessage').html();
        var errorTemplate = $('#errorMessage').html();
        var prescription1;
        var DOB;
        var formStarted = false;

        var prescriptionElement = $('#prescription1'),
            DOBElement = $('#DOB'),
            refillForm = $('#refillForm');

        var confirmMessageContainer = $('.js-store-confirm-message');

        prescriptionElement.val($.cookie('prescription1'));
        DOBElement.val($.cookie('DOB'));

        prescriptionElement.on('input', sliceMaxLengthFOrNumber);
        DOBElement.on('input', sliceMaxLengthFOrNumber);

        $(document).on('keydown', function (event) {
            if (event.key === "Enter") {
                const target = $(event.target);

                if (target.is('#header-search-input')) {
                    return;
                }

                target.closest('.step').find('.next-step:visible').click();
                event.preventDefault();
            }
        });

        $(document).on('click', '#continueToStepTwo', function (event) {
            event.preventDefault();

            prescription1 = $.trim(prescriptionElement.val());
            DOB = $.trim($('#DOB').val());

            $.cookie('prescription1', prescription1, {
                expires: 7
            });

            $.cookie('DOB', DOB, {
                expires: 7
            });

            if ($(this).parent().find('input').valid()) {
                showStepTwo();
            }
        });

        function moveContainer() {
            var windowWidth = $(window).width();
            var refillInfoBox = $('#refill-info-box');

            if (windowWidth > 768 && $('#refillForm').hasClass('expanded')) {
                $('.refill-info-box-desktop').append(refillInfoBox);
            }
        }

        $(document).on('change', '#nearby-stores', function (event) {
            var storeId = $.trim($('#nearby-stores').val());
            var label = $.trim($('#nearby-stores option:selected').text());

            if (!storeId) {
                show_error($t('You need to choose a store first'));
            } else {
                confirmStore(storeId, label);
            }
        });

        $(document).ready(function () {
            function toggleSearchOption() {
                const selectedOption = $('.search-method-select input[type="radio"]:checked').val();

                if (selectedOption === 'address') {
                    $('.geo-field').show();
                    $('.search-phone').hide();
                } else {
                    $('.geo-field').hide();
                    $('.search-phone').show();
                }
            }

            toggleSearchOption();

            $('.search-method-select input[type="radio"]').change(function () {
                toggleSearchOption();
            });
        });

        $(document).on('click', '#geocodeGo', function (event) {
            event.preventDefault();

            if ($(this).parent().find('input').valid()) {
                executeSearch();
            }
        });

        $(document).on('click', '#phonelookupGo', function (event) {
            event.preventDefault();

            executePhoneSearch();
        });

        $(document).ready(function () {
            sendStepImpression(1);
        });

        function sendStepImpression(step) {
            dataLayer.push({
                'event': 'stepImpression',
                'formId': `refill-content_step${step}`,
                'formName': 'Refill Form'
            });
        }

        function sendStepCompletion(step) {
            dataLayer.push({
                'event': 'stepCompleted',
                'formId': `refill-content_step${step}`,
                'formName': 'Refill Form'
            });
        }

        function hideBeWellBlock() {
            $('#bewellCard').hide();
            $('.refill-or-separator').hide();
            $('#refillForm').addClass('expanded');
            moveContainer();
        }

        function scrollToMiddle(section) {
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var sectionHeight = windowWidth > 767 ? 200 : 400;
            var scrollPosition = section.offset().top - (windowHeight / 2) + (sectionHeight / 2);

            $('html, body').animate({
                scrollTop: scrollPosition
            }, 'slow');
        }

        function showStepTwo() {
            var step2 = $('#step-2');

            step2.slideDown('slow');
            step2.css('display', 'flex');

            scrollToMiddle(step2);

            hideBeWellBlock();
            sendStepCompletion(1);
            sendStepImpression(2);
        }

        function showStepThree() {
            let storeId = $.trim($('#nearby-stores').val());
            let label = $.trim($('#nearby-stores option:selected').text());

            confirmStore(storeId, label);

            $('#step-3-wrapper').slideDown('slow');
            $('#step-3-wrapper').css('display', 'flex');

            scrollToMiddle($('#step-3-wrapper'));

            sendStepCompletion(2);
            sendStepImpression(3);
        }

        function executeSearch() {
            var address = $.trim($('#geocodeAddress').val());

            if (!address) {
                show_error($t('Please enter a valid address'));
            } else {
                var geocoder = new google.maps.Geocoder();

                geocoder.geocode({
                    'address': address,
                    'componentRestrictions': {
                        country: 'CA'
                    }
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var position = results[0].geometry.location;
                        populateStores(position.lat(), position.lng());
                    } else {
                        show_error($t('We were not able to find your location. Please try again'));
                    }
                });
            }
        }

        function populateStores(latitude, longitude) {
            var data = {
                Latitude: latitude,
                Longitude: longitude,
                refillOnly: 1,
                ci_csrf_token: cct
            };

            $.ajax({
                url: getBaseURL() + 'rest/V1/contact-us/storelist',
                type: 'post',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                error: function (data) {
                    show_error($t('error occurred while fetching data. Please refresh and try again.'));
                },
                success: function (data) {
                    var $dropdownContainer = $('#nearby-stores');
                    $dropdownContainer.empty();

                    var response = JSON.parse(data);
                    if (response.Success === 1) {
                        for (var i = 0; i < response.Store.length; i++) {
                            var store = response.Store[i];
                            var text = $t('Store #') + store.StoreNumber + ', ' + store.StoreName + ',' + store.Address + ',' + store.City + ', ' + store.Province;
                            var compiled = '<option value="' + store.StoreNumber + '">' + text + '</option>';
                            $dropdownContainer.append(compiled);
                        }
                        showStepThree();
                    } else {
                        show_error(response.Message[0], $t('Please try again'));
                    }
                }
            });
        }

        function confirmStore(storeId, label) {
            var store = {
                StoreNumber: storeId,
                ci_csrf_token: cct,
                refillOnly: 1
            };

            $.ajax({
                url: getBaseURL() + 'rest/V1/contact-us/storeget',
                type: 'post',
                data: JSON.stringify(store),
                contentType: 'application/json',
                dataType: 'json',
                error: function (data) {
                    show_error($t('We were not able to set this store as your default store. Please try again.'));
                },
                success: function (data) {
                    var response = JSON.parse(data);
                    if (response.Success === 1) {
                        currentStore = response.Store[0];
                    } else {
                        show_error(response.Message[0], $t('Please try again'));
                    }
                }
            });
        }

        function executePhoneSearch() {
            const phoneNumberSelector = $('#phoneNumber');
            let phoneNumber = $.trim(phoneNumberSelector.val());

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            const phoneNumberFormated = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
            phoneNumberSelector.val(phoneNumberFormated);

            $.cookie('phoneNumber', phoneNumberFormated, {
                expires: 7
            });

            if (!phoneNumber) {
                show_error($t('You need to enter a phone number to search by'));
                return false;
            }

            var data = {
                PhoneNumber: phoneNumberFormated,
                refillOnly: 1,
                source: 'refill',
                ci_csrf_token: cct
            };
            $.ajax({
                url: getBaseURL() + 'rest/V1/contact-us/storeget',
                type: 'post',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                error: function () {
                    show_error($t('error occurred while fetching data. Please refresh and try again.'));
                },
                success: function (data) {
                    var response = JSON.parse(data);
                    if (response.Success === 1) {
                        var $dropdownContainer = $('#nearby-stores');
                        $dropdownContainer.empty();
                        var store = response.Store[0];
                        var text = 'Store #' + store.StoreNumber + ', ' + store.StoreName + ', ' + store.Address + ', ' + store.City + ', ' + store.Province;
                        var compiled = '<option value="' + store.StoreNumber + '">' + text + '</option>';
                        $dropdownContainer.append(compiled);
                        showStepThree();
                    } else {
                        show_error(response.Message[0], $t('Please try again'));
                    }
                }
            });
        }

        $('#submitRefill').click(function (e) {
            e.preventDefault();

            if (!refillForm.valid()) {
                return false;
            }

            if (currentStore === null) {
                show_error($t('Please select a store and click confirm before submitting your request'));
            } else {
                $('#submitRefill').prop('disabled', true);
                $.ajax({
                    url: getBaseURL() + 'refill/index/post',
                    type: 'post',
                    data: {
                        'Rxnumber': prescription1,
                        'Year': DOB.slice(6, 10),
                        'Month': DOB.slice(3, 5),
                        'Day': DOB.slice(0, 2),
                        'Storenumber': currentStore.StoreNumber,
                        'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
                        'method': 'Manual',
                        'ci_csrf_token': cct
                    },
                    dataType: 'json',
                    success: function (data) {
                        var compiled = '';
                        var contentContainer = $('#refill-content');
                        contentContainer.empty();

                        if (data.status === 1) {
                            dataLayer.push({
                                'event': 'formSubmission',
                                'formId': 'refill-content',
                                'formName': 'Refill Form'
                            });

                            compiled = _.template(successTemplate);

                            contentContainer.empty();
                            contentContainer.html(compiled({
                                message: data.message,
                                store: currentStore
                            }));
                            $('html, body').animate({
                                scrollTop: 0
                            }, 'slow');

                            if (!$.cookie('refill-popup')) {
                                show_popup();
                            }
                        } else if (data.status === 0) {
                            compiled = _.template(errorTemplate);

                            contentContainer.empty();
                            contentContainer.html(compiled({
                                message: data.message,
                                store: currentStore
                            }));
                            $('html, body').animate({
                                scrollTop: 0
                            }, 'slow');
                        } else {
                            compiled = _.template(errorTemplate);

                            contentContainer.empty();
                            contentContainer.html(compiled({
                                message: data.message,
                                store: currentStore
                            }));
                            $('html, body').animate({
                                scrollTop: 0
                            }, 'slow');
                        }
                    }
                });
            }
        });

        var form = $('.refill-form'),
            origForm = form.serialize();

        $(window).on('beforeunload', function () {
            var submitted = dataLayer.filter(x => x.event === 'formSubmission').length;

            if (form.serialize() !== origForm) {
                if (!submitted) {
                    dataLayer.push({
                        'event': 'formAbandonment',
                        'formId': 'refill-content',
                        'formName': 'Refill Form'
                    });
                }
            }
        });

        function sliceMaxLengthFOrNumber() {
            if (this.maxLength !== -1 && this.value.length > this.maxLength) {
                this.value = this.value.slice(0, this.maxLength);
            }
        }

        $('#DOB').inputmask({
            alias: "datetime",
            inputFormat: "dd-mm-yyyy",
            placeholder: 'DD-MM-YYYY'
        });

        $("#phoneNumber").inputmask({
            "mask": "(899) 899-9999",
            "definitions": {
                "8": {
                    "validator": "[2-9]"
                }
            }
        });
    }
);