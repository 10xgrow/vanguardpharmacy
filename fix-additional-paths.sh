#!/bin/bash

# Supplementary script to fix additional relative paths that were missed

echo "Fixing additional relative paths..."

find . -name "*.html" -type f  -not -name "*.bak" | while read -r file; do
    sed -i '' \
        -e 's|href="pharmacist-care-walk-in-clinic/|href="/pharmacist-care-walk-in-clinic/|g' \
        -e 's|href="prescriptions-delivered-to-your-door/|href="/prescriptions-delivered-to-your-door/|g' \
        -e 's|href="online-health-services/|href="/online-health-services/|g' \
        -e 's|href="covid-19/|href="/covid-19/|g' \
        -e 's|href="paxlovid/|href="/paxlovid/|g' \
        -e 's|href="myrexallpharmacist|href="/myrexallpharmacist|g' \
        -e 's|href="pharmacy-flu-shots|href="/pharmacy-flu-shots|g' \
        "$file"
done

echo "Additional paths fixed!"
