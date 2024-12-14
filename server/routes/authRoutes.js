// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'https://mern-google-login.onrender.com',
}), (req, res) => {
    console.log("User session after login:", req.user);
    res.redirect('https://mern-google-login.onrender.com/profile');
});

router.get('/current_user', (req, res) => {
    console.log("Current user:", req.user);
    res.send(req.user);
});

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('https://mern-google-login.onrender.com');
    });
});

module.exports = router;
