var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function string_subtract(str1, str2) {
    var pos = str1.indexOf(str2);
    if (pos == -1) {
        return str1;
    }
    return str1.substr(0, pos) + str1.substr(pos + str2.length);
}

function urlencode(str) {
    return escape(str).replace('+', '%2B').replace('%20', '+').replace('*', '%2A').replace('/', '%2F').replace('@', '%40').replace('#', '%23').replace('&', '%26');
}

function urldecode(str) {
    //	return unescape(str.replace('+', ' '));
    return unescape(str.replace(/\+/g, ""));
}

function utfdecode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }
    return string;
}

function convert_to_am_pm(hours) {
    suffix = (hours >= 12) ? 'pm' : 'am';
    hours = (hours > 12) ? hours - 12 : hours;
    hours = (hours == '00') ? 12 : hours;

    return hours + ' ' + suffix;
}

function isInt(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}

function show_popup() {
    if (getRefillPopupEnabled()) {
        require(['jquery', 'accessible-modal-builder', 'mage/cookies'], function($, modalBuilder) {

            if (!$.cookie('refill-popup') && getRefillPopupCookie()) {
                $.cookie('refill-popup', 'true', {
                    expires: getRefillPopupCookie() / 1440,
                    path: '/'
                });
            }
            modalBuilder.build({
                content: '<div class="lightbox-error lightbox-refill-popup"><div class="message-box">' +
                    '<h2>Thank You!</h2>' +
                    '<p>Your request has been submitted.</p>' +
                    '<hr>' +
                    '<div class="bewell-line"><span class="bewell-logo" style="background-image: url(' + getBaseURL() + getRefillPopupIcon() + ')"></span><h2>' + getRefillPopupHeading() + '</h2></div>' +
                    '<p class="popup-body-text">' + getRefillPopupContent() + '</p>' +
                    '<div class="popup-buttons"><a href="' + getRefillPopupButton1Link() + '" target="_blank">' + getRefillPopupButton1Text() + '</a>' +
                    '<a href="' + getRefillPopupButton2Link() + '" target="_blank">' + getRefillPopupButton2Text() + '</a></div></div>' +
                    '<div class="popup-creative" style="background-image: url(' + getBaseURL() + getRefillPopupImage() + ')"></div></div>',
                show: true,
                selfDestruct: false,
                className: 'refill-success-popup',
                contentClassName: 'refill-popup'
            });
        });
    }
}

function show_newcomers_popup() {
    if (getNewcomersPopupEnabled()) {
        require(['jquery', 'accessible-modal-builder'], function($, modalBuilder) {
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
                }
            });
        });
    }
}

function show_error(message, title) {
    require(['accessible-modal-builder'], function(modalBuilder) {
        modalBuilder.build({
            content: '<div class="lightbox-error"><h2>' + (title || 'Something went wrong...') + '</h2><p>' + message + '</p></div>',
            show: true,
            selfDestruct: true
        });
    });
}

function show_message(message) {
    jQuery.fancybox.open({
        content: '<div class="lightbox-error"><p>' + message + '</p></div>',
        width: 600,
        height: 'auto',
        autoSize: false
    });
}

function show_lightbox(message, title, callback) {
    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        (title ? '<h1>' + title + '</h1>' : '') +
        '<p>' + message + '</p>' +
        '<a href="#" onclick="jQuery.fancybox.close(); return false;" class="mr-light-teal-button-link">Continue</a>' +
        '</div>';

    var options = {
        content: content,
        width: 740,
        height: 'auto',
        autoSize: false
    };

    if (callback) {
        options.afterClose = callback;
    }

    jQuery.fancybox.open(options);
}

function show_medicationrecord_lightbox(message, title, callback) {
    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        (title ? '<h1>' + title + '</h1>' : '') +
        '<p>' + message + '</p>' +
        '<a href="#" onclick="jQuery.fancybox.close(); return false;" class="mr-light-teal-button-link">View Medication Record Now</a>' +
        '</div>';

    var options = {
        content: content,
        width: 740,
        height: 'auto',
        autoSize: false
    };

    if (callback) {
        options.afterClose = callback;
    }

    jQuery.fancybox.open(options);
}

function show_code_related_lightbox(message, title, callback) {
    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        (title ? '<h1>' + title + '</h1>' : '') +
        message +
        '</div>';

    var options = {
        content: content,
        width: 740,
        height: 'auto',
        autoSize: false
    };

    if (callback) {
        options.afterClose = callback;
    }

    jQuery.fancybox.open(options);
}

