const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Render Register Page
exports.getRegister = (req, res) => {
    res.render('auth/register', { title: 'Register - HireHub', error: null, success: null });
};

// Handle Registration Submit
exports.postRegister = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Simple validation
    if (!name || !email || !password || !role) {
        return res.render('auth/register', { 
            title: 'Register - HireHub', 
            error: 'All fields are required.', 
            success: null 
        });
    }

    if (!['applicant', 'recruiter', 'admin'].includes(role)) {
        return res.render('auth/register', { 
            title: 'Register - HireHub', 
            error: 'Invalid role selected.', 
            success: null 
        });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.render('auth/register', { 
                title: 'Register - HireHub', 
                error: 'Email is already registered.', 
                success: null 
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into database
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.render('auth/login', { 
            title: 'Login - HireHub', 
            success: 'Registration successful! Please login.', 
            error: null 
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.render('auth/register', { 
            title: 'Register - HireHub', 
            error: 'Database error occurred during registration. Please try again.', 
            success: null 
        });
    }
};

// Render Login Page
exports.getLogin = (req, res) => {
    res.render('auth/login', { title: 'Login - HireHub', error: null, success: null });
};

// Handle Login Submit
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('auth/login', { 
            title: 'Login - HireHub', 
            error: 'Please enter all fields.', 
            success: null 
        });
    }

    try {
        // Fetch user from DB
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.render('auth/login', { 
                title: 'Login - HireHub', 
                error: 'Invalid email or password.', 
                success: null 
            });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', { 
                title: 'Login - HireHub', 
                error: 'Invalid email or password.', 
                success: null 
            });
        }

        // Initialize user session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Redirect based on role
        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else if (user.role === 'recruiter') {
            res.redirect('/recruiter/dashboard');
        } else {
            // Check for post-login redirectURL
            const redirectUrl = req.session.redirectUrl || '/applicant/dashboard';
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.render('auth/login', { 
            title: 'Login - HireHub', 
            error: 'Database connection failed. Please try again.', 
            success: null 
        });
    }
};

// Handle Logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
};
