import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PuestosComponent } from './components/puestos/puestos.component';
import { ColaboradoresComponent } from './components/colaboradores/colaboradores.component';
import { HardwareComponent } from './components/hardware/hardware.component';
import { HardwareIdealComponent } from './components/hardware-ideal/hardware-ideal.component';
import { SoftwareComponent } from './components/software/software.component';
import { SitiosComponent } from './components/sitios/sitios.component';
import { PlataformasComponent } from './components/plataformas/plataformas.component';
import { BaseDatosComponent } from './components/base-datos/base-datos.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { AuthGuard } from './guards/auth.guard';

import { SeguridadComponent } from './components/seguridad/seguridad.component';
import { PermissionGuard } from './guards/permission.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'catalogos', component: CatalogosComponent, canActivate: [AuthGuard] },
  { path: 'puestos', component: PuestosComponent, canActivate: [AuthGuard] },
  { path: 'colaboradores', component: ColaboradoresComponent, canActivate: [AuthGuard] },
  { path: 'hardware', component: HardwareComponent, canActivate: [AuthGuard] },
  { path: 'hardware-ideal', component: HardwareIdealComponent, canActivate: [AuthGuard] },
  { path: 'software', component: SoftwareComponent, canActivate: [AuthGuard] },
  { path: 'sitios', component: SitiosComponent, canActivate: [AuthGuard] },
  { path: 'plataformas', component: PlataformasComponent, canActivate: [AuthGuard] },
  { path: 'base-datos', component: BaseDatosComponent, canActivate: [AuthGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard] },
  { path: 'seguridad', component: SeguridadComponent, canActivate: [AuthGuard, PermissionGuard], data: { pantallaId: 'SEGURIDAD' } },


  // Ruta por defecto explícita
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta comodín (wildcard) para atrapar rutas no existentes
  { path: '**', redirectTo: 'login' }
];
