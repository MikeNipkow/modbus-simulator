# Multi-stage Dockerfile to build and run backend (Node/TypeScript) and frontend (Vite)
# Build targets:
#  - backend-builder -> builds the backend
#  - frontend-builder -> builds the frontend
#
# Final images (use `--target backend` or `--target frontend` when building):
#  docker build --target backend -t modbus-backend .
#  docker build --target frontend -t modbus-frontend .

ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS backend-builder
WORKDIR /app
COPY packages/backend /app/backend
WORKDIR /app/backend
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS frontend-builder
WORKDIR /app
COPY packages/frontend /app/frontend
WORKDIR /app/frontend
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi
RUN npm run build

FROM node:${NODE_VERSION}-slim AS backend
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/dist /usr/src/app/dist
COPY --from=backend-builder /app/backend/package*.json /usr/src/app/
RUN if [ -f package-lock.json ]; then npm ci --production --silent; else npm install --production --silent; fi
EXPOSE 3000
CMD ["node","dist/src/app.js"]

FROM nginx:stable-alpine AS frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf || true
RUN printf 'server { listen 80; server_name _; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

FROM node:${NODE_VERSION}-slim AS single
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/dist /usr/src/app/dist
COPY --from=frontend-builder /app/frontend/dist /usr/src/app/frontend
COPY --from=backend-builder /app/backend/package*.json /usr/src/app/
RUN if [ -f package-lock.json ]; then npm ci --production --silent; else npm install --production --silent; fi

# Install nginx and supervisord to run both processes in one container
RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx supervisor \
	&& rm -rf /var/lib/apt/lists/*

# Copy frontend build into nginx web root
RUN rm -rf /var/www/html/*
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Nginx config: serve SPA and proxy API requests to backend on port 3000
RUN printf 'server { listen 80; server_name _; root /var/www/html; index index.html; location /api/ { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; } location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/sites-available/default

# Supervisor config: start nginx and node
RUN mkdir -p /etc/supervisor/conf.d
RUN printf '[supervisord]\n[nodaemon]\n' > /etc/supervisor/supervisord.conf
RUN printf '[program:nginx]\ncommand=/usr/sbin/nginx -g "daemon off;"\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstderr_logfile=/dev/stderr\n\n' >> /etc/supervisor/supervisord.conf
RUN printf '[program:backend]\ncommand=node dist/src/app.js\nautostart=true\nautorestart=true\nstdout_logfile=/dev/stdout\nstderr_logfile=/dev/stderr\n' >> /etc/supervisor/supervisord.conf

EXPOSE 3000 80
CMD ["/usr/bin/supervisord","-n","-c","/etc/supervisor/supervisord.conf"]
