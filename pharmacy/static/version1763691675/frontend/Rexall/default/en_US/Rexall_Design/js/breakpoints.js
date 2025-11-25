'use strict';
define(['jquery'], function($) {
    window.Breakpoints = function() { // made global for backwards compatibility
        var sizes = [{
                'name': 'zero',
                'size': 0
            },
            {
                'name': 'xxs',
                'size': 320
            },
            {
                'name': 'xs',
                'size': 480
            },
            {
                'name': 'md',
                'size': 768
            },
            {
                'name': 'header-footer',
                'size': 960
            },
            {
                'name': 'lg',
                'size': 1020
            }
        ];

        sizes.forEach(function(currentItem) {
            this[currentItem.name] = currentItem.size; // backwards compatibility
        }.bind(this));

        this.getCurrentSizeName = function() {
            var sizeNumber = this.getCurrentSize(),
                sizeName = null;

            sizes.forEach(function(currentItem) {
                if (sizeNumber >= currentItem.size) {
                    sizeName = currentItem.name;
                }
            });

            return sizeName;
        };

        this.getSizeByName = function(name) {
            var size = sizes.reduce(function(foundSize, size) {
                return size.name === name ? size.size : foundSize;
            }, null);

            if (size === null) {
                throw new Error('Could not find breakpoint size "' + name + '" in ' + JSON.stringify(sizes))
            }

            return size;
        };

        this.getCurrentSize = function() {
            return window.innerWidth;
        };

        this.isAtLeast = function(breakpointName) {
            if (breakpointName === null) {
                return false;
            }

            return this.getCurrentSize() >= this.getSizeByName(breakpointName);
        };

        this.observeSize = function(callback) {
            if (observableWindowSizeInstance === null) {
                observableWindowSizeInstance = new WindowSizeObservable();
            }

            return observableWindowSizeInstance.addObserver(callback);
        };

        this.removeObserveSize = function(callback) {
            if (observableWindowSizeInstance === null) {
                observableWindowSizeInstance = new WindowSizeObservable();
            }

            return observableWindowSizeInstance.removeObserver(callback);
        };
    };

    function WindowSizeObservable() {
        var observers = [],
            currentBreakpointSize = breakpointsInstance.getCurrentSizeName();

        this.addObserver = function(callback) {
            observers.push(callback);

            this.notifyObservers([callback]);

            return callback;
        };

        this.removeObserver = function(callback) {
            observers.splice(observers.indexOf(callback), 1);
        };

        this.notifyObservers = function(targetedObservers) {
            (targetedObservers || observers).forEach(function(callback) {
                callback(breakpointsInstance);
            });
        };

        $(window).on('resize', function() {
            var sizeName = breakpointsInstance.getCurrentSizeName();

            if (sizeName !== currentBreakpointSize) {
                this.notifyObservers();

                currentBreakpointSize = sizeName;
            }
        }.bind(this));
    }

    var observableWindowSizeInstance = null,
        breakpointsInstance = new Breakpoints();

    return breakpointsInstance;
});