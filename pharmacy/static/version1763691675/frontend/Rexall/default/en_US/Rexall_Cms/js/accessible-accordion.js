'use strict';
define(['jquery', 'jquery-ui-modules/widget'], function($) {
    var itemId = 0;

    $.widget('rexall.accessibleAccordion', {
        options: {
            multiExpand: false,
            activeClass: 'is-active',
            accordionItemSelector: '.js-accessible-accordion-item',
            accordionTitleSelector: '.js-accessible-accordion-title',
            accordionContentSelector: '.js-accessible-accordion-content',
        },
        _create: function() {
            this.accordionItems = this.element.find(this.options.accordionItemSelector);

            this._initHtml();

            this._initEvents();
        },
        _destroy: function() {
            this._cleanupHtml();
        },
        _initHtml: function() {
            this.element.attr('role', 'tablist');

            this.accordionItems.each(function(index, item) {
                item = $(item);

                var currentId = itemId++,
                    titleId = 'accessible-accordion-title-' + currentId,
                    contentId = 'accessible-accordion-content-' + currentId,
                    title = item.find(this.options.accordionTitleSelector),
                    content = item.find(this.options.accordionContentSelector);

                title.attr({
                    'aria-controls': contentId,
                    'role': 'tab',
                    'id': titleId,
                });

                content.attr({
                    'id': contentId,
                    'role': 'tabpanel',
                    'aria-labelledby': titleId
                });

                this.setActiveState(item, item.hasClass(this.options.activeClass));
            }.bind(this));

            return this;
        },
        _cleanupHtml: function() {
            this.element.removeAttr('role');

            this.accordionItems.each(function(index, item) {
                item = $(item);

                item.find(this.options.accordionTitleSelector)
                    .removeAttr('aria-controls role id aria-expanded aria-selected');

                item.find(this.options.accordionContentSelector)
                    .removeAttr('id role aria-labelledby aria-hidden')
                    .css('display', '');

                item.removeClass(this.options.activeClass);
            }.bind(this));
        },
        _initEvents: function() {
            var events = {};

            events['click ' + this.options.accordionTitleSelector] = this._handleClickEvent;

            this._on(events);

            return this;
        },
        _handleClickEvent: function(event) {
            event.preventDefault();

            var item = $(event.currentTarget).closest(this.options.accordionItemSelector);

            if (!this.options.multiExpand) {
                this.setActiveState(this.accordionItems.not(item), false);
            }

            this.setActiveState(item, !this._isItemActive(item));
        },
        _isItemActive: function(item) {
            return item.hasClass(this.options.activeClass);
        },
        setActiveState: function(accordionItem, state) {
            var title = accordionItem.find(this.options.accordionTitleSelector),
                content = accordionItem.find(this.options.accordionContentSelector);

            accordionItem.toggleClass(this.options.activeClass, state);

            title.attr({
                'aria-expanded': state,
                'aria-selected': state
            });

            content.attr({
                    'aria-hidden': !state
                })
                .toggle(state);

            accordionItem.trigger('accordionItem' + (state ? 'Opened' : 'Closed'), [this.element]);

            return this;
        }
    });

    return $.rexall.accessibleAccordion;
});