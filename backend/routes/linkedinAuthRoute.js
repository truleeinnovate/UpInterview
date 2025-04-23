const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const config = require('../config.js');

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

router.post('/check-user', async (req, res) => {
  try {
    console.log('Backend: 1. Received user check request', {
      source: 'Local Server',
      requestOrigin: req.headers.origin,
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: req.body
    });
    const { code, redirectUri } = req.body;

    if (!code) {
      console.log('No authorization code provided');
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    if (!redirectUri) {
      console.log('No redirectUri provided');
      return res.status(400).json({ error: 'No redirectUri provided' });
    }

    console.log('Backend: 2. Exchanging code for token', {
      source: 'LinkedIn API',
      requestMethod: 'POST',
      params: {
        grant_type: 'authorization_code',
        code: code.substring(0, 10) + '...', // Log partial code for security
        redirect_uri: config.REACT_APP_REDIRECT_URI,
        client_id: config.REACT_APP_CLIENT_ID
      }
    });

    let tokenResponse;
    try {
      tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.REACT_APP_REDIRECT_URI,
          client_id: config.REACT_APP_CLIENT_ID,
          client_secret: config.REACT_APP_CLIENT_SECRET
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.error('Token exchange error:', {
        source: 'LinkedIn API',
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      return res.status(500).json({ 
        error: 'Failed to exchange LinkedIn code for token',
        details: error.response?.data || error.message
      });
    }

    const accessToken = tokenResponse.data.access_token;

    console.log('Backend: 3. Getting user info from LinkedIn', {
      source: 'LinkedIn API',
      requestMethod: 'GET',
      endpoint: 'https://api.linkedin.com/v2/userinfo'
    });

    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('Backend: 4. Processing user info', {
      source: 'Backend Processing',
      userInfo: {
        firstName: userInfoResponse.data.given_name,
        lastName: userInfoResponse.data.family_name,
        email: userInfoResponse.data.email
      }
    });

    const userInfo = {
      firstName: userInfoResponse.data.given_name,
      lastName: userInfoResponse.data.family_name,
      email: userInfoResponse.data.email,
      pictureUrl: userInfoResponse.data.picture || null,
      profileUrl: `https://www.linkedin.com/in/${userInfoResponse.data.sub}`
    };

    console.log('Backend: 5. Checking database for existing user', {
      source: 'MongoDB Database',
      query: { Email: userInfo.email }
    });

    const existingUser = await Users.findOne({ Email: userInfo.email });

    console.log('Backend: 5.1 Database response', {
      source: 'MongoDB Database',
      found: Boolean(existingUser),
      userId: existingUser?._id
    });

    console.log('Backend: 6. Sending response with user info', {
      source: 'Backend Response',
      data: {
        existingUser: Boolean(existingUser),
        userInfo: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email
        }
      }
    });

    res.json({
      existingUser: Boolean(existingUser),
      userInfo
    });
  } catch (error) {
    console.error('Backend Error:', {
      source: 'Error Handling',
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      error: 'Failed to process LinkedIn data',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;