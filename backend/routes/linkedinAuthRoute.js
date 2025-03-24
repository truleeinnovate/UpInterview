const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const config = require('../config');

router.post('/check-user', async (req, res) => {
  try {
    console.log('Backend: 1. Received user check request');
    const { code } = req.body;

    // Exchange code for token with available scopes
    console.log('Backend: 2. Exchanging code for token');
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.REACT_APP_REDIRECT_URI,
        client_id: config.REACT_APP_CLIENT_ID,
        client_secret: config.REACT_APP_CLIENT_SECRET
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user info from OpenID Connect userinfo endpoint
    console.log('Backend: 3. Getting user info from LinkedIn');
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Backend: 4. Processing user info');
    const userInfo = {
      firstName: userInfoResponse.data.given_name,
      lastName: userInfoResponse.data.family_name,
      email: userInfoResponse.data.email,
      pictureUrl: userInfoResponse.data.picture || null, // OpenID Connect profile picture
      profileUrl: `https://www.linkedin.com/in/${userInfoResponse.data.sub}`
    };

    console.log('Backend: 5. Checking if user exists in database');
    const existingUser = await Users.findOne({ Email: userInfo.email });
    
    console.log('Backend: 6. Sending response with user info:', userInfo);
    res.json({
      existingUser: Boolean(existingUser),
      userInfo
    });

  } catch (error) {
    console.error('Backend Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      error: 'Failed to process LinkedIn data',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;