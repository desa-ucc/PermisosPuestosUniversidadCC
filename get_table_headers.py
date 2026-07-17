import re
import os

components = [
    'colaboradores',
    'hardware-ideal',
    'hardware',
    'software',
    'sitios',
    'base-datos'
]

for comp in components:
    file_path = f'/app/src/src/app/components/{comp}/{comp}.component.ts'
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue

    with open(file_path, 'r') as f:
        content = f.read()

    print(f"\n--- {comp} ---")

    # Extract table headers
    match = re.search(r'<thead>(.*?)</thead>', content, re.DOTALL)
    if match:
        thead = match.group(1)
        headers = re.findall(r'<th[^>]*>(.*?)</th>', thead, re.DOTALL)
        # Clean up tags inside headers
        headers = [re.sub(r'<[^>]+>', '', h).strip() for h in headers]
        print("Headers:", headers)

    # Search for listaFiltrada or similar variables
    print("Variables:")
    for line in content.split('\n'):
        if 'listaFiltrada' in line or 'list' in line.lower() and 'filter' in line.lower():
            if '=' in line and '[]' in line:
                print(line.strip())
