# Job Portal Project

## Overview

A full-stack job portal MVP with recruiter and seeker workflows.
Recruiters can post jobs, track candidates, and view dashboard insights.
Job seekers can browse openings, apply, and manage their applications.

## Key Features

- User registration and login
- Role-based recruiter and job seeker workflows
- Job search, listing, details, and application submission
- Recruiter job creation, editing, and deletion
- Applicant tracking and dashboard metrics
- Resume upload and profile management
- JWT-based authentication for protected APIs
- Backend powered by Spring Boot and MySQL
- Frontend built with React, TypeScript, Vite, and Tailwind CSS

## Technology Stack

### Backend
- Spring Boot 3.5.14
- Java 17
- Spring Web
- Spring Security
- Spring Data JPA
- JWT using `jjwt`
- Lombok
- MySQL database

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React icons

### Tools
- Maven wrapper: `./mvnw`, `./mvnw.cmd`
- npm
- ESLint
- Docker (backend image available)

## Repository Layout

- `backend/` — Spring Boot backend service
  - `pom.xml` — Maven dependencies and build
  - `src/main/java` — Java source code
  - `src/main/resources/application.properties` — database and JWT config
  - `schema.sql` — database schema and initial data
  - `Dockerfile` — backend container image build

- `frontend/` — React frontend client
  - `package.json` — frontend dependencies and scripts
  - `package-lock.json` — installed dependencies lockfile
  - `tsconfig.json` — TypeScript configuration
  - `vite.config.ts` — Vite configuration
  - `src/` — React application source files

## Backend Endpoints

- `POST /signup` — register a new user
- `POST /login` — authenticate and return JWT
- `GET /jobs` — retrieve job listings
- `GET /jobs/search?keyword=...` — search jobs
- `POST /jobs` — create a new job posting
- `PUT /jobs/{id}` — update an existing job posting
- `DELETE /jobs/{id}` — delete a job posting
- `POST /apply` — submit a job application
- `GET /applications/user/{userId}` — list applications for a user
- `GET /recruiter/dashboard/{recruiterId}` — recruiter dashboard metrics
- `GET /user/dashboard/{userId}` — job seeker dashboard metrics
- `PUT /users/{userId}` — update user profile
- `POST /users/{userId}/resume` — upload PDF resume and update user profile
- `GET /users/{userId}` — fetch user profile

## Architecture

Frontend (React + TypeScript + Vite)
↓
REST APIs
↓
Spring Boot + Spring Security + JWT
↓
MySQL Database

## Setup Guide

### Prerequisites
- Java 17
- Maven or the included Maven wrapper
- Node.js and npm
- MySQL
- Git

### Database Setup
1. Create a MySQL database named `smart_job_portal`.
2. Execute `backend/schema.sql` to create tables and seed sample data.
3. Update `backend/src/main/resources/application.properties` with your database credentials.

### Run Backend
```powershell
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Run Frontend
```powershell
cd frontend
npm install
npm run dev
```

### Configuration Notes
- `backend/src/main/resources/application.properties` contains:
  - `jwt.secret`
  - `jwt.expiration`
  - `spring.datasource.url`
  - `spring.datasource.username`
  - `spring.datasource.password`
- `frontend/.env` is currently available but empty by default.

## Docker

Build backend Docker image:
```powershell
docker build -t job-portal-backend backend/
```
Run backend container:
```powershell
docker run -p 8080:8080 job-portal-backend
```

## Notes
- The application uses JWT authentication for protected routes.
- The frontend communicates with backend APIs for auth and user profile state.
- `spring.jpa.hibernate.ddl-auto=update` is enabled in development; avoid using this with production databases without review.

## Future Improvements
- Add frontend containerization and deployment pipeline
- Add Kubernetes manifests and CI/CD automation
- Implement persistent saved jobs and recruiter applicant management
- Add richer search filters and advanced applicant management

## Contributing
Contributions, issues, and feature requests are welcome.

Please open an issue or submit a pull request.
