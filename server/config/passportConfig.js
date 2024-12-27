const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID, // Ensure CLIENT_ID is in .env
    clientSecret: process.env.CLIENT_SECRET, // Ensure CLIENT_SECRET is in .env
    callbackURL: process.env.NODE_ENV === "production" 
        ? "https://mern-google-login.onrender.com/auth/google/callback" // Update with your production URL
        : "http://localhost:5000/auth/google/callback" // Local URL for development
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0].value,
                refreshToken: refreshToken,
            });
            await user.save();
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return done(null, { user, token });
    } catch (err) {
        console.error('Error authenticating user:', err);
        return done(err, null);
    }
}));

passport.deserializeUser((token, done) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        done(null, decoded);
    } catch (err) {
        done(err);
    }
});
