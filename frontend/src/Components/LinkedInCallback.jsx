import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config.js';
import { setAuthCookies } from '../utils/AuthCookieManager/AuthCookieManager.jsx';

const LinkedInCallback = () => {
  console.log('linked in call back')
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }

        const response = await axios.post(
          `${config.REACT_APP_API_URL}/linkedin/check-user`,
          { code, redirectUri: window.location.origin + '/callback' },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const { userInfo, existingUser, token, isProfileCompleted, roleName } = response.data;

        if (existingUser) {
          // Store JWT in cookies if token exists
          if (token) {
            setAuthCookies(token);
          }
          
          // Handle navigation based on profile completion status
          if (typeof isProfileCompleted === 'undefined') {
            navigate('/home');
          } else if (isProfileCompleted === true) {
            navigate('/home');
          } else if (isProfileCompleted === false && roleName) {
            navigate('/complete-profile', {
              state: { isProfileComplete: true, roleName },
            });
          } else {
            navigate('/home');
          }
        } else {
          navigate('/select-profession', {
            state: {
              linkedInData: {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                pictureUrl: userInfo.pictureUrl,
                profileUrl: userInfo.profileUrl,
              },
            },
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

  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        navigate('/', {
          state: { error: 'LinkedIn login failed. Please try again.' },
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