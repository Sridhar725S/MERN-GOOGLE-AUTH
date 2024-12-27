// server.js
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Passport
require('./config/passportConfig'); // This will handle Google login strategy

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // Client URL (React app)
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// =====================
// Authentication Routes
// =====================

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Upon successful login, generate a JWT token and send it in the response
  const token = jwt.sign({ id: req.user.id, username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Set JWT in HTTP-only cookie
  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });

  res.redirect('/profile'); // Redirect to the profile page after login
});

// =====================
// Middleware to verify JWT
// =====================

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid Token');
    }
    req.user = user;  // Attach user info to the request
    next();
  });
};

// =====================
// Profile Route (protected by JWT)
// =====================

app.get('/profile', authenticateJWT, (req, res) => {
  res.json({
    message: 'Welcome to your profile',
    user: req.user,  // User information stored in JWT
  });
});

// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
