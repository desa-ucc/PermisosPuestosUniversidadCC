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
          <span class="material-symbols-outlined text-3xl">mark_email_read</span>
        </div>

        <h2 class="text-2xl font-bold mb-2 text-white">Recuperar Contraseña</h2>
        <p class="text-sm text-slate-300 mb-8 text-center">Ingrese su correo electrónico para recibir las instrucciones de recuperación.</p>

        @if(isSuccess) {
          <div class="bg-green-500/20 text-green-200 border border-green-500 p-4 rounded-lg text-center mb-6 w-full">
            Si el correo está registrado, hemos enviado las instrucciones de recuperación a su bandeja de entrada.
          </div>
          <button (click)="irAlLogin()" class="ucc-btn-secondary w-full py-3">Volver al login</button>
        } @else {
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="w-full">
            <div class="mb-6 w-full">
              <label class="ucc-label !text-white">Correo Electrónico</label>
              <input type="email" formControlName="email" class="ucc-input bg-white/90" placeholder="ejemplo@ucc.cr">
              @if(forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid) {
                <span class="text-red-400 text-xs mt-1 block">Ingrese un correo electrónico válido.</span>
              }
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || isLoading" class="ucc-btn-primary w-full py-3 mb-4">
              @if(isLoading) {
                <span class="material-symbols-outlined animate-spin mr-2">sync</span> Enviando...
              } @else {
                Enviar Enlace
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
  isLoading = false;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.api.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.isSuccess = true;
          if (res._tokenDebug) {
             console.log('TESTING ONLY - Reset Link: http://localhost:4200/reset-password?token=' + res._tokenDebug);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          // Security practice: don't reveal if email exists or not
          this.isSuccess = true;
        }
      });
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
