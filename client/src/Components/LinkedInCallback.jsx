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
        console.log('3. LinkedIn callback received');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          console.error('4. LinkedIn auth error:', error);
          throw new Error(`LinkedIn auth error: ${error}`);
        }

        if (!code) {
          console.error('4. No authorization code received');
          throw new Error('No authorization code received');
        }

        console.log('5. Sending code to backend:', code);
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/api/linkedin/token`,
          { code }
        );

        console.log('6. Received response from backend:', response.data);

        if (response.data.existingUser) {
          console.log('7a. Existing user - redirecting to home');
          navigate('/home');
        } else {
          console.log('7b. New user - redirecting to profile completion');
          navigate('/profile3', {
            state: {
              userData: response.data.userInfo
            }
          });
        }
      } catch (error) {
        console.error('Error in LinkedIn callback:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/profile1'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error}</p>
        <p className="text-gray-600">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
};

export default LinkedInCallback;