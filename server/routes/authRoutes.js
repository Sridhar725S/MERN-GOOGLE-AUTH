// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Current user route
router.get('/current_user', (req, res) => {
    console.log('Current user:', req.user); 
    res.send(req.user);
});

// Google callback route (corrected with /auth in the route)
router.get('/auth/google/callback', passport.authenticate('google', {
    
    failureRedirect: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000',
}), (req, res) => {
    // Handle successful authentication
    if (!req.user) {
        console.error('Authentication failed. req.user is not defined.');
        return res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login-client.onrender.com'
            : 'http://localhost:3000');
    }

    console.log('User authenticated successfully:', req.user);

    // Store the user ID in the session (use req.session if session middleware is used)
    if (req.session) {
        req.session.userId = req.user.id;
        console.log('User ID stored in session:', req.session.userId);
    } else {
        console.error('Session middleware is not set up correctly.');
    }

    // Redirect to the profile page on the client
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Logout route
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login-client.onrender.com'
            : 'http://localhost:3000');
    });
});

module.exports = router;
