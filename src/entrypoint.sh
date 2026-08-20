#!/bin/bash
# Reemplazar variables de entorno en env.template.js
envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

# Iniciar Nginx
exec "$@"
