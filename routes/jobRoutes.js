const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Applicant Dashboard (Browse and filter jobs)
router.get('/applicant/dashboard', isAuthenticated, hasRole(['applicant']), jobController.getApplicantDashboard);

// Recruiter Dashboard (Manage job listings)
router.get('/recruiter/dashboard', isAuthenticated, hasRole(['recruiter']), jobController.getRecruiterDashboard);

// Recruiter Post Job (Form + Action)
router.get('/recruiter/post-job', isAuthenticated, hasRole(['recruiter']), jobController.getPostJob);
router.post('/recruiter/post-job', isAuthenticated, hasRole(['recruiter']), jobController.postJob);

// Applicant Job Details
router.get('/jobs/:id', isAuthenticated, hasRole(['applicant']), jobController.getJobDetails);

module.exports = router;
