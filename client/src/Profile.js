// client/src/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Make sure this CSS file exists

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('https://mern-google-login.onrender.com/auth/current_user', {
        withCredentials: true, // Include cookies
        })
        .then(response => {
            console.log("User data:", response.data);
            setUser(response.data); // Set user data in state
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            setUser(null); // Reset user data
        });
    }, []);



    return (
    <div className="profile-container">
        {user ? (
            <div className="profile-content">
                <h1>Welcome, {user.username}</h1>
                <p><strong>Email:</strong> {user.email}</p>
                <div className="profile-picture-wrapper">
                    <img
                        src={user.profilePicture || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="profile-picture"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                    />
                </div>
                <a href="https://mern-google-login.onrender.com/auth/logout">
                    <button className="logout-btn">Logout</button>
                </a>
            </div>
        ) : (
            <div>
                <h1>You are not logged in!</h1>
                <a href="https://mern-google-login.onrender.com/auth/google">
                    <button className="login-btn">Login with Google</button>
                </a>
            </div>
        )}
    </div>
);

}

export default Profile;
