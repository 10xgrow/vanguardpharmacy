document.addEventListener('DOMContentLoaded', function () {
    const pages = [
        { title: "Home", url: "/" },
        { title: "Pharmacy", url: "/pharmacy/" },
        { title: "Auto Refill", url: "/pharmacy/medicationmanagement/autorefill/" },
        { title: "Medication Review", url: "/pharmacy/med-management/medreview/" },
        { title: "Prescription Delivery", url: "/prescriptions-delivered-to-your-door/" },
        { title: "Everyday Health", url: "/everyday-health/" },
        { title: "Oral Health", url: "/oral-health-hygiene/" },
        { title: "Refill Prescriptions", url: "/contact-us/" },
        { title: "Quit Smoking", url: "/quit-smoking/" },
        { title: "Prescribing", url: "/prescribing/" },
        { title: "Virtual Doctor", url: "/virtual-doctor-appointment/" },
        { title: "Translation Services (Voyce)", url: "/voyce/" },
        { title: "Diabetes Resources", url: "/diabetes-resources/" },
        { title: "Vitamins", url: "/vitamins/" },
        { title: "Privacy Policy", url: "/privacy-policy/" },
        { title: "Vitamin Finder", url: "/vitamin-finder/" },
        { title: "Health Articles", url: "/articles/healthandlifestyle/" },
        { title: "Drug Information", url: "/articles/drugs/" },
        { title: "Medical Conditions", url: "/articles/conditions/" },
        { title: "Natural Health", url: "/articles/naturalhealth/" },
        { title: "Travel Clinic", url: "/travel-clinic/consultations/" },
        { title: "Transfer Prescriptions", url: "/contact-us/" },
        { title: "Digestive Health", url: "/digestive-gut-health/" },
        { title: "Eye Care", url: "/eye-care/" },
        { title: "Walk-In Clinic", url: "/pharmacist-care-walk-in-clinic/" },
        { title: "RightDose Blister Packaging", url: "/right-dose-blister-packaging/" },
        { title: "Contact Us", url: "/contact-us/" },
        { title: "Skin Care", url: "/skin-care/" },
        { title: "Respiratory Care", url: "/respiratory/" },
        { title: "Option+", url: "/option-plus/" },
        { title: "Ask a Pharmacist", url: "/ask-a-pharmacist/" },
        { title: "Vaccinations", url: "/vaccines/" },
        { title: "Remedy Cabinet", url: "/remedycabinet/" },
        { title: "Allergy Relief", url: "/remedycabinet/allergy/" },
        { title: "Cold Relief", url: "/remedycabinet/cold/" },
        { title: "Pain Relief", url: "/remedycabinet/pain/" }
    ];

    const searchInput = document.getElementById('header-search-input');
    const resultsContainer = document.getElementById('header-search631971031');
    const searchForm = document.querySelector('form.search');

    if (!searchInput || !resultsContainer) {
        console.warn('Search elements not found');
        return;
    }

    // Prevent default form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';

        if (query.length < 2) {
            return;
        }

        const filteredPages = pages.filter(page =>
            page.title.toLowerCase().includes(query)
        );

        if (filteredPages.length > 0) {
            filteredPages.forEach(page => {
                const li = document.createElement('li');
                li.className = 'selected'; // Matches existing style if any
                li.style.cursor = 'pointer';
                li.style.padding = '0'; // Remove padding from li

                const link = document.createElement('a');
                link.href = page.url;
                link.textContent = page.title;
                link.style.display = 'block';
                link.style.width = '100%'; // Ensure full width
                link.style.padding = '10px'; // Add padding to link
                link.style.textDecoration = 'none';
                link.style.color = '#333';

                // Highlight match
                const regex = new RegExp(`(${query})`, 'gi');
                link.innerHTML = page.title.replace(regex, '<strong>$1</strong>');

                li.appendChild(link);
                resultsContainer.appendChild(li);
            });
            resultsContainer.style.display = 'block';
        } else {
            const li = document.createElement('li');
            li.style.padding = '10px';
            li.textContent = 'No results found';
            resultsContainer.appendChild(li);
            resultsContainer.style.display = 'block';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
});
