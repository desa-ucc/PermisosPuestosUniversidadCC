const fs = require('fs');
let code = fs.readFileSync('src/src/app/components/base-datos/base-datos.component.ts', 'utf8');

// Replace form fields and table columns
code = code.replace(/accesoBDForm = this\.fb\.group\({[^}]*}\);/, `accesoBDForm = this.fb.group({
      empleadoId: [null, Validators.required],
      servidor: ['', Validators.required],
      baseDatos: ['', Validators.required],
      nivelAcceso: ['', Validators.required],
      observaciones: ['']
    });`);

code = code.replace(/patchValue\({[\s\S]*?}\);/g, (match) => {
    if (match.includes('empleadoId') && match.includes('licencias')) {
        return `patchValue({
      empleadoId: acbd.empleadoId,
      servidor: acbd.servidor,
      baseDatos: acbd.baseDatos,
      nivelAcceso: acbd.nivelAcceso,
      observaciones: acbd.observaciones
    });`;
    }
    return match;
});

code = code.replace(/reset\({[\s\S]*?}\);/g, (match) => {
    if (match.includes('empleadoId') && match.includes('licencias')) {
        return `reset({
      empleadoId: null,
      servidor: '',
      baseDatos: '',
      nivelAcceso: '',
      observaciones: ''
    });`;
    }
    return match;
});


fs.writeFileSync('src/src/app/components/base-datos/base-datos.component.ts', code);
console.log("Fixed base-datos.component.ts");
