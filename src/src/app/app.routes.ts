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
import { ReportesComponent } from './components/reportes/reportes.component';
import { CatalogosComponent } from './components/catalogos/catalogos.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'DASHBOARD' } },
  { path: 'catalogos', component: CatalogosComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'SEGURIDAD' } },
  { path: 'puestos', component: PuestosComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'PUESTOS' } },
  { path: 'colaboradores', component: ColaboradoresComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'COLABORADORES' } },
  { path: 'hardware', component: HardwareComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'HARDWARE' } },
  { path: 'hardware-ideal', component: HardwareIdealComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'EQUIPO_IDEAL' } },
  { path: 'software', component: SoftwareComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'SOFTWARE_LOCAL' } },
  { path: 'sitios', component: SitiosComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'PERMISOS_SITIOS' } },
  { path: 'plataformas', component: PlataformasComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'PLATAFORMAS' } },
  { path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard, RoleGuard], data: { pantallaId: 'REPORTES' } },

  // Ruta por defecto explícita
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta comodín (wildcard) para atrapar rutas no existentes
  { path: '**', redirectTo: 'login' }
];
