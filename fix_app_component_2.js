const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'src', 'app', 'app.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

// replace local storage with session storage
content = content.replace(/localStorage.removeItem\('permisos'\);/g, "sessionStorage.removeItem('permisos');");

// implement redirect if sessionStorage doesn't exist on refresh
const loginLogic = `
      // Ocultar navbar en la página de login
      const wasLoggedIn = this.isLoggedIn;
      this.isLoggedIn = !event.urlAfterRedirects.includes('/login');

      if (this.isLoggedIn && !wasLoggedIn) {
          // If we just logged in, load permissions (and also load from storage on refresh)
          if (localStorage.getItem('token')) {
              this.permissionService.cargarPermisosDesdeStorage();
              this.permissionService.cargarPermisosDelUsuarioLogueado().subscribe({
                  error: err => console.error("Could not load permissions from API", err)
              });
          }
      } else if (this.isLoggedIn) {
          // just a navigation event but we are already logged in, ensure we have permissions in state if they exist in storage
          const permisosStr = sessionStorage.getItem('permisos');
          if (permisosStr) {
             this.permissionService.cargarPermisosDesdeStorage();
          } else {
             // Redireccionar a login porque se perdieron los permisos globales
             this.logout();
          }
      }
`;

content = content.replace(/\/\/ Ocultar navbar en la página de login[\s\S]*this.permissionService.cargarPermisosDesdeStorage\(\);\n      }/g, loginLogic.trim());

fs.writeFileSync(filePath, content);
console.log("app.component updated");
