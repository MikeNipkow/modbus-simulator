# Modbus Simulator

This repository contains a Modbus simulator with a backend and a frontend. Below are concise installation instructions for running the frontend and backend using Docker and docker-compose.

## Docker (single-container build and run)

Prerequisites: Docker Engine installed.

Build and run the frontend image locally:

```bash
cd packages/frontend
docker build -t modbus-frontend:latest .
docker run -e API_URL=http://api.example.com:3000/api/v1 -p 8080:80 modbus-frontend:latest
```

Notes:

- Use the `API_URL` environment variable to point the frontend to your backend API. If not provided, the frontend will default to `http(s)://<current-host>:3000/api/v1`.
- To build multi-arch images (amd64 + armv7) and push to a registry, use `docker buildx` with `--platform linux/amd64,linux/arm/v7 --push`.

## Docker Compose (recommended for development/local stacks)

Create a `docker-compose.yml` at the repository root (example below) to run frontend and backend together.

Example `docker-compose.yml`:

```yaml
version: "3.8"
services:
	backend:
		image: your-registry/modbus-backend:latest
		ports:
			- "3000:3000"
		environment:
			- NODE_ENV=production

	frontend:
		build:
			context: ./packages/frontend
			dockerfile: Dockerfile
		ports:
			- "8080:80"
		environment:
			- API_URL=http://backend:3000/api/v1
		depends_on:
			- backend
```

Run the whole stack:

```bash
docker compose up --build
```

Notes:

- On Docker Desktop, `docker compose` is the preferred command (`docker-compose` is also supported if installed).
- The frontend reads `API_URL` at container start and writes a small `env-config.js` consumed by the app.

## Useful commands

Build only frontend image:

```bash
cd packages/frontend
docker build -t <your-repo>/modbus-frontend:latest .
```

Build and push multi-arch image (example):

```bash
docker buildx create --name mybuilder --use
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx build --platform linux/amd64,linux/arm/v7 -t <your-repo>/modbus-frontend:latest --push .
```

Run frontend container with custom API:

```bash
docker run -e API_URL=http://api.example.com:3000/api/v1 -p 8080:80 <your-repo>/modbus-frontend:latest
```

## Kubernetes / CI

In Kubernetes or CI, set the `API_URL` environment variable in the deployment manifest or pipeline environment. For multi-arch images use `docker buildx` in CI or GitHub Actions to publish a manifest list.

---

If you want, I can add a ready-made `docker-compose.yml` into the repo or a GitHub Actions workflow to build and push multi-arch images.
