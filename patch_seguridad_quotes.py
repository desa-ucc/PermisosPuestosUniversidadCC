import re

with open('./src/src/app/components/seguridad/seguridad.component.ts', 'r') as f:
    content = f.read()

# Fix the escaped quotes that got introduced by python string escaping in my previous command
content = content.replace(r"\'SEGURIDAD\'", "'SEGURIDAD'")
content = content.replace(r"\'EDITAR\'", "'EDITAR'")

with open('./src/src/app/components/seguridad/seguridad.component.ts', 'w') as f:
    f.write(content)
