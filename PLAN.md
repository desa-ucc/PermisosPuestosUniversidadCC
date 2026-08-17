1. **Refactor Backend Dockerfile (`PermisosPuestosApi/Dockerfile`)**:
   - Rewrite the file using a 3-stage process (Clonador with `alpine/git`, Build with `.NET SDK`, Final Runtime with `.NET ASP.NET Alpine/Chiseled/Slim`).
   - For the Cloner stage, use `ARG GIT_REPO`, `GIT_USER`, `GIT_TOKEN`, clone, and remove `.git`.
   - For the Runtime stage, use `mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim`, install `tzdata`, configure `TZ=America/Costa_Rica`, and create a non-root user `appuser`. Use `bash` for healthchecks since `curl/wget/telnet/ping` must be removed via `apt-get purge` or `apk del`. Add extensive Spanish comments and separators.
2. **Refactor Frontend Dockerfile (`src/Dockerfile`)**:
   - Follow the same Multi-Stage standard (Clonador, Build with `node`, Runtime with `nginx:alpine`).
   - Remove `curl/wget` from the final Alpine image, install `bash` and `tzdata`, configure `TZ`, create a non-root user (e.g. `appuser`) and configure nginx to run as non-root. Add extensive Spanish comments.
3. **Refactor `docker-compose.yml`**:
   - Remove hardcoded credentials and map them to `.env`.
   - Add explicit internal bridge network.
   - Add `container_name` to all services.
   - Implement `bash -c '</dev/tcp/127.0.0.1/5000'` style healthchecks.
   - Add `depends_on` with `condition: service_healthy` for frontend depending on backend.
   - Add line-by-line Spanish comments.
4. **Verify Configurations**: Run `docker-compose config` to validate the YAML structure.
5. **Verify Builds**: Run `docker-compose build` to ensure the new Dockerfiles compile without errors.
6. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
7. **Submit the changes**.
