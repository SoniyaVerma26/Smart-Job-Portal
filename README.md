# Job Portal Project

## Project Overview

**Problem Statement**
This project addresses the need for a connected job marketplace where recruiters can publish roles and job seekers can discover, apply, and manage applications.

**Business Purpose**
It provides a modern job portal experience with recruiter and seeker workflows, centralized job posting, application submission, and a lightweight dashboard for both user types.

**Target Users**
- Job seekers looking for new roles
- Recruiters hiring candidates
- Product owners evaluating a job portal MVP

**Key Features**
- User sign-up and login
- Job browsing and search
- Recruiter job posting
- Job application submission
- Dashboard summaries for seekers and recruiters
- User profile management via Supabase

## Features

### Job Seeker Features
- Browse and search jobs
- View job details and apply
- See applications for the authenticated user
- Edit personal profile and skills
- Saved jobs UI available in the frontend

### Recruiter Features
- Post new jobs with details, requirements, and skills
- View posted jobs in `My Jobs`
- Dashboard summary showing active roles and application counts
- Candidates view via recruiter dashboard

### Authentication & Authorization
- Backend signup and login endpoints
- JWT token generation with HS256
- Spring Security filter chain protecting API routes
- Supabase authentication and profile storage on the frontend
- Role-based frontend routing for `job_seeker` and `recruiter`

### Job Management
- Create, read, update, and delete jobs
- Search jobs by keyword over title, company, location, and skills
- Recruiters store jobs with recruiter association

### Application Tracking
- Submit applications with resume link and cover letter
- Prevent duplicate applications per user and job
- Fetch applications for a specific user
- Dashboard status counts for user applications

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase JS
- Lucide React icons

### Backend
- Spring Boot 3.5.14
- Java 17
- Spring Web
- Spring Data JPA
- Spring Security
- JWT (`jjwt`)
- Lombok

### Database
- MySQL
- JPA entities mapped to `users`, `jobs`, `applications`
- Schema managed with `schema.sql`

### Security
- JWT token creation and validation in `JwtUtil`
- `JwtAuthenticationFilter` secures authenticated endpoints
- CORS configured for localhost frontends
- Stateless session management

### Tools
- Maven wrapper (`mvnw`, `mvnw.cmd`)
- npm / Vite frontend scripts
- ESLint for frontend linting
- Tailwind CSS for styling

### Cloud & DevOps
- Backend Dockerfile present under `backend/Dockerfile`
- No Kubernetes manifests found
- No Azure deployment configuration found

## System Architecture

### Frontend → Backend → Database flow
- User interacts with React UI
- Frontend uses Supabase for auth and profile state
- Backend APIs handle jobs, applications, and dashboards
- Backend persists data to MySQL via JPA

### Controller → Service → Repository architecture
- Controllers receive HTTP requests
- Services implement business logic
- Repositories execute JPA queries against the database
- Example:
  - `JobController` → `JobService` → `JobRepository`
  - `ApplicationController` → `ApplicationService` → `ApplicationRepository`

### JWT authentication flow
1. User submits credentials to `POST /login`
2. Backend validates credentials via `AuthService`
3. On success, `JwtUtil` issues a JWT
4. Frontend stores token in `localStorage`
5. Protected API requests include `Authorization: Bearer <token>`
6. `JwtAuthenticationFilter` validates the token for secured routes

## Database Design

### Entities
- `User`
- `Job`
- `Application`

### Relationships
- `jobs.recruiter_id` → `users.id`
- `applications.job_id` → `jobs.id`
- `applications.user_id` → `users.id`

### Purpose of each table
- `users`
  - Stores registered users, including role, contact and skills
- `jobs`
  - Stores job postings and recruiter ownership
- `applications`
  - Stores user applications to job postings, resume link, status, and cover letter

## REST API Documentation

### `POST /signup`
- Purpose: Register a new user
- Authentication Required: No

### `POST /login`
- Purpose: Authenticate a user and return JWT
- Authentication Required: No

### `GET /jobs`
- Purpose: List all jobs
- Authentication Required: No

### `GET /jobs/search?keyword=...`
- Purpose: Search jobs by keyword
- Authentication Required: No

### `POST /jobs`
- Purpose: Create a new job posting
- Authentication Required: Yes

### `PUT /jobs/{id}`
- Purpose: Update an existing job
- Authentication Required: Yes

### `DELETE /jobs/{id}`
- Purpose: Delete an existing job
- Authentication Required: Yes

### `POST /apply`
- Purpose: Submit an application for a job
- Authentication Required: Yes

### `GET /applications/user/{userId}`
- Purpose: Get applications for a specific user
- Authentication Required: Yes

### `GET /recruiter/dashboard/{recruiterId}`
- Purpose: Get recruiter dashboard metrics
- Authentication Required: Yes

### `GET /user/dashboard/{userId}`
- Purpose: Get job seeker dashboard metrics
- Authentication Required: Yes

## Project Structure

