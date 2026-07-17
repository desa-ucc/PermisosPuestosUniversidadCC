import re

file_path = '/app/src/src/app/components/hardware-ideal/hardware-ideal.component.ts'
with open(file_path, 'r') as f:
    content = f.read()

match = re.search(r'getPuestoName\(.*?\)\s*{.*?}', content, re.DOTALL)
if match:
    print(match.group(0))

match = re.search(r'getTipoName\(.*?\)\s*{.*?}', content, re.DOTALL)
if match:
    print(match.group(0))
