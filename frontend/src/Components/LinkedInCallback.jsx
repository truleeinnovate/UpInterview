import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config.js';
import { setAuthCookies } from '../utils/AuthCookieManager/AuthCookieManager.jsx';
import Loading from '../Components/Loading.js';

const LinkedInCallback = () => {
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
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
        console.log('recieved response from the backend :-',response, response.data)

        const { userInfo, existingUser, token, isProfileCompleted, roleName } = response.data;

        if (existingUser) {
          if (token) {
            setAuthCookies(token);
          }

          if (typeof isProfileCompleted === 'undefined' || isProfileCompleted === true) {
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
        <Loading message="Processing LinkedIn login..." />
      ) : error ? (
        <Loading message={`Error: ${error}. Redirecting to login page...`} />
      ) : null}
    </div>
  );
};

export default LinkedInCallback;
