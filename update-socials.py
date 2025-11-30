#!/usr/bin/env python3
# update-socials.py
import re
from pathlib import Path

footer_re = re.compile(
    r'<div\s+class="social-link-container">.*?</div>\s*',
    flags=re.S | re.I
)

schema_re = re.compile(
    r'("sameAs"\s*:\s*)\[(?:[^\]]*?)\]',
    flags=re.S | re.I
)

footer_replacement = '''<div class="social-link-container">
  <ul class="social">
    <li>
      <a href="https://www.facebook.com/VanguardPharmacy.Clinic"
         class="facebook"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Vanguard Pharmacy on Facebook"></a>
    </li>
    <li>
      <a href="https://www.instagram.com/vanguardpharmacy.clinic"
         class="instagram"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Vanguard Pharmacy on Instagram"></a>
    </li>
  </ul>
</div>
'''

schema_replacement_array = '''"sameAs": [
    "https://www.facebook.com/VanguardPharmacy.Clinic",
    "https://www.instagram.com/vanguardpharmacy.clinic"
  ]'''\n\ndef process_file(p: Path):
    try:
        text = p.read_text(encoding='utf-8')
    except Exception:
        return
    new_text = text

    if footer_re.search(text):
        new_text = footer_re.sub(footer_replacement, new_text)

    if schema_re.search(new_text):
        new_text = schema_re.sub(schema_replacement_array, new_text)

    if new_text != text:
        p.write_text(new_text, encoding='utf-8')
        print("Updated:", p)


def main():
    for p in Path('.').rglob('*.html'):
        process_file(p)

if __name__ == '__main__':
    main()