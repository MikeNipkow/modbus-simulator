## Backend Dockerfile (Node + TypeScript)
# Multi-stage build: build TypeScript, then produce a runtime image
ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# copy package files and install deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# copy source and build
COPY . .
RUN npm run build

## Runtime image
FROM node:${NODE_VERSION}-slim AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production

# copy built artifacts and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# install only production deps
RUN if [ -f package-lock.json ]; then npm ci --production --silent; else npm install --production --silent; fi

EXPOSE 3000
CMD ["node","dist/src/app.js"]
