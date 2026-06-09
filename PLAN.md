# PLAN.md

## Objetivo
Corregir el bloqueo crítico de UX en la pantalla de Reportes Avanzados de la aplicación Angular (`reportes.component.ts`), garantizando que la selección de filtros en los comboboxes y la caja de búsqueda libre sean independientes, y ajustando la lógica de envío de parámetros al backend.

## Arquitectura y Tareas

### 1. Desacoplamiento de Controles en Frontend
- El archivo actual (`./src/src/app/components/reportes/reportes.component.ts`) contiene un evento `onFilterChange` que reinicia variables (`filtroPuesto`, `filtroEmpleado`, `terminoBusqueda`) basándose en lo que se modifica, acoplando su funcionamiento.
- **Acción:** Eliminar `onFilterChange` del controlador TS y de las plantillas HTML:
  - Quitar `(change)="onFilterChange('puesto')"`
  - Quitar `(change)="onFilterChange('empleado')"`
  - Quitar `(keyup)="onFilterChange('texto')"`

### 2. Actualización de Lógica de Búsqueda
- El método `buscar()` debe recolectar los valores sin modificarlos y enviarlos siguiendo la jerarquía:
  1. Si hay texto en "Búsqueda Libre", usa ese valor.
  2. Si no, pero hay un "Colaborador" seleccionado, usa el nombre del colaborador.
  3. Si no, pero hay un "Puesto" seleccionado, usa el nombre del puesto.
- La lógica actual ya implementa esta jerarquía de forma similar (a través de `if else`), se mantendrá y validará.

### 3. Prevención de Errores (Validation)
- Crear el método `formularioTieneFiltros()` o actualizar el getter `hasAnyFilter` a dicho nombre, para validar que al menos uno de los tres controles tenga valor diferente de sus valores por defecto (o vacío) antes de permitir la petición.
- Actualizar el botón "Generar Reporte" para utilizar `[disabled]="!formularioTieneFiltros() || isLoading"`.

### 4. Aseguramiento de Calidad
- Ejecución de pruebas / `ng build` para confirmar que las variables y plantillas funcionan correctamente sin errores de compilación.
- Auditar que se envíe un único string al servicio API.
