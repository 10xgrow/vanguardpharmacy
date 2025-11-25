'use strict';

define([
    'jquery',
    'accessible-slider',
    'mage/translate'
], function($, accessibleSlider, $t) {
    return function(config, node) {
        config = $.extend(true, {
            pausePlayInsertMethod: 'prepend',
            slickOptions: {
                autoplay: true,
                arrows: false,
                rows: 0,
                customPaging: function(slider, i) {
                    var title = $(slider.$slides[i]).data('dot-text') || $t('Slide %number').replace('%number', i + 1);

                    return '<button type="button"><span class="hero-slider-dot-text">' + title + '</span></button>';
                },
                responsive: [{
                    breakpoint: 'md',
                    settings: {
                        arrows: false
                    }
                }]
            },
        }, config);

        return accessibleSlider.init(config, node);
    };
});