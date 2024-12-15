const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const connectRedis = require('connect-redis'); // Import connect-redis
const Redis = require('ioredis'); // Import ioredis for Redis client
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/passportConfig');

const authRoutes = require('./routes/authRoutes');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// CORS Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com'
        : 'http://localhost:3000',
    credentials: true,
}));

// Redis Client Setup using internal Redis URL (e.g., redis://localhost:6379 or your internal Redis URL)
const redisClient = new Redis(process.env.REDIS_URL); // Directly using REDIS_URL from environment variables

// Check Redis connectivity
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));

// Initialize RedisStore (Correct method for v8.x)
const RedisStore = connectRedis(session); // Correct way to initialize RedisStore in v8.x

// Session Middleware
app.use(session({
    store: new RedisStore({
        client: redisClient // pass the redis client here
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1-day expiration
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        httpOnly: true,
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
