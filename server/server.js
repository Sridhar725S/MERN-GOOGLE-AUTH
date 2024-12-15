const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis').default; // Correct usage for newer versions of connect-redis
const { createClient } = require('redis'); // Import createClient for Redis
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/passportConfig');

const authRoutes = require('./routes/authRoutes');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Redis Client
const redisClient = createClient({
    url: process.env.REDIS_URL, // Use your Redis URL
    legacyMode: true, // For compatibility with older versions of Redis commands
});
redisClient.connect().catch(console.error);

// CORS Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000',
    credentials: true,
}));

// Session Middleware
app.use(session({
    store: new RedisStore({ client: redisClient }), // Use the Redis client for the session store
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    },
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
