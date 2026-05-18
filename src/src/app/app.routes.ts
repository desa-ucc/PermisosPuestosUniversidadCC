import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PuestosComponent } from './components/puestos/puestos.component';
import { ColaboradoresComponent } from './components/colaboradores/colaboradores.component';
import { HardwareComponent } from './components/hardware/hardware.component';
import { SoftwareComponent } from './components/software/software.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'puestos', component: PuestosComponent, canActivate: [AuthGuard] },
  { path: 'colaboradores', component: ColaboradoresComponent, canActivate: [AuthGuard] },
  { path: 'hardware', component: HardwareComponent, canActivate: [AuthGuard] },
  { path: 'software', component: SoftwareComponent, canActivate: [AuthGuard] },

  // Ruta por defecto explícita
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Ruta comodín (wildcard) para atrapar rutas no existentes
  { path: '**', redirectTo: 'login' }
];
