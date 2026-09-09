import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center px-4 py-10 bg-cover bg-center bg-no-repeat" style="background-image: url('https://imagen.castrocarazo.ac.cr/images/2026/08/10/Fondo_login_2MB.jpg')">
      <div class="absolute inset-0 bg-slate-900/60 z-0"></div>
      <div class="w-full max-w-md rounded-2xl relative z-10 border border-white/20 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">

        <div class="w-16 h-16 bg-ucc-primary text-white rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-3xl">lock_reset</span>
        </div>

        <h2 class="text-2xl font-bold mb-2 text-white">Recuperar Contraseña</h2>

        @if(isResetSuccess) {
          <div class="bg-green-500/20 text-green-200 border border-green-500 p-4 rounded-lg text-center mb-6 w-full">
            Su contraseña ha sido restablecida con éxito.
          </div>
          <button (click)="irAlLogin()" class="ucc-btn-primary w-full py-3">Ir al Login</button>
        } @else if(recoveryToken) {
          <p class="text-sm text-slate-300 mb-8 text-center">Cree una nueva contraseña segura.</p>
          <form [formGroup]="resetForm" (ngSubmit)="onResetSubmit()" class="w-full">
            <div class="mb-4 w-full">
              <label class="ucc-label !text-white">Nueva Contraseña</label>
              <input type="password" formControlName="newPassword" class="ucc-input bg-white/90" placeholder="********">
              @if(resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid) {
                <span class="text-red-400 text-xs mt-1 block">La contraseña debe tener al menos 6 caracteres.</span>
              }
            </div>

            <div class="mb-6 w-full">
              <label class="ucc-label !text-white">Confirmar Contraseña</label>
              <input type="password" formControlName="confirmPassword" class="ucc-input bg-white/90" placeholder="********">
              @if(resetForm.get('confirmPassword')?.touched && resetForm.hasError('mismatch')) {
                <span class="text-red-400 text-xs mt-1 block">Las contraseñas no coinciden.</span>
              }
            </div>

            @if(errorMessage) {
              <div class="bg-red-500/20 text-red-200 border border-red-500 p-3 rounded-lg text-sm text-center mb-4 w-full">
                {{ errorMessage }}
              </div>
            }

            <button type="submit" [disabled]="resetForm.invalid || isLoading" class="ucc-btn-primary w-full py-3 mb-4">
              @if(isLoading) {
                <span class="material-symbols-outlined animate-spin mr-2">sync</span> Guardando...
              } @else {
                Guardar Contraseña
              }
            </button>
            <button type="button" (click)="irAlLogin()" class="ucc-btn-secondary w-full py-3">
               Cancelar
            </button>
          </form>
        } @else {
          <p class="text-sm text-slate-300 mb-8 text-center">Ingrese su correo electrónico y número de cédula para validar su identidad.</p>
          <form [formGroup]="forgotForm" (ngSubmit)="onForgotSubmit()" class="w-full">
            <div class="mb-4 w-full">
              <label class="ucc-label !text-white">Correo Electrónico</label>
              <input type="email" formControlName="email" class="ucc-input bg-white/90" placeholder="ejemplo@ucc.cr">
              @if(forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid) {
                <span class="text-red-400 text-xs mt-1 block">Ingrese un correo electrónico válido.</span>
              }
            </div>

            <div class="mb-6 w-full">
              <label class="ucc-label !text-white">Número de Cédula</label>
              <input type="text" formControlName="cedula" class="ucc-input bg-white/90" placeholder="Ej: 101110111">
              @if(forgotForm.get('cedula')?.touched && forgotForm.get('cedula')?.invalid) {
                <span class="text-red-400 text-xs mt-1 block">La cédula es requerida.</span>
              }
            </div>

            @if(errorMessage) {
              <div class="bg-red-500/20 text-red-200 border border-red-500 p-3 rounded-lg text-sm text-center mb-4 w-full">
                {{ errorMessage }}
              </div>
            }

            <button type="submit" [disabled]="forgotForm.invalid || isLoading" class="ucc-btn-primary w-full py-3 mb-4">
              @if(isLoading) {
                <span class="material-symbols-outlined animate-spin mr-2">sync</span> Validando...
              } @else {
                Continuar
              }
            </button>
            <button type="button" (click)="irAlLogin()" class="ucc-btn-secondary w-full py-3">
               Cancelar
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  resetForm: FormGroup;
  isLoading = false;
  recoveryToken: string | null = null;
  errorMessage: string | null = null;
  isResetSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cedula: ['', [Validators.required]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onForgotSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      this.api.forgotPassword(this.forgotForm.value.email, this.forgotForm.value.cedula).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.token) {
            this.recoveryToken = res.token;
          } else {
             this.errorMessage = "Error al generar el token de recuperación.";
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || "Los datos proporcionados no coinciden.";
        }
      });
    }
  }

  onResetSubmit() {
    if (this.resetForm.valid && this.recoveryToken) {
      this.isLoading = true;
      this.errorMessage = null;

      this.api.resetPassword(this.recoveryToken, this.resetForm.value.newPassword).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.isResetSuccess = true;
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || "Error al restablecer la contraseña. Intente nuevamente.";
        }
      });
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