```
Job Portal Project/
├── APPLICATION_FIXES_CODE_CHANGES.md
├── APPLICATION_MODULE_TEST_GUIDE.md
├── APPLY_JOB_IMPLEMENTATION.md
├── ARCHITECTURE_SUMMARY.md
├── QUICK_REFERENCE.md
├── backend/
│   ├── Dockerfile
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── schema.sql
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartjobportal/backend/
│   │   │   │   ├── BackendApplication.java
│   │   │   │   ├── config/SecurityConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── JobController.java
│   │   │   │   │   ├── ApplicationController.java
│   │   │   │   │   └── DashboardController.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Job.java
│   │   │   │   │   └── Application.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── JobRepository.java
│   │   │   │   │   └── ApplicationRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── JwtUtil.java
│   │   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   │   └── service/
│   │   │   │       ├── AuthService.java
│   │   │   │       ├── JobService.java
│   │   │   │       ├── ApplicationService.java
│   │   │   │       └── DashboardService.java
│   │   └── resources/
│   │       └── application.properties
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── layout/DashboardLayout.tsx
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── layout/Sidebar.tsx
│   │   │   ├── ui/EmptyState.tsx
│   │   │   ├── ui/JobCard.tsx
│   │   │   ├── ui/Pagination.tsx
│   │   │   └── ui/StatCard.tsx
│   │   ├── contexts/AuthContext.tsx
│   │   ├── lib/api.ts
│   │   ├── lib/supabase.ts
│   │   ├── hooks/useApplication.ts
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.tsx
│   │   │   ├── auth/SignupPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── JobListingsPage.tsx
│   │   │   ├── JobDetailPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── recruiter/RecruiterDashboard.tsx
│   │   │   ├── recruiter/PostJobPage.tsx
│   │   │   ├── recruiter/MyJobsPage.tsx
│   │   │   ├── recruiter/ApplicantsPage.tsx
│   │   │   ├── seeker/SeekerDashboard.tsx
│   │   │   ├── seeker/AppliedJobsPage.tsx
│   │   │   ├── seeker/MyApplicationsPage.tsx
│   │   │   └── seeker/SavedJobsPage.tsx
│   │   ├── types/index.ts
│   │   └── data/mock.ts
```

## Installation & Setup Guide

### Prerequisites
- Java 17
- Maven
- Node.js and npm
- MySQL database
- Git

### Database Setup
1. Create a MySQL database named `smart_job_portal`
2. Run `backend/schema.sql` to create tables and sample data
3. Confirm `backend/src/main/resources/application.properties` contains your MySQL settings

### Backend Setup
```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
- `frontend/.env`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- `backend/src/main/resources/application.properties`
  - `jwt.secret`
  - `jwt.expiration`
  - `spring.datasource.url`
  - `spring.datasource.username`
  - `spring.datasource.password`

### Run Commands
- Backend build: `./mvnw clean package`
- Backend run: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
- Frontend dev: `npm run dev`
- Frontend build: `npm run build`

## Docker Setup
- Backend Dockerfile exists at `backend/Dockerfile`
- Build backend image:
```bash
docker build -t job-portal-backend backend/
```
- Run backend container:
```bash
docker run -p 8080:8080 job-portal-backend
```

## Kubernetes Setup
Not Implemented

## Azure Deployment
Not Implemented

## Screenshots Section
- ![Homepage](screenshots/homepage.png)
- ![Job Listings](screenshots/job-listings.png)
- ![Job Detail](screenshots/job-detail.png)
- ![Recruiter Dashboard](screenshots/recruiter-dashboard.png)

## Future Enhancements
- Implement persistent saved jobs and recruiter applicant management
- Add proper frontend/backend session consistency for Supabase and JWT
- Add full CRUD pages for jobs, applications, and profiles
- Add Kubernetes manifests and Azure deployment pipelines

## Resume Highlights
- Designed and implemented a full-stack job portal using React, TypeScript, Spring Boot, MySQL, and JWT-based authentication
- Built RESTful backend APIs for jobs, applications, dashboards, and authentication with Spring Security and JPA
- Integrated Supabase authentication and profile persistence with a Vite-based React frontend
- Implemented role-aware UI routes and dashboards for job seekers and recruiters

## Interview Preparation

### Spring Boot Questions
- How do you configure a `SecurityFilterChain` in Spring Boot 3?
- What is the difference between `@RestController` and `@Controller`?
- How does `@SpringBootApplication` bootstrap a Spring Boot app?
- When should `spring.jpa.hibernate.ddl-auto=update` be used or avoided?

### Hibernate/JPA Questions
- How do JPA repository query methods like `findAllByOrderByIdDesc()` work?
- What is the purpose of `@ManyToOne(fetch = FetchType.LAZY)`?
- How do `@JoinColumn` and `insertable = false, updatable = false` behave together?
- Why would you use `@JsonIgnoreProperties` on JPA entities?

### JWT Questions
- How does a JWT token get generated and validated in the backend?
- What is the role of `Authorization: Bearer <token>` in API requests?
- Why must JWT secrets be at least 32 bytes for HS256?
- How do you handle expired or invalid JWTs in a filter chain?

### SQL Questions
- What tables are required for a job portal schema?
- How do foreign key relationships support recruiter and application workflows?
- What does `ON DELETE CASCADE` do for application records?
- Why is indexing important for search or join columns?

### Docker Questions
- How do you build a Docker image from a `Dockerfile`?
- What is the purpose of `ENTRYPOINT ["java","-jar","/app.jar"]`?
- How do you expose port `8080` from a container to localhost?
- What would you add to containerize the frontend app?

### Azure Questions
- Not Implemented

