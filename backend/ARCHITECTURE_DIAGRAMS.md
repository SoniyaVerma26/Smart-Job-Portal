# JDBC Signup API - Architecture Diagram & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                  (Postman / cURL / Frontend)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP POST /signup (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                              │
│                  AuthController.java                             │
│                                                                   │
│  @RestController                                                 │
│  @PostMapping("/signup")                                         │
│  public ResponseEntity<Map> signup(@RequestBody User user)       │
│                                                                   │
│  ├─ Receives HTTP Request                                        │
│  ├─ Converts JSON to User object (Spring auto-converts)          │
│  ├─ Calls AuthService.signup()                                   │
│  └─ Returns ResponseEntity with JSON response                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
│                   AuthService.java                               │
│                                                                   │
│  @Service (Business Logic)                                       │
│  public Map<String, Object> signup(User user)                    │
│                                                                   │
│  ├─ Validate name (required, non-empty)                          │
│  ├─ Validate email (required, non-empty)                         │
│  ├─ Validate password (required, non-empty)                      │
│  ├─ Validate role (required)                                     │
│  ├─ Validate phone (required)                                    │
│  ├─ Check if email already exists                                │
│  ├─ Set default role if RECRUITER, else JOB_SEEKER             │
│  ├─ Call UserRepository.saveUser()                               │
│  └─ Return response map (success/error message)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                               │
│                  UserRepository.java                             │
│                                                                   │
│  @Repository (Data Access)                                       │
│                                                                   │
│  Methods:                                                         │
│  ├─ saveUser(User user)                                          │
│  │  └─ INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)              │
│  │     Using PreparedStatement (prevents SQL injection)          │
│  │                                                               │
│  ├─ emailExists(String email)                                    │
│  │  └─ SELECT COUNT(*) FROM users WHERE email = ?               │
│  │                                                               │
│  └─ getUserByEmail(String email)                                 │
│     └─ SELECT * FROM users WHERE email = ?                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE CONFIG LAYER                          │
│                 DatabaseConfig.java                              │
│                                                                   │
│  @Configuration                                                  │
│  ├─ Reads application.properties                                 │
│  ├─ Creates HikariDataSource bean                                │
│  │  ├─ Max pool size: 10 connections                             │
│  │  └─ Min idle: 5 connections                                   │
│  └─ Provides DataSource to repository layer                      │
│     (Connection pooling for performance)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                               │
│                      MySQL 8.0+                                  │
│                  smart_job_portal database                       │
│                                                                   │
│  Table: users                                                    │
│  ├─ id (BIGINT, Primary Key, Auto Increment)                     │
│  ├─ name (VARCHAR 100, NOT NULL)                                 │
│  ├─ email (VARCHAR 100, NOT NULL, UNIQUE) ← Index               │
│  ├─ password (VARCHAR 255, NOT NULL)                             │
│  ├─ role (VARCHAR 50, DEFAULT 'JOB_SEEKER')                      │
│  ├─ phone (VARCHAR 15, NOT NULL)                                 │
│  ├─ skills (VARCHAR 500)                                         │
│  ├─ created_at (TIMESTAMP)                                       │
│  └─ updated_at (TIMESTAMP)                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow

```
1. CLIENT REQUEST
   ────────────────────────────────────────────
   POST /signup HTTP/1.1
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123",
     "role": "JOB_SEEKER",
     "phone": "9876543210",
     "skills": "Java, Spring Boot"
   }


2. SPRING PROCESSES REQUEST
   ────────────────────────────────────────────
   DispatcherServlet receives request
           ↓
   DispatcherServlet routes to AuthController
           ↓
   Spring binds JSON to User object (Jackson)
           ↓
   @PostMapping method invoked


3. CONTROLLER PROCESSES
   ────────────────────────────────────────────
   AuthController.signup(User user)
           ↓
   Calls authService.signup(user)
           ↓
   Receives Map<String, Object> response


4. SERVICE PROCESSES
   ────────────────────────────────────────────
   AuthService.signup(User user)
           ↓
   Validate each field
           ↓
   Check userRepository.emailExists(email)
           ↓
   If valid: Call userRepository.saveUser(user)
           ↓
   Prepare response map
           ↓
   Return map to controller


5. REPOSITORY PROCESSES
   ────────────────────────────────────────────
   UserRepository.saveUser(User user)
           ↓
   Get Connection from DataSource (HikariPool)
           ↓
   Create PreparedStatement with SQL
           ↓
   Bind parameters using setString()
           ↓
   Execute update: executeUpdate()
           ↓
   Return boolean (rows affected > 0)
           ↓
   Close PreparedStatement & Connection (auto)


6. DATABASE PROCESSES
   ────────────────────────────────────────────
   MySQL receives INSERT query
           ↓
   Validates constraints (UNIQUE email, NOT NULL)
           ↓
   Inserts row into users table
           ↓
   Auto-increments id
           ↓
   Returns success/failure


7. RESPONSE FLOW
   ────────────────────────────────────────────
   Service returns response map
           ↓
   Controller creates ResponseEntity
           ↓
   Spring converts map to JSON (Jackson)
           ↓
   HTTP status code: 201 (Created) or 400 (Bad Request)
           ↓
   Sends response to client


8. CLIENT RECEIVES RESPONSE
   ────────────────────────────────────────────
   HTTP/1.1 201 Created
   Content-Type: application/json
   
   {
     "success": true,
     "message": "User registered successfully",
     "email": "john@example.com"
   }
```

