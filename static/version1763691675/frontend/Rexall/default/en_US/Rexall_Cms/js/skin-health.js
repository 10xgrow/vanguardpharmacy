'use strict';
require(['jquery', 'accessibilityUtils'], function($, accessibilityUtils) {
    const skinHealth = $('a[href="#skinHealth"]'),
        skinHealthIngredients = $('a[href="#skinHealthIngredients"]'),
        featuredBrands = $('a[href="#featuredBrands"]'),
        featuredProducts = $('a[href="#featuredProducts"]'),
        skinHealthArticles = $('a[href="#skinHealthArticles"]');

    skinHealth.click(function() {
        accessibilityUtils.scrollTo($('#skinHealth'), 'slow');
    });
    skinHealthIngredients.click(function() {
        accessibilityUtils.scrollTo($('#skinHealthIngredients'), 'slow');
    });
    featuredBrands.click(function() {
        accessibilityUtils.scrollTo($('#featuredBrands'), 'slow');
    });
    featuredProducts.click(function() {
        accessibilityUtils.scrollTo($('#featuredProducts'), 'slow');
    });
    skinHealthArticles.click(function() {
        accessibilityUtils.scrollTo($('#skinHealthArticles'), 'slow');
    });

    $(".octagons img").hover(function() {
        $(".octagons img").css('opacity', '0.4');
        $(this).css('opacity', '1');
        $(".diagram").attr('src', $(this).data('symbol-path'));
        $(".ingredient-details").html($(this).data('ingredient'));
        $(".hidden-content").css('display', 'flex');
        $(".default-content").hide();
    });

    $(".octagons img").mouseleave(function() {
        $(".octagons img").css('opacity', '1');
        $(".hidden-content").hide();
        $(".default-content").show();
    });
});