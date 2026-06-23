# Smart Job Portal - Architecture Summary

## 1. Database Schema & Entities

### Database: `smart_job_portal`

#### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('JOB_SEEKER','RECRUITER') DEFAULT 'JOB_SEEKER',
    phone VARCHAR(15) NOT NULL,
    skills VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP AUTO_UPDATE
);
```

**Key Fields:**
- `role`: Two-tier system (JOB_SEEKER, RECRUITER)
- `skills`: Comma-separated string of user skills
- Email is unique constraint for authentication

#### Jobs Table
```sql
CREATE TABLE jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    salary VARCHAR(100),
    description TEXT,
    skills VARCHAR(500),
    recruiter_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP AUTO_UPDATE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Key Fields:**
- `skills`: Comma-separated job requirements
- `recruiter_id`: Links job to recruiter user
- No soft-delete; CASCADE delete for applications

#### Applications Table
```sql
CREATE TABLE applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    resume_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP AUTO_UPDATE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Status Values:** PENDING, (extensible for future states)

---

## 2. Backend Architecture (Spring Boot 3.5.14, Java 17)

### Project Structure
```
backend/
├── src/main/java/com/smartjobportal/backend/
│   ├── BackendApplication.java          # Spring Boot entry point
│   ├── model/
│   │   ├── User.java                    # User entity
│   │   ├── Job.java                     # Job entity
│   │   └── Application.java             # Application entity
│   ├── controller/
│   │   ├── AuthController.java          # /signup, /login
│   │   ├── JobController.java           # CRUD jobs, search
│   │   ├── ApplicationController.java   # /apply endpoint
│   │   └── DashboardController.java     # Dashboard APIs
│   ├── service/
│   │   ├── AuthService.java             # Auth logic
│   │   ├── JobService.java              # Job operations
│   │   ├── ApplicationService.java      # Application logic
│   │   └── DashboardService.java        # Dashboard data
│   ├── repository/
│   │   ├── UserRepository.java          # User DB operations
│   │   ├── JobRepository.java           # Job DB operations
│   │   └── ApplicationRepository.java   # Application DB ops
│   ├── security/
│   │   ├── JwtUtil.java                 # JWT token generation/validation
│   │   └── JwtAuthenticationFilter.java # Filter for auth checks
│   └── config/
│       ├── SecurityConfig.java          # Spring Security setup, CORS
│       └── DatabaseConfig.java          # Database configuration
└── src/main/resources/
    └── application.properties           # Config: DB, JWT, ports
```

### Data Model Classes (Lombok @Data annotations)

#### User.java
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class User {
    private Long id;
    private String name;
    private String email;
    private String password;      // Plain text (no hashing implemented)
    private String role;          // "JOB_SEEKER" or "RECRUITER"
    private String phone;
    private String skills;        // Comma-separated
}
```

#### Job.java
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class Job {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String salary;
    private String description;
    private String skills;        // Comma-separated requirements
    private Long recruiterId;
}
```

#### Application.java
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class Application {
    private Long id;
    private Long jobId;
    private Long userId;
    private String resumeLink;
    private String status;        // e.g., "PENDING"
}
```

### API Response Pattern

All APIs follow a consistent **Map-based response** format:
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": {...} or "token": "jwt-token" (for login)
}
```

### Core APIs

#### Authentication
- **POST /signup**
  - Body: `{name, email, password, role, phone, skills}`
  - Validates email uniqueness
  - Stores user with JOB_SEEKER or RECRUITER role
  - Response: `{success, message, email}`

- **POST /login**
  - Body: `{email, password}`
  - Validates credentials against DB
  - Generates JWT token with claims: userId, name, role, email
  - Response: `{success, token, user: {id, name}}`

#### Jobs Management
- **GET /jobs**
  - Public endpoint
  - Returns all jobs
  - Response: `{success, jobs: [{id, title, company, ...}]}`

- **GET /jobs/search?keyword=term**
  - Public endpoint
  - Searches by keyword
  - Response: `{success, jobs: [...]}`

- **POST /jobs** (Protected: RECRUITER only)
  - Body: `{title, company, location, salary, description, skills, recruiterId}`
  - Returns created job with generated ID
  - Response: `{success, message, job}`

- **PUT /jobs/{id}** (Protected)
  - All fields required for update
  - Response: `{success, message}`

- **DELETE /jobs/{id}** (Protected)
  - Response: `{success, message}`

#### Applications
- **POST /apply** (Protected: JOB_SEEKER)
  - Body: `{jobId, userId, resumeLink, status}`
  - Prevents duplicate applications
  - Response: `{success, message, application}`

### Authentication & Security

#### JWT Implementation (jjwt 0.11.5)

**JwtUtil.java** - Token generation and validation:
```java
// Token structure
Jwts.builder()
  .setSubject(user.getEmail())           // Username claim
  .claim("userId", user.getId())
  .claim("name", user.getName())
  .claim("role", user.getRole())
  .setIssuedAt(now)
  .setExpiration(now + jwtExpirationMillis)
  .signWith(key, SignatureAlgorithm.HS256)
  .compact()
