// server/routes/authRoutes.js
const router = require('express').Router();
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'https://mern-google-login.onrender.com',
}), (req, res) => {
    console.log("User session after login:", req.user);
    console.log("User session after login:", req.session); // Log session here
    res.redirect('https://mern-google-login.onrender.com/profile');
});

router.get('/current_user', (req, res) => {
    console.log("Current session:", req.session);
    console.log("Current user:", req.user);
    
    if (req.user) {
        res.status(200).send(req.user); // Send user data if authenticated
    } else {
        res.status(401).send({ error: "User not authenticated" });
    }
});


router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('https://mern-google-login.onrender.com');
    });
});

module.exports = router;
