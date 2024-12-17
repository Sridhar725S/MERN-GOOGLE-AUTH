const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === "production" 
        ? "https://mern-google-login.onrender.com/auth/google/callback" 
        : "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    console.log('Google profile:', profile); 
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            if (refreshToken) {
                user.refreshToken = refreshToken;
                await user.save();
            }
            return done(null, user);
        }

        user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            refreshToken: refreshToken,
        });

        await user.save();
        done(null, user);
    } catch (err) {
        console.error("Error authenticating user:", err);
        done(err, null);
    }
}));

