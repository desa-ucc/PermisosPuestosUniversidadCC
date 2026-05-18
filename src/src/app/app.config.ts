import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provisión del enrutador correctamente configurado
    provideRouter(routes, withComponentInputBinding()),

    // Provisión de llamadas HTTP seguras preparadas para el SSR de la versión 17 (Fetch)
    provideHttpClient(withFetch()),

    // Requerido por ngx-charts y animaciones globales
    provideAnimations()
  ]
};
