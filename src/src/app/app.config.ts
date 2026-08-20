import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';


export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msalConfig.clientId,
      authority: environment.msalConfig.authority,
      redirectUri: environment.msalConfig.redirectUri
    },
    cache: {
      cacheLocation: 'localStorage',

    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          console.log(message);
        },
        piiLoggingEnabled: false,
        logLevel: LogLevel.Error
      }
    }
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService
  ]
};