function show_lightbox_transfer_success(message, title) {
    require(['accessible-modal-builder'], function(modalBuilder) {
        modalBuilder.build({
            content: '<div class="lightbox-error search-error">' +
                (title ? '<h2>' + title + '</h2>' : '') +
                '<p>' + message + '</p>' +
                '<a href="#" class="mr-light-teal-button-link js-modal-close" onclick="window.location.href = getBaseURL() + \'transfer\'">Continue</a>' +
                '</div>',
            show: true,
            selfDestruct: true
        });
    });
}

function show_lightbox_nobrand(message, title, callback) {
    require(['accessible-modal-builder'], function(modalBuilder) {
        modalBuilder.build({
            content: '<div class="lightbox-error search-error">' +
                (title ? '<h2>' + title + '</h2>' : '') +
                '<p>' + message + '</p>' +
                '<a href="#" class="mr-light-teal-button-link js-modal-close">Continue</a>' +
                '</div>',
            show: true,
            selfDestruct: true
        });
    });
}

function show_terms_lightbox(message, acceptCallback, rejectCallback) {
    var title = '<h1>Terms of Use</h1><h2 style=\'font-size: 18px; margin-top: 0;\'>Rexall Pharma Plus Websites and Mobile Applications</h2>';

    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        title +
        '<p>' + message + '</p>' +
        '<a href="#" style="margin-right:24px" id="acceptButton" class="mr-light-teal-button-link">Accept</a>' +
        '<a href="#" id="rejectButton" class="mr-light-teal-button-link">Reject</a>' +
        '</div>';

    jQuery('#acceptButton').on('click', function(e) {
        e.preventDefault();
        acceptCallback();
        jQuery.fancybox.close();
    });

    jQuery('#rejectButton').on('click', function(e) {
        e.preventDefault();
        rejectCallback();
        jQuery.fancybox.close();
    });

    var options = {
        content: content,
        width: 776,
        height: 'auto',
        autoSize: false
    };

    options.afterClose = function() {
        jQuery('#acceptButton').off('click');
        jQuery('#rejectButton').off('click');
    };

    jQuery.fancybox.open(options);
}

function show_deactivate_lightbox(message, title, acceptCallback, rejectCallback) {
    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        '<h1>' + title + '</h1>' +
        '<p>' + message + '</p>' +
        '<a href="#" id="acceptButton" class="mr-light-teal-button-link" style="margin-right:20px">Yes</a>' +
        '<a href="#" id="rejectButton" class="mr-light-teal-button-link">No</a>' +
        '</div>';

    jQuery('#acceptButton').on('click', function(e) {
        e.preventDefault();
        acceptCallback();
        jQuery.fancybox.close();
    });

    jQuery('#rejectButton').on('click', function(e) {
        e.preventDefault();
        rejectCallback();
        jQuery.fancybox.close();
    });

    var options = {
        content: content,
        width: 740,
        height: 'auto',
        autoSize: false
    };

    options.afterClose = function() {
        jQuery('#acceptButton').off('click');
        jQuery('#rejectButton').off('click');
    };

    jQuery.fancybox.open(options);
}

function show_airmiles_lightbox() {
    var content = '<div id="mr-lightbox" style="width: 460px; background-color: #e7f4f3;">' +
        '<h1>Aeroplan Collectors</h1>' +
        '<p>As of October 31st, Aeroplan members will <b>no longer</b> be able to accumulate miles at Rexall.</p>' +
        '<table cellspacing="0" cellpadding="0" style="border: none;"><tr><td><img src="' + getBaseURL() + 'public/img/airmiles_transition.png" alt="New Airmiles Card" style="margin-right: 12px;"></td>' +
        '<td style="vertical-align: top;"><b style="color: #0076bd;">START COLLECTING AIR MILES<sup>&reg;</sup><br />reward miles as of October 31<sup>st</sup></b><div style="height: 6px;"></div><a href="' + getBaseURL() + 'special-offers/aeroplan-card" style="color: #0076bd; font-size: 14px; text-decoration: none;" target="_blank">Learn More <span style="font-size: 9px">&#9654;</span></a></td></tr></table>' +
        '<p><b>Please update your Loyalty Rewards Number with your AIR MILES Collector Number in your MyRexall Account.</p></b>' +
        '<p>If you do not have an AIR MILES Collector Card and wish to participate in our loyalty program, you can sign up for one, <a href="https://www.airmiles.ca/" style="color: #00b4ae; text-decoration: none; font-weight: 700;" target="_blank">here</a>.</p>' +
        '<p><b style="color: #00b4ae;">Note:</b> <em>Your Aeroplan Account number will be removed from your MyRexall account on October 31st.</em></p>' +
        '<a href="#" id="updateButton" class="mr-blue-button-link" style="margin-right: 12px">Update Loyalty Number</a>' +
        '<a href="#" id="cancelButton" class="mr-light-teal-button-link">Not Now</a>' +
        '</div>';

    jQuery('#cancelButton').on('click', function(e) {
        e.preventDefault();
        jQuery.fancybox.close();
    });

    jQuery('#updateButton').on('click', function(e) {
        e.preventDefault();
        window.location.href = getBaseURL() + 'myrexall/profile#loyalty';
        jQuery.fancybox.close();
    });

    var options = {
        content: content,
        width: 520,
        height: 'auto',
        autoSize: false
    };

    options.afterClose = function() {
        jQuery('#cancelButton').off('click');
        jQuery('#updateButton').off('click');
    };

    jQuery.fancybox.open(options);
}