---

## Data Flow Diagram

```
┌──────────────┐
│ JSON Request │
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│ Spring Boot             │
│ DispatcherServlet       │
└──────┬──────────────────┘
       │ Routes to
       ▼
┌─────────────────────────┐
│ AuthController          │
│                         │
│ @PostMapping("/signup") │
└──────┬──────────────────┘
       │ Calls
       ▼
┌─────────────────────────┐
│ AuthService             │
│                         │
│ - Validates fields      │
│ - Checks duplicates     │
└──────┬──────────────────┘
       │ Calls
       ▼
┌─────────────────────────┐
│ UserRepository          │
│                         │
│ - saveUser()            │
│ - emailExists()         │
│ - getUserByEmail()      │
└──────┬──────────────────┘
       │ Uses
       ▼
┌─────────────────────────┐
│ DataSource              │
│ (HikariCP Pool)         │
│ Max: 10 connections     │
└──────┬──────────────────┘
       │ Gets connection
       ▼
┌─────────────────────────┐
│ MySQL Connection        │
│ (from pool)             │
└──────┬──────────────────┘
       │ Executes
       ▼
┌─────────────────────────┐
│ PreparedStatement       │
│                         │
│ INSERT INTO users       │
│ VALUES (?, ?, ?, ?)     │
└──────┬──────────────────┘
       │ Sends to
       ▼
┌─────────────────────────┐
│ MySQL Database          │
│                         │
│ smart_job_portal DB     │
│ users table             │
└──────┬──────────────────┘
       │ Returns result
       ▼
┌─────────────────────────┐
│ Response (success/fail) │
│ Flows back through      │
│ layers                  │
└──────┬──────────────────┘
       │
       ▼
┌──────────────┐
│ JSON Response│
│ HTTP 201/400 │
└──────────────┘
```

---

## Dependency Injection Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SPRING CONTAINER                          │
│                    (IoC Container)                            │
└─────────────────────────────────────────────────────────────┘

        ↓ Creates Beans

┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│ DatabaseConfig   │  │ UserRepository   │  │ AuthService  │
│ Bean             │  │ Bean             │  │ Bean         │
│ ↓                │  │ ↓                │  │ ↓            │
│ DataSource       │  │ Injects          │  │ Injects      │
│ (HikariCP)       │  │ @Autowired       │  │ @Autowired   │
│                  │  │ DataSource       │  │ UserRepo     │
└──────────────────┘  │                  │  │              │
        ▲             │                  │  │              │
        │             └──────────────────┘  └──────────────┘
        │                     ▲                     ▲
        └─────────────────────┴─────────────────────┘
                    (Dependencies)

        ↓ Injection into Controller

┌─────────────────────────────────────────────┐
│        AuthController Bean                  │
│        ↓                                    │
│        @Autowired private AuthService       │
│                                             │
│        authService = (instance) ────────────┼──→ Uses AuthService
└─────────────────────────────────────────────┘
```

---

## Exception Handling Flow

```
┌─────────────────────────────────────┐
│ Signup Request                       │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────────┐
        │ Validate Name   │
        └────┬────────┬───┘
             │        │
          Valid    ❌ Empty
             │        │
             │        ▼
             │   Return 400
             │   "Name is required"
             │
             ▼
        ┌─────────────────┐
        │ Validate Email  │
        └────┬────────┬───┘
             │        │
          Valid    ❌ Empty/Invalid
             │        │
             │        ▼
             │   Return 400
             │   "Email is required"
             │
             ▼
        ┌─────────────────────────────┐
        │ Check Email Uniqueness      │
        └────┬────────────────────┬───┘
             │                   │
          Unique         ❌ Already exists
             │                   │
             │                   ▼
             │              Return 400
             │              "Email already registered"
             │
             ▼
        ┌─────────────────┐
        │ Save to DB      │
        └────┬────────┬───┘
             │        │
          Success  ❌ SQL Error
             │        │
             │        ▼
             │   Return 500
             │   Exception logged
             │
             ▼
        Return 201
        "User registered successfully"
