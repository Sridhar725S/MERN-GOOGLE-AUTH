// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const MongoStore = require('connect-mongo');
require('dotenv').config();
require('./config/passportConfig');

const authRoutes = require('./routes/authRoutes');
const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.use(cors({
    origin: 'https://mern-google-login.onrender.com',
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB URI for storing sessions
        collectionName: 'sessions', // Name of the collection where sessions will be stored
    }),
    cookie: { 
            secure: true, // Use secure cookies in production
            httpOnly: true, // Prevent client-side JS from accessing cookies
            sameSite: 'none', // Ensure compatibility with cross-site requests
            maxAge: 24 * 60 * 60 * 1000 , // 1-day cookie expiration
            }
    } 
));


app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Starting the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
