'use strict';
define(['uiComponent', 'jquery', 'ko'], function(Component, $, ko) {
    return Component.extend({
        defaults: {
            packCost: 15,
            packSize: 10,
            cigarettesPerDay: 8,
        },
        initObservable: function() {
            this._super().observe([
                'packCost',
                'packSize',
                'cigarettesPerDay'
            ]);

            this.weeklyCost = ko.computed(function() {
                return this._calcCostByDays(7);
            }, this);

            this.monthlyCost = ko.computed(function() {
                return this._calcCostByDays(365 / 12);
            }, this);

            this.yearlyCost = ko.computed(function() {
                return this._calcCostByDays(365);
            }, this);

            return this;
        },
        _calcCostByDays: function(dayCount) {
            return (this.packCost() / this.packSize()) * (this.cigarettesPerDay() * dayCount);
        },
        formatCost: function(cost) {
            var formatter = new Intl.NumberFormat(
                'en-CA', {
                    style: 'currency',
                    currency: 'CAD'
                }
            );

            return formatter.format(cost);
        }
    });
});