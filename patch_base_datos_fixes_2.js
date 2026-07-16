const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

// The original file is highly broken because the regex match was not correct. Let's rewrite the logic completely.
// Since it's easier to rewrite the typescript class part completely:

const classStartIdx = code.indexOf('export class BaseDatosComponent');
const classEndIdx = code.lastIndexOf('}');

const classDefinition = `export class BaseDatosComponent implements OnInit {
  Math = Math;
  accesosBD: AccesoBD[] = [];
  listaFiltradaTabla: AccesoBD[] = [];
  empleados: Empleado[] = [];
  puestos: Puesto[] = [];

  accesoBDForm: FormGroup;
  isEditing = false;
  isReadOnly = false;
  currentId: number | null = null;

  filtros = {
    codigoPuesto: '',
    nombreCompleto: '',
    nombrePuesto: '',
    servidor: '',
    baseDatos: '',
    nivelAcceso: '',
    observaciones: ''
  };

  aplicarFiltros() {
    this.listaFiltradaTabla = this.accesosBD.filter(acbd => {
      const matchCodigoPuesto = !this.filtros.codigoPuesto || (acbd.codigoPuesto && acbd.codigoPuesto.toLowerCase().includes(this.filtros.codigoPuesto.toLowerCase()));
      const matchNombreCompleto = !this.filtros.nombreCompleto || (acbd.nombreCompleto && acbd.nombreCompleto.toLowerCase().includes(this.filtros.nombreCompleto.toLowerCase()));
      const matchNombrePuesto = !this.filtros.nombrePuesto || (acbd.nombrePuesto && acbd.nombrePuesto.toLowerCase().includes(this.filtros.nombrePuesto.toLowerCase()));
      const matchServidor = !this.filtros.servidor || (acbd.servidor && acbd.servidor.toLowerCase().includes(this.filtros.servidor.toLowerCase()));
      const matchBaseDatos = !this.filtros.baseDatos || (acbd.baseDatos && acbd.baseDatos.toLowerCase().includes(this.filtros.baseDatos.toLowerCase()));
      const matchNivelAcceso = !this.filtros.nivelAcceso || (acbd.nivelAcceso && acbd.nivelAcceso.toLowerCase().includes(this.filtros.nivelAcceso.toLowerCase()));
      const matchObservaciones = !this.filtros.observaciones || (acbd.observaciones && acbd.observaciones.toLowerCase().includes(this.filtros.observaciones.toLowerCase()));

      return matchCodigoPuesto && matchNombreCompleto && matchNombrePuesto && matchServidor && matchBaseDatos && matchNivelAcceso && matchObservaciones;
    });
    this.currentPage = 1;
  }

  limpiarFiltros() {
    this.filtros = {
      codigoPuesto: '',
      nombreCompleto: '',
      nombrePuesto: '',
      servidor: '',
      baseDatos: '',
      nivelAcceso: '',
      observaciones: ''
    };
    this.aplicarFiltros();
  }

  // Empleados dropdown
  showDropdownEmpleados = false;
  searchTermEmpleados = '';
  get empleadosFiltrados() {
    return this.empleados.filter(e => e.nombreCompleto.toLowerCase().includes(this.searchTermEmpleados.toLowerCase()));
  }
  seleccionarEmpleado(emp: Empleado | null) {
    if (emp) {
        this.accesoBDForm.patchValue({ empleadoId: emp.id });
        this.searchTermEmpleados = emp.nombreCompleto;
    } else {
        this.accesoBDForm.patchValue({ empleadoId: null });
        this.searchTermEmpleados = '';
    }
    this.onEmpleadoChange(null);
    this.showDropdownEmpleados = false;
  }
  cerrarDropdownEmpleados() {
    setTimeout(() => {
      this.showDropdownEmpleados = false;
      const currentId = this.accesoBDForm.get('empleadoId')?.value;
      if (!currentId) {
          this.searchTermEmpleados = '';
      } else {
          const matched = this.empleados.find(e => e.id === currentId);
          if (matched) this.searchTermEmpleados = matched.nombreCompleto;
      }
    }, 200);
  }

  // Niveles dropdown
  showDropdownNiveles = false;
  searchTermNiveles = '';
  get nivelesFiltrados() {
    return this.nivelesAcceso.filter(n => n.nombre.toLowerCase().includes(this.searchTermNiveles.toLowerCase()));
  }
  seleccionarNivel(nivel: Catalogo | null) {
    if (nivel) {
        this.accesoBDForm.patchValue({ nivelAcceso: nivel.nombre });
        this.searchTermNiveles = nivel.nombre;
    } else {
        this.accesoBDForm.patchValue({ nivelAcceso: null });
        this.searchTermNiveles = '';
    }
    this.showDropdownNiveles = false;
  }
  cerrarDropdownNiveles() {
    setTimeout(() => {
      this.showDropdownNiveles = false;
      const currentId = this.accesoBDForm.get('nivelAcceso')?.value;
      if (!currentId) {
          this.searchTermNiveles = '';
      } else {
          const matched = this.nivelesAcceso.find(n => n.nombre === currentId);
          if (matched) this.searchTermNiveles = matched.nombre;
      }
    }, 200);
  }

  // Paginación
  currentPage: number = 1;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 50, 100];
  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFiltradaTabla.slice(start, start + this.pageSize);
  }
  get totalPages() {
    return Math.ceil(this.listaFiltradaTabla.length / this.pageSize) || 1;
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = Number(target.value);
    this.currentPage = 1;
  }

  selectedEmpleadoPuestoId: number | undefined | null = null;
  nivelesAcceso: Catalogo[] = [];

  constructor(private api: ApiService, private fb: FormBuilder, public permissionService: PermissionService) {
    this.accesoBDForm = this.fb.group({
      empleadoId: [null, Validators.required],
      servidor: ['', Validators.required],
      baseDatos: ['', Validators.required],
      nivelAcceso: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadCatalogos();
  }

  loadData() {
    this.api.getAccesosBD().subscribe(res => {
      this.accesosBD = res;
      this.aplicarFiltros();
    });
    this.api.getEmpleados().subscribe(res => this.empleados = res);
    this.api.getPuestos().subscribe(res => this.puestos = res);
  }

  loadCatalogos() {
    this.api.getNivelesAcceso().subscribe(res => this.nivelesAcceso = res);
  }

  onEmpleadoChange(event: any) {
    const empId = this.accesoBDForm.get('empleadoId')?.value;
    if (empId) {
      const emp = this.empleados.find(e => e.id === Number(empId));
      this.selectedEmpleadoPuestoId = emp?.puestoId;
    } else {
      this.selectedEmpleadoPuestoId = null;
    }
  }

  getPuestoName(puestoId: number | undefined | null): string {
    if (!puestoId) return 'No Asignado';
    return this.puestos.find(p => p.id === puestoId)?.nombrePuesto || 'Desconocido';
  }

  onSubmit() {
    if (this.isEditing && !this.permissionService.tienePermiso('ADMINBASEDATOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    if (!this.isEditing && !this.permissionService.tienePermiso('ADMINBASEDATOS', 'CREAR')) {
      alert('Acceso denegado: No tienes permiso para crear.');
      return;
    }
    this.accesoBDForm.markAllAsTouched();
    if (this.accesoBDForm.invalid) return;

    const data = this.accesoBDForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      this.api.updateAccesoBD(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err: any) => alert('Error al actualizar registro de base de datos.')
      });
    } else {
      this.api.createAccesoBD(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err: any) => alert('Error al crear registro de base de datos.')
      });
    }
  }

  edit(acbd: AccesoBD) {
    if (!this.permissionService.tienePermiso('ADMINBASEDATOS', 'EDITAR')) {
      alert('Acceso denegado: No tienes permiso para editar.');
      return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = acbd.id;
    this.accesoBDForm.enable();
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones
    });
    this.onEmpleadoChange(null);
    if (acbd.empleadoId) {
        const matched = this.empleados.find(e => e.id === acbd.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }

  verDetalle(acbd: AccesoBD) {
    this.isReadOnly = true;
    this.isEditing = false;
    this.currentId = acbd.id;
    this.accesoBDForm.patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones
    });
    this.onEmpleadoChange(null);
    this.accesoBDForm.disable();
    if (acbd.empleadoId) {
        const matched = this.empleados.find(e => e.id === acbd.empleadoId);
        if (matched) this.searchTermEmpleados = matched.nombreCompleto;
    } else {
        this.searchTermEmpleados = '';
    }
    this.searchTermNiveles = acbd.nivelAcceso || '';
  }

  delete(id: number) {
    if (!this.permissionService.tienePermiso('ADMINBASEDATOS', 'ELIMINAR')) {
      alert('Acceso denegado: No tienes permiso para eliminar.');
      return;
    }
    if(confirm('¿Está seguro de que desea eliminar este registro?')) {
      this.api.deleteAccesoBD(id).subscribe({
        next: () => this.loadData(),
        error: (err: any) => alert('No se pudo eliminar el registro.')
      });
    }
  }

  resetForm() {
    this.isEditing = false;
    this.isReadOnly = false;
    this.currentId = null;
    this.selectedEmpleadoPuestoId = null;
    this.accesoBDForm.reset({
      empleadoId: null,
      servidor: '',
      baseDatos: '',
      nivelAcceso: '',
      observaciones: ''
    });
    this.accesoBDForm.enable();
  }
}
`;

code = code.substring(0, classStartIdx) + classDefinition;
fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Rewrote typescript class.");
