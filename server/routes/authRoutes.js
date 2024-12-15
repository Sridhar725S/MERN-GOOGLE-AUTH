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
        res.json(req.user);
    } else {
        res.status(401).send("Not authenticated");
    }
});


router.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error("Error during logout:", err);
        }
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Clear session cookie
            res.redirect('/'); // Redirect to homepage
        });
    });
});



module.exports = router;
