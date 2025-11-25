require(['jquery', 'mage/cookies', 'accessible-modal-builder', 'rexallutil'], function($, cookies, modalBuilder) {
    $(document).ready(function() {

        function getPopupConfig() {
            const $config = $('#newcomers-config-container');

            return {
                maxViews: parseInt($config.data('max-views') ? ? 5, 10),
                delayHours: parseInt($config.data('delay-hours') ? ? 8, 10)
            };
        }

        function getPopupViewCount() {
            return parseInt($.cookie('newcomers_popup_views') || '0', 10);
        }

        function setPopupViewCount(count) {
            $.cookie('newcomers_popup_views', count, {
                expires: 365,
                path: '/',
                domain: window.location.hostname
            });
        }

        function getLastShownTime() {
            return parseInt($.cookie('newcomers_popup_last_shown') || '0', 10);
        }

        function setLastShownTime(timestamp) {
            $.cookie('newcomers_popup_last_shown', timestamp, {
                expires: 365,
                path: '/',
                domain: window.location.hostname
            });
        }

        function shouldShowPopup(config) {
            const views = getPopupViewCount();
            const lastShown = getLastShownTime();
            const now = Date.now();
            const hoursSinceLastShown = (now - lastShown) / (1000 * 60 * 60);

            return views < config.maxViews && hoursSinceLastShown >= config.delayHours;
        }

        function show_newcomers_popup() {
            const config = getPopupConfig();
            const views = getPopupViewCount();
            const now = Date.now();

            if (!shouldShowPopup(config)) {
                return;
            }

            $.ajax({
                url: getBaseURL() + 'rexall_cms/newcomers/popup',
                method: 'GET',
                success: function(response) {
                    modalBuilder.build({
                        content: response,
                        show: true,
                        className: 'newcomers-success-popup',
                        contentClassName: 'newcomers-popup'
                    });

                    setPopupViewCount(views + 1);
                    setLastShownTime(now);
                }
            });
        }

        if (window.location.pathname === '/newcomers-to-canada') {
            window.newcomersFormSubmitted = false;

            $('#subscribe').on('submit', function() {
                window.newcomersFormSubmitted = true;
                $.cookie('newcomers_popup', null, {
                    path: '/',
                    domain: window.location.hostname
                });
            });

            const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isIOSSafari = isIOS && isSafari;

            if (isIOSSafari) {
                window.onpagehide = function() {
                    if (!window.newcomersFormSubmitted) {
                        $.cookie('newcomers_popup', 'true', {
                            expires: 1,
                            path: '/',
                            domain: window.location.hostname
                        });
                    }
                };
            } else {
                $(window).on('beforeunload', function() {
                    if (!window.newcomersFormSubmitted) {
                        $.cookie('newcomers_popup', 'true', {
                            expires: 1,
                            path: '/',
                            domain: window.location.hostname
                        });
                    }
                });
            }
        } else {
            const triggerCookie = $.cookie('newcomers_popup');

            if (window.location.pathname !== '/bewell') {
                if (triggerCookie === 'true' && $.cookie('newcomers_popup_suppressed') !== 'true') {
                    show_newcomers_popup();
                }
            }
        }
    });
});