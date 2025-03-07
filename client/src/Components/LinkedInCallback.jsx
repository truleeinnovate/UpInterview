// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { config } from '../config.js';

// const LinkedInCallback = () => {
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const handleCallback = async () => {
//       try {
//         const urlParams = new URLSearchParams(window.location.search);
//         const code = urlParams.get('code');

//         if (!code) {
//           throw new Error('No code received');
//         }

//         // Exchange code for tokens
//         const tokenResponse = await axios.post(`${config.REACT_APP_API_URL}/api/linkedin/token`, { code });
        
//         // Get user data using id_token
//         const idToken = tokenResponse.data.id_token;
//         const userData = JSON.parse(atob(idToken.split('.')[1]));

//         // Check if user exists in your database
//         const checkUser = await axios.get(`${config.REACT_APP_API_URL}/users?email=${userData.email}`);

//         if (checkUser.data.length > 0) {
//           // User exists - log them in
//           navigate('/home');
//         } else {
//           // New user - redirect to profile completion
//           navigate('/profile3', {
//             state: {
//               userData: {
//                 email: userData.email,
//                 firstName: userData.given_name,
//                 lastName: userData.family_name
//               }
//             }
//           });
//         }
//       } catch (err) {
//         setError('Authentication failed. Please try again.');
//         console.error('LinkedIn callback error:', err);
//       }
//     };

//     handleCallback();
//   }, [navigate]);

//   if (error) {
//     return <div className="text-red-500 text-center mt-4">{error}</div>;
//   }

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//     </div>
//   );
// };

// export default LinkedInCallback;

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
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('Authorization code not found');
        }

        // Exchange code for user data
        const response = await axios.post(`${config.REACT_APP_API_URL}/api/linkedin/token`, { code });

        // Check if we got user data
        if (!response.data || !response.data.userInfo) {
          throw new Error('Failed to get user information');
        }

        const userData = response.data.userInfo;

        // Check if user exists in database
        const checkUserResponse = await axios.get(`${config.REACT_APP_API_URL}/users?email=${userData.email}`);

        if (checkUserResponse.data.length > 0) {
          // Existing user - redirect to home
          navigate('/home');
        } else {
          // New user - redirect to profile completion
          navigate('/profile3', {
            state: {
              userData: {
                email: userData.email,
                firstName: userData.given_name,
                lastName: userData.family_name,
                linkedinId: userData.sub
              }
            }
          });
        }
      } catch (error) {
        console.error('LinkedIn callback error:', error);
        setError('Authentication failed. Please try again.');
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/profile1'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  // Show loading or error state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="text-red-500 text-center p-4 rounded-lg bg-red-50">
          <p>{error}</p>
          <p className="text-sm mt-2">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Processing your login...</p>
        </div>
      )}
    </div>
  );
};

export default LinkedInCallback;