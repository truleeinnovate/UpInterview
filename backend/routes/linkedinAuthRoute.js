const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const config = require('../config.js');

// router.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   // Handle preflight OPTIONS requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
//   next();
// });

// router.post('/check-user', async (req, res) => {
//   try {
//     console.log('Backend: 1. Received user check request', {
//       source: 'Local Server',
//       requestOrigin: req.headers.origin,
//       requestMethod: req.method,
//       requestPath: req.path
//     });
//     const { code } = req.body;

//     if (!code) {
//       return res.status(400).json({ error: 'No authorization code provided' });
//     }

//     // Exchange code for token with available scopes
//     console.log('Backend: 2. Exchanging code for token', {
//       source: 'LinkedIn API',
//       requestMethod: 'POST'
//     });
//     let tokenResponse;
//     try {
//       tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
//         params: {
//           grant_type: 'authorization_code',
//           code,
//           redirect_uri: config.REACT_APP_REDIRECT_URI,
//           client_id: config.REACT_APP_CLIENT_ID,
//           client_secret: config.REACT_APP_CLIENT_SECRET
//         },
//         timeout: 10000,
//         headers: {
//           'Accept': 'application/json'
//         }
//       });
//     } catch (error) {
//       console.error('Token exchange error:', {
//         source: 'LinkedIn API',
//         error: error.response?.data || error.message
//       });
//       return res.status(500).json({ 
//         error: 'Failed to exchange LinkedIn code for token',
//         details: error.response?.data || error.message
//       });
//     }

//     const accessToken = tokenResponse.data.access_token;

//     // Get user info from OpenID Connect userinfo endpoint
//     console.log('Backend: 3. Getting user info from LinkedIn', {
//       source: 'LinkedIn API',
//       requestMethod: 'GET',
//       endpoint: 'https://api.linkedin.com/v2/userinfo'
//     });
//     const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Accept': 'application/json'
//       },
//       timeout: 10000
//     });

//     console.log('Backend: 4. Processing user info', {
//       source: 'Backend Processing',
//       userInfo: {
//         firstName: userInfoResponse.data.given_name,
//         lastName: userInfoResponse.data.family_name,
//         email: userInfoResponse.data.email
//       }
//     });

//     const userInfo = {
//       firstName: userInfoResponse.data.given_name,
//       lastName: userInfoResponse.data.family_name,
//       email: userInfoResponse.data.email,
//       pictureUrl: userInfoResponse.data.picture || null,
//       profileUrl: `https://www.linkedin.com/in/${userInfoResponse.data.sub}`
//     };

//     console.log('Backend: 5. Checking database for existing user', {
//       source: 'MongoDB Database',
//       query: { Email: userInfo.email }
//     });
//     const existingUser = await Users.findOne({ Email: userInfo.email });
//     console.log('Backend: 5.1 Database response', {
//       source: 'MongoDB Database',
//       found: Boolean(existingUser),
//       userId: existingUser?._id
//     });
    
//     console.log('Backend: 6. Sending response with user info', {
//       source: 'Backend Response',
//       data: {
//         existingUser: Boolean(existingUser),
//         userInfo: {
//           firstName: userInfo.firstName,
//           lastName: userInfo.lastName,
//           email: userInfo.email
//         }
//       }
//     });
//     res.json({
//       existingUser: Boolean(existingUser),
//       userInfo
//     });

//   } catch (error) {
//     console.error('Backend Error:', {
//       source: 'Error Handling',
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status
//     });
    
//     const statusCode = error.response?.status || 500;
//     res.status(statusCode).json({ 
//       error: 'Failed to process LinkedIn data',
//       details: error.response?.data || error.message
//     });
//   }
// });

// Add CORS middleware for this route
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://app.upinterview.io');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const { generateToken } = require('../utils/jwt');

router.post('/check-user', async (req, res) => {
  try {
    console.log('Backend: 1. Received user check request', {
      source: 'Local Server',
      requestOrigin: req.headers.origin,
      requestMethod: req.method,
      requestPath: req.path,
    });
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for token with available scopes
    console.log('Backend: 2. Exchanging code for token', {
      source: 'LinkedIn API',
      requestMethod: 'POST',
    });
    let tokenResponse;

    console.log('Backend: 2.1. Exchanging code for token', {
      source: 'LinkedIn API',
      requestMethod: 'POST',
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });

    try {
      tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          },
        }
      );
    } catch (error) {
      console.error('Backend Error:', error);
      return res.status(error.response?.status || 500).json({
        error: 'Failed to exchange LinkedIn code for token',
        details: error.response?.data || error.message,
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Fetch user info (existing logic)
    console.log('Backend: 3. Getting user info from LinkedIn', {
      source: 'LinkedIn API',
      requestMethod: 'GET',
      endpoint: 'https://api.linkedin.com/v2/me',
    });
    const userResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('Backend: 4. Getting user email from LinkedIn', {
      source: 'LinkedIn API',
      requestMethod: 'GET',
      endpoint: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
    });
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userInfo = {
      firstName: userResponse.data.localizedFirstName,
      lastName: userResponse.data.localizedLastName,
      email: emailResponse.data.elements[0]['handle~'].emailAddress,
      pictureUrl: userResponse.data.profilePicture?.['displayImage~']?.elements[0]?.identifiers[0]?.identifier || '',
      profileUrl: `https://www.linkedin.com/in/${userResponse.data.vanityName}`,
    };

    const loginEmail = userInfo.email.toLowerCase();
    const existingUser = await Users.findOne({ email: loginEmail });

    console.log('Backend: 5. Checking database for existing user', {
      source: 'MongoDB Database',
      query: { Email: loginEmail },
    });

    if (existingUser) {
      // Generate JWT for existing user
      console.log('Backend: 6. Generating JWT for existing user', {
        source: 'Backend Response',
        data: {
          existingUser: true,
          userInfo,
          userId: existingUser._id.toString(),
        },
      });
      const payload = {
        userId: existingUser._id.toString(),
        organization: false,
        timestamp: new Date().toISOString(),
      };
      const token = generateToken(payload);

      res.json({
        existingUser: true,
        userInfo,
        userId: existingUser._id.toString(),
        token,
      });
    } else {
      console.log('Backend: 6. Responding with user info', {
        source: 'Backend Response',
        data: {
          existingUser: false,
          userInfo,
        },
      });
      res.json({
        existingUser: false,
        userInfo,
      });
    }
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to process LinkedIn data',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;