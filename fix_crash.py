import re

with open("resources/js/Layouts/DashboardLayout.jsx", "r") as f:
    content = f.read()

# Extract navMenus definition
nav_menus_match = re.search(r'    const navMenus = \[\n.*?}?\n    \];', content, re.DOTALL)
if nav_menus_match:
    nav_menus_code = nav_menus_match.group(0)
    
    # Remove it from the current location
    content = content.replace(nav_menus_code, "")
    
    # Insert it right before the first useEffect
    target = r"    // Initial check to ensure active menu is open"
    content = content.replace(target, nav_menus_code + "\n\n" + target)

with open("resources/js/Layouts/DashboardLayout.jsx", "w") as f:
    f.write(content)
