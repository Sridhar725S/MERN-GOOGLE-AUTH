// server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const connectRedis = require('connect-redis'); // Correctly import connect-redis
const { createClient } = require('redis'); // Redis v4 client
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/passportConfig'); // Passport strategy configuration

const authRoutes = require('./routes/authRoutes');
const app = express();

// ==================
// MongoDB Connection
// ==================
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==================
// CORS Middleware
// ==================
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://mern-google-login-client.onrender.com' // Client URL in production
        : 'http://localhost:3000', // Client URL in development
    credentials: true, // Allow cookies
}));

// ==================
// Redis Client Setup
// ==================
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379', // Fallback to local Redis
});

client.on('error', (err) => console.error('❌ Redis Client Error:', err));

client.connect()
    .then(() => console.log('✅ Connected to Redis'))
    .catch((err) => console.error('❌ Redis connection error:', err));

// ==================
// Redis Store for Sessions
// ==================
const RedisStore = connectRedis(session);

app.set('trust proxy', 1); // Trust proxy for Render/Heroku to support secure cookies

app.use(session({
    store: new RedisStore({ client: client }), // Use Redis store
    secret: process.env.SESSION_SECRET || 'yourSecretKey', // Use strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: process.env.NODE_ENV === 'production' ? 'https://mern-google-login-client.onrender.com' : 'localhost', // Set this appropriately
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
        httpOnly: true, // Prevent client-side access
        sameSite: 'None', // Allow cross-origin cookies
    },
}));

// ==================
// Passport Middleware
// ==================
app.use(passport.initialize());
app.use(passport.session());

// ==================
// Routes
// ==================
app.use('/auth', authRoutes);

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// ==================
// Starting the Server
// ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
