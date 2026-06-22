const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Initialize Express App
const app = express();

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folders
app.use(express.static(path.join(__dirname, 'public')));
// Allow downloading/viewing uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Middleware Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'hirehub_default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 Hours
        secure: false // true for production HTTPS
    }
}));

// Expose session variables to EJS views globally
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Bind Routes
app.use('/auth', authRoutes);
app.use('/', jobRoutes);
app.use('/', applicationRoutes);
app.use('/', adminRoutes);

// Root Route - Redirect depending on authentication and role
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        const role = req.session.user.role;
        if (role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (role === 'recruiter') {
            return res.redirect('/recruiter/dashboard');
        } else {
            return res.redirect('/applicant/dashboard');
        }
    }
    res.redirect('/auth/login');
});

// 404 Handler (Page Not Found)
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist or has been moved.',
        user: req.session.user
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Express Global Error]:', err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: err.message || 'A critical server error occurred. Please contact the administrator.',
        user: req.session ? req.session.user : null
    });
});

// Bind Port and Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Server]: HireHub listening on http://localhost:${PORT}`);
});
