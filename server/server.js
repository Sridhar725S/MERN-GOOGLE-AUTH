import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis'; // Redis client library
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import './config/passportConfig.js'; // Adjust to ensure compatibility with ESM imports
import authRoutes from './routes/authRoutes.js';

dotenv.config();
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

// Redis Client Setup
const redisClient = new Redis(process.env.REDIS_URL);

// Check Redis connectivity
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));

// Initialize RedisStore
const redisStore = new RedisStore({
    client: redisClient, // Use the Redis client for the store
});

// Session Middleware
app.use(session({
    store: redisStore, // Use the RedisStore instance
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
    app.use(express.static(path.resolve('client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve('client/build', 'index.html'));
    });
}

// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
