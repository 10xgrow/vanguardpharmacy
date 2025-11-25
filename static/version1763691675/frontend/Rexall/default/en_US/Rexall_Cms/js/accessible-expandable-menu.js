'use strict';

define(
    [
        'jquery',
        'accessibilityUtils',
        'jquery-ui-modules/widget'
    ],
    function($, accessibilityUtils) {
        $.widget('rexall.accessibleExpandableMenu', {
            options: {
                menuItemSelector: '.js-menu-item',
                menuItems: null,
                menuItemToggleSelector: '.js-menu-item-toggle',
                menuItemToggle: null,
                submenuSelector: '.js-submenu-item',
                submenuItems: null,
                submenuToggleSelector: '.js-menu-item-toggle-submenu',
                submenuToggle: null,
                activeClass: 'active',
                closeButton: null,
                moveFocusOnEscape: true,
                moveFocusOnOffClick: false,
                closeOnOffClick: true,
                focusOnOpenSelector: '.js-focus-target'
            },
            _menuItems: null,
            _menuItemsToggles: null,
            _submenuToggles: null,
            _submenuItems: null,
            _openButton: null,
            _create: function() {
                this._menuItems = this.options.menuItems || this.element.find(this.options.menuItemSelector);

                this._menuItemsToggles = this.options.menuItemToggle || this.element.find(this.options.menuItemToggleSelector);

                this._submenuItems = this.options.submenuItems || this.element.find(this.options.submenuSelector);

                this._submenuToggles = this.options.submenuToggle || this.element.find(this.options.submenuToggleSelector);

                this._initEvents();
            },
            _initEvents: function() {
                this._on(this._menuItemsToggles, {
                    'click': this._handleClickEvent
                });

                this._on(this._submenuToggles, {
                    'click': this._handleClickEvent
                });

                this._on(window, {
                    'keydown': this._handleKeydownEvent
                });

                if (this.options.closeOnOffClick) {
                    this._on(document, {
                        'click': this._handleOffClickEvent
                    });
                }

                if (this.options.closeButton !== null) {
                    this._on($(this.options.closeButton), {
                        'click': this._handleCloseButtonClickEvent
                    });
                }

                if (this.options.focusOnOpenSelector !== null) {
                    this._on(this.element, {
                        'afterMenuStateChange': this._handleAfterMenuStateChangeEvent
                    });
                }

                return this;
            },
            _handleKeydownEvent: function(event) {
                var allowedKeys = [
                    'Escape',
                    'Esc' // IE 11
                ];

                if (allowedKeys.indexOf(event.key) !== -1) {
                    var activeItem = this.getActiveItem();

                    if (activeItem.length > 0) {
                        this.toggleMenuState(activeItem, false);
                        this.toggleSubmenuState(activeItem, false);

                        if (this.options.moveFocusOnEscape && this._openButton !== null) {
                            accessibilityUtils.forceElementFocus(this._openButton);
                        }
                    }
                }
            },
            _handleClickEvent: function(event) {
                event.preventDefault();

                this._openButton = $(event.currentTarget);

                let isSubmenuClicked = this._openButton.hasClass('js-menu-item-toggle-submenu');

                if (isSubmenuClicked) {
                    this.toggleSubmenuState(this._openButton.next(this._submenuItems));
                } else {
                    this.toggleMenuState(this._openButton.closest(this._menuItems));
                }
            },
            _handleCloseButtonClickEvent: function(event) {
                event.preventDefault();

                this.toggleMenuState(this.getActiveItem(), false);
                this.toggleSubmenuState(this.getActiveItem(), false);

                accessibilityUtils.forceElementFocus(this._openButton);
            },
            _handleOffClickEvent: function(event) {
                var activeItem = this.getActiveItem();

                if (activeItem.length > 0) {
                    var isMenuClicked = this.element.toArray().some(function(element) {
                        return $(element).is(event.target) || $.contains(element, event.target);
                    });

                    if (!isMenuClicked) {
                        this.toggleMenuState(activeItem, false);
                        this.toggleSubmenuState(activeItem, false);

                        if (this.options.moveFocusOnOffClick && this._openButton !== null) {
                            accessibilityUtils.forceElementFocus(this._openButton);
                        }
                    }
                }
            },
            _handleAfterMenuStateChangeEvent: function(event, stateVal, item) {
                if (this.options.focusOnOpenSelector !== null && stateVal && this._menuItems.filter(item).length > 0) {
                    setTimeout(function() { // Allow focus changing from other menus to happen first
                        accessibilityUtils.forceElementFocus(this.element.find(this.options.focusOnOpenSelector));
                    }.bind(this));
                }
            },
            toggleMenuState: function(item, stateVal) {
                this._menuItems.not(item)
                    .add(this._menuItemsToggles)
                    .not(this._openButton)
                    .removeClass(this.options.activeClass);

                var newStateVal = typeof stateVal !== 'undefined' ? stateVal : !item.hasClass(this.options.activeClass);

                item.add(this._openButton)
                    .toggleClass(this.options.activeClass, newStateVal)
                    .trigger('afterMenuStateChange', [newStateVal, item]);

                return stateVal;
            },
            toggleSubmenuState: function(submenu, stateVal) {
                this._submenuItems.not(submenu)
                    .add(this._submenuToggles)
                    .not(this._openButton)
                    .removeClass(this.options.activeClass);

                var newStateVal = typeof stateVal !== 'undefined' ? stateVal : !submenu.hasClass(this.options.activeClass);

                submenu.add(this._openButton)
                    .toggleClass(this.options.activeClass, newStateVal)
                    .trigger('afterMenuStateChange', [newStateVal, submenu]);

                return newStateVal;
            },
            getActiveItem: function() {
                return this._menuItems.filter('.' + this.options.activeClass);
            }
        });

        return $.rexall.accessibleExpandableMenu;
    }
);