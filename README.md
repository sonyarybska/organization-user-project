# Organization Project

This project is a backend API for managing organizations, users, attachments, and invites. It is built with TypeScript and uses TypeORM for database interactions. The project structure is modular, separating controllers, routes, services, hooks, and types for maintainability and scalability.

## Features
- User authentication and authorization
- Organization management (create, invite, join, decline)
- Attachment upload and management (AWS S3 integration)
- Email notifications (SendGrid integration)
- Role-based access control
- Transactional operations with TypeORM

## Project Structure
- `src/api/` - API schemas and common utilities
- `src/controllers/` - Business logic for each domain
- `src/routes/` - Route definitions for Fastify
- `src/hooks/` - Fastify hooks for guards and middleware
- `src/repos/` - Database repositories
- `src/services/` - External service integrations (AWS, SendGrid, TypeORM)
- `src/types/` - Type definitions, DTOs, enums, and errors
- `migrations/` - Database migration scripts

## Getting Started

### Prerequisites
- Node.js >= 18.x
- Docker (for running database and services)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd organization-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```
4. Start services with Docker Compose:
   ```bash
   docker-compose up -d
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

