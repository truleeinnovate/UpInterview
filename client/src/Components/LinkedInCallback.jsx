import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const LinkedInCallback = () => {
  console.log('navigated to call back');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Fetching LinkedIn user data...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        const response = await axios.post(`${config.REACT_APP_API_URL}/linkedin/check-user`, { code });
        const { existingUser, userInfo } = response.data;
        
        console.log('LinkedIn data received:', userInfo);
    
        if (existingUser) {
          alert('Account already exists. Please login.');
          navigate('/profile1');
        } else {
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
        console.error('LinkedIn data fetch error:', error);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to login page...</p>
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