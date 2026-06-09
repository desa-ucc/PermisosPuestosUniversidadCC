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

### 5. Paginación del Lado del Cliente (Client-Side Pagination)
- Implementar paginación en las tablas del componente de Reportes.
- Variables de paginación para Hardware, Sitios y Plataformas (`currentPage`, `pageSize=10`).
- Creación de getters `paginatedHardwareList`, `paginatedSitiosList`, `paginatedPlataformasList` usando `.slice()`.
- Modificación de los bucles `@for` en el template HTML para iterar sobre los getters paginados.
- Adición de footer para controles de paginación ("Anterior", "Siguiente", y texto "Mostrando página X de Y").
- Esta modificación no requerirá cambios en el Backend (.NET) ni en Stored Procedures.

### 6. Paginación Dinámica del lado del Cliente (Dynamic Client-Side Pagination)
- Añadir control interactivo de tamaño de página a la paginación de cliente (Client-side) para evitar scroll infinito masivo.
- Componentes a actualizar (Estándar): Todos los mantenimientos con tablas.
- El estándar dicta el uso de `currentPage = 1`, `pageSize = 20`, y un array de configuración `pageSizeOptions = [10, 20, 50, 100]`.
- Se usa un footer flexible conteniendo los 3 elementos visuales principales: Selección de tamaño de visualización, Contador dinámico de página `Math.ceil()`, y botones de acción "Anterior" y "Siguiente".
- Las reglas críticas prohíben modificar Backend / .NET y SPs.

### 7. Despliegue Masivo de Paginación Dinámica
- Aplicar la arquitectura de "Software Local" a todos los demás componentes con tablas: Colaboradores, Puestos, Hardware Ideal, Hardware, Sitios, Plataformas, y Reportes.
- No modificar el backend ni requerir llamados adicionales a la API, respetando la regla base de Client-Side Pagination al 100%.
- Mantener la cohesión de nombres de variables en el TypeScript: `currentPage`, `pageSize=20`, `pageSizeOptions`, `paginatedList`, `nextPage`, `prevPage`, `changePageSize`.
- Mantener diseño Flexbox estándar de UCC en los `.html`.

### 8. Buscador con Autocompletado (Searchable Dropdown)
- Reemplazar las etiquetas `<select>` nativas para "Puestos" y "Colaboradores" por un buscador con autocompletado en Angular 17.
- No utilizar librerías de terceros (cero ng-select).
- Implementar la lógica TypeScript:
  - Variables de visibilidad (`showDropdownColaboradores`, `showDropdownPuestos`).
  - Variables de búsqueda (`searchTermColaboradores`, `searchTermPuestos`).
  - Getters `colaboradoresFiltrados` y `puestosFiltrados` para filtrado en tiempo real usando `.filter()`.
  - Métodos de selección `seleccionarColaborador` y `seleccionarPuesto`.
- Implementar la estructura HTML:
  - Input base (`<input type="text" class="ucc-input">`) enlazado a la variable de búsqueda.
  - Gestión de eventos `(focus)` para abrir y `(blur)` (con `setTimeout`) para cerrar.
  - Lista flotante absoluta (`<ul class="absolute z-50 w-full ...">`) anclada bajo el input.
  - Directivas `@for` para iterar elementos y `@empty` para notificar cuando no hay resultados.

### 9. Rollout de Buscador con Autocompletado Masivo
- Extender el nuevo `<input>` de filtrado `absolute` y `z-50` (Searchable Dropdown) a todos los formularios del sistema que utilizan catálogos.
- Componentes a actualizar: Colaboradores, Hardware Ideal, Hardware, Software Local, Sitios y Plataformas.
- Reglas:
  - Manejo de múltiples selectores en la misma vista requiere variables independientes (ej. `searchTermEmpleados`, `searchTermSitios`).
  - Actualización del Reactive Form en los métodos `seleccionar[Item]` vía `this.form.patchValue({ fieldId: id })`.
  - Timeout de 200ms en los métodos de `blur` para permitir la acción de click sobre la lista.
