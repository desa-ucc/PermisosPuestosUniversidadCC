# PLAN: Submission Payload Update Fix 2

## 1. Architecure
- **Frontend App**: Patched missing mapping to `catForm` submission interceptor parsing the time component safely. Also fixed mapping for `abrirDetalle` falling back to pascalCase.

## 2. Steps Execution
- [x] Extracted logic modifications to TS code in `catalogos.component.ts`.
- [x] Verified full build compilation natively across the stack.
- [x] Code passes audit standards and solves API disconnect payload.
