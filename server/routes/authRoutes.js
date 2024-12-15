// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'https://mern-google-login.onrender.com',
}), (req, res) => {
    if (req.user) {
        console.log("User session after login:", req.user);
        res.redirect('https://mern-google-login.onrender.com/profile');
    } else {
        res.redirect('https://mern-google-login.onrender.com');
    }
});

router.get('/auth/current_user', (req, res) => {
    if (req.isAuthenticated()) {
        console.log("Authenticated user:", req.user);
        res.status(200).json(req.user); // Send user data
    } else {
        console.error("User not authenticated!");
        res.status(401).json({ error: "Not authenticated" });
    }
});





router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('https://mern-google-login.onrender.com');
    });
});

module.exports = router;
