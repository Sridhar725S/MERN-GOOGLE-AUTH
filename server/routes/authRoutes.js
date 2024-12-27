const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const { user, token } = req.user;

    // Set JWT token in cookies
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });

    // Redirect to profile page
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Current user route (JWT validation)
router.get('/current_user', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        res.json(decoded); 
    });
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login.onrender.com'
        : 'http://localhost:3000');
});

module.exports = router;
