'use strict';

define(['jquery', 'mage/translate', 'accessible-modal'], function($, $t) {
    var builder = {};

    builder.build = function(config) {
        config = $.extend(
            true, {
                modalOptions: {},
                content: '',
                className: '',
                show: false,
                selfDestruct: false,
                contentClassName: ''
            },
            config
        );

        var modalHtml = '<div class="accessible-modal ' + config.className + '">' +
            '    <div class="accessible-modal-content ' + config.contentClassName + ' js-accessible-modal-content">' +
            config.content +
            '        <button class="accessible-modal-close js-modal-close" type="button">' +
            '            <span class="screenreader-only">' + $t('Close') + '</span>' +
            '        </button>' +
            '    </div>' +
            '</div>';

        var modalElement = $(modalHtml);

        modalElement.accessibleModal(config.modalOptions);

        if (config.show) {
            modalElement.accessibleModal('setActiveState', true);
        }

        if (config.selfDestruct) {
            modalElement.on('modalActiveStateChanged', function(event, isOpen) {
                if (!isOpen) {
                    modalElement.remove();
                }
            });
        }

        return modalElement;
    };

    return builder;
});