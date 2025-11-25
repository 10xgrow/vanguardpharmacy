define([
    'jquery',
    'underscore',
    'accessibilityUtils',
    'mage/translate'
], function($, _, accessibilityUtils) {
    return function(config, el) {
        var isOpen = false;
        var index = -1;

        if (!config.url || !config.destinationSelector) {
            return;
        }

        var proceed = _.debounce(function(e) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].indexOf(e.code) > -1 || $(e.target).closest('.search').length === 0) {
                return;
            }

            $(config.destinationSelector).load(config.url + '?' + $.param({
                q: this.value
            }));
            $('.autocomplete-dropdown').show();
            $('.autocomplete-close-button').show();
            $('.search > :submit').addClass('active');
            isOpen = true;
            $('#header-search-input').attr('aria-expanded', 'true');
            index = -1;
        }, 500);

        $(el).on('keyup', proceed);

        function closeSearchDropdown() {
            $('.autocomplete-dropdown').hide();
            $('.autocomplete-close-button').hide();
            $('.search > :submit').removeClass('active');
            $('#header-search-input').val('');
            $('#mobile-search-input').val('');
            isOpen = false;
            accessibilityUtils.forceElementFocus('#header-search-input');
            $('#header-search-input').attr('aria-expanded', 'false');
        }

        $('.autocomplete-close-button').on('click', function() {
            closeSearchDropdown();
        });

        $(document).on('keyup', function(e) {
            if (e.key === 'Escape' && $(e.target).closest('.search').length !== 0) {
                closeSearchDropdown();
            }
        });

        $(document).click(function(e) {
            e.stopPropagation();
            if (isOpen) {
                var target = $(e.target);

                if (target.parents('.autocomplete-dropdown').length || target.attr('class') == 'autocomplete-dropdown' || target.attr('id') == 'header-search-input') {
                    return;
                }

                if (!target.parents('.autocomplete-dropdown').length) {
                    if (target.attr('class') == 'autocomplete-dropdown') {
                        return;
                    }

                    $('.autocomplete-dropdown').hide();
                    $('.autocomplete-close-button').hide();
                    $('.search > :submit').removeClass('active');
                }
                $('.autocomplete-dropdown').hide();
                $('.autocomplete-close-button').hide();
                $('.search > :submit').removeClass('active');
                $('#header-search-input').attr('aria-expanded', 'false');
            }
        });

        window.addEventListener('keydown', function(e) {
            if ($('.js-autocomplete-link').is(':focus')) {
                if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
                    e.preventDefault();
                }

                if (['Tab'].indexOf(e.code) > -1) {
                    e.preventDefault();
                    index = -1;

                    if (e.shiftKey) {
                        accessibilityUtils.forceElementFocus($('.autocomplete-close-button'));

                        return;
                    }

                    accessibilityUtils.forceElementFocus($('button#header-search-submit'));
                }
            }

            if ($('.autocomplete-close-button').is(':focus')) {
                if (['Tab'].indexOf(e.code) > -1) {
                    e.preventDefault();

                    if (e.shiftKey) {
                        accessibilityUtils.forceElementFocus('#header-search-input');

                        return;
                    }
                    accessibilityUtils.forceElementFocus($('button#header-search-submit'));
                }
            }
        }, false);

        $(document).on('keyup', function(e) {
            e.stopPropagation();
            var listItem;

            if (e.keyCode == 40) {
                if (isOpen) {
                    if (index < 0) {
                        index++;
                        accessibilityUtils.forceElementFocus($('.js-autocomplete-link')[0]);
                        $('.js-autocomplete-link').parent().attr('aria-selected', 'false');
                        listItem = $('.js-autocomplete-link')[index].closest('li');
                        $(listItem).attr('aria-selected', 'true');

                        return;
                    }

                    e.preventDefault();
                    if (index < $('.js-autocomplete-link').length - 1) {
                        index++;
                        $('.js-autocomplete-link').parent().attr('aria-selected', 'false');
                        accessibilityUtils.forceElementFocus($('.js-autocomplete-link')[index]);
                        listItem = $('.js-autocomplete-link')[index].closest('li');
                        $(listItem).attr('aria-selected', 'true');

                        return;
                    }
                }
            }

            if (e.keyCode == 38) {
                if (isOpen) {
                    e.preventDefault();
                    if (index > 0) {
                        index--;
                        $('.js-autocomplete-link').parent().attr('aria-selected', 'false');
                        accessibilityUtils.forceElementFocus($('.js-autocomplete-link')[index]);
                        listItem = $('.js-autocomplete-link')[index].closest('li');
                        $(listItem).attr('aria-selected', 'true');

                    }
                }
            }
        });
    };
});