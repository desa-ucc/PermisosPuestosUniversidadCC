# PLAN: Date Binding Fix

## 1. Architecure
- **Frontend App**: Updated TS parsing for ISO datetime string to correctly format `YYYY-MM-DD` allowing the native HTML `<input type="date">` to bind the payload successfully in `abrirDetalle`.

## 2. Steps Execution
- [x] Patched `catalogos.component.ts`.
- [x] Verified build.
