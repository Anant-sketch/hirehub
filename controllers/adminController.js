const db = require('../config/db');

// Admin Dashboard: View all users and all jobs
exports.getAdminDashboard = async (req, res) => {
    try {
        // 1. Fetch all users (excluding the current logged-in admin)
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id != ? ORDER BY created_at DESC',
            [req.session.user.id]
        );

        // 2. Fetch all jobs with recruiter company name
        const [jobs] = await db.query(`
            SELECT jobs.*, users.name as company_name 
            FROM jobs 
            JOIN users ON jobs.recruiter_id = users.id 
            ORDER BY jobs.created_at DESC
        `);

        res.render('admin/dashboard', {
            title: 'Admin Panel - HireHub',
            users,
            jobs
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load administration panel.',
            user: req.session.user
        });
    }
};

// Admin Action: Delete User
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.session.user.id) {
        return res.status(400).redirect('/admin/dashboard');
    }

    try {
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        console.log(`[Admin]: Deleted User ID: ${userId}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to delete user. They might be linked to dependencies.',
            user: req.session.user
        });
    }
};

// Admin Action: Delete Job Listing
exports.deleteJob = async (req, res) => {
    const jobId = req.params.id;

    try {
        await db.query('DELETE FROM jobs WHERE id = ?', [jobId]);
        console.log(`[Admin]: Deleted Job Listing ID: ${jobId}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Delete Job Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to delete job listing.',
            user: req.session.user
        });
    }
};
