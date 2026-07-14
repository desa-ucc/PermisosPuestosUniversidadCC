import re

def fix(file_path):
    with open(file_path, 'r') as f:
        c = f.read()

    # 1. Imports
    if "Catalogo" not in c:
        c = re.sub(
            r'(import \{ .*?) \}( from \'../../models/models\';)',
            r'\1, Catalogo \2',
            c
        )

    # 2. Properties and Methods
    logic_methods = """
  tiposHardware: Catalogo[] = [];
  selectedTipoHardwareId: number | null = null;

  get isPC(): boolean {
    if (!this.selectedTipoHardwareId) return false;
    const tipo = this.tiposHardware.find(t => t.id === Number(this.selectedTipoHardwareId));
    if (!tipo) return false;
    const nombre = tipo.nombre.toLowerCase();
    return nombre.includes('laptop') || nombre.includes('desktop');
  }

  onTipoHardwareChangeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const nombreSeleccionado = target.value;
    const tipo = this.tiposHardware.find(t => t.nombre === nombreSeleccionado);
    this.selectedTipoHardwareId = tipo ? tipo.id : null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);
  }

  onTipoHardwareChange(tipoId: number | null) {
    this.selectedTipoHardwareId = tipoId;
    const isPC = this.isPC;
    const form = 'hwForm' in this ? (this as any).hwForm : (this as any).hwIdealForm;
    const fields = ['procesador', 'memoria', 'disco', 'marcaPC'];

    fields.forEach(field => {
      const control = form.get(field);
      if (control) {
        if (isPC) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
          control.patchValue(null);
        }
        control.updateValueAndValidity();
      }
    });
  }
"""
    if "get isPC()" not in c:
        c = re.sub(r'(export class (?:HardwareComponent|HardwareIdealComponent) implements OnInit \{)', r'\1\n' + logic_methods, c)

    # 3. HTML Select
    input_str_laptop = r'<input formControlName="tipoEquipo" placeholder="Equipo \(Tipo ej\. Laptop\)" class="ucc-input">'
    input_str_desktop = r'<input formControlName="tipoEquipo" placeholder="Equipo \(Tipo ej\. Desktop\)" class="ucc-input">'
    select_str = """<select formControlName="tipoEquipo" class="ucc-input" (change)="onTipoHardwareChangeSelect($event)">
              <option value="" disabled selected>Seleccione un tipo</option>
              @for(tipo of tiposHardware; track tipo.id) {
                <option [value]="tipo.nombre">{{tipo.nombre}}</option>
              }
            </select>"""

    c = re.sub(input_str_laptop, select_str, c)
    c = re.sub(input_str_desktop, select_str, c)

    # 4. HTML if
    field_labels = ['Procesador', 'Memoria RAM', 'Disco Duro', 'Marca de PC']
    for label in field_labels:
        pattern = r'(<div class="flex flex-col">\s*<label class="ucc-label">' + label + r'</label>(?:(?!<div class="flex flex-col">)[\s\S])*?</div>)'
        def replacement(m):
            if '@if(isPC)' in m.group(1):
                return m.group(1)
            return r"""@if(isPC) {
          """ + m.group(1) + r"""
          }"""
        c = re.sub(pattern, replacement, c)

    # 5. Load Data
    loaddata_regex = r'(loadData\(\) \{[\s\S]*?)(this\.api\.getPuestos\(\)\.subscribe\(res => this\.puestos = res\);)'
    new_loaddata = r'\1this.api.getTiposHardware().subscribe(res => this.tiposHardware = res);\n    \2'
    if "getTiposHardware" not in c:
        c = re.sub(loaddata_regex, new_loaddata, c)

    # 6. Edit Logic
    edit_regex = r'(this\.hw(?:Ideal)?Form\.patchValue\(hw\);)'
    patch_update = r"""\1
    const matchedTipo = this.tiposHardware.find(t => t.nombre === hw.tipoEquipo);
    this.selectedTipoHardwareId = matchedTipo ? matchedTipo.id : null;
    this.onTipoHardwareChange(this.selectedTipoHardwareId);"""
    c = re.sub(edit_regex, patch_update, c)

    # 7. Reset Form
    reset_regex = r'(this\.hw(?:Ideal)?Form\.reset\(\{)'
    reset_update = r"""this.selectedTipoHardwareId = null;
    this.onTipoHardwareChange(null);
    \1"""
    c = re.sub(reset_regex, reset_update, c)

    with open(file_path, 'w') as f:
        f.write(c)

fix('src/src/app/components/hardware/hardware.component.ts')
fix('src/src/app/components/hardware-ideal/hardware-ideal.component.ts')
