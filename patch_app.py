import re

with open('./src/src/app/app.component.ts', 'r') as f:
    content = f.read()

new_item = "    { link: '/seguridad', label: 'Seguridad y Accesos', icon: 'security', pantallaId: 'SEGURIDAD' }\n"

# find the reportes array item
content = re.sub(r"({ link: '/reportes', label: 'Reportes', icon: 'analytics', pantallaId: 'REPORTES' })", r"\1,\n" + new_item, content)

with open('./src/src/app/app.component.ts', 'w') as f:
    f.write(content)
