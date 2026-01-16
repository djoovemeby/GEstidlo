# GEstidlo

GEstidlo is a modern application built with a microservices-inspired architecture, featuring a Camunda 7 Process Engine, Spring Boot microservices, and an Angular frontend.

## 🏗️ Architecture Overiew

The project is structured as a monorepo with the following services:

| Service            | Path                     | Port     | Description                                        |
| :----------------- | :----------------------- | :------- | :------------------------------------------------- |
| **Camunda Engine** | `backend/camunda-engine` | **9080** | Core BPMN Process Engine (Camunda 7.22).           |
| **Camunda API**    | `backend/camunda-api`    | **9081** | Abstraction layer / Facade for the Process Engine. |
| **API Metier**     | `backend/api-metier`     | **9082** | Domain/Business Logic service.                     |
| **BFF**            | `frontend/bff`           | **9083** | Backend-for-Frontend (Aggregation & Security).     |
| **SPA**            | `frontend/spa`           | **4200** | Single Page Application (Angular 18).              |

## 🚀 Getting Started

### Prerequisites

- **Java 17** (Required for Spring Boot 3.2.0 compatibility)
- **Node.js 18+** & **npm**
- **Maven 3.8+**

### Quick Start

To build and start all services simultaneously, run the orchestration script from the root directory:

```bash
./start-all.sh
```

This script will:

1. Build all backend projects (skipping tests for speed).
2. Start the 4 Spring Boot microservices in the background.
3. Serve the Angular frontend.

> **Note**: Press `ENTER` in the terminal to stop all services gracefully.

## 🔑 Access & Credentials

### Camunda Cockpit

- **URL**: [http://localhost:9080/camunda/app/cockpit/default/](http://localhost:9080/camunda/app/cockpit/default/)
- **Username**: `admin`
- **Password**: `admin`

### Frontend Application

- **URL**: [http://localhost:4200](http://localhost:4200)

### API Documentation (OpenAPI/Swagger)

Services with `springdoc-openapi` enabled can be accessed at:

- Camunda API: `http://localhost:9081/swagger-ui.html`
- API Metier: `http://localhost:9082/swagger-ui.html`

## 📂 Project Structure

```
GEstidlo/
├── backend/            # Backend Microservices
│   ├── camunda-engine  # Process Engine & DB config
│   ├── camunda-api     # Wrappers & APIs
│   └── api-metier      # Business Logic
├── frontend/           # Frontend Code
│   ├── bff             # Backend for Frontend Pattern
│   └── spa             # Angular Frontend
├── postman/            # Postman Collections & Environment
└── start-all.sh        # Startup Orchestration Script
```

## 🛠️ Development & Testing

### Postman

A set of Postman collections is available in the `postman/` directory.

1. Import `GEstidlo_Local_Env.json` as your Environment.
2. Import the collection files (`*.json`).
3. Select the "GEstidlo - Local Dev" environment to auto-configure ports.

### H2 Database

For local development, an in-memory H2 database is used.

- **Console**: [http://localhost:9080/h2-console](http://localhost:9080/h2-console)
- **JDBC URL**: `jdbc:h2:mem:camunda-db`
- **User**: `sa`
- **Password**: _(empty)_