```

---

## JDBC Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│ JDBC Operation Lifecycle                                   │
└────────────────────────────────────────────────────────────┘

1. GET CONNECTION
   ┌─────────────────────────────────┐
   │ dataSource.getConnection()      │
   │                                 │
   │ Retrieves from HikariPool       │
   │ or creates new if none available│
   └─────────────────────────────────┘

2. CREATE PREPARED STATEMENT
   ┌─────────────────────────────────┐
   │ connection.prepareStatement(sql)│
   │                                 │
   │ SQL: INSERT INTO users VALUES   │
   │      (?, ?, ?, ?, ?, ?)         │
   └─────────────────────────────────┘

3. BIND PARAMETERS
   ┌─────────────────────────────────┐
   │ preparedStatement.setString(1,  │
   │   user.getName())               │
   │ preparedStatement.setString(2,  │
   │   user.getEmail())              │
   │ ... (more parameters)           │
   │                                 │
   │ Prevents SQL injection!         │
   └─────────────────────────────────┘

4. EXECUTE
   ┌─────────────────────────────────┐
   │ preparedStatement.executeUpdate()│
   │                                 │
   │ Returns: int (rows affected)    │
   │ 1 = Success                     │
   │ 0 = No rows affected            │
   └─────────────────────────────────┘

5. HANDLE RESULT
   ┌─────────────────────────────────┐
   │ if (rowsAffected > 0)           │
   │   return true (success)         │
   │ else                            │
   │   return false (failure)        │
   └─────────────────────────────────┘

6. AUTO-CLOSE RESOURCES
   ┌─────────────────────────────────┐
   │ try-with-resources              │
   │ Automatically closes:           │
   │ - PreparedStatement             │
   │ - Connection                    │
   │                                 │
   │ Returns connection to pool      │
   └─────────────────────────────────┘
```

---

## Validation Sequence

```
START
  │
  ▼
Name ────────► Empty? ──Yes──► Error: "Name is required" ──┐
  │                                                          │
  No                                                         │
  │                                                          │
  ▼                                                          │
Email ───────► Empty? ──Yes──► Error: "Email is required" ──┤
  │                                                          │
  No                                                         │
  │                                                          │
  ▼                                                          │
Email ───────► Exists? ──Yes──► Error: "Email already      ──┤
  │                              registered"                 │
  No                                                          │
  │                                                          │
  ▼                                                          │
Password ────► Empty? ──Yes──► Error: "Password required" ──┤
  │                                                          │
  No                                                          │
  │                                                          │
  ▼                                                          │
Role ────────► Empty? ──Yes──► Error: "Role is required" ──┤
  │                                                          │
  No                                                          │
  │                                                          │
  ▼                                                          │
Phone ───────► Empty? ──Yes──► Error: "Phone required" ────┤
  │                                                          │
  No                                                          │
  │                                                          │
  ▼                                                          │
All Valid ──────────────────► Save to Database              │
  │                                                          │
  ▼                                                          │
Success ──────────────────────► Return Success Response ────┤
                                                             │
                                ┌──────────────────────────┘
                                │
                                ▼
                          Return Response
                         (with status code)
```

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 201 | Created | User successfully registered |
| 400 | Bad Request | Validation failed or duplicate email |
| 500 | Internal Server Error | Database connection or SQL error |

---

## Thread Safety & Connection Pooling

```
Multiple Requests
│
├─ Request 1 ──────┐
├─ Request 2 ──────┼──► HikariCP Connection Pool (Max: 10)
├─ Request 3 ──────┤
├─ Request 4 ──────┤    ┌────────────────────────────┐
└─ Request N ──────┘    │ Active Connections: 4      │
                        │ Idle Connections: 6        │
                        │ Max Pool Size: 10          │
                        │ Min Idle: 5                │
                        │ Thread-Safe: YES           │
                        └────────────────────────────┘
                                    │
                                    ▼
                        ┌────────────────────────────┐
                        │ MySQL Connections          │
                        │ Each request gets          │
                        │ dedicated connection       │
                        │ Reused after use           │
                        └────────────────────────────┘
```

---

**Complete Architecture**: ✅ Request → Controller → Service → Repository → Database → Response

**Layered Design Benefits**:
- ✅ Separation of concerns
- ✅ Easy to test each layer
- ✅ Maintainable code
- ✅ Reusable components
- ✅ Easy to switch implementations
