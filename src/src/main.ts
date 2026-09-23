import { MsalRedirectComponent } from '@azure/msal-angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Ensure MsalRedirectComponent is bootstrapped to handle the hash in popups
    bootstrapApplication(MsalRedirectComponent, appConfig).catch(e => {
      // May throw if app-redirect isn't in index.html, which is normal
    });
  })
  .catch((err) => console.error(err));
