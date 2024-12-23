// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/current_user', (req, res) => {
    res.send(req.user);
});

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000',
}), (req, res) => {
      // Store only the user ID in the session
    req.session.userId = req.user.id;

    console.log('User ID stored in session:', req.session.userId);
    
    if (!req.user) {
        console.error('Authentication failed. req.user is not defined.');
        return res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login-client.onrender.com'
            : 'http://localhost:3000');
    }

    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com/profile'
        : 'http://localhost:3000/profile');
});



router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login-client.onrender.com'
            : 'http://localhost:3000');
    });
});

module.exports = router;
