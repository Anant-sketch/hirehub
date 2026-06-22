# HireHub - Full-Stack Job & Internship Portal

**HireHub** is a clean, responsive, and robust Job & Internship Portal built as a server-side MVC web application. It features role-based access control, session-based authentication, resume uploads, pagination, and automated status updates.

## 🚀 Key Features

### 👤 Role-based Dashboards
*   **Applicants**: Register, login, search & filter jobs (by skills, locations), upload PDF resumes (via Multer), and trace application status logs.
*   **Recruiters**: Post job listings, view applicants for individual jobs, download resume attachments, and select/update applicant status.
*   **Admin Panel**: Monitor system users and job listings, and perform cleanups by deleting accounts or postings.

### 🔒 Secure Authentication
*   **Session State**: Session-based authentication using `express-session` cookies.
*   **Security**: Hashed user passwords saved to MySQL using `bcryptjs`.
*   **Protection Middlewares**: Role-based access constraints routing users securely.

### 📧 Dynamic Alerts
*   **E-mail Updates**: Dispatches automated email messages to applicants when recruiters update their application status (using `nodemailer`).

---

## 🛠️ Tech Stack
*   **Backend**: Node.js & Express.js
*   **Database**: MySQL
*   **Templating Engine**: EJS (Embedded JavaScript)
*   **Styling**: Vanilla responsive CSS3
*   **File Uploads**: Multer
*   **Email Engine**: Nodemailer
*   **Password Hashing**: Bcryptjs

---

## 📦 Getting Started

### 1. Database Setup
1. Open your MySQL client (CLI, Workbench, or phpMyAdmin) and login.
2. Run the queries in the provided [schema.sql](schema.sql) file to create the database (`hirehub_db`) and tables:
   ```bash
   mysql -u your_username -p < schema.sql
   ```
   *Note: This will also seed three default testing accounts (Password for all accounts is `password123`):*
   *   **Admin**: `admin@hirehub.com`
   *   **Recruiter**: `recruiter@hirehub.com`
   *   **Applicant**: `applicant@hirehub.com`

### 2. Configuration Setup
1. Open the [.env](.env) file in the project root directory.
2. Edit the database credentials to match your local MySQL configuration:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=hirehub_db
   SESSION_SECRET=a_secure_custom_key
   ```
3. *(Optional)* Configure your SMTP mail credentials under `EMAIL_USER` and `EMAIL_PASS` to enable status update emails.

### 3. Installation & Run
1. Install project node dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   👉 **[http://localhost:3000](http://localhost:3000)**
