// server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');  // To parse cookies
const jwt = require('jsonwebtoken');  // JWT for validation
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
// Cookie Parser Middleware
// ==================
app.use(cookieParser());

// ==================
// JWT Middleware (to protect routes)
// ==================
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send('Access Denied');
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Invalid Token');
        }
        req.user = user;  // Store the user in the request object
        next();
    });
};

// ==================
// Routes
// ==================
app.use('/auth', authRoutes);

// Protected route example (using JWT)
app.get('/protected', authenticateJWT, (req, res) => {
    res.send('This is a protected route, ' + req.user.username);
});

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
