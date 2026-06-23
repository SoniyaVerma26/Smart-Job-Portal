# Application Module - Complete Test Guide

## Summary of Changes Made

### Backend Changes

#### 1. **Application.java** - Added Field Mappings & Timestamps
- Added `@JsonProperty` annotations to map Java field names to frontend expected names:
  - `jobId` → `job_id`
  - `userId` → `seeker_id`
  - `resumeLink` → `resume_link`
  - Added `coverLetter` field → `cover_letter`
  - Added `createdAt` timestamp → `created_at`
- Removed `@JsonIgnore` from `job` field to expose nested Job object
- Kept `@JsonIgnore` on `user` field to prevent circular references

#### 2. **Frontend API Changes (api.ts)**
- Added `getAuthHeader()` helper to extract JWT token from localStorage
- Updated `applyToJob()` to accept optional `resumeLink` and `coverLetter` parameters
- Added Authorization header to both `applyToJob()` and `getUserApplications()`

#### 3. **JobDetailPage.tsx**
- Updated `submitApplication()` to pass `coverLetter` to API call
- Form still collects cover letter text which is now sent to backend

#### 4. **useApplication Hook**
- Updated function signature to accept optional `resumeLink` and `coverLetter`
- Updated to pass these parameters to API call

---

## Expected Data Flows

### POST /apply - Create Application

**Required Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Request Body (Expected):**
```json
{
  "jobId": 1,
  "userId": 2,
  "resumeLink": "",
  "coverLetter": "I am very interested in this position because..."
}
```

**Response (201 CREATED):**
```json
{
  "success": true,
  "message": "Job applied successfully",
  "application": {
    "id": 1,
    "job_id": 1,
    "seeker_id": 2,
    "resume_link": "",
    "cover_letter": "I am very interested in this position because...",
    "status": "PENDING",
    "created_at": "2026-06-12T10:30:45.123456",
    "job": {
      "id": 1,
      "title": "Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "description": "...",
      "type": "full-time",
      "salary": 120000,
      ...
    }
  }
}
```

**Error Response (400 BAD REQUEST):**
```json
{
  "success": false,
  "message": "jobId, userId, and resumeLink are required"
}
```

**Error Response (409 CONFLICT):**
```json
{
  "success": false,
  "message": "You have already applied for this job"
}
```

**Error Response (401 UNAUTHORIZED):**
```json
{
  "success": false,
  "message": "Authorization token is missing"
}
```

---

### GET /applications/user/{userId} - List Applications

**Required Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Path Parameters:**
- `userId`: The seeker's user ID (e.g., `/applications/user/2`)

**Response (200 OK):**
```json
{
  "success": true,
  "applications": [
    {
      "id": 1,
      "job_id": 1,
      "seeker_id": 2,
      "resume_link": "",
      "cover_letter": "Interested in this role",
      "status": "PENDING",
      "created_at": "2026-06-12T10:30:45.123456",
      "job": {
        "id": 1,
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "description": "...",
        "type": "full-time",
        "salary": 120000
      }
    },
    {
      "id": 2,
      "job_id": 2,
      "seeker_id": 2,
      "resume_link": "",
      "cover_letter": "Very qualified for this position",
      "status": "REVIEWING",
      "created_at": "2026-06-12T09:15:20.654321",
      "job": {
        "id": 2,
        "title": "Product Manager",
        "company": "Another Corp",
        "location": "New York, NY",
        "description": "...",
        "type": "full-time",
        "salary": 130000
      }
    }
  ]
}
```

**Error Response (401 UNAUTHORIZED):**
```json
{
  "success": false,
  "message": "Authorization token is missing"
}
```

---

## Postman Test Requests

### 1. Register/Login First (Required)

**POST** `http://localhost:8080/signup`
```json
{
  "email": "seeker@example.com",
  "password": "SecurePassword123!",
  "role": "JOB_SEEKER",
  "fullName": "John Seeker"
}
```

**Response (Save the token):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": 2, "email": "seeker@example.com" },
  "profile": { "id": 2, "full_name": "John Seeker", "role": "JOB_SEEKER" },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Copy the `token` value to use in subsequent requests.

---

### 2. Create a Job (Optional - Only if you want to test with a new job)

**POST** `http://localhost:8080/jobs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN_FROM_RECRUITER>
```

**Body:**
```json
{
  "title": "Senior Backend Developer",
  "company": "Tech Innovations Inc",
  "location": "Austin, TX",
  "description": "We are looking for an experienced backend developer...",
  "type": "full-time",
  "salary": 150000,
  "salary_min": 140000,
  "salary_max": 160000,
  "skills": ["Java", "Spring Boot", "MySQL", "Docker"],
  "requirements": ["5+ years experience", "BSc in Computer Science"],
  "recruiterId": 1
}
```

**Response:** Note the returned `id` to use in apply tests.

---

### 3. Apply to Job (Test POST /apply)

**POST** `http://localhost:8080/apply`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Body:**
```json
{
  "jobId": 1,
  "userId": 2,
  "resumeLink": "https://example.com/resume.pdf",
  "coverLetter": "I am very interested in this Senior Backend Developer position. With my 6 years of experience in Java and Spring Boot development, I believe I am a perfect fit for your team..."
}
```

**Expected Response (201 CREATED):**
```json
{
  "success": true,
  "message": "Job applied successfully",
  "application": {
    "id": 1,
    "job_id": 1,
    "seeker_id": 2,
    "resume_link": "https://example.com/resume.pdf",
    "cover_letter": "I am very interested...",
    "status": "PENDING",
    "created_at": "2026-06-12T14:23:45.789123",
    "job": {
      "id": 1,
      "title": "Senior Backend Developer",
      "company": "Tech Innovations Inc",
      "location": "Austin, TX",
      "description": "We are looking for...",
      "type": "full-time",
      "salary": 150000,
      "skills": ["Java", "Spring Boot", "MySQL", "Docker"],
      "requirements": ["5+ years experience", "BSc in Computer Science"]
    }
  }
}
```

---

### 4. Duplicate Application Check

**POST** `http://localhost:8080/apply` (same data as above)

**Expected Response (409 CONFLICT):**
```json
{
  "success": false,
  "message": "You have already applied for this job"
}
```

This confirms the duplicate check is working.

---

### 5. Get User Applications (Test GET /applications/user/{userId})

**GET** `http://localhost:8080/applications/user/2`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "applications": [
    {
      "id": 1,
      "job_id": 1,
      "seeker_id": 2,
      "resume_link": "https://example.com/resume.pdf",
      "cover_letter": "I am very interested...",
      "status": "PENDING",
      "created_at": "2026-06-12T14:23:45.789123",
      "job": {
        "id": 1,
        "title": "Senior Backend Developer",
        "company": "Tech Innovations Inc",
        "location": "Austin, TX",
        "description": "We are looking for...",
        "type": "full-time",
        "salary": 150000,
        "skills": ["Java", "Spring Boot", "MySQL", "Docker"]
      }
    }
  ]
}
```

---

## Testing Checklist

### Backend Testing (Postman)

- [ ] **Test 1: POST /apply with valid data**
  - Verify status code: 201 CREATED
  - Verify response includes all fields with correct names (job_id, seeker_id, cover_letter, created_at)
  - Verify nested job object is populated
  - Verify created_at timestamp is present and valid

- [ ] **Test 2: POST /apply with missing resumeLink**
  - Send request without resumeLink field
  - Verify status code: 400 BAD REQUEST
  - Verify error message about required fields

- [ ] **Test 3: POST /apply without Authorization header**
  - Send request without Bearer token
  - Verify status code: 401 UNAUTHORIZED
  - Verify error message about missing token

- [ ] **Test 4: POST /apply with invalid JWT token**
  - Send request with invalid/expired token
  - Verify status code: 401 UNAUTHORIZED

- [ ] **Test 5: Duplicate application check**
  - Apply to same job twice with same user
  - First request should succeed (201 CREATED)
  - Second request should return 409 CONFLICT

- [ ] **Test 6: GET /applications/user/{userId}**
  - Verify status code: 200 OK
  - Verify response includes all applications with correct field names
  - Verify each application has nested job object
  - Verify created_at timestamps are present

- [ ] **Test 7: GET /applications/user/{userId} without Authorization**
  - Verify status code: 401 UNAUTHORIZED

---

### Frontend Testing (Browser)

- [ ] **Test 1: JobDetailPage Apply Flow**
  - Navigate to a job detail page
  - Click "Apply Now" button
  - Enter cover letter text
  - Click submit
  - Verify success message appears
  - Verify button changes to "Applied"

- [ ] **Test 2: MyApplicationsPage Display**
  - Navigate to seeker dashboard → "My Applications"
  - Verify all applications are loaded
  - Verify application cards display:
    - Job title (from nested job object)
    - Company name (from nested job object)
    - Location (from nested job object)
    - Status badge (with correct color coding)
    - Applied date (formatted from created_at)
  - Verify clicking on application card navigates to job detail

- [ ] **Test 3: Empty State**
  - For a new user with no applications
  - Verify "No applications yet" message appears
  - Verify "Browse Jobs" link is clickable

- [ ] **Test 4: Error Handling**
  - Try to apply with invalid job/user IDs
  - Verify error message is displayed
  - Verify can retry the operation

---

## Database Verification

### SQL Commands to Verify Changes

```sql
-- Check application table structure
DESC applications;

