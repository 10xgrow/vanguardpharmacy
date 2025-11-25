#!/bin/bash

# Script to convert relative navigation paths to absolute paths in HTML files
# This fixes navigation issues from subdirectory pages

echo "Starting path conversion..."

# Find all HTML files and process them
find . -name "*.html" -type f | while read -r file; do
    # Create a backup
    cp "$file" "$file.bak"
    
    # Apply sed replacements to convert relative paths to absolute
    # Only replace href attributes that don't already start with /, http, https, #, javascript:, mailto:, tel:
    
    sed -i '' \
        -e 's|href="pharmacy/|href="/pharmacy/|g' \
        -e 's|href="refill/|href="/refill/|g' \
        -e 's|href="transfer/|href="/transfer/|g' \
        -e 's|href="prescribing/|href="/prescribing/|g' \
        -e 's|href="vaccines/|href="/vaccines/|g' \
        -e 's|href="diabetes-resources/|href="/diabetes-resources/|g' \
        -e 's|href="respiratory/|href="/respiratory/|g' \
        -e 's|href="quit-smoking/|href="/quit-smoking/|g' \
        -e 's|href="voyce/|href="/voyce/|g' \
        -e 's|href="everyday-health/|href="/everyday-health/|g' \
        -e 's|href="remedycabinet/|href="/remedycabinet/|g' \
        -e 's|href="skin-care/|href="/skin-care/|g' \
        -e 's|href="oral-health-hygiene/|href="/oral-health-hygiene/|g' \
        -e 's|href="digestive-gut-health/|href="/digestive-gut-health/|g' \
        -e 's|href="eye-care/|href="/eye-care/|g' \
        -e 's|href="vitamins/|href="/vitamins/|g' \
        -e 's|href="vitamin-finder/|href="/vitamin-finder/|g' \
        -e 's|href="right-dose-blister-packaging/|href="/right-dose-blister-packaging/|g' \
        -e 's|href="articles/|href="/articles/|g' \
        -e 's|href="storelocator/|href="/storelocator/|g' \
        -e 's|href="eflyer/|href="/eflyer/|g' \
        -e 's|href="travel-clinic/|href="/travel-clinic/|g' \
        -e 's|href="option-plus/|href="/option-plus/|g' \
        -e 's|href="help/|href="/help/|g' \
        -e 's|href="contact-us/|href="/contact-us/|g' \
        -e 's|href="accessibility/|href="/accessibility/|g' \
        -e 's|href="legal/|href="/legal/|g' \
        -e 's|href="consent/|href="/consent/|g' \
        -e 's|href="external-privacy-policy/|href="/external-privacy-policy/|g' \
        -e 's|href="ask-a-pharmacist/|href="/ask-a-pharmacist/|g' \
        -e 's|href="always-flexfoam/|href="/always-flexfoam/|g' \
        -e 's|href="bewell/|href="/bewell/|g' \
        -e 's|href="search/|href="/search/|g' \
        "$file"
    
    echo "Processed: $file"
done

echo "Path conversion complete!"
echo "Backup files created with .bak extension"
echo ""
echo "To verify changes, run: git diff (if using git)"
echo "To remove backups after verification: find . -name '*.bak' -delete"
