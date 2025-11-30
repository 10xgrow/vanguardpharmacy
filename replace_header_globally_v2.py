import os
import re

# The new header content from index.html (lines 200-256 approx)
NEW_HEADER = """<header class="modern-header">
    <div class="container header-container">
        <a href="/" class="logo">
            <img src="/public/images/vanguard-logo.png" alt="Vanguard Pharmacy">
        </a>

        <nav class="main-nav">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/pharmacy/">Pharmacy</a></li>
                <li><a href="/prescribing/">Services</a></li>
                <li><a href="/contact-us/">Contact Us</a></li>
                <li><a href="/about-us/">About Us</a></li>
            </ul>

            <!-- Mobile Actions (Visible only on mobile inside nav) -->
            <div class="mobile-actions">
                <form class="header-search" action="/search/" method="get">
                    <input type="search" name="q" placeholder="Search...">
                    <button type="submit">Search</button>
                </form>
                <a href="/contact-us/" class="btn-secondary btn-sm">Find a Store</a>
            </div>
        </nav>

        <div class="header-actions">
            <form class="header-search" action="search/" method="get" role="search" aria-haspopup="listbox">
                <input type="search" name="q" placeholder="Search..." id="header-search-input"
                    autocomplete="off" role="combobox" aria-describedby="autocomplete-assistive-hint"
                    aria-expanded="false" aria-autocomplete="list" aria-controls="header-search631971031"
                    data-mage-init='{
                    "vanguard_Search/js/autocomplete": {
                        "url": "https://www.vanguardpharmacy.ca/search/autocomplete/",
                        "destinationSelector": "#header-search631971031"
                    }
                }'>
                <button type="submit" aria-label="Search" id="header-search-submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
                <ul id="header-search631971031" role="listbox" aria-labelledby="header-search-label"
                    class="autocomplete-dropdown" style="display: none;"></ul>
            </form>
            <a href="/contact-us/" class="btn-secondary btn-sm">Find a Store</a>
        </div>

        <button class="mobile-menu-toggle" aria-label="Toggle navigation"
            onclick="document.querySelector('.main-nav').classList.toggle('active')">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>"""

CSS_LINK = '<link rel="stylesheet" href="/public/css/redesign.css">'

# Regex to find existing header (either page-header or modern-header)
HEADER_REGEX = re.compile(r'<header.*?>.*?</header>', re.DOTALL)

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has a header to replace
        if '<header' not in content:
            print(f"Skipping {filepath}: No header found.")
            return

        # Replace header
        new_content = HEADER_REGEX.sub(NEW_HEADER, content)
        
        # Add CSS link if missing
        if 'redesign.css' not in new_content:
            if '</head>' in new_content:
                new_content = new_content.replace('</head>', f'    {CSS_LINK}\n</head>')
            else:
                print(f"Warning: No </head> tag in {filepath}")

        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"No changes needed for {filepath}")

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    root_dir = '/Users/pranay/Files/10x Grow/vanguard/vanguardpharmacy'
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                # Skip index.html as it is the source
                if filepath == os.path.join(root_dir, 'index.html'):
                    continue
                process_file(filepath)

if __name__ == "__main__":
    main()
