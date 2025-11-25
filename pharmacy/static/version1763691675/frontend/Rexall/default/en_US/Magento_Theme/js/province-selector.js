'use strict';
require(['jquery'], function($) {
    const provinceSelectorContainer = $('.province-selector-wrapper')

    function getCookieValue(cookieName) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim().split('=');
            const name = decodeURIComponent(cookie[0]);
            const value = decodeURIComponent(cookie[1]);
            if (name === cookieName) {
                return value;
            }
        }
        return undefined;
    }

    $(document).ready(function() {
        if (provinceSelectorContainer.length) {
            const geoBypassCookie = getCookieValue('geolocation_bypass') || 'Ontario';
            const currentProvinceElement = provinceSelectorContainer.find('.js-accessible-accordion-title .current-province');
            const currentProvinceInDropdown = provinceSelectorContainer.find('.js-accessible-accordion-content a');

            currentProvinceElement.text(geoBypassCookie);
            currentProvinceInDropdown.each(function() {
                const $link = $(this);
                if ($link.text() === geoBypassCookie) {
                    $link.css('font-weight', 'bold');
                    $link.addClass('selected-province');
                }
            })
        }
    })
});