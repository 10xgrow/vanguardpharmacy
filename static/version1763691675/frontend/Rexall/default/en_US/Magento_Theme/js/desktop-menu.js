'use strict';

require([
    'jquery',
    'accessible-expandable-menu'
], function($) {
    $('.nav .header-nav').accessibleExpandableMenu({
        focusOnOpenSelector: null
    });
});