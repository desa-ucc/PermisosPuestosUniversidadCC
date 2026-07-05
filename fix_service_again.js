const fs = require('fs');

// As the previous patch somehow got reverted or not saved effectively (likely git stash/checkout conflicts), I'll create the auth interceptor.
// A global HTTP interceptor is a much better approach than appending headers manually on every request.

const interceptorCode = `import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: \`Bearer \${token}\`
      }
    });
    return next(authReq);
  }

  return next(req);
};
`;

fs.writeFileSync('src/src/app/interceptors/auth.interceptor.ts', interceptorCode);

// update app.config.ts to provide the interceptor
let configContent = fs.readFileSync('src/src/app/app.config.ts', 'utf8');
configContent = configContent.replace(
  /import \{ provideHttpClient \} from '@angular\/common\/http';/,
  "import { provideHttpClient, withInterceptors } from '@angular/common/http';\nimport { authInterceptor } from './interceptors/auth.interceptor';"
);

configContent = configContent.replace(
  /provideHttpClient\(\)/,
  "provideHttpClient(withInterceptors([authInterceptor]))"
);

fs.writeFileSync('src/src/app/app.config.ts', configContent);

console.log('Interceptor created and registered.');
