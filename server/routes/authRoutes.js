// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route (corrected with JWT handling)
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // If user is authenticated, generate a JWT token
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const { user, token } = req.user; // The user and token returned by the Passport strategy

    // Set the JWT in a cookie or send it as part of the response (depends on your implementation)
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });

    // Redirect the user to the profile page
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});

// Protect the current user route with JWT validation
router.get('/current_user', (req, res) => {
    const token = req.cookies.jwt; // Assuming JWT is stored in cookies
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        res.json(decoded); // Return the decoded token (user data)
    });
});

// Example of generating JWT on login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET, // Use the JWT_SECRET from the .env file
            { expiresIn: '1d' } // Set token expiry (e.g., 1 day)
        );

        // Send the token to the client
        res.status(200).json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Logout route (invalidate JWT by clearing the cookie)
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000');
});

module.exports = router;
