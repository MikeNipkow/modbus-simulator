FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

COPY . .
RUN npm run typegen
RUN npm run build

FROM nginx:stable-alpine AS production

RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf || true
RUN printf 'server { listen 80; server_name _; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

COPY docker-entrypoint.d/99-runtime-config.sh /docker-entrypoint.d/99-runtime-config.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/99-runtime-config.sh && chmod +x /docker-entrypoint.d/99-runtime-config.sh

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
