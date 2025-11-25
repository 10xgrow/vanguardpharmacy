define([
    'uiComponent',
    'Magento_Customer/js/customer-data',
    'jquery',
    'mage/storage',
    'ko',
    'Northern_Webapi/js/model/url-builder',
    'moment',
    'mage/translate',
    'underscore'
], function(Component, customerData, $, storage, ko, urlBuilder, moment, $t, _) {
    'use strict';

    return Component.extend({
        position: ko.observable({}),
        isGeolocated: ko.observable(true),
        initialize: function() {
            this._super();

            this.preferredStores = customerData.get('preferredStores');

            this.preferredStore = ko.computed(function() {
                if (!this.preferredStores || !this.preferredStores()[0]) {
                    return {};
                }

                return this.preferredStores()[0];
            }, this);

            this.preferredStores.subscribe(function(stores) {
                if (!$('.eflyer-index-index').length) {
                    if (stores[0] && stores[0].region_name !== this.province) {
                        window.location.reload();
                    }
                }
            }, this);

            if (!this.preferredStore().StoreNumber || this.preferredStores().length == 1) {
                this.getLocation();
            }

            if (this.isGeolocated()) {
                $('.nearby-stores ').css('display', 'block');
            }

            if ($('.eflyer-index-index').length) {
                if (!this.preferredStore().StoreNumber) {
                    $('.eflyer-results-container').show();
                } else {
                    $('.eflyer-results-container').hide();
                }
            }

            if (this.preferredStore().StoreNumber && this.preferredStore().updated_at !== moment().utc().format('YYYYMMDD')) {
                storage
                    .post(urlBuilder.createUrl('/storelocator/select/:storeNumber', {
                        storeNumber: this.preferredStore().StoreNumber
                    }))
                    .done(
                        function(stores) {
                            if (stores) {
                                stores = JSON.parse(stores);
                                customerData.set('preferredStores', stores);
                            }
                        }
                    );
            }
        },
        selectByLatLng: function(lat, lng) {
            return storage.post(
                urlBuilder.createUrl('/storelocator/select', {}),
                JSON.stringify({
                    'latitude': lat,
                    'longitude': lng
                })
            ).done(
                function(stores) {
                    if (stores) {
                        if (typeof stores === 'string') {
                            stores = JSON.parse(stores);
                        }
                        customerData.set('preferredStores', stores);
                    }
                }
            );
        },
        getLocation: function() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        this.position(position);
                        if (this.preferredStores().length == 1) {
                            this.selectByLatLng(position.coords.latitude, position.coords.longitude);
                            this.preferredStores = customerData.get('preferredStores');
                        }
                        if (!this.preferredStore().StoreNumber) {
                            this.selectByLatLng(position.coords.latitude, position.coords.longitude);
                        }
                    }.bind(this),
                    function(error) {
                        $('.location-block-button ').css('display', 'block');
                        $('.loader').css('display', 'none');
                        this.isGeolocated(false);
                        $('.nearby-stores ').css('display', 'none');
                        $('.dropdown-store ').addClass('no-geo');
                        $('.main-store ').css('border-bottom', 'none');
                    }.bind(this)
                );
                $('.nearby-stores ').css('display', 'block');
            } else {
                this.isGeolocated(false);
            }
        },
        getNearbyStores: function() {
            if (!this.preferredStores || typeof this.preferredStores() !== typeof []) {
                return [];
            }

            return this.preferredStores().filter(store => store.StoreNumber != this.preferredStore().StoreNumber).slice(0, 3);
        },
        getStoreHolidays: function(store) {
            var result = [];

            $.each(store.Exceptions || [], function(i, holiday) {
                if (holiday.Activity == 'FS' || holiday.Activity == 'Rx') {
                    holiday.dateFormatted = moment(holiday.Date, 'YYYY-MM-DD').format('MMMM Do');
                    holiday.hoursFormatted = holiday.TimeClose ? (holiday.TimeOpen + ' - ' + holiday.TimeClose) : $t('Closed');

                    result.push(holiday);
                } else {
                    return true;
                }
            });

            return result;
        },
        isHolidaysEqual: function(storeHolidayArray, pharmacyHolidayArray) {
            if (storeHolidayArray.length !== pharmacyHolidayArray.length) {
                return false;
            }

            const simplifyData = holiday => {
                return {
                    'Date': holiday.Date,
                    'TimeClose': holiday.TimeClose,
                    'TimeOpen': holiday.TimeOpen,
                };
            };

            return storeHolidayArray.every(storeHoliday => {
                const storeHolidayData = simplifyData(storeHoliday);

                return pharmacyHolidayArray.some(
                    pharmacyHoliday =>
                    _.isEqual(storeHolidayData, simplifyData(pharmacyHoliday))
                );
            });
        },
        getTodayStoreHours: function(store) {
            var now = new Date(),
                momentNow = moment(),
                dayText = '',
                holidays,
                todayHoliday = [];

            holidays = this.getStoreHolidays(store);

            if (holidays) {
                $.each(holidays, function(i, holiday) {
                    if (holiday.Activity !== 'Rx' && holiday.Date === momentNow.format('YYYY-MM-DD')) {
                        todayHoliday = [holiday.TimeOpen, holiday.TimeClose];
                    }
                });
            }

            if (todayHoliday.length) {
                return todayHoliday;
            }

            switch (now.getDay()) {
                case 0:
                    dayText = 'Sunday';
                    break;
                case 1:
                    dayText = 'Monday';
                    break;
                case 2:
                    dayText = 'Tuesday';
                    break;
                case 3:
                    dayText = 'Wednesday';
                    break;
                case 4:
                    dayText = 'Thursday';
                    break;
                case 5:
                    dayText = 'Friday';
                    break;
                case 6:
                    dayText = 'Saturday';
                    break;
            }

            return [store.StoreHours[dayText + 'Open'], store.StoreHours[dayText + 'Close']];
        },
        isStoreOpen: function(store) {
            var hours = this.getTodayStoreHours(store);

            if (hours[1] === '') {
                return false;
            }

            var now = moment(),
                open = moment(now.format('YYYY-MM-DD') + ' ' + hours[0], 'YYYY-MM-DD HH:mm a'),
                close = moment(now.format('YYYY-MM-DD') + ' ' + hours[1], 'YYYY-MM-DD HH:mm a');

            return now.isBetween(open, close);
        },
        getStoreHours: function(store, hoursToGet) {
            var storeHours,
                result;

            if (hoursToGet == 'FS') {
                storeHours = store.StoreHours;
            } else {
                storeHours = store.RxHours;
            }

            var storeHoursData = [{}];

            for (var i = 0; i < 14; i++) {
                if (i % 2 == 0) {
                    var day = Object.keys(storeHours)[i].replace('Close', '').replace('Open', '');
                    var closeHr = Object.values(storeHours)[i];
                    var openHr = Object.values(storeHours)[i + 1];

                    if (closeHr == '') {
                        storeHoursData.push({
                            label: day,
                            hours: 'Closed'
                        });
                        i++;
                    } else {
                        storeHoursData.push({
                            label: day,
                            hours: openHr + ' - ' + closeHr,
                        });
                        i++;
                    }
                }
            }

            var sortedWeekHours = [{}];

            $.each(storeHoursData, function(i, day) {
                switch (day.label) {
                    case 'Monday':
                        sortedWeekHours[0] = day;
                        break;
                    case 'Tuesday':
                        sortedWeekHours[1] = day;
                        break;
                    case 'Wednesday':
                        sortedWeekHours[2] = day;
                        break;
                    case 'Thursday':
                        sortedWeekHours[3] = day;
                        break;
                    case 'Friday':
                        sortedWeekHours[4] = day;
                        break;
                    case 'Saturday':
                        sortedWeekHours[5] = day;
                        break;
                    case 'Sunday':
                        sortedWeekHours[6] = day;
                        break;
                }
            });

            function combineHours(hours) {
                var combined = [];
                var counter = -1;

                for (var i = 0; i < hours.length; i++) {
                    var day = hours[i];
                    if (counter == -1 || combined[counter].hours != day.hours) {
                        combined.push({
                            days: [day.label],
                            hours: day.hours
                        });
                        counter++;
                    } else {
                        combined[counter].days.push(day.label);
                    }
                }

                return combined;
            }

            function joinDays(hours) {
                var result = [];

                for (var i = 0; i < hours.length; i++) {
                    var item = hours[i];
                    var days = item.days;
                    if (days.length == 1) {
                        result.push({
                            days: days[0],
                            hours: item.hours
                        });
                    } else {
                        result.push({
                            days: days[0] + ' - ' + days[days.length - 1],
                            hours: item.hours
                        });
                    }
                }

                return result;
            }

            result = joinDays(combineHours(sortedWeekHours));

            return result;
        },
        getConsolidatedHours: function(store) {
            return store.ConsolidatedStoreHours === store.ConsolidatedRxHours;
        },
        getDistanceToStore: function(store) {
            if (!this.position().coords) {
                return null;
            }

            var lon1 = this.position().coords.longitude * Math.PI / 180,
                lon2 = store.Longitude * Math.PI / 180,
                lat1 = this.position().coords.latitude * Math.PI / 180,
                lat2 = store.Latitude * Math.PI / 180,
                dlon = lon2 - lon1,
                dlat = lat2 - lat1;

            return (2 * Math.asin(Math.sqrt(Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2))) * 6371).toFixed(1);
        },
        getStoreName: function(store) {
            $('.loader').css('display', 'none');
            $('.pin-icon-container').css('display', 'block');

            if (!$('.dropdown-store').is(':visible')) {
                $('.arrow-down').show();
            }

            return store.StoreName;
        }
    });
});