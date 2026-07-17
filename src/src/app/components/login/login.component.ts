import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center" style="background-image: url('/assets/login-bg.svg')">
      <div class="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
        <div class="w-16 h-16 bg-ucc-primary text-white rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
        </div>
        <h2 class="text-2xl font-bold mb-2 text-white">Login Administrativo</h2>
        <p class="text-sm text-slate-300 mb-6">Perfiles Tecnológicos</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="w-full">
          <div class="mb-4 w-full">
            <label class="ucc-label !text-white">Usuario</label>
            <input type="text" formControlName="username" class="ucc-input bg-white/90">
          </div>

          <div class="mb-6 w-full">
            <label class="ucc-label !text-white">Contraseña</label>
            <input type="password" formControlName="password" class="ucc-input bg-white/90">
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="ucc-btn-primary w-full">
            @if(isLoading) {
              <span class="material-symbols-outlined animate-spin">sync</span> Validando...
            } @else {
              Ingresar al Sistema
            }
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private permissionService: PermissionService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.api.login(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          if (res.permisos) {
            this.permissionService.setPermisos(res.permisos);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          alert('Login fallido: Credenciales incorrectas');
        }
      });
    }
  }
}
