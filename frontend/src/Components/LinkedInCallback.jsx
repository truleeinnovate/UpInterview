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
        
        // Add timeout to the request
        const response = await axios.post(`${config.REACT_APP_API_URL}/linkedin/check-user`, 
          { code },
          {
            timeout: 20000, // 20 second timeout
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: false // Important for CORS - don't send credentials for now
          }
        );
        
        console.log('3. User details received:', response.data);

        const { userInfo } = response.data;

        console.log('4.0: LinkedIn data received:', userInfo);

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
        navigate('/');
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to login page in 5 seconds...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4">Processing your information...</p>
        </div>
      )}
    </div>
  );
};

export default LinkedInCallback;