# Modbus-Simulator

This repository contains a **Modbus-TCP simulator**.

The system is split into a backend software using Node.JS and a web-frontend using React. The backend offers a **REST-API** to allow communication to the web-frontend and other systems.

## Features
- Server-side installation using **Docker**
- **JSON template** files can be up- and downloaded
- Communication **logging**
- **Multiple Unit-IDs** per server
- Value **simulation** within a specific range
- Define **feedback datapoints** (change feedback value on write-request to another datapoint)
- Supported **function codes**:
  - 01: Read Coils
  - 02: Read Discrete Inputs
  - 03: Read Holding Registers
  - 04: Read Input Registers
  - 05: Write single Coil
  - 06: Write single Register
  - 15: Write multiple Coils
  - 16: Write multiple Registers
- Supported **data types**:
  - Bool
  - Byte
  - Int16
  - Int32
  - Int64
  - UInt16
  - UInt32
  - UInt64
  - Float32
  - Float64
  - ASCII

## Installation

### Docker

Prerequisites: Docker Engine installed.

1. Run backend container:

```bash
docker run -d --net=host --name=modbus-simulator-backend ghcr.io/mikenipkow/modbus-simulator-backend:latest
```
*OR*
```bash
docker run -d -p 3000:3000 -p 502:502 -p 503:503 --name=modbus-simulator-backend ghcr.io/mikenipkow/modbus-simulator-backend:latest
```

2. Run frontend container
```bash
docker run -d -p 8080:80 --name=modbus-simulator-frontend ghcr.io/mikenipkow/modbus-simulator-frontend:latest
```

Notes:

- Using `--net=host` you **do not need to expose every port individually**, which allows you to run multiple servers with different ports without requiring additional configuration. Keep in mind that this may lead to address conflicts on your machine.
- Use the `-e API_URL=http://127.0.0.1:3000/api/v1` environment variable to point the frontend to your backend API, if you do not use port 3000 or if the backend container is running on a different address. If not provided, the frontend will default to `http://<current-host>:3000/api/v1`.

___

### Docker Compose (recommended)

Create a `docker-compose.yml` at the repository root (example below) to run frontend and backend together.

Example `docker-compose.yml`:

```yaml
version: "3.8"
services:
  backend:
    container_name: modbus-simulator-backend
    image: ghcr.io/mikenipkow/modbus-simulator-backend:latest
    network_mode: host
    environment:
      - NODE_ENV=production

  frontend:
    container_name: modbus-simulator-frontend
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
docker compose up -d
```
