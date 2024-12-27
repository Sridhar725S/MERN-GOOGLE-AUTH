// src/Home.js 
import React from 'react';
import './index.css'; // Ensure to import the CSS file
import googleLogo from './assets/google.png'; // Import the Google image

const Login = () => {
    const handleGoogleLogin = () => {
        // Dynamically handle URL for production and development
        const googleLoginURL = process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login.onrender.com/auth/google'
            : 'http://localhost:5000/auth/google';
        window.open(googleLoginURL, '_self');
    };

    return (
        <div className="login-container">
            <h1>Welcome to the App</h1>
            <button className="google-btn" onClick={handleGoogleLogin}>
                <img src={googleLogo} alt="Google Logo" />
                Continue with Google
            </button>
        </div>
    );
};

export default Login;
