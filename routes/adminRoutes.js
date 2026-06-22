const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

// Admin Dashboard View
router.get('/admin/dashboard', isAuthenticated, hasRole(['admin']), adminController.getAdminDashboard);

// Admin Action: Delete User
router.post('/admin/users/delete/:id', isAuthenticated, hasRole(['admin']), adminController.deleteUser);

// Admin Action: Delete Job Listing
router.post('/admin/jobs/delete/:id', isAuthenticated, hasRole(['admin']), adminController.deleteJob);

module.exports = router;
