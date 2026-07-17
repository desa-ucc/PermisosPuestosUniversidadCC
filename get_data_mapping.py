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
        continue

    with open(file_path, 'r') as f:
        content = f.read()

    print(f"\n--- {comp} ---")

    match = re.search(r'<tbody>(.*?)</tbody>', content, re.DOTALL)
    if match:
        tbody = match.group(1)
        # Find lines like <td>{{emp.codigoEmpleado}}</td>
        cols = re.findall(r'\{\{(.*?)\}\}', tbody)
        print("Data cols:", cols)
