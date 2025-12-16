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
