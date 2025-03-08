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
        console.log('3. Received callback from LinkedIn');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          console.error('4. No authorization code received');
          throw new Error('No authorization code received');
        }

        // Exchange code for user info
        console.log('5. Getting user details from LinkedIn');
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/linkedin/check-user`,
          { code }
        );

        console.log('6. Received user details:', response.data);

        if (response.data.existingUser) {
          console.log('7a. User exists - showing message');
          alert('This email is already registered. Please login instead.');
          navigate('/profile1');
        } else {
          console.log('7b. New user - proceeding to profile completion');
          navigate('/profile3', {
            state: {
              userData: {
                firstName: response.data.userInfo.firstName,
                lastName: response.data.userInfo.lastName,
                email: response.data.userInfo.email
              }
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/profile1'), 3000);
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