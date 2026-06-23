-- Create Smart Job Portal Database
CREATE DATABASE IF NOT EXISTS smart_job_portal;
USE smart_job_portal;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('JOB_SEEKER','RECRUITER') 
    NOT NULL DEFAULT 'JOB_SEEKER',
    phone VARCHAR(15) NOT NULL,
    skills VARCHAR(500),
    resume_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Insert sample data (optional)
INSERT INTO users (name, email, password, role, phone, skills) VALUES
('John Doe', 'john@example.com', 'password123', 'JOB_SEEKER', '9876543210', 'Java, Spring Boot, MySQL'),

('Recruiter User', 'recruiter@example.com', 'recruiter123', 'RECRUITER', '9123456789', 'Java, Database Management');

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(200) DEFAULT NULL,
    salary VARCHAR(100) DEFAULT NULL,
    description TEXT,
    skills VARCHAR(500),
    recruiter_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_recruiter (recruiter_id),
    CONSTRAINT fk_recruiter FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    resume_link VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_job (job_id),
    INDEX idx_user (user_id),
    CONSTRAINT fk_application_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_application_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
