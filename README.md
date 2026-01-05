# Real-Time Task Board

Real-Time Task Board is a NestJS backend project that implements JWT authentication, role-based authorization, task management, and real-time updates via WebSockets, following clean, production-oriented backend architecture.

---

## Deployment Architecture

The application is **containerized with Docker** and deployed on a **VPS**, running behind an **Nginx reverse proxy**.

### Request Flow (Client to Application)

**Step 1: Client Request**

* Client sends HTTP or WebSocket requests to the public domain.

**Step 2: Nginx Reverse Proxy**

* Terminates SSL.
* Routes HTTP traffic to the NestJS API container.
* Proxies WebSocket connections correctly.
* Applies server-level security and rate limiting rules.

**Step 3: NestJS Application**

* Handles REST APIs (tasks, auth, files).
* Manages WebSocket gateways for real-time events.
* Applies JWT authentication and role-based authorization.
* Emits domain events from services (not controllers).

**Step 4: Data & Infrastructure Layer**

* PostgreSQL:

  * Stores users, roles, tasks, assignments, comments, and file metadata.
* Redis:

  * WebSocket adapter.
  * Rate limiting.
  * Shared in-memory coordination.

---

## Core Features

* JWT Authentication.
* Role-based authorization (Admin / User).
* Task CRUD with strict permission rules.
* Task assignments (many-to-many).
* Task comments.
* File uploads (images & PDFs).
* Real-time updates using WebSockets (Socket.IO).
* Redis adapter for scalable WebSocket communication.
* Redis-backed rate limiting.
* Nodemailer integration for emails.
* Fully Dockerized setup.
* Deployed on VPS behind Nginx reverse proxy.

---

## Authorization Model

### Roles

| Role  | Capabilities                   |
| ----- | ------------------------------ |
| ADMIN | Full system access             |
| USER  | Limited task-level permissions |

### Rules

**Admin**

* Can create, update, delete any task.
* Can assign tasks to any user.
* Can view all tasks.

**User**

* Can create tasks.
* Can update tasks only if:

  * They created the task, or
  * They are assigned to the task.
* Cannot delete tasks created by others.
* Cannot manage users or roles.

Authorization is enforced using **NestJS Guards and policies**, not controller-level conditionals.

---

## Real-Time Communication

The system uses **WebSockets (Socket.IO)** to keep all connected clients synchronized.

### Events Emitted

| Event Name    | Trigger               |
| ------------- | --------------------- |
| task.created  | Task creation         |
| task.updated  | Task update           |
| task.deleted  | Task deletion         |
| file.uploaded | File attached to task |

Important architectural rule:

* Controllers never emit WebSocket events.
* Events are emitted from services after successful business logic execution.

---

## Technologies Used

| Technology | Purpose                           |
| ---------- | --------------------------------- |
| NestJS     | Backend framework                 |
| Prisma     | ORM & schema management           |
| PostgreSQL | Relational database               |
| Redis      | WebSocket adapter & rate limiting |
| Socket.IO  | Real-time communication           |
| Docker     | Containerization                  |
| Nginx      | Reverse proxy & SSL termination   |
| Nodemailer | Email delivery                    |


---

## Demo

* API Documentation (Swagger): *Coming Soon*
* Postman Collection: *Coming Soon*