function show_subscription_lightbox() {
    var content = '<div id="mr-lightbox" style="padding: 15px; width: 540px; background: #e7f4f3 url(' + getBaseURL() + 'public/img/newsletter-subscribe-lightbox-airmiles.png) 342px 15px no-repeat;">' +
        '<h1 style="font-size: 28px; color: #00ada7; margin: 0; line-height: 30px;">Subscribe to the<br />Rexall Newsletter today!</h1>' +
        '<p style="font-size: 16px; line-height: 21px; color: #00ada7; margin: 10px 0 30px;">Don\'t miss the latest news, articles, promotions<br/>and savings from Rexall™</p>' +
        '<a href="#" id="subscriptionContinueButton" class="teal-button">Subscribe Now</a>' +
        '<p style="font-size: 13px; line-height: 18px; color: #00ada7; margin: 55px 0 0;">You may unsubscribe at any time.<br />' +
        'View our <a href="' + getBaseURL() + 'privacy-policy" style="font-weight: 700; text-decoration: none; color: #00ada7;">Privacy Policy</a> and <a href="' + getBaseURL() + 'contact-us" style="font-weight: 700; text-decoration: none; color: #00ada7;">Contact Details</a></p>' +
        '</div>';

    jQuery('#subscriptionCancelButton').on('click', function(e) {
        e.preventDefault();
        jQuery.fancybox.close();
    });

    jQuery('#subscriptionContinueButton').on('click', function(e) {
        e.preventDefault();
        window.location.href = getBaseURL() + 'subscribe';
        jQuery.fancybox.close();
    });

    var options = {
        content: content,
        width: 570,
        height: 'auto',
        autoSize: false
    };

    options.afterClose = function() {
        jQuery('#subscriptionCancelButton').off('click');
        jQuery('#subscriptionContinueButton').off('click');
    };

    jQuery.fancybox.open(options);
}

function show_registration_with_medrecord_lightbox(message, title, acceptCallback, rejectCallback) {
    var content = '<div id="mr-lightbox">' +
        '<img src="' + getBaseURL() + 'public/myrexall/img/mr-logo-lightbox.png" alt="MyRexall Logo">' +
        '<h1>' + title + '</h1>' +
        '<p>' + message + '</p>' +
        '<a href="#" style="margin-right:24px" id="acceptButton" class="mr-light-teal-button-link">Continue to Step 1</a>' +
        '<a href="#" id="rejectButton" class="mr-light-teal-button-link">Come Back Later</a>' +
        '</div>';

    jQuery('#acceptButton').on('click', function(e) {
        e.preventDefault();
        acceptCallback();
        jQuery.fancybox.close();
    });

    jQuery('#rejectButton').on('click', function(e) {
        e.preventDefault();
        rejectCallback();
        jQuery.fancybox.close();
    });

    var options = {
        content: content,
        width: 740,
        height: 'auto',
        autoSize: false
    };

    options.afterClose = function() {
        jQuery('#acceptButton').off('click');
        jQuery('#rejectButton').off('click');
    };

    jQuery.fancybox.open(options);
}

function shuffle(array) {
    var counter = array.length,
        temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function age(year, month, day) {
    year = Number(year);
    month = Number(month) - 1;
    day = Number(day);

    var today = new Date();
    var age = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
        age--;
    }
    return age;
}

function chop(val) {
    if (val.charAt(0) == '0') {
        return val.substr(1);
    }
    return val;
}

function padit(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}