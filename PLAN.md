1. *Refactorizar Dockerfile del Backend (.NET)*
   - Aplicar multi-stage build.
   - Configurar usuario no-root.
   - Eliminar herramientas de red (curl, wget, ping, telnet).
   - Configurar TZ=America/Costa_Rica.
   - Documentar en español exhaustivamente.
2. *Refactorizar Dockerfile del Frontend (Angular)*
   - Aplicar multi-stage build (preparer, build, final).
   - Usar Nginx alpine con usuario no-root.
   - Configurar TZ y eliminar herramientas de red.
   - Ejecutar entrypoint.sh para inyectar variables de entorno en runtime a Nginx.
   - Documentar en español exhaustivamente.
3. *Refactorizar docker-compose.yml*
   - Usar red interna (`bridge`).
   - Pasar configuraciones por variables de entorno (usando .env).
   - Healthchecks usando bash sin curl.
   - Configurar resoluciones de nombres (sin `localhost` entre contenedores).
   - Documentación en español.
4. *Asegurar scripts de entrypoint (Frontend)*
   - Verificar y/o crear `entrypoint.sh` para inyectar MSAL y API URLs en `env.js` en runtime.
5. *Completar pasos pre-commit*
   - Ejecutar verificaciones, auditoría y revisión requeridas.
6. *Submitir los cambios*
   - Hacer commit y enviar.
