const db = require('../config/db');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// Nodemailer Config with Ethereal fallback
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'ethereal_user_placeholder',
        pass: process.env.EMAIL_PASS || 'ethereal_pass_placeholder'
    }
});

// Helper to send email alerts
const sendStatusEmail = async (toEmail, applicantName, jobTitle, status, companyName) => {
    // Skip sending if user has placeholder settings
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('placeholder')) {
        console.log(`[Email Mock]: Skip sending status email to ${toEmail}. (SMTP Credentials not configured)`);
        return;
    }

    const mailOptions = {
        from: `"HireHub Portal" <no-reply@hirehub.com>`,
        to: toEmail,
        subject: `Application Status Updated: ${jobTitle}`,
        text: `Hi ${applicantName},\n\nYour application status for the "${jobTitle}" position at "${companyName}" has been updated to: ${status}.\n\nLog in to HireHub to check details.\n\nBest regards,\nHireHub Team`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #4f46e5;">HireHub Application Update</h2>
                <p>Hi <strong>${applicantName}</strong>,</p>
                <p>Your application status for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been updated to:</p>
                <div style="background-color: #f8fafc; padding: 12px 20px; border-radius: 6px; display: inline-block; font-size: 1.1em; font-weight: bold; color: #10b981; margin: 10px 0;">
                    ${status}
                </div>
                <p>Please <a href="http://localhost:${process.env.PORT || 3000}/auth/login" style="color: #4f46e5; text-decoration: underline;">log in to HireHub</a> to view the complete details of your application.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 0.85em; color: #64748b;">This is an automated system email. Please do not reply directly.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer]: Email successfully dispatched to ${toEmail} for ${jobTitle} update.`);
    } catch (error) {
        console.error('[Nodemailer Error]: Failed to send notification email:', error.message);
    }
};

// Handle Application Submit (Multer handles the file upload)
exports.applyForJob = async (req, res) => {
    const applicantId = req.session.user.id;
    const jobId = req.body.job_id;

    if (!jobId) {
        return res.status(400).render('error', {
            title: 'Bad Request',
            message: 'Job ID is missing.',
            user: req.session.user
        });
    }

    if (!req.file) {
        // Fetch job info again to reload view
        try {
            const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
            return res.render('applicant/apply', {
                title: 'Apply - HireHub',
                job: jobs[0],
                hasApplied: false,
                application: null,
                error: 'Please upload a PDF resume.'
            });
        } catch (err) {
            return res.status(500).redirect('/applicant/dashboard');
        }
    }

    const resumePath = `/uploads/${req.file.filename}`;

    try {
        // Prevent double applications
        const [existing] = await db.query(
            'SELECT id FROM applications WHERE applicant_id = ? AND job_id = ?',
            [applicantId, jobId]
        );

        if (existing.length > 0) {
            return res.status(400).render('error', {
                title: 'Duplicate Application',
                message: 'You have already applied for this position.',
                user: req.session.user
            });
        }

        // Insert Application record
        await db.query(
            'INSERT INTO applications (applicant_id, job_id, resume_path) VALUES (?, ?, ?)',
            [applicantId, jobId, resumePath]
        );

        res.redirect('/applicant/applications');
    } catch (error) {
        console.error('Submit Application Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to submit your application. Please try again.',
            user: req.session.user
        });
    }
};

// Applicant Tracking: List all applications submitted by user
exports.getApplicantApplications = async (req, res) => {
    const applicantId = req.session.user.id;

    try {
        const sql = `
            SELECT applications.*, jobs.title, jobs.location, jobs.stipend, users.name as company_name 
            FROM applications 
            JOIN jobs ON applications.job_id = jobs.id 
            JOIN users ON jobs.recruiter_id = users.id 
            WHERE applications.applicant_id = ? 
            ORDER BY applications.applied_at DESC
        `;
        const [applications] = await db.query(sql, [applicantId]);

        res.render('applicant/applications', {
            title: 'My Applications - HireHub',
            applications
        });
    } catch (error) {
        console.error('Fetch Applicant Applications Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load your applications.',
            user: req.session.user
        });
    }
};

// Recruiter Dashboard Action: View applicants for a specific job
exports.getJobApplicants = async (req, res) => {
    const jobId = req.params.jobId;
    const recruiterId = req.session.user.id;

    try {
        // 1. Verify this recruiter owns the job listing
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, recruiterId]);
        if (jobs.length === 0) {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You are not authorized to view applicants for this job.',
                user: req.session.user
            });
        }

        // 2. Fetch applications linked with applicant details
        const sql = `
            SELECT applications.*, users.name as applicant_name, users.email as applicant_email 
            FROM applications 
            JOIN users ON applications.applicant_id = users.id 
            WHERE applications.job_id = ? 
            ORDER BY applications.applied_at DESC
        `;
        const [applicants] = await db.query(sql, [jobId]);

        res.render('recruiter/view-applicants', {
            title: `Applicants - ${jobs[0].title}`,
            job: jobs[0],
            applicants
        });
    } catch (error) {
        console.error('Fetch Job Applicants Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load applicants list.',
            user: req.session.user
        });
    }
};

// Recruiter Action: Update status and notify applicant
exports.updateApplicationStatus = async (req, res) => {
    const { application_id, status, job_id } = req.body;
    const recruiterId = req.session.user.id;

    if (!application_id || !status || !job_id) {
        return res.status(400).redirect('/recruiter/dashboard');
    }

    try {
        // 1. Double check recruiter authorization
        const [jobs] = await db.query('SELECT id, title, recruiter_id FROM jobs WHERE id = ? AND recruiter_id = ?', [job_id, recruiterId]);
        if (jobs.length === 0) {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Unauthorized action.',
                user: req.session.user
            });
        }

        // 2. Update status in database
        await db.query(
            'UPDATE applications SET status = ? WHERE id = ?',
            [status, application_id]
        );

        // 3. Fetch applicant name/email & company name to trigger email notifications
        const infoSql = `
            SELECT users.name as applicant_name, users.email as applicant_email, companies.name as company_name 
            FROM applications 
            JOIN users ON applications.applicant_id = users.id 
            JOIN jobs ON applications.job_id = jobs.id 
            JOIN users as companies ON jobs.recruiter_id = companies.id 
            WHERE applications.id = ?
        `;
        const [infos] = await db.query(infoSql, [application_id]);

        if (infos.length > 0) {
            const info = infos[0];
            // Async send status email (non-blocking)
            sendStatusEmail(
                info.applicant_email,
                info.applicant_name,
                jobs[0].title,
                status,
                info.company_name
            );
        }

        res.redirect(`/recruiter/applicants/${job_id}`);
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to update application status.',
            user: req.session.user
        });
    }
};
