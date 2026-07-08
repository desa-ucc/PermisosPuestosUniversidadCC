const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'app.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

// replace ngOnInit
const newNgOnInit = `
  ngOnInit() {
    // Rehidratación de Estado inmediata (para refrescos de página)
    const token = localStorage.getItem('token');
    const permisosStr = sessionStorage.getItem('permisos');

    if (token) {
        if (permisosStr) {
             this.permissionService.cargarPermisosDesdeStorage();
             this.isLoggedIn = true;
        } else {
             // Redireccionar a login porque se perdieron los permisos globales en sessionStorage (ej. refresh duro)
             this.logout();
        }
    } else {
        this.isLoggedIn = false;
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar en la página de login
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          if (localStorage.getItem('token') && !sessionStorage.getItem('permisos')) {
              this.permissionService.cargarPermisosDelUsuarioLogueado().subscribe({
                  error: err => console.error("Could not load permissions from API", err)
              });
          }
      }
    });
  }
`;

content = content.replace(/ngOnInit\(\) \{[\s\S]*?\}\);[\n\r\s]*\}/g, newNgOnInit.trim());

fs.writeFileSync(filePath, content);
console.log("app.component updated");
