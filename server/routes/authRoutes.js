// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'https://mern-google-login.onrender.com',
}), (req, res) => {
    res.redirect('https://mern-google-login.onrender.com/profile');
});

router.get('/current_user', (req, res) => {
    res.send(req.user);
});

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('https://mern-google-login.onrender.com');
    });
});

module.exports = router;
