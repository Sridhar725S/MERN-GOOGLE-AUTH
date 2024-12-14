// src/Login.js
import React from 'react';
import './index.css'; // Ensure to import the CSS file
import googleLogo from './assets/google.png'; // Import the Google image

const Login = () => {
    const handleGoogleLogin = () => {
        // Add your Google login logic here
        window.open('https://mern-google-login.onrender.com/auth/google', '_self'); // Adjust the URL as necessary
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
