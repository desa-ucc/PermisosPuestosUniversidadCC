import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PermissionService } from '../../services/permission.service';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-cover bg-center" style="background-image: url('/assets/login-bg.svg')">
      <div class="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
        <!-- Logotipo Institucional -->
        <div class="mb-6 flex flex-col items-center">
          <img src="/assets/logo.svg" alt="Logotipo Universidad" class="h-12 mb-2" onerror="this.style.display='none'">
          <!-- Fallback icon if logo not found -->
          <div class="w-16 h-16 bg-ucc-primary text-white rounded-full flex items-center justify-center mt-2">
            <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-2 text-white">Acceso Administrativo</h2>
        <p class="text-sm text-slate-300 mb-8">Perfiles Tecnológicos</p>

        <!-- Microsoft SSO Option (Opción 1) -->
        <button type="button" (click)="loginMicrosoft()" class="w-full flex items-center justify-center gap-3 bg-white text-slate-800 hover:bg-slate-100 font-semibold py-3 px-4 rounded-lg transition-colors mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
          Ingresar con Microsoft
        </button>

        <div class="flex items-center w-full mb-6">
          <div class="flex-1 border-t border-white/20"></div>
          <span class="px-4 text-xs text-slate-400 uppercase tracking-wider">O usar credenciales</span>
          <div class="flex-1 border-t border-white/20"></div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="w-full">
          <div class="mb-4 w-full">
            <label class="ucc-label !text-white">Usuario</label>
            <input type="text" formControlName="username" class="ucc-input bg-white/90">
          </div>

          <div class="mb-2 w-full">
            <label class="ucc-label !text-white">Contraseña</label>
            <input type="password" formControlName="password" class="ucc-input bg-white/90">
          </div>

          <!-- Recuperación de contraseña -->
          <div class="flex justify-end mb-6 w-full">
            <button type="button" (click)="recoverPassword()" class="text-xs text-ucc-primary-container hover:text-white transition-colors underline">
              ¿Olvidó su contraseña?
            </button>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading" class="ucc-btn-primary w-full py-3">
            @if(isLoading) {
              <span class="material-symbols-outlined animate-spin mr-2">sync</span> Validando...
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
    private permissionService: PermissionService,
    private msalService: MsalService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  loginMicrosoft() {
    this.msalService.loginPopup().subscribe({
      next: (response: any) => {
        if (response !== null && response.idToken) {
          this.isLoading = true;
          this.api.loginMicrosoft(response.idToken).subscribe({
            next: (res: any) => {
              localStorage.setItem('token', res.token);
              if (res.permisos) {
                this.permissionService.setPermisos(res.permisos);
              }
              this.router.navigate(['/dashboard']);
            },
            error: (err: any) => {
              this.isLoading = false;
              alert('Acceso fallido: No se pudo validar con Microsoft');
            }
          });
        }
      },
      error: (error: any) => {
        console.error(error);
        alert('Error en inicio de sesión con Microsoft');
      }
    });
  }

  recoverPassword() {
    const email = prompt('Ingrese su correo electrónico para recuperar la contraseña:');
    if (email && email.trim() !== '') {
      this.isLoading = true;
      this.api.forgotPassword(email.trim()).subscribe({
        next: (res) => {
          this.isLoading = false;
          // In a real app we just say check email. Here we might get mockToken back to test.
          alert('Si el correo existe, se ha enviado un enlace de recuperación.');
          if (res.mockToken) {
              console.log('TESTING ONLY - Reset Link: http://localhost:4200/reset-password?token=' + res.mockToken);
          }
        },
        error: (err) => {
          this.isLoading = false;
          // Security practice: don't reveal if email exists or not
          alert('Si el correo existe, se ha enviado un enlace de recuperación.');
        }
      });
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.api.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          if (res.permisos) {
            this.permissionService.setPermisos(res.permisos);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.isLoading = false;
          alert('Acceso fallido: Credenciales incorrectas');
        }
      });
    }
  }
}
