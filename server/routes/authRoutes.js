// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');  // Import JWT

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Current user route (to get the logged-in user data)
router.get('/current_user', (req, res) => {
    if (req.user) {
        return res.send(req.user);  // If authenticated, send user info
    }
    return res.status(401).send('Not authenticated');  // Not authenticated
});

// Google callback route (JWT token generation after successful login)
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === 'production' 
        ? 'https://mern-google-login-client.onrender.com' 
        : 'http://localhost:3000'
}), (req, res) => {
    if (!req.user) {
        console.error('Authentication failed. req.user is not defined.');
        return res.redirect(process.env.NODE_ENV === 'production' 
            ? 'https://mern-google-login-client.onrender.com' 
            : 'http://localhost:3000');
    }

    console.log('User authenticated successfully:', req.user);

    // Generate JWT and send it in cookies
    const token = jwt.sign({ id: req.user.id, username: req.user.username }, process.env.JWT_SECRET, {
        expiresIn: '1d'  // Token expiration time
    });

    // Send token in response cookies
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Only secure in production
        sameSite: 'None',  // Allow cross-origin cookies
        maxAge: 24 * 60 * 60 * 1000  // 1 day
    });

    // Redirect to profile page
    res.redirect(process.env.NODE_ENV === 'production' 
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Logout route (clear the JWT cookie)
router.get('/logout', (req, res) => {
    res.clearCookie('jwt', { path: '/' });
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000');
});

module.exports = router;
