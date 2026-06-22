/**
 * Auth Middleware
 * Enforces session-based route security and role-based access control.
 */

// Verify that the user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        // Expose user session to EJS views dynamically
        res.locals.user = req.session.user;
        return next();
    }
    req.session.redirectUrl = req.originalUrl;
    res.redirect('/auth/login');
};

// Redirect logged-in users away from login/register pages
const isRedirectIfAuthenticated = (req, res, next) => {
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
    next();
};

// Enforce specific role restrictions
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const userRole = req.session.user.role;
        if (allowedRoles.includes(userRole)) {
            // Expose session user to views
            res.locals.user = req.session.user;
            return next();
        }
        
        // Forbidden access
        res.status(403).render('error', {
            title: 'Access Denied',
            message: 'You do not have permission to view this page.',
            user: req.session.user
        });
    };
};

module.exports = {
    isAuthenticated,
    isRedirectIfAuthenticated,
    hasRole
};