```

**Token Claims:**
- `sub`: User email (subject)
- `userId`: User ID
- `name`: User full name
- `role`: JOB_SEEKER or RECRUITER
- `exp`: Expiration timestamp (24 hours by default)

**JwtAuthenticationFilter.java** - Request interceptor:
- Checks for `Authorization: Bearer <token>` header
- Validates token signature
- Extracts username and sets Spring Security context
- Public paths bypass auth: `/signup`, `/login`, `/jobs`, `/jobs/search`
- Protected endpoints require valid JWT

**SecurityConfig.java** - Spring Security setup:
- CORS enabled for: localhost:5173, localhost:3000 (dev ports)
- CSRF disabled (stateless API)
- Session policy: STATELESS (JWT-based)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS, PATCH

**Configuration (application.properties):**
```properties
jwt.secret=mySecretKey123456789        # HMAC key
jwt.expiration=86400000                # 24 hours in ms
spring.datasource.url=jdbc:mysql://localhost:3306/smart_job_portal
spring.datasource.username=root
spring.datasource.password=root123
```

### Repository Pattern

**UserRepository.java** - Manual JDBC (no ORM):
```java
// Direct SQL queries with PreparedStatement
public boolean saveUser(User user)
public boolean emailExists(String email)
public User getUserByEmail(String email)
```

**JobRepository.java** - Similar JDBC pattern:
```java
public long saveJob(Job job)              // Returns generated ID
public List<Job> getAllJobs()
public List<Job> searchJobs(String keyword)
public boolean updateJob(Job job)
public boolean deleteJobById(Long id)
```

**ApplicationRepository.java** - Application operations

---

## 3. Frontend Architecture (React + TypeScript, Vite)

### Stack
- **Framework**: React 19 (with TypeScript)
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Native Fetch API
-- **Backend Integration**: Backend APIs (JWT) for auth and profile storage
- **Icons**: Lucide React

### Project Structure
```
frontend/src/
├── main.tsx                    # React entry point
├── App.tsx                     # Main routing component
├── index.css                   # Global Tailwind styles
├── types/
│   └── index.ts               # TypeScript type definitions
├── contexts/
│   └── AuthContext.tsx        # Global auth state & methods
├── pages/
│   ├── HomePage.tsx
│   ├── JobDetailPage.tsx
│   ├── JobListingsPage.tsx
│   ├── ProfilePage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx      # Backend auth integration
│   │   └── SignupPage.tsx     # Backend auth integration
│   ├── recruiter/
│   │   ├── RecruiterDashboard.tsx
│   │   ├── MyJobsPage.tsx
│   │   ├── PostJobPage.tsx
│   │   └── ApplicantsPage.tsx
│   └── seeker/
│       ├── SeekerDashboard.tsx
│       ├── AppliedJobsPage.tsx
│       └── SavedJobsPage.tsx
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx # Protected layout wrapper
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── JobCard.tsx         # Job display component
│       ├── StatCard.tsx
│       ├── Pagination.tsx
│       └── EmptyState.tsx
├── data/
│   └── mock.ts                # Mock data (categories, locations)
└── lib/
  └── api.ts                 # Utility API helper functions
```

### TypeScript Interfaces (src/types/index.ts)

```typescript
export type UserRole = 'job_seeker' | 'recruiter';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  skills: string[];
  resume_url: string;
  company: string;
  avatar_url: string;
  created_at: string;
}

export type JobType = 'full-time' | 'part-time' | 'remote' | 'contract' | 'internship';

export interface Job {
  id: string | number;
  recruiter_id?: string;
  title: string;
  company: string;
  location: string;
  type?: JobType | string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string[];
  skills?: string | string[];
  category?: string;
  is_active?: boolean;
  created_at?: string;
}

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'rejected' | 'offered';

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  job?: Job;
}

