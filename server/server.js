const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
require('dotenv').config();
require('./config/passportConfig');

const authRoutes = require('./routes/authRoutes');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Session Configuration
const sessionStore = new MongoStore({
  mongooseUrl: process.env.MONGO_URI,
  collection: 'sessions',
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  },
}));

// Other Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://mern-google-login-client.onrender.com'
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Passport and Authentication
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

// Protected Route Example (using session)
app.get('/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }
  res.send('This is a protected route, ' + req.session.user.username);
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ${PORT}');
});
