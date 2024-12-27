import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; 

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          process.env.NODE_ENV === 'production'
            ? 'https://mern-google-login.onrender.com/protected' 
            : 'http://localhost:5000/protected',
          { withCredentials: true } 
        );
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., redirect to login page)
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-content">
          <h1>Welcome, {user.username}</h1>
          {/* ... other profile details ... */}
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
