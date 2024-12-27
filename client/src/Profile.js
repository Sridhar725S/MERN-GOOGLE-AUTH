// Profile.js (React)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('https://mern-google-login.onrender.com/profile', { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
      });
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
    return (
        <div className="profile-container">
            {user ? (
                <div className="profile-content">
                    <h1>Welcome, {user.username}</h1>
                    <p><strong>Email:</strong> {user.email}</p>
                    <div className="profile-picture-wrapper">
                        <img
                            src={user.profilePicture || 'http://via.placeholder.com/150'}
                            alt="Profile"
                            className="profile-picture"
                            onError={(e) => { e.target.src = 'http://via.placeholder.com/150'; }}
                        />
                    </div>
                    <a href={process.env.NODE_ENV === 'production' 
                        ? 'https://mern-google-login.onrender.com/auth/logout'
                        : 'http://localhost:5000/auth/logout'}>
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
