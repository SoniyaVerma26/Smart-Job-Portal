# Testing the Signup API

## Test Scenarios

### Test 1: Successful Registration

**Request**:
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "Java, Spring Boot, MySQL, REST API"
  }'
```

**Expected Response** (201):
```json
{
    "success": true,
    "message": "User registered successfully",
    "email": "john.doe@example.com"
}
```

---

### Test 2: Duplicate Email

**Request** (same email as Test 1):
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "AnotherPass123",
    "role": "JOB_SEEKER",
    "phone": "8765432109",
    "skills": "Python, Django"
  }'
```

**Expected Response** (400):
```json
{
    "success": false,
    "message": "Email already registered"
}
```

---

### Test 3: Missing Required Field (Name)

**Request**:
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "Java"
  }'
```

**Expected Response** (400):
```json
{
    "success": false,
    "message": "Name is required"
}
```

---

### Test 4: Missing Email

**Request**:
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "password": "TestPass123",
    "role": "JOB_SEEKER",
    "phone": "9876543210",
    "skills": "JavaScript, React"
  }'
```

**Expected Response** (400):
```json
{
    "success": false,
    "message": "Email is required"
}
```

---

### Test 5: Admin Registration

**Request**:
```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Recruiter User",
    "email": "recruiter@smartjobportal.com",
    "password": "RecruiterSecurePass123",
    "role": "RECRUITER",
    "phone": "9000000000",
    "skills": "Recruitment, HR Management"
  }'
```

**Expected Response** (201):
```json
{
    "success": true,
    "message": "User registered successfully",
    "email": "admin@smartjobportal.com"
}
```

---

### Test 6: Verify Database Insert

**SQL Query**:
```sql
SELECT * FROM users;

-- To check specific user:
SELECT * FROM users WHERE email = 'john.doe@example.com';

-- Count total users:
SELECT COUNT(*) as total_users FROM users;
```

---

## Postman Collection

Save this as `signup-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Smart Job Portal - Signup API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Successful Signup",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123\",\n  \"role\": \"JOB_SEEKER\",\n  \"phone\": \"9876543210\",\n  \"skills\": \"Java, Spring Boot\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["signup"]
        }
      }
    },
    {
      "name": "Duplicate Email",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Jane Doe\",\n  \"email\": \"jane@example.com\",\n  \"password\": \"AnotherPass123\",\n  \"role\": \"JOB_SEEKER\",\n  \"phone\": \"8765432109\",\n  \"skills\": \"Python, Django\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["signup"]
        }
      }
    },
    {
      "name": "Missing Name",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123\",\n  \"role\": \"JOB_SEEKER\",\n  \"phone\": \"9876543210\",\n  \"skills\": \"Java\"\n}"
        },
        "url": {
          "raw": "http://localhost:8080/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["signup"]
        }
      }
    }
  ]
}
```

---

## Manual Testing Steps

1. **Start MySQL**
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   mysql.server start
   ```

2. **Create Database**
   ```bash
   mysql -u root -p < schema.sql
   ```

3. **Build Project**
   ```bash
   mvn clean install
   ```

4. **Run Application**
   ```bash
   mvn spring-boot:run
   ```

5. **Test Endpoint**
   ```bash
   # Option 1: cURL (from command line)
   curl -X POST http://localhost:8080/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@test.com","password":"Pass123","role":"JOB_SEEKER","phone":"9999999999","skills":"Java"}'
   
   # Option 2: Postman (GUI)
   # Import the collection above
   
   # Option 3: VS Code REST Client (create test.http file)
   POST http://localhost:8080/signup
   Content-Type: application/json
   
   {
     "name": "Test User",
     "email": "test@test.com",
     "password": "Pass123",
     "role": "JOB_SEEKER",
     "phone": "9999999999",
     "skills": "Java"
   }
   ```

6. **Verify Database**
   ```sql
   mysql> USE smart_job_portal;
   mysql> SELECT * FROM users;
   mysql> SELECT COUNT(*) FROM users;
   ```

---

## Expected Test Results

| Test Case | Status Code | Expected Message |
|-----------|-------------|------------------|
| Valid Registration | 201 | User registered successfully |
| Duplicate Email | 400 | Email already registered |
| Missing Name | 400 | Name is required |
| Missing Email | 400 | Email is required |
| Missing Password | 400 | Password is required |
| Missing Phone | 400 | Phone number is required |
| Missing Role | 400 | Role is required |
| Admin Registration | 201 | User registered successfully |

---

## Debugging

If tests fail, check:

1. **MySQL Connection**
   ```bash
   mysql -u root -p
   USE smart_job_portal;
   SHOW TABLES;
   DESC users;
   ```

2. **Application Logs**
   - Look for "Tomcat started on port 8080"
   - Check for SQL errors

3. **Database State**
   ```sql
   SELECT * FROM users;
   SELECT COUNT(*) FROM users WHERE email = 'your-test-email@example.com';
   ```

4. **Spring Boot Console Output**
   - Check for any exceptions
   - Verify bean creation: "AuthService", "UserRepository", "DatabaseConfig"
