import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center px-4 py-10 bg-cover bg-center bg-no-repeat" style="background-image: url('https://imagen.castrocarazo.ac.cr/images/2026/08/10/Fondo_login_2MB.jpg')">
      <div class="absolute inset-0 bg-slate-900/60 z-0"></div>
      <div class="w-full max-w-md rounded-2xl relative z-10 border border-white/20 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">

        <div class="w-16 h-16 bg-ucc-primary text-white rounded-full flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-3xl">lock_reset</span>
        </div>

        <h2 class="text-2xl font-bold mb-2 text-white">Restablecer Contraseña</h2>
        <p class="text-sm text-slate-300 mb-8 text-center">Ingrese su nueva contraseña.</p>

        @if(!tokenValido) {
          <div class="bg-red-500/20 text-red-200 border border-red-500 p-4 rounded-lg text-center mb-6 w-full">
            El enlace de recuperación no es válido o ha expirado.
          </div>
          <button (click)="irAlLogin()" class="ucc-btn-secondary w-full py-3">Volver al login</button>
        } @else {
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="w-full">
            <div class="mb-4 w-full">
              <label class="ucc-label !text-white">Nueva Contraseña</label>
              <input type="password" formControlName="newPassword" class="ucc-input bg-white/90">
              @if(resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid) {
                <span class="text-red-400 text-xs mt-1 block">La contraseña es requerida (mínimo 6 caracteres).</span>
              }
            </div>

            <div class="mb-6 w-full">
              <label class="ucc-label !text-white">Confirmar Contraseña</label>
              <input type="password" formControlName="confirmPassword" class="ucc-input bg-white/90">
              @if(resetForm.hasError('mismatch')) {
                <span class="text-red-400 text-xs mt-1 block">Las contraseñas no coinciden.</span>
              }
            </div>

            <button type="submit" [disabled]="resetForm.invalid || isLoading" class="ucc-btn-primary w-full py-3">
              @if(isLoading) {
                <span class="material-symbols-outlined animate-spin mr-2">sync</span> Guardando...
              } @else {
                Cambiar Contraseña
              }
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  tokenValido = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.tokenValido = false;
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.isLoading = true;
      this.api.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
        next: (res) => {
          alert('Contraseña actualizada con éxito.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          alert(err.error?.message || 'Error al actualizar contraseña. El token podría haber expirado.');
        }
      });
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
