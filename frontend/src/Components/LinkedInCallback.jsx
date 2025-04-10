import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config.js';

const LinkedInCallback = () => {
  console.log('navigated to call back');
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('config.REACT_APP_API_URL :-', config.REACT_APP_API_URL);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Frontend: 1. LinkedIn callback received', {
          source: 'Browser',
          currentUrl: window.location.href,
          searchParams: window.location.search
        });
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }

        console.log('Frontend: 2. Fetching user details with code', {
          source: 'Local API',
          apiEndpoint: `${config.REACT_APP_API_URL}/linkedin/check-user`,
          codeLength: code.length
        });

        // Add timeout and retry logic to the request
        const response = await axios.post(`${config.REACT_APP_API_URL}/linkedin/check-user`,
          { code, redirectUri: window.location.origin + '/callback' },
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

        console.log('Frontend: 3. User details received', {
          source: 'API Response',
          existingUser: response.data.existingUser,
          userInfo: {
            firstName: response.data.userInfo.firstName,
            lastName: response.data.userInfo.lastName,
            email: response.data.userInfo.email
          }
        });

        const { userInfo } = response.data;

        console.log('Frontend: 4. LinkedIn complete data', {
          source: 'Processed Data',
          data: {
            name: `${userInfo.firstName} ${userInfo.lastName}`,
            email: userInfo.email,
            picture: userInfo.pictureUrl,
            profileUrl: userInfo.profileUrl
          }
        });

        if (response.data.existingUser) {
          console.log('Frontend: 4a. User exists - redirecting to login', {
            source: 'Navigation',
            destination: '/home'
          });
          navigate('/home');
        } else {
          console.log('Frontend: 4b. New user - navigating to profile3', {
            source: 'Navigation',
            destination: '/profile3',
            data: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              email: userInfo.email
            }
          });
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
        console.error('Frontend: Error in LinkedIn callback', {
          source: 'Error Handling',
          message: error.message || 'Failed to process LinkedIn login',
          errorDetails: {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          }
        });
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
      console.log('Frontend: Error redirecting to login', {
        source: 'Error Recovery',
        destination: '/login',
        error: error
      });
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
          <p>Error: {error}</p>
          <p>Redirecting to login page...</p>
        </div>
      ) : null}
    </div>
  );
};

export default LinkedInCallback;