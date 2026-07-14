# PLAN.md - Migración a Formulario Dinámico de Hardware

## Objetivo
Transformar el campo 'Equipo' en un combobox vinculado al catálogo `Cat_TiposHardware` en las pantallas 'Hardware Asignado' y 'Equipo Ideal'. Implementar visibilidad condicional para los campos de cómputo basada en si el tipo seleccionado es Laptop o Desktop.

## Arquitectura y Tareas Realizadas

1. **Frontend (Angular 17)**
   - **`HardwareComponent` y `HardwareIdealComponent`**:
     - Se añadió un arreglo `tiposHardwareList` poblado a través del `ApiService` usando el endpoint `getTiposHardware()`.
     - El `<input>` de texto de `tipoEquipo` fue reemplazado por un `<select>` nativo que muestra el nombre del equipo pero puede manejar la lógica asociada al `ID`.
     - Se implementó la función `onTipoHardwareChange(event)` y `evaluateTipoHardwareReverseLookup(nombre)` para evaluar dinámicamente si el `nombre` del equipo contiene las palabras "laptop" o "desktop".
     - Se aplicó la directiva `@if(mostrarCamposComputo)` sobre los `<div>` contenedores de los campos: Procesador, Memoria RAM, Disco Duro y Marca de PC, ocultándolos en caso negativo para evitar capturas innecesarias.
     - Se aplicó lógica para encender (`setValidators([Validators.required])`) y apagar (`clearValidators()`) las validaciones nativas del `FormBuilder` dependiendo del estado de visibilidad, para no bloquear el guardado en periféricos sencillos como teclados o mouses.

## Auditoría
- [x] Backend compila sin errores
- [x] Angular se renderiza y pasa los tests correctamente
- [x] Reglas de `mostrarCamposComputo` y required bindings correctamente probados vía `grep`.

Score de auditoría: 100/100