export interface SavedJob {
  id: string;
  job_id: string;
  seeker_id: string;
  created_at: string;
  job?: Job;
}
```

### Authentication Context (AuthContext.tsx)

**State Management:**
```typescript
interface AuthContextType {
  user: AuthUser | null;           // {id, email}
  profile: Profile | null;         // Full user profile
  loading: boolean;
  signUp(email, password, role, fullName): Promise<{error: string|null}>;
  signIn(email, password): Promise<{error: string|null}>;
  loginWithBackend(user, profile, token?): void;  // Backend auth mapping
  signOut(): Promise<void>;
  updateProfile(updates): Promise<{error: string|null}>;
}
```

**Key Feature - Auth System:**
The context uses backend JWT authentication and supports mapping backend profiles into the frontend auth state.

**Backend Login Integration:**
```typescript
const loginWithBackend = (backendUser, backendProfile, token) => {
  // Maps backend role strings (JOB_SEEKER → job_seeker)
  // Stores token in localStorage['backendAuth']
  // Sets user and profile state
}
```

---

## 4. API Integration Pattern (Frontend ↔ Backend)

### Base Configuration
- **Backend URL**: `http://localhost:8080`
- **Frontend Dev URL**: `http://localhost:5173` (Vite)
- **CORS**: Configured on backend for localhost ports

### HTTP Calls Pattern

#### Login Example (LoginPage.tsx)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const res = await fetch('/api/login', {  // Note: /api prefix (proxy)
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  // Expected: { success: true, user: {id, name, email, role, phone, skills}, token }
  
  if (data.success) {
    localStorage.setItem('backendAuth', JSON.stringify(data));
    loginWithBackend(backendUser, backendProfile, data.token);
    navigate(roleRaw === 'JOB_SEEKER' ? '/seeker/dashboard' : '/recruiter/dashboard');
  }
}
```

#### Signup Example (SignupPage.tsx)
```typescript
const backendRole = role === 'job_seeker' ? 'JOB_SEEKER' : 'RECRUITER';
const payload = { 
  name: fullName, 
  email, 
  password, 
  role: backendRole, 
  phone, 
  skills 
};

