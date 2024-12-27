const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route (JWT handling)
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const { user, token } = req.user;

    // Set JWT in a cookie or send it as part of the response
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure cookies are sent securely
        sameSite: 'None' // Required for cross-site cookies
    });

    // Redirect to profile page
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Protect the current user route with JWT validation
router.get('/current_user', (req, res) => {
    const token = req.cookies.jwt; // JWT from cookies

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        res.json(decoded); // Send back decoded user data
    });
});

// Logout route (clear the JWT cookie)
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000');
});

// Example route with JWT auth
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'You have access to this route' });
});

module.exports = router;
