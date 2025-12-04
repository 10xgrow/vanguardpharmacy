/**
 * GDPR Cookie Consent Manager
 * Provides full GDPR compliance for cookie consent management
 */
(function() {
    'use strict';

    // Configuration constants
    var CONSENT_STORAGE_KEY = 'vp_cookie_consent';
    var CONSENT_LOG_KEY = 'vp_consent_log';
    var MAX_LOG_ENTRIES = 100;  // Maximum consent log entries to store
    var USER_AGENT_MAX_LENGTH = 100;  // Truncate user agent for privacy/storage
    var COOKIE_POLICY_URL = '/cookie-policy/';
    var PRIVACY_POLICY_URL = '/privacy-policy/';

    var CookieConsent = {
        preferences: null,
        initialized: false,

        /**
         * Initialize the cookie consent system
         */
        init: function() {
            if (this.initialized) return;
            this.initialized = true;

            this.preferences = this.loadPreferences();
            
            if (!this.preferences) {
                this.showConsentModal();
            } else {
                this.applyPreferences();
            }

            this.bindEvents();
        },

        /**
         * Load saved preferences from localStorage
         */
        loadPreferences: function() {
            try {
                var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error loading cookie preferences:', e);
            }
            return null;
        },

        /**
         * Save preferences to localStorage
         */
        savePreferences: function(prefs) {
            try {
                this.preferences = prefs;
                localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
                this.logConsent(prefs);
            } catch (e) {
                console.error('Error saving cookie preferences:', e);
            }
        },

        /**
         * Log consent action with timestamp
         */
        logConsent: function(prefs) {
            try {
                var logs = [];
                var stored = localStorage.getItem(CONSENT_LOG_KEY);
                if (stored) {
                    logs = JSON.parse(stored);
                }

                var logEntry = {
                    timestamp: new Date().toISOString(),
                    action: prefs.timestamp ? 'update' : 'initial',
                    preferences: {
                        necessary: true,
                        analytics: prefs.analytics,
                        marketing: prefs.marketing
                    },
                    userAgent: navigator.userAgent.substring(0, USER_AGENT_MAX_LENGTH)
                };

                logs.push(logEntry);

                // Keep only the most recent entries
                if (logs.length > MAX_LOG_ENTRIES) {
                    logs = logs.slice(-MAX_LOG_ENTRIES);
                }

                localStorage.setItem(CONSENT_LOG_KEY, JSON.stringify(logs));
            } catch (e) {
                console.error('Error logging consent:', e);
            }
        },

        /**
         * Get consent logs for admin viewing
         */
        getConsentLogs: function() {
            try {
                var stored = localStorage.getItem(CONSENT_LOG_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error retrieving consent logs:', e);
            }
            return [];
        },

        /**
         * Apply current preferences (enable/disable cookies)
         */
        applyPreferences: function() {
            if (!this.preferences) return;

            if (this.preferences.analytics) {
                this.enableAnalytics();
            }

            if (this.preferences.marketing) {
                this.enableMarketing();
            }
        },

        /**
         * Enable analytics cookies (Google Analytics via GTM)
         */
        enableAnalytics: function() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'cookie_consent_analytics',
                'analytics_consent': true
            });
        },

        /**
         * Enable marketing cookies
         */
        enableMarketing: function() {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'cookie_consent_marketing',
                'marketing_consent': true
            });
        },

        /**
         * Create and show the consent modal
         */
        showConsentModal: function() {
            var existingModal = document.getElementById('cookie-consent-modal');
            if (existingModal) {
                existingModal.style.display = 'flex';
                return;
            }

            var modal = document.createElement('div');
            modal.id = 'cookie-consent-modal';
            modal.className = 'cookie-consent-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'cookie-consent-title');
            modal.setAttribute('aria-modal', 'true');

            modal.innerHTML = this.getModalHTML();

            document.body.appendChild(modal);

            // Focus management for accessibility
            var firstButton = modal.querySelector('.cookie-consent-btn');
            if (firstButton) {
                firstButton.focus();
            }
        },

        /**
         * Get the HTML for the consent modal
         */
        getModalHTML: function() {
            return '<div class="cookie-consent-overlay"></div>' +
                '<div class="cookie-consent-container">' +
                    '<div class="cookie-consent-header">' +
                        '<h2 id="cookie-consent-title">Cookie Preferences</h2>' +
                    '</div>' +
                    '<div class="cookie-consent-body">' +
                        '<p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Please choose your preferences below.</p>' +
                        
                        '<div class="cookie-consent-categories">' +
                            '<div class="cookie-category">' +
                                '<div class="cookie-category-header">' +
                                    '<label class="cookie-category-label">' +
                                        '<input type="checkbox" id="cookie-necessary" checked disabled>' +
                                        '<span class="cookie-category-title">Necessary Cookies</span>' +
                                        '<span class="cookie-category-required">(Required)</span>' +
                                    '</label>' +
                                '</div>' +
                                '<p class="cookie-category-desc">These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>' +
                            '</div>' +
                            
                            '<div class="cookie-category">' +
                                '<div class="cookie-category-header">' +
                                    '<label class="cookie-category-label">' +
                                        '<input type="checkbox" id="cookie-analytics">' +
                                        '<span class="cookie-toggle"></span>' +
                                        '<span class="cookie-category-title">Analytics Cookies</span>' +
                                    '</label>' +
                                '</div>' +
                                '<p class="cookie-category-desc">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website.</p>' +
                            '</div>' +
                            
                            '<div class="cookie-category">' +
                                '<div class="cookie-category-header">' +
                                    '<label class="cookie-category-label">' +
                                        '<input type="checkbox" id="cookie-marketing">' +
                                        '<span class="cookie-toggle"></span>' +
                                        '<span class="cookie-category-title">Marketing Cookies</span>' +
                                    '</label>' +
                                '</div>' +
                                '<p class="cookie-category-desc">These cookies are used to track visitors across websites to display ads that are relevant and engaging for the individual user.</p>' +
                            '</div>' +
                        '</div>' +
                        
                        '<p class="cookie-consent-links">' +
                            '<a href="' + COOKIE_POLICY_URL + '" class="cookie-policy-link">Cookie Policy</a> | ' +
                            '<a href="' + PRIVACY_POLICY_URL + '" class="privacy-policy-link">Privacy Policy</a>' +
                        '</p>' +
                    '</div>' +
                    
                    '<div class="cookie-consent-footer">' +
                        '<button type="button" class="cookie-consent-btn cookie-consent-reject" id="cookie-reject-all">Reject All</button>' +
                        '<button type="button" class="cookie-consent-btn cookie-consent-save" id="cookie-save-preferences">Save Preferences</button>' +
                        '<button type="button" class="cookie-consent-btn cookie-consent-accept" id="cookie-accept-all">Accept All</button>' +
                    '</div>' +
                '</div>';
        },

        /**
         * Hide the consent modal
         */
        hideConsentModal: function() {
            var modal = document.getElementById('cookie-consent-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        },

        /**
         * Accept all cookies
         */
        acceptAll: function() {
            var prefs = {
                necessary: true,
                analytics: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            this.savePreferences(prefs);
            this.applyPreferences();
            this.hideConsentModal();
        },

        /**
         * Reject all non-necessary cookies
         */
        rejectAll: function() {
            var prefs = {
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            this.savePreferences(prefs);
            this.hideConsentModal();
        },

        /**
         * Save custom preferences
         */
        saveCustomPreferences: function() {
            var analyticsCheckbox = document.getElementById('cookie-analytics');
            var marketingCheckbox = document.getElementById('cookie-marketing');

            var prefs = {
                necessary: true,
                analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
                marketing: marketingCheckbox ? marketingCheckbox.checked : false,
                timestamp: new Date().toISOString()
            };

            this.savePreferences(prefs);
            this.applyPreferences();
            this.hideConsentModal();
        },

        /**
         * Open the consent modal for preference modification
         */
        openPreferences: function() {
            this.showConsentModal();

            // Restore current preferences in the modal
            if (this.preferences) {
                var analyticsCheckbox = document.getElementById('cookie-analytics');
                var marketingCheckbox = document.getElementById('cookie-marketing');

                if (analyticsCheckbox) {
                    analyticsCheckbox.checked = this.preferences.analytics || false;
                }
                if (marketingCheckbox) {
                    marketingCheckbox.checked = this.preferences.marketing || false;
                }
            }
        },

        /**
         * Bind event listeners
         */
        bindEvents: function() {
            var self = this;

            document.addEventListener('click', function(e) {
                if (e.target && e.target.id === 'cookie-accept-all') {
                    self.acceptAll();
                } else if (e.target && e.target.id === 'cookie-reject-all') {
                    self.rejectAll();
                } else if (e.target && e.target.id === 'cookie-save-preferences') {
                    self.saveCustomPreferences();
                } else if (e.target && e.target.classList.contains('cookie-preferences-btn')) {
                    self.openPreferences();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    var modal = document.getElementById('cookie-consent-modal');
                    if (modal && modal.style.display !== 'none' && self.preferences) {
                        self.hideConsentModal();
                    }
                }
            });
        },

        /**
         * Check if a specific cookie type is allowed
         */
        isAllowed: function(type) {
            if (!this.preferences) return false;
            if (type === 'necessary') return true;
            return this.preferences[type] === true;
        },

        /**
         * Get current preferences
         */
        getPreferences: function() {
            return this.preferences;
        },

        /**
         * Clear all consent data (for testing/reset)
         */
        clearConsent: function() {
            localStorage.removeItem(CONSENT_STORAGE_KEY);
            this.preferences = null;
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            CookieConsent.init();
        });
    } else {
        CookieConsent.init();
    }

    // Expose to global scope
    window.CookieConsent = CookieConsent;
})();
