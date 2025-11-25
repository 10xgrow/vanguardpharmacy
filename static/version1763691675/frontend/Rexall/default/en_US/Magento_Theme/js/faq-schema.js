'use strict';
require(['jquery'], function($) {
    const questions = [];
    const faqBlocks = document.querySelectorAll('.faq-accordion');

    faqBlocks.forEach(faqBlock => {
        const items = faqBlock.querySelectorAll('.js-accessible-accordion-item');
        items.forEach(item => {
            const question = item.querySelector('.js-accessible-accordion-title') ? .textContent.trim();
            const answer = item.querySelector('.js-accessible-accordion-content p') ? .textContent.trim();
            if (question && answer) {
                questions.push({
                    "@type": "Question",
                    "name": question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer
                    }
                });
            }
        });
    });

    if (questions.length > 0) {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": questions
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(faqSchema, null, 2);

        document.head.appendChild(script);
    }
});