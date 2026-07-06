const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'components', 'software', 'software.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

// replace onSubmit logic
const newOnSubmit = `
  onSubmit() {
    this.swForm.markAllAsTouched();
    if (this.swForm.invalid) return;

    const data = this.swForm.value;
    data.empleadoId = Number(data.empleadoId);

    if (this.isEditing && this.currentId) {
      if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
        alert('Acceso denegado: No tiene permisos para editar software local.');
        return;
      }
      this.api.updateSoftwareLocal(this.currentId, { ...data, id: this.currentId }).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al actualizar registro de software.')
      });
    } else {
      if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'CREAR')) {
        alert('Acceso denegado: No tiene permisos para crear software local.');
        return;
      }
      this.api.createSoftwareLocal(data).subscribe({
        next: () => {
          this.loadData();
          this.resetForm();
        },
        error: (err) => alert('Error al crear registro de software.')
      });
    }
  }
`;

content = content.replace(/onSubmit\(\) \{[\s\S]*?alert\('Error al crear registro de software\.'\)\n      \}\);\n    \}\n  \}/, newOnSubmit.trim());

// replace edit method
const newEdit = `
  edit(sw: SoftwareLocal) {
    if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'EDITAR')) {
       alert('Acceso denegado');
       return;
    }
    this.isEditing = true;
    this.isReadOnly = false;
    this.currentId = sw.id;
    this.swForm.enable();
    this.searchTermEquipos = '';
    this.swForm.patchValue(sw);
    if (sw.empleadoId) {
        const matched = this.equipos.find(e => e.empleadoId === sw.empleadoId);
        if (matched) this.searchTermEquipos = \`\${matched.placa} - \${matched.marcaPC}\`;
    } else {
        this.searchTermEquipos = '';
    }
  }
`;

content = content.replace(/edit\(sw: SoftwareLocal\) \{[\s\S]*?this\.searchTermEquipos = '';\n    \}\n  \}/, newEdit.trim());

// replace delete method
const newDelete = `
  delete(id: number) {
    if (!this.permissionService.tienePermiso('SOFTWARE_LOCAL', 'ELIMINAR')) {
       alert('Acceso denegado');
       return;
    }
    if(confirm('¿Está seguro de que desea eliminar este registro de software?')) {
      this.api.deleteSoftwareLocal(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('No se pudo eliminar el registro.')
      });
    }
  }
`;

content = content.replace(/delete\(id: number\) \{[\s\S]*?alert\('No se pudo eliminar el registro\.'\)\n      \}\);\n    \}\n  \}/, newDelete.trim());

fs.writeFileSync(filePath, content);
console.log("software component logic updated");
