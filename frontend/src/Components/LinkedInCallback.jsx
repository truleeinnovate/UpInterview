import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config.js';

const LinkedInCallback = () => {
  console.log('navigated to call back');
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('1. LinkedIn callback received');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }

        console.log('2. Fetching user details with code:', code);
        
        // Add timeout and retry logic to the request
        const response = await axios.post(`${config.REACT_APP_API_URL}/linkedin/check-user`, 
          { code },
          {
            timeout: 20000, // 20 second timeout
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: false, // Don't send credentials for CORS
            maxRedirects: 0, // Prevent redirect loops
            validateStatus: function (status) {
              return status >= 200 && status < 300; // default
            }
          }
        );
        
        console.log('3. User details received:', response.data);

        const { userInfo } = response.data;

        console.log('4. LinkedIn complete data:', {
          name: `${userInfo.firstName} ${userInfo.lastName}`,
          email: userInfo.email,
          picture: userInfo.pictureUrl,
          profileUrl: userInfo.profileUrl
        });

        if (response.data.existingUser) {
          console.log('4a. User exists - redirecting to login');
          navigate('/home');
        } else {
          console.log('4b. New user - navigating to profile3');
          navigate('/profile3', {
            state: {
              linkedInData: {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                pictureUrl: userInfo.pictureUrl,
                profileUrl: userInfo.profileUrl
              }
            }
          });
        }
      } catch (error) {
        console.error('Error in LinkedIn callback:', error);
        setError(error.message || 'Failed to process LinkedIn login');
        // Log more details about the error
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  // Redirect to login page after 5 seconds if there's an error
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        navigate('/login', { 
          state: { error: 'LinkedIn login failed. Please try again.' }
        });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [error, navigate]);

  return (
    <div className="linkedin-callback">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing LinkedIn login...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>LinkedIn login failed. Please try again.</p>
        </div>
      ) : null}
    </div>
  );
};

export default LinkedInCallback;