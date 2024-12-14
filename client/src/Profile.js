// client/src/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Make sure this CSS file exists

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get("https://mern-google-login.onrender.com/auth/current_user", { withCredentials: true })
            .then(res => {
                console.log("User data:", res.data); // Check user data for correct profilePicture URL
                setUser(res.data);
            })
            .catch(err => console.error("Error fetching user data:", err));
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
                <h1>Loading...</h1>
            )}
        </div>
    );
}

export default Profile;
