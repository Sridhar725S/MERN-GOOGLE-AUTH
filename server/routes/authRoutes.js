const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google callback route (JWT handling)
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const { user } = req.user;

    // Create a JWT token
    const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // Set JWT in a cookie (You could alternatively send it in the response body or headers)
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Secure cookie for production
        sameSite: 'None'  // Required for cross-site cookies
    });

    // Redirect to profile page
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Protect the current user route with JWT validation
router.get('/current_user', (req, res) => {
    const token = req.cookies.jwt;  // JWT from cookies

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        res.json(decoded);  // Send back decoded user data
    });
});

// Logout route (clear the JWT cookie)
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000');
});

// Example route with JWT auth (no session, JWT used)
router.get('/protected', (req, res) => {
    const token = req.cookies.jwt;  // Get JWT from cookies

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        res.json({ message: 'You have access to this route', user: decoded });
    });
});

module.exports = router;
