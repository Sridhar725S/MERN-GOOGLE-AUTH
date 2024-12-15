const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    console.log("Serialized user ID:", user.id); // Logs for debugging
    done(null, user.id); // Store only the user ID
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Find user by ID
        if (!user) {
            console.error("No user found during deserialization!");
            return done(null, false); // Invalidate session if no user
        }
        console.log("Deserialized user:", user); // Logs for debugging
        done(null, user); // Attach user to req.user
    } catch (err) {
        console.error("Error in deserialization:", err);
        done(err, null);
    }
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://mern-google-login.onrender.com/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        

        // Attempt to find the user in the database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // User found, update the refresh token if it's returned
            if (refreshToken) {
                user.refreshToken = refreshToken;
                await user.save(); // Save the user with updated refreshToken
            }
            return done(null, user); // Successful authentication
        }

        // Create a new user if one does not exist
        user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            refreshToken: refreshToken // Store refreshToken for future silent logins
        });

        await user.save(); // Save the new user
        done(null, user); // Successful authentication
    } catch (err) {
        console.error("Error authenticating user:", err);
        done(err, null); // Pass the error to done
    }
}));