const res = await fetch('/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const data = await res.json();
// Expected: { success: true, message, email }
```

#### Data Fetching Example (JobListingsPage.tsx)
```typescript
useEffect(() => {
  fetch('http://localhost:8080/jobs')  // Full URL (no proxy)
    .then(res => res.json())
    .then(data => {
      // Expected: { success: true, jobs: [...] }
      setJobs(data.jobs || []);
    })
    .catch(err => console.log('Error:', err));
}, []);
```

**Note:** Inconsistent URL patterns - some use `/api/` prefix (expecting Vite proxy), others use full `http://localhost:8080/` URL. This suggests incomplete proxy configuration.

### Protected Requests (with JWT)
When frontend needs to call protected endpoints (e.g., job creation):
```typescript
// Expected pattern (not yet implemented in current code):
const token = JSON.parse(localStorage.getItem('backendAuth')).token;

fetch('http://localhost:8080/jobs', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(jobData)
})
```

---

## 5. Component Patterns

### Layout Protection (DashboardLayout.tsx)
```typescript
interface DashboardLayoutProps {
  requiredRole: 'job_seeker' | 'recruiter';
}

// Validates:
// 1. User is authenticated
// 2. User has correct role
// 3. Routes unauthorized users to appropriate dashboard
export default function DashboardLayout({ requiredRole }) {
  const { user, profile, loading } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (profile?.role !== requiredRole) return <Navigate to="..." />;
}
```

### Job Card Component (JobCard.tsx)
```typescript
interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
}

// Features:
// - Dynamic skills parsing (string or array)
// - Salary formatting (min/max or fixed)
// - Type color coding
// - Save/unsave functionality
// - Posted date formatting
// - Truncated display with hover effects
```

### Form Patterns
- Controlled components with `useState`
- Client-side validation before submit
- Loading states during async operations
- Error/success message display
- Role-specific field mapping (backend → frontend)

---

## 6. Code Style & Naming Conventions

### Backend (Java)

**Package Structure:**
```
com.smartjobportal.backend
  ├── model          # Data models
  ├── controller     # REST endpoints
  ├── service        # Business logic
  ├── repository     # Data access
  ├── security       # Auth & JWT
  └── config         # Configuration
```

**Naming:**
- **Classes**: PascalCase (`UserRepository`, `AuthService`)
- **Methods**: camelCase (`getUserByEmail()`, `validateToken()`)
- **Constants**: UPPER_SNAKE_CASE (implicit - not heavily used)
- **Annotations**: `@Service`, `@Repository`, `@Component`, `@Configuration`
- **API Endpoints**: kebab-case paths (`/apply`, `/jobs/search`)

**Design Patterns:**
- **Dependency Injection**: `@Autowired` for service/repository injection
- **Lombok**: `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` for boilerplate
- **Spring Security**: Filter-based JWT authentication
- **JDBC**: Manual PreparedStatement queries (no JPA/Hibernate)

### Frontend (React + TypeScript)

**File Organization:**
```
pages/        # Page-level components (full screens)
components/   # Reusable components (UI + Layout)
contexts/     # Global state management
types/        # TypeScript interfaces
lib/          # Utility modules (e.g., api helpers)
data/         # Mock data, constants
```

**Naming:**
- **Components**: PascalCase (`JobCard.tsx`, `AuthContext.tsx`)
- **Hooks**: camelCase (`useAuth`, `useState`)
- **Variables**: camelCase (`fullName`, `selectedRole`)
- **Type Names**: PascalCase (`UserRole`, `Job`, `Profile`)
- **Files**: Match component names for modules

**Styling:**
- **CSS Framework**: Tailwind CSS utility classes
- **Color Variables**: Predefined Tailwind palette (gray, blue, emerald, etc.)
- **Responsive**: Mobile-first design with `sm:`, `lg:` breakpoints
- **Common Classes**:
  - `px-4 py-2.5` for padding
  - `rounded-lg` for border-radius
  - `border border-gray-300` for borders
  - `hover:shadow-md` for interactive states
  - `transition-colors` for smooth animations

**Component Structure:**
```typescript
interface ComponentProps {
  prop1: Type;
  prop2?: Optional;
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState(initialValue);
  const { contextData } = useContext(AuthContext);
  
  const handleEvent = (e: React.FormEvent) => {
    // Handler logic
  };
  
  return <JSX />;
}
```

---

## 7. Current Implementation Status

### ✅ Implemented
- User authentication (signup/login with JWT)
- Job CRUD operations
- Job search functionality
- Job applications (basic)
- Two-user roles (JOB_SEEKER, RECRUITER)
- Protected endpoints with JWT validation
- React routing with role-based access control
- Responsive UI with Tailwind CSS
- Context-based auth state management

### ⚠️ Partial/Notes
- Frontend uses `/api/` prefix inconsistently with direct `http://localhost:8080/` URLs
- Vite proxy configuration may be missing or incomplete
- Protected API calls from frontend don't currently include JWT tokens in Authorization header
- Password stored as plain text in DB (no hashing - security risk)
- No input sanitization or rate limiting
- Mock data still present in `JobListingsPage` for filtering

### ❌ Not Yet Implemented
- Database migrations with Flyway/Liquibase
- ORM (JPA/Hibernate) - using manual JDBC
- Request validation (Bean Validation)
- Global exception handling
- Logging framework (SLF4J)
- API documentation (Swagger/SpringDoc)
- Unit/Integration tests
- CI/CD pipeline
- Frontend token refresh logic
- Application status workflow (review → interview → offer)
- Resume upload/storage mechanism
- Saved jobs functionality
- Applicant management for recruiters
- Email notifications
- Analytics/metrics

---

## 8. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Spring Boot | 3.5.14 |
| | Java | 17 |
| | JWT (jjwt) | 0.11.5 |
| | MySQL | (via jdbc:mysql) |
| | Maven | (build tool) |
| **Frontend** | React | 19 |
| | TypeScript | (tsconfig included) |
| | Vite | (build tool) |
| | Tailwind CSS | 3 |
| | React Router | 6 |
| | Lucide React | (icons) |
| **Database** | MySQL | (via JDBC) |
| **Deployment** | TBD | - |

---

## 9. Key Integration Points

### Request Flow: Login
1. User enters credentials on LoginPage
2. Frontend calls `POST /api/login` (or direct `http://localhost:8080/login`)
3. Backend validates email/password
4. JwtUtil generates JWT with claims
5. Response: `{success, token, user: {id, name, ...}}`
6. Frontend stores in `localStorage['backendAuth']`
7. AuthContext's `loginWithBackend()` sets user/profile state
8. Navigation routes to role-specific dashboard

### Request Flow: Create Job (Protected)
1. Recruiter fills job form on PostJobPage
2. Frontend calls `POST /jobs` with job data
3. JwtAuthenticationFilter validates Authorization header (expects Bearer token)
4. SecurityConfig checks role (RECRUITER only for POST)
5. JobController receives request, validates input
6. JobService calls JobRepository.saveJob()
7. Repository executes INSERT query, returns generated ID
8. Response: `{success, message, job: {id, title, ...}}`
9. Frontend updates state/navigation

---

## 10. Development Notes

**Recommended Fixes/Improvements:**
1. Standardize API URL prefixes (use Vite proxy or full URLs consistently)
2. Add JWT token to protected request headers from frontend
3. Implement password hashing (bcrypt) before production
4. Add comprehensive error handling and validation
5. Use JPA/Hibernate instead of manual JDBC for better maintainability
6. Implement proper logging with SLF4J
7. Add unit tests for services and controllers
8. Document APIs with Swagger/OpenAPI
9. Implement role-based authorization in controllers
10. Add input sanitization and CSRF protection
11. Set up environment-specific configurations (dev, prod)
12. Consider implementing a token refresh mechanism

---

**Generated**: 2026-01-08  
**Project**: Smart Job Portal
