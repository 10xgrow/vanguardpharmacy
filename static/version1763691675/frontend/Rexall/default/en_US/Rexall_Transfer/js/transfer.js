require(
    [
        'jquery',
        'mage/translate',
        'accessibilityUtils',
        'mage/cookies',
        'rexallutil',
        'mage/validation',
        'jquery.inputmask'
    ],
    function($, $t, accessibilityUtils) {
        var cct = $.cookie('ci_csrf_token');
        var pharmacy = '';
        var storeId = '';

        $('#nearby-stores').on('change', function(e) {
            e.preventDefault();
            showSelectedStore($('#nearby-stores option:selected'));
            pharmacy = $('#nearby-stores').val();
        });

        $('#changeStore').on('click', function(e) {
            e.preventDefault();
            pharmacy = '';
            $('#nearby-stores').val('');
            showStoreDropdown();
        });

        function showStoreDropdown() {
            $('#selectedStore').html('');
            $('#selectStore').show();
            $('#storeSelected').hide();
            accessibilityUtils.forceElementFocus($('#nearby-stores'));
        }

        $('#pharmacy_name').on('change', function(e) {
            e.preventDefault();
            var $this = $(this);
            var $other = $('#pharmacy_other');
            if ($this.val() === 'other') {
                $other.removeAttr('disabled');
            } else {
                $other.val('');
                $other.attr('disabled', 'disabled');
            }
        });

        function showSelectedStore(value) {
            $('#selectedStore').html(value.text());
            storeId = value.val();
            $('#selectStore').hide();
            $('#storeSelected').show();
            accessibilityUtils.forceElementFocus($('#selectedStore'));
        }

        $(document).on('click', '.js-storeSearchBtn', function(event) {
            event.preventDefault();
            formatPhoneNumber('#searchPharmacyPhoneNumber');

            var searchPharmacyPhoneNumber = $.trim($('#searchPharmacyPhoneNumber').val());
            var searchLocation = $.trim($('#searchLocation').val());

            var phoneMode = (searchPharmacyPhoneNumber.length);
            var locationMode = searchLocation.length;


            if (!$('#searchForm').valid()) {
                return false;
            }

            if (phoneMode && locationMode) {
                show_lightbox_nobrand($t('You have entered information in both phone number and location fields. Please only select one of these searches to complete.'), $t('Please try again'));
            } else if (phoneMode) {
                executePhoneSearch(searchPharmacyPhoneNumber);
            } else if (locationMode) {
                executeLocationSearch(searchLocation);
            } else {
                show_lightbox_nobrand($t('Please enter a phone number or a location to search'), $t('Please try again'));
            }
        });

        function extractServiceObject(service) {
            var serviceObject = {};
            var serviceData = service.split('|');
            serviceObject.name = serviceData.shift();
            serviceObject.services = serviceData;

            return serviceObject;
        }

        function executeLocationSearch(location) {
            if (!location) {
                show_error($t('Please enter a valid address'));
            } else {
                var geocoder = new google.maps.Geocoder();

                geocoder.geocode({
                    'address': location,
                    'componentRestrictions': {
                        country: 'CA'
                    }
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var position = results[0].geometry.location;
                        populateStores(position.lat(), position.lng());

                        accessibilityUtils.forceElementFocus($('#nearby-stores'));
                    } else {
                        show_error($t('We were not able to find your location. Please try again'));
                    }
                });
            }
        }

        function executePhoneSearch(phoneNumber) {
            if (!phoneNumber) {
                show_error($t('You need to enter a phone number to search by'));
            } else {
                var data = {
                    PhoneNumber: phoneNumber,
                    refillOnly: 1,
                    source: 'refill',
                    ci_csrf_token: cct
                };
                $.ajax({
                    url: getBaseURL() + 'rest/V1/storelocator/storeget',
                    type: 'post',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    error: function() {
                        show_error($t('error occurred while fetching data. Please refresh and try again.'));
                    },
                    success: function(data) {
                        var response = JSON.parse(data);
                        if (response.Success === 1) {
                            var $dropdownContainer = $('#nearby-stores');
                            var placeholder = '<option value="">Choose from List</option>';
                            $dropdownContainer.empty();
                            $dropdownContainer.prepend(placeholder);
                            var store = response.Store[0];

                            store.StoreServiceObjects = _.map(store.StoreServices, function(service) {
                                return extractServiceObject(service);
                            });

                            store.Exclude = $.grep(store.StoreServiceObjects, function(element) {
                                return element.name === 'No Pharmacy';
                            }).length;

                            if (!store.Exclude) {
                                var text = $t('Store #') + store.StoreNumber + ', ' + store.StoreName + ', ' + store.Address + ', ' + store.City + ', ' + store.Province;
                                var compiled = '<option value="' + store.StoreNumber + '">' + text + '</option>';
                                $dropdownContainer.append(compiled);
                            }

                            accessibilityUtils.forceElementFocus($dropdownContainer);
                        } else {
                            show_error(response.Message[0], $t('Please try again'));
                        }
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
                url: getBaseURL() + 'rest/V1/storelocator/storelist',
                type: 'post',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                error: function(data) {
                    show_error($t('error occurred while fetching data. Please refresh and try again.'));
                },
                success: function(data) {
                    var $dropdownContainer = $('#nearby-stores');
                    var placeholder = '<option value="">Choose from List</option>';
                    $dropdownContainer.empty();
                    $dropdownContainer.prepend(placeholder);

                    var response = JSON.parse(data);
                    if (response.Success === 1) {
                        for (var i = 0; i < response.Store.length; i++) {
                            var store = response.Store[i];

                            store.StoreServiceObjects = _.map(store.StoreServices, function(service) {
                                return extractServiceObject(service);
                            });

                            store.Exclude = $.grep(store.StoreServiceObjects, function(element) {
                                return element.name === 'No Pharmacy';
                            }).length;

                            if (!store.Exclude) {
                                var text = $t('Store #') + store.StoreNumber + ', ' + store.StoreName + ',' + store.Address + ',' + store.City + ', ' + store.Province;
                                var compiled = '<option value="' + store.StoreNumber + '">' + text + '</option>';
                                $dropdownContainer.append(compiled);
                            }
                        }

                    } else {
                        show_error(response.Message[0], $t('Please try again'));
                    }
                }
            });
        }

        $(document).on('click', '#submitTransferBtn', function(event) {
            var $submitTransferBtn = $('#submitTransferBtn');
            $submitTransferBtn.prop('disabled', true);

            formatPhoneNumber('#phoneNumber');
            formatPhoneNumber('#secondaryPhoneNumber');
            formatPhoneNumber('#pharmacyPhoneNumber');
            const splitDOB = $('#DOB').val().split('-');
            const formattedDob = `${splitDOB[2]}-${splitDOB[1]}-${splitDOB[0]}`;
            var formData = {
                pharmacy_name: $('#pharmacy_name').val(),
                pharmacy_other: $('#pharmacy_other').val(),

                email: $('#email').val(),
                pharmacyPhoneNumber: $('#pharmacyPhoneNumber').val(),

                transfer_all_prescriptions: $('input[name="transfer_all_prescriptions"]:checked').val() == 'yes' ? 1 : 0,

                lastName: $('#lastName').val(),
                firstName: $('#firstName').val(),
                homePhone: $('#phoneNumber').val(),
                mobilePhone: $('#secondaryPhoneNumber').val(),
                DOB: formattedDob,
                address: $('#address').val(),
                city: $('#city').val(),
                postalCode: $('#postalCode').val(),
                province: $('#province').val(),

                drug_name_1: $('#drug_name_prescription-1').val(),
                rx_number_1: $('#rx_number_prescription-1').val(),
                notes_1: $('#notes_prescription-1').val(),
                fill_prescription_now_1: $('#fill_prescription_now_prescription-1').is(':checked') ? 1 : 0,
                put_prescription_on_hold_1: $('#put_prescription_on_hold_prescription-1').is(':checked') ? 1 : 0,
                prescription_status_other_1: $('#prescription_status_other_prescription-1').val(),

                drug_name_2: $('#drug_name_prescription-2').val(),
                rx_number_2: $('#rx_number_prescription-2').val(),
                notes_2: $('#notes_prescription-2').val(),
                fill_prescription_now_2: $('#fill_prescription_now_prescription-2').is(':checked') ? 1 : 0,
                put_prescription_on_hold_2: $('#put_prescription_on_hold_prescription-2').is(':checked') ? 1 : 0,
                prescription_status_other_2: $('#prescription_status_other_prescription-2').val(),

                drug_name_3: $('#drug_name_prescription-3').val(),
                rx_number_3: $('#rx_number_prescription-3').val(),
                notes_3: $('#notes_prescription-3').val(),
                fill_prescription_now_3: $('#fill_prescription_now_prescription-3').is(':checked') ? 1 : 0,
                put_prescription_on_hold_3: $('#put_prescription_on_hold_prescription-3').is(':checked') ? 1 : 0,
                prescription_status_other_3: $('#prescription_status_other_prescription-3').val(),

                pharmacy: storeId,

                'ci_csrf_token': cct
            };

            const form = $('#transferForm');

            if (!form.valid()) {
                //scroll to top of form
                $('html, body').animate({
                    scrollTop: form.offset().top
                }, 500);

                $submitTransferBtn.prop('disabled', false);

                return false;
            }

            function showHoldFillError() {
                show_error($t('Please specify whether to fill or hold your prescriptions.'));
            }

            if (!formData.transfer_all_prescriptions) {
                if (!formData.fill_prescription_now_1 && !formData.put_prescription_on_hold_1) {
                    showHoldFillError();

                    return;
                }

                if ($('.mr-rx-container-open').length >= 1) {
                    if (!formData.fill_prescription_now_2 && !formData.put_prescription_on_hold_2) {
                        showHoldFillError();

                        return;
                    }
                }

                if ($('.mr-rx-container-open').length >= 3) {
                    if (!formData.fill_prescription_now_3 && !formData.put_prescription_on_hold_3) {
                        showHoldFillError();

                        return;
                    }
                }
            }

            var store = {
                StoreNumber: storeId,
                ci_csrf_token: cct,
                refillOnly: 0
            };

            $submitTransferBtn.one('gRecaptchaComplete', function() {
                var recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';

                $.ajax({
                    url: getBaseURL() + 'rest/V1/storelocator/storeget',
                    type: 'post',
                    data: JSON.stringify(store),
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function(storeData) {
                        var response = JSON.parse(storeData);

                        if (response.Success === 1) {
                            formData['g-recaptcha-response'] = recaptchaResponse;

                            $.ajax({
                                url: getBaseURL() + 'transfer/index/post',
                                type: 'post',
                                data: formData,
                                dataType: 'json',
                                timeout: 8000,
                                async: false,
                                success: function(data) {
                                    if (data.status === 1) {
                                        window.dataLayer = window.dataLayer || [];
                                        window.dataLayer.push({
                                            'event': 'transfer_prescriptions'
                                        });
                                        dataLayer.push({
                                            'event': 'formSubmission',
                                            'formId': 'transferForm',
                                            'formName': 'Transfer Form'
                                        });

                                        show_lightbox_transfer_success($t('Our pharmacist will call the pharmacy on your behalf to arrange the transfer of your prescription(s).'), $t('Thank you for requesting a prescription transfer. Your request is being processed.'));
                                    } else {
                                        show_lightbox_nobrand(data.message, $t('Please try again'));
                                    }
                                },
                                complete: function() {
                                    setTimeout(function() {
                                        $submitTransferBtn.prop('disabled', false);
                                        $submitTransferBtn.next().remove();
                                    }, 1000);
                                }
                            });
                        } else {
                            show_lightbox_nobrand($t('Please select a pharmacy to transfer to'), $t('Please try again'));
                            $submitTransferBtn.prop('disabled', false);
                        }
                    }
                });
            });

            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
                grecaptcha.execute();
            } else {
                $submitTransferBtn.trigger('gRecaptchaComplete');
            }
        });

        var form = $('#transferForm'),
            origForm = form.serialize();

        $(window).on('beforeunload', function() {
            var submitted = dataLayer.filter(x => x.event === 'formSubmission').length;

            if (form.serialize() !== origForm) {
                if (!submitted) {
                    dataLayer.push({
                        'event': 'formAbandonment',
                        'formId': 'transferForm',
                        'formName': 'Transfer Form'
                    });
                }
            }
        });

        $(document).ready(function() {
            dataLayer.push({
                'event': 'stepImpression',
                'formId': 'transferForm_step1',
                'formName': 'Transfer Form'
            });
        });

        function sliceMaxLengthFOrNumber() {
            if (this.maxLength !== -1 && this.value.length > this.maxLength) {
                this.value = this.value.slice(0, this.maxLength);
            }
        }

        function formatPhoneNumber(selector) {
            const phoneNumberSelector = $(selector);
            let phoneNumber = $.trim(phoneNumberSelector.val());

            if (!phoneNumber) {
                return;
            }

            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            const phoneNumberFormatted = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
            phoneNumberSelector.val(phoneNumberFormatted);
        }

        $('#DOB').inputmask({
            alias: "datetime",
            inputFormat: "dd-mm-yyyy",
            placeholder: 'DD-MM-YYYY'
        });
    }
);