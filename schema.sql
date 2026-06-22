-- Create Database if not exists (Commented out for cloud compatibility)
-- CREATE DATABASE IF NOT EXISTS hirehub_db;
-- USE hirehub_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('applicant', 'recruiter', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    skills_required VARCHAR(255) NOT NULL,
    stipend INT NOT NULL DEFAULT 0,
    job_type ENUM('Full-time', 'Part-time', 'Internship', 'Contract') NOT NULL DEFAULT 'Internship',
    deadline DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('Applied', 'Reviewed', 'Accepted', 'Rejected') NOT NULL DEFAULT 'Applied',
    resume_path VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Seed Data (Password for all is 'password123' hashed with bcrypt)
-- Admin
INSERT INTO users (name, email, password, role) 
VALUES ('System Admin', 'admin@hirehub.com', '$2a$10$vI8aWBnd3GfGCsDGW2lTGe94v69.J/jE6wTUX0T1.bS3qHqXl6uU6', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Recruiter
INSERT INTO users (name, email, password, role) 
VALUES ('Google India', 'recruiter@hirehub.com', '$2a$10$vI8aWBnd3GfGCsDGW2lTGe94v69.J/jE6wTUX0T1.bS3qHqXl6uU6', 'recruiter')
ON DUPLICATE KEY UPDATE id=id;

-- Applicant
INSERT INTO users (name, email, password, role) 
VALUES ('Anant Kumar', 'applicant@hirehub.com', '$2a$10$vI8aWBnd3GfGCsDGW2lTGe94v69.J/jE6wTUX0T1.bS3qHqXl6uU6', 'applicant')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Job Posting (Linked to Recruiter ID = 2)
INSERT INTO jobs (recruiter_id, title, description, location, skills_required, stipend, job_type, deadline)
VALUES (2, 'Node.js Developer Intern', 'We are looking for a Node.js backend developer intern. You will work on API integrations, design database structures in MySQL, and build scalable server routing systems.', 'Bangalore (Remote)', 'Node.js, Express, MySQL', 25000, 'Internship', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY))
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO jobs (recruiter_id, title, description, location, skills_required, stipend, job_type, deadline)
VALUES (2, 'Frontend Developer Intern', 'Join our frontend engineering team to build beautiful, responsive web views using modern CSS features, layouts, and interactive EJS template scripts.', 'New Delhi', 'HTML, CSS, JavaScript, EJS', 20000, 'Internship', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY))
ON DUPLICATE KEY UPDATE id=id;
