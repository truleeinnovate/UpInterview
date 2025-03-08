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
        console.log('1. LinkedIn callback received');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        console.log('2. Fetching user details with code:', code);
        const response = await axios.post(`${config.REACT_APP_API_URL}/linkedin/check-user`, { code });
        console.log('3. User details received:', response.data);

        const { userInfo } = response.data;
    
        console.log('LinkedIn data received:', userInfo);
    
        if (response.data.existingUser) {
          console.log('4a. User exists - redirecting to login');
          alert('Account already exists. Please login.');
          navigate('/profile1');
        } else {
          console.log('4b. New user - navigating to profile3');
          navigate('/profile3', {
            state: {
              linkedInData: {
                firstName: response.data.userInfo.firstName,
                lastName: response.data.userInfo.lastName,
                email: response.data.userInfo.email
              }
            }
          });
        }
      } catch (error) {
        console.error('Error in LinkedIn callback:', error);
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