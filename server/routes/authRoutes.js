const router = require('express').Router();
const passport = require('passport');

// Google authentication route
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    res.redirect('/profile'); // Redirect to profile page after successful login
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/');
  });
});

module.exports = router;
