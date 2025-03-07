import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No code received');
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post(`${config.REACT_APP_API_URL}/api/linkedin/token`, { code });
        
        // Get user data using id_token
        const idToken = tokenResponse.data.id_token;
        const userData = JSON.parse(atob(idToken.split('.')[1]));

        // Check if user exists in your database
        const checkUser = await axios.get(`${config.REACT_APP_API_URL}/users?email=${userData.email}`);

        if (checkUser.data.length > 0) {
          // User exists - log them in
          navigate('/home');
        } else {
          // New user - redirect to profile completion
          navigate('/profile3', {
            state: {
              userData: {
                email: userData.email,
                firstName: userData.given_name,
                lastName: userData.family_name
              }
            }
          });
        }
      } catch (err) {
        setError('Authentication failed. Please try again.');
        console.error('LinkedIn callback error:', err);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LinkedInCallback;