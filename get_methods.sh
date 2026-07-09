#!/bin/bash
components=("colaboradores" "hardware-ideal" "hardware" "sitios" "plataformas")

for comp in "${components[@]}"; do
  file="src/src/app/components/$comp/$comp.component.ts"
  echo "--- $file ---"
  grep -n -B 5 -A 15 "onSubmit() {" "$file"
  grep -n -A 10 "edit(.*) {" "$file"
  grep -n -A 10 "delete(.*) {" "$file"
  echo "----------------"
done
