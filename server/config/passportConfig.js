const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const session = require('express-session');

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === "production" 
    ? "https://mern-google-login.onrender.com/auth/google/callback" 
    : "http://localhost:5000/auth/google/callback",
  session: true,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value,
      });
      await user.save();
    }

    req.session.user = user; // Store user in session
    done(null, user);
  } catch (err) {
    console.error('Error authenticating user:', err);
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
