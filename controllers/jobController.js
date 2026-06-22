const db = require('../config/db');

// Applicant Dashboard: Browse, Filter, Search, Paginate
exports.getApplicantDashboard = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Job postings per page
    const offset = (page - 1) * limit;

    const { skills, location, job_type } = req.query;

    let queryParts = ['WHERE deadline >= CURRENT_DATE()'];
    let queryParams = [];

    if (skills) {
        queryParts.push('(skills_required LIKE ? OR title LIKE ? OR description LIKE ?)');
        const wildCard = `%${skills}%`;
        queryParams.push(wildCard, wildCard, wildCard);
    }

    if (location) {
        queryParts.push('location LIKE ?');
        queryParams.push(`%${location}%`);
    }

    if (job_type && job_type !== 'All') {
        queryParts.push('job_type = ?');
        queryParams.push(job_type);
    }

    const whereClause = queryParts.join(' AND ');

    try {
        // 1. Get total jobs count for pagination
        const countSql = `SELECT COUNT(*) as total FROM jobs ${whereClause}`;
        const [countResult] = await db.query(countSql, queryParams);
        const totalJobs = countResult[0].total;
        const totalPages = Math.ceil(totalJobs / limit);

        // 2. Fetch paginated jobs with company name
        const jobsSql = `
            SELECT jobs.*, users.name as company_name 
            FROM jobs 
            JOIN users ON jobs.recruiter_id = users.id 
            ${whereClause} 
            ORDER BY jobs.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        // Append LIMIT & OFFSET to params. MySQL LIMIT/OFFSET requires numbers, which mysql2 handles nicely.
        const [jobs] = await db.query(jobsSql, [...queryParams, limit, offset]);

        res.render('applicant/dashboard', {
            title: 'Applicant Dashboard - HireHub',
            jobs,
            currentPage: page,
            totalPages,
            filters: { skills: skills || '', location: location || '', job_type: job_type || 'All' }
        });
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to retrieve job listings. Please refresh.',
            user: req.session.user
        });
    }
};

// Recruiter Dashboard: Show recruiter's job postings + applicant count
exports.getRecruiterDashboard = async (req, res) => {
    const recruiterId = req.session.user.id;

    try {
        const sql = `
            SELECT jobs.*, COUNT(applications.id) as applicant_count 
            FROM jobs 
            LEFT JOIN applications ON jobs.id = applications.job_id 
            WHERE jobs.recruiter_id = ? 
            GROUP BY jobs.id 
            ORDER BY jobs.created_at DESC
        `;
        const [jobs] = await db.query(sql, [recruiterId]);

        res.render('recruiter/dashboard', {
            title: 'Recruiter Dashboard - HireHub',
            jobs
        });
    } catch (error) {
        console.error('Recruiter Dashboard Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load dashboard statistics.',
            user: req.session.user
        });
    }
};

// Render Post Job Form
exports.getPostJob = (req, res) => {
    res.render('recruiter/post-job', { title: 'Post New Job - HireHub', error: null });
};

// Handle Post Job Submit
exports.postJob = async (req, res) => {
    const recruiterId = req.session.user.id;
    const { title, description, location, skills_required, stipend, job_type, deadline } = req.body;

    if (!title || !description || !location || !skills_required || !stipend || !job_type || !deadline) {
        return res.render('recruiter/post-job', {
            title: 'Post New Job - HireHub',
            error: 'All fields are required.'
        });
    }

    try {
        await db.query(
            'INSERT INTO jobs (recruiter_id, title, description, location, skills_required, stipend, job_type, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [recruiterId, title, description, location, skills_required, stipend, job_type, deadline]
        );
        res.redirect('/recruiter/dashboard');
    } catch (error) {
        console.error('Post Job Error:', error);
        res.render('recruiter/post-job', {
            title: 'Post New Job - HireHub',
            error: 'Failed to create job posting. Try again.'
        });
    }
};

// Get Job Details and Application Form
exports.getJobDetails = async (req, res) => {
    const jobId = req.params.id;
    const applicantId = req.session.user.id;

    try {
        // Fetch job details
        const sql = `
            SELECT jobs.*, users.name as company_name 
            FROM jobs 
            JOIN users ON jobs.recruiter_id = users.id 
            WHERE jobs.id = ?
        `;
        const [jobs] = await db.query(sql, [jobId]);

        if (jobs.length === 0) {
            return res.status(404).render('error', {
                title: 'Job Not Found',
                message: 'The requested job posting does not exist or has expired.',
                user: req.session.user
            });
        }

        // Check if already applied
        const [existingApps] = await db.query(
            'SELECT id, status FROM applications WHERE applicant_id = ? AND job_id = ?',
            [applicantId, jobId]
        );

        res.render('applicant/apply', {
            title: 'Apply - HireHub',
            job: jobs[0],
            hasApplied: existingApps.length > 0,
            application: existingApps[0] || null
        });
    } catch (error) {
        console.error('Job Details Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load job details.',
            user: req.session.user
        });
    }
};