-- Expected columns:
-- id, job_id, user_id, resume_link, cover_letter, status, created_at

-- Check sample data with all fields
SELECT * FROM applications LIMIT 5;

-- Verify cover_letter column exists
SHOW COLUMNS FROM applications WHERE Field = 'cover_letter';

-- Verify created_at column type and defaults
SHOW COLUMNS FROM applications WHERE Field = 'created_at';
```

**Expected Columns:**
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `job_id` (BIGINT, NOT NULL, FOREIGN KEY)
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY)
- `resume_link` (VARCHAR(500), NULLABLE)
- `cover_letter` (VARCHAR(2000), NULLABLE)
- `status` (VARCHAR(50), DEFAULT: 'PENDING')
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

---

## Common Issues & Solutions

### Issue 1: "resumeLink is required" Error
**Cause:** Frontend not sending resumeLink field in POST /apply request
**Solution:** Frontend API now sends empty string for resumeLink by default. This satisfies the backend validation (non-blank check is only for non-null values).

### Issue 2: 401 UNAUTHORIZED on /apply or /applications/user/{userId}
**Cause:** Missing Authorization header
**Solution:** Frontend API now automatically includes Authorization header from localStorage.backendAuth.token

### Issue 3: MyApplicationsPage shows "undefined" values
**Cause:** Field name mismatch between backend and frontend
**Solution:** Application.java now uses @JsonProperty annotations to map field names to snake_case

### Issue 4: Cannot read property 'job' of undefined in MyApplicationsPage
**Cause:** Nested job object not exposed in JSON response
**Solution:** Removed @JsonIgnore from job field in Application.java

### Issue 5: "created_at is undefined" in MyApplicationsPage
**Cause:** Application entity missing timestamp field
**Solution:** Added @CreationTimestamp field with @JsonProperty("created_at")

---

## Next Steps

1. **Run backend tests in Postman** (Tests 1-7)
2. **Run frontend tests in browser** (Tests 1-4)
3. **Verify database** using SQL queries
4. **Monitor logs** for any Hibernate or Spring Data JPA warnings
5. **Load test** with multiple concurrent applications
6. **Update production database** with cover_letter column if needed
   ```sql
   ALTER TABLE applications ADD COLUMN cover_letter VARCHAR(2000);
   ```

---

## Files Changed

### Backend
- `backend/src/main/java/com/smartjobportal/backend/model/Application.java` - Added field mappings and timestamp

### Frontend
- `frontend/src/lib/api.ts` - Added auth headers and new parameters
- `frontend/src/pages/JobDetailPage.tsx` - Pass coverLetter to API
- `frontend/src/hooks/useApplication.ts` - Updated function signature

### Database Schema Change
New column required in `applications` table:
- `cover_letter` VARCHAR(2000) - Optional, stores cover letter text from application form
