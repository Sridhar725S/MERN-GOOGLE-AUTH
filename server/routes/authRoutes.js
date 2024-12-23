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

// Google callback route
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000',
}), (req, res) => {
    if (!req.user) {
        console.error('Authentication failed. req.user is not defined.');
        return res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login-client.onrender.com'
            : 'http://localhost:3000');
    }

    // Store only the user ID in the session
    req.session.userId = req.user.id;
    console.log('User ID stored in session:', req.session.userId);

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
