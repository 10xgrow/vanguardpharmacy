'use strict';

define([
    'jquery'
], function($) {
    return function(config, element) {
        $.ajax({
            url: config.url,
            dataType: 'json',
            cache: false
        }).done(function(data) {
            var bannerContent = $(data);

            $(element).replaceWith(bannerContent);

            bannerContent.trigger('loadedBanner').trigger('contentUpdated');
        });
    };
});