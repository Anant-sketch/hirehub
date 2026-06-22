const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const applicationController = require('../controllers/applicationController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExt = path.extname(file.originalname).toLowerCase();
        cb(null, `resume-${req.session.user.id}-${uniqueSuffix}${fileExt}`);
    }
});

// Filter to only accept PDF resumes
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only PDF resumes are accepted.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Applicant Action: Submit application
router.post('/apply', isAuthenticated, hasRole(['applicant']), (req, res, next) => {
    // Wrap multer in a custom handler to intercept errors (like non-PDF uploads)
    upload.single('resume')(req, res, (err) => {
        if (err) {
            console.error('[Multer Error]:', err.message);
            // Re-render apply page with the error message
            return res.status(400).render('error', {
                title: 'Upload Error',
                message: err.message || 'File upload failed. Ensure the file is a PDF under 5MB.',
                user: req.session.user
            });
        }
        next();
    });
}, applicationController.applyForJob);

// Applicant View: Track list of applications
router.get('/applicant/applications', isAuthenticated, hasRole(['applicant']), applicationController.getApplicantApplications);

// Recruiter View: List of candidates who applied for a specific job
router.get('/recruiter/applicants/:jobId', isAuthenticated, hasRole(['recruiter']), applicationController.getJobApplicants);

// Recruiter Action: Update application status (Accepted, Reviewed, Rejected)
router.post('/recruiter/status/update', isAuthenticated, hasRole(['recruiter']), applicationController.updateApplicationStatus);

module.exports = router;
