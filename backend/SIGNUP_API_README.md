# Smart Job Portal - JDBC Signup API

A Spring Boot REST API for user registration with JDBC-based MySQL database integration using a layered architecture (Controller-Service-Repository).

## Features

✅ User Registration API with validation
✅ JDBC with PreparedStatement for SQL injection prevention
✅ Layered Architecture (Controller → Service → Repository)
✅ Connection pooling with HikariCP
✅ Email uniqueness validation
✅ RESTful API endpoints

## Project Structure

```
backend/
├── config/
│   └── DatabaseConfig.java         # Database connection pool configuration
├── controller/
│   └── AuthController.java         # REST API endpoints
├── model/
│   └── User.java                   # User entity with Lombok annotations
├── repository/
│   └── UserRepository.java         # JDBC database operations
├── service/
│   └── AuthService.java            # Business logic for authentication
├── src/main/resources/
│   └── application.properties       # Database credentials
├── schema.sql                       # Database table creation script
└── pom.xml                          # Maven dependencies
```

## Technology Stack

- **Framework**: Spring Boot 3.5.14
- **Language**: Java 17
- **Database**: MySQL 8.0+
- **ORM**: JDBC with PreparedStatement
- **Connection Pooling**: HikariCP
- **Build Tool**: Maven
- **Utilities**: Lombok

## Prerequisites

1. Java 17 or higher
2. MySQL 8.0 or higher
3. Maven 3.6+
4. IDE (IntelliJ IDEA, Eclipse, or VS Code)

## Setup Instructions

### 1. Database Setup

Execute the SQL script to create the database and table:

```sql
-- Option 1: Using command line
mysql -u root -p < schema.sql

-- Option 2: Using MySQL Workbench
-- Copy and paste the contents of schema.sql file
```

### 2. Configure Database Connection

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_job_portal
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Signup Endpoint

**Endpoint**: `POST /signup`

**Request Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "Java, Spring Boot, MySQL"
}
```

**Success Response** (201 Created):
```json
{
    "success": true,
    "message": "User registered successfully",
    "email": "john@example.com"
}
```

**Error Response** (400 Bad Request):
```json
{
    "success": false,
    "message": "Email already registered"
}
```

## Code Components

### 1. User Model (model/User.java)
- POJO with Lombok annotations (@Data, @NoArgsConstructor, @AllArgsConstructor)
- Fields: id, name, email, password, role, phone, skills
- Auto-generated getters, setters, toString(), equals(), hashCode()

### 2. AuthController (controller/AuthController.java)
- REST controller with POST mapping to `/signup`
- Accepts User object from request body
- Returns ResponseEntity with JSON response
- HTTP Status: 201 (Created) for success, 400 (Bad Request) for failure

### 3. AuthService (service/AuthService.java)
- Business logic layer
- Validates user input
- Checks for duplicate emails
- Calls UserRepository to save data
- Returns response map with success status and message

### 4. UserRepository (repository/UserRepository.java)
- Database access layer
- Uses JDBC with PreparedStatement
- Methods:
  - `saveUser(User user)`: Insert user into database
  - `emailExists(String email)`: Check email uniqueness
  - `getUserByEmail(String email)`: Retrieve user by email
- Prevents SQL injection using PreparedStatement

### 5. DatabaseConfig (config/DatabaseConfig.java)
- Spring @Configuration class
- Creates HikariDataSource bean
- Connection pooling configuration:
  - Max pool size: 10
  - Min idle connections: 5
- Loads properties from application.properties

## Database Schema

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'JOB_SEEKER',
    phone VARCHAR(15) NOT NULL,
    skills VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

## Validation Rules

- **Name**: Required, non-empty
- **Email**: Required, non-empty, must be unique
- **Password**: Required, non-empty
- **Role**: Required (defaults to 'JOB_SEEKER' if not RECRUITER)
- **Phone**: Required, non-empty
- **Skills**: Optional

## Error Handling

The API returns appropriate HTTP status codes:
- **201 Created**: User registered successfully
- **400 Bad Request**: Validation failed or email already exists
- **500 Internal Server Error**: Database connection error

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "Password123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "Python, Django, PostgreSQL"
  }'
```

### Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:8080/signup`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "Java, MySQL"
}
```

## Security Considerations

⚠️ **Note**: This is a basic implementation for learning purposes. For production:

1. **Password Hashing**: Use BCryptPasswordEncoder instead of plaintext
2. **JWT Tokens**: Implement JWT for authentication
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Add more comprehensive validation
5. **SQL Injection**: Already prevented with PreparedStatement
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **CORS**: Configure CORS properly for frontend integration

### Password Hashing (Recommended for Production)

```java
// In pom.xml, add Spring Security Crypto
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>

// In AuthService.java
@Autowired
private PasswordEncoder passwordEncoder;

// In signup method
user.setPassword(passwordEncoder.encode(user.getPassword()));
```

## Troubleshooting

### Connection Error
```
java.sql.SQLNonTransientConnectionException: Cannot get a connection
```
**Solution**: Verify MySQL is running and connection details in application.properties

### Table Not Found
```
java.sql.SQLSyntaxErrorException: Table 'smart_job_portal.users' doesn't exist
```
**Solution**: Execute schema.sql to create the database and table

### Email Already Exists
```json
{
    "success": false,
    "message": "Email already registered"
}
```
**Solution**: Use a different email address for registration

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Login API with JWT tokens
- [ ] User profile update
- [ ] Role-based access control (RBAC)
- [ ] Job postings and applications
- [ ] Skill endorsements
- [ ] User search and filtering

## License

This project is open source and available for learning purposes.

## Author

Smart Job Portal Development Team
