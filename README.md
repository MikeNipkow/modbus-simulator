# Modbus Simulator

This repository contains a Modbus-TCP simulator. The system is split into a frontend software using Node.JS and a web-frontend using React. The backend offers a REST-API to allow communication to the web-frontend and other systems.

## Installation

### Docker

Prerequisites: Docker Engine installed.

1. Pull and run the backend container:

```bash
docker run -d --net=host --name=modbus-simulator-backend ghcr.io/mikenipkow/modbus-simulator-backend:latest
```

2. Pull and run the frontend container:
```bash
docker run -d -p 8080:80 --name=modbus-simulator-frontend ghcr.io/mikenipkow/modbus-simulator-frontend:latest
```

Notes:

- Use the `API_URL` environment variable to point the frontend to your backend API. If not provided, the frontend will default to `http(s)://<current-host>:3000/api/v1`.

___

### Docker Compose (recommended for development/local stacks)

Create a `docker-compose.yml` at the repository root (example below) to run frontend and backend together.

Example `docker-compose.yml`:

```yaml
version: "3.8"
services:
	backend:
		image: ghcr.io/mikenipkow/modbus-simulator-backend:latest
		ports:
			- "3000:3000"
		environment:
			- NODE_ENV=production

	frontend:
		image: ghcr.io/mikenipkow/modbus-simulator-frontend:latest
		ports:
			- "8080:80"
		environment:
			- API_URL=http://127.0.0.1:3000/api/v1
		depends_on:
			- backend
```

Run the whole stack:

```bash
docker compose up
```.
