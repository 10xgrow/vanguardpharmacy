// Simple accordion implementation that doesn't rely on RequireJS
(function () {
    'use strict';

    function initAccordion() {
        // Find all accordion buttons
        var accordionButtons = document.querySelectorAll('.js-accessible-accordion-title');

        accordionButtons.forEach(function (button) {
            // Add click event listener
            button.addEventListener('click', function (e) {
                e.preventDefault();

                // Find the parent item
                var item = button.closest('.js-accessible-accordion-item');
                if (!item) return;

                // Find the content div
                var content = item.querySelector('.js-accessible-accordion-content');
                if (!content) return;

                // Toggle active class
                var isActive = item.classList.contains('is-active');

                // Close all other items (single expand mode)
                var allItems = document.querySelectorAll('.js-accessible-accordion-item');
                allItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('is-active');
                        var otherContent = otherItem.querySelector('.js-accessible-accordion-content');
                        if (otherContent) {
                            otherContent.style.display = 'none';
                            otherContent.setAttribute('aria-hidden', 'true');
                        }
                        var otherButton = otherItem.querySelector('.js-accessible-accordion-title');
                        if (otherButton) {
                            otherButton.setAttribute('aria-expanded', 'false');
                        }
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('is-active');
                    content.style.display = 'none';
                    content.setAttribute('aria-hidden', 'true');
                    button.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('is-active');
                    content.style.display = 'block';
                    content.setAttribute('aria-hidden', 'false');
                    button.setAttribute('aria-expanded', 'true');
                }
            });

            // Initialize ARIA attributes
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('role', 'button');

            var item = button.closest('.js-accessible-accordion-item');
            var content = item.querySelector('.js-accessible-accordion-content');
            if (content) {
                content.style.display = 'none';
                content.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccordion);
    } else {
        initAccordion();
    }
})();
