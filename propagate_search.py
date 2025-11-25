import os
import re

def propagate_search(root_dir):
    search_script_tag = '<script src="/static/js/search.js"></script>'
    
    # Regex to find the search input with data-mage-init and remove the attribute
    # It looks for the specific input structure we saw in the files
    input_regex = re.compile(r'(<input[^>]*id="header-search-input"[^>]*?)(\s*data-mage-init=\'[^\']+\')([^>]*>)', re.DOTALL)
    
    count = 0
    
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename == 'index.html':
                filepath = os.path.join(dirpath, filename)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    modified = False
                    
                    # 1. Remove data-mage-init
                    if 'data-mage-init' in content and 'header-search-input' in content:
                        # We use a simpler string replacement if the regex is too complex or fragile, 
                        # but let's try a robust replacement first.
                        # The pattern in the file is:
                        # id="header-search-input" placeholder="Search&#x20;rexall.ca" data-mage-init='{...}'
                        
                        # Let's try to just remove the specific data-mage-init block we know exists
                        mage_init_block = """ data-mage-init='{
                "Rexall_Search/js/autocomplete": {
                    "url": &quot;https&#x3A;&#x5C;&#x2F;&#x5C;&#x2F;www.rexall.ca&#x5C;&#x2F;search&#x5C;&#x2F;autocomplete&#x5C;&#x2F;&quot;,
                    "destinationSelector": &quot;&#x23;header-search631971031&quot;                }
            }'"""
                        if mage_init_block in content:
                            content = content.replace(mage_init_block, "")
                            modified = True
                        else:
                             # Fallback for slight variations or if it's single line
                            content = re.sub(r'\s*data-mage-init=\'{[^}]*}\'', '', content)
                            if content != original_content:
                                modified = True

                    # 2. Add search.js script
                    if '/static/js/search.js' not in content:
                        if '</body>' in content:
                            content = content.replace('</body>', f'    {search_script_tag}\n</body>')
                            modified = True
                    
                    if modified:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated: {filepath}")
                        count += 1
                    else:
                        print(f"Skipped (no changes needed): {filepath}")
                        
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

    print(f"Total files updated: {count}")

if __name__ == "__main__":
    root_directory = "/Users/pranay/Files/10x Grow/vanguard/vanguardpharmacy"
    propagate_search(root_directory)
