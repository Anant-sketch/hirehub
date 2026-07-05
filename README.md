# 💼 HireHub - Full-Stack Job & Internship Portal

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg?style=flat&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg?style=flat&logo=express)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-blue.svg?style=flat&logo=mysql)](https://mysql.com)
[![Render Deployment](https://img.shields.io/badge/Hosted%20on-Render-darkviolet.svg?style=flat&logo=render)](https://hirehub-portal-dt5l.onrender.com)

**HireHub** is a clean, robust, and responsive Job & Internship Portal structured as a server-side Model-View-Controller (MVC) web application. It features role-based access control, session-based authentication, PDF resume uploads, search filters, and automated email alerts.

👉 **[Live Deployment on Render](https://hirehub-portal-dt5l.onrender.com)**

---

## 🚀 Key Features

### 👤 Role-based Dashboards
*   **Applicants**: Search & filter internships/jobs by skills and location, upload PDF resumes, and track application history logs.
*   **Recruiters**: Post job descriptions, manage applicant rosters, download resume files, and select/update application statuses (Applied, Reviewed, Accepted, Rejected).
*   **Admin Panel**: Monitor database users and job postings, and perform cleanups by deleting accounts or outdated listings.

### 🔒 Secure Authentication
*   **Cookie Session State**: Stateful authentication using `express-session` cookies.
*   **Password Security**: Hashed passwords encrypted and saved to MySQL using `bcryptjs` encryption.
*   **Route Guards**: Middleware protecting private recruiter, applicant, and admin pages from unauthenticated access.

### 📧 Automated Notifications
*   **Nodemailer Alerts**: Sends instant automated email notifications to applicants when recruiters update their application status.

---

## 🛠️ Architecture & Tech Stack

HireHub follows the **MVC design pattern** to cleanly separate data, user views, and controller route logics:

*   **Backend**: Node.js & Express.js
*   **Database**: MySQL (relational schemas with connection pool modules)
*   **Templating**: EJS (Embedded JavaScript) for dynamic pages
*   **Uploads Manager**: Multer for handling file attachments
*   **Styling**: Responsive Vanilla CSS3 design tokens

---

## 📦 Getting Started

### 1. Database Setup
1. Log in to your local MySQL server.
2. Run the queries in the provided [schema.sql](schema.sql) file to create the tables:
   ```bash
   mysql -u your_username -p < schema.sql
   ```
   *Note: This seeds default test accounts for testing (Password is `password123`):*
   *   Admin: `admin@hirehub.com`
   *   Recruiter: `recruiter@hirehub.com`
   *   Applicant: `applicant@hirehub.com`

### 2. Configuration Setup
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=hirehub_db
SESSION_SECRET=a_secure_custom_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Installation & Run
1. Install node modules:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open browser to: `http://localhost:3000`
