const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const config = require('../config');

router.post('/token', async (req, res) => {
  try {
    console.log('Backend: 1. Received token request');
    const { code } = req.body;

    if (!code) {
      console.error('Backend: No code provided');
      return res.status(400).json({ error: 'No code provided' });
    }
    
    console.log('Backend: 2. Authorization code received:', code);

    // Exchange code for tokens using OpenID Connect endpoint
    console.log('Backend: 3. Attempting to exchange code for access token');
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.REACT_APP_REDIRECT_URI,
        client_id: config.REACT_APP_CLIENT_ID,
        client_secret: config.REACT_APP_CLIENT_SECRET
      }
    });
    console.log('Backend: 4. Access token received');

    // Get user info from OpenID Connect userinfo endpoint
    console.log('Backend: 5. Fetching user info using access token');
    const userInfoResponse = await axios.get('https://www.linkedin.com/oauth/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access_token}`
      }
    });

    const userInfo = userInfoResponse.data;
    console.log('Backend: 6. User info received:', {
      email: userInfo.email,
      name: `${userInfo.given_name} ${userInfo.family_name}`,
      sub: userInfo.sub
    });
    
    // Check if user exists in database
    console.log('Backend: 7. Checking if user exists in database');
    const existingUser = await Users.findOne({ Email: userInfo.email });
    console.log('Backend: 8. User exists:', Boolean(existingUser));

    console.log('Backend: 9. Sending response to frontend');
    res.json({
      success: true,
      existingUser: Boolean(existingUser),
      userInfo: {
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        id: userInfo.sub
      }
    });

  } catch (error) {
    console.error('Backend: Error in LinkedIn authentication:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Log specific error details
    if (error.response) {
      console.error('Backend: API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }

    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.response?.data || error.message 
    });
  }
});

// router.post('/check-user', async (req, res) => {
//   try {
//     console.log('Backend: 1. Received user check request');
//     const { code } = req.body;

//     // Exchange code for token
//     console.log('Backend: 2. Exchanging code for token');
//     const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
//       params: {
//         grant_type: 'authorization_code',
//         code,
//         redirect_uri: config.REACT_APP_REDIRECT_URI,
//         client_id: config.REACT_APP_CLIENT_ID,
//         client_secret: config.REACT_APP_CLIENT_SECRET
//       }
//     });

//     // Get user info using token
//     console.log('Backend: 3. Getting user info from LinkedIn');
//     const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
//       headers: {
//         'Authorization': `Bearer ${tokenResponse.data.access_token}`
//       }
//     });

//     const userInfo = userInfoResponse.data;
//     console.log('Backend: 4. Checking if user exists in database');

//     // Check if user exists in database
//     const existingUser = await Users.findOne({ Email: userInfo.email });
//     console.log('Backend: 5. User exists:', Boolean(existingUser));

//     res.json({
//       existingUser: Boolean(existingUser),
//       userInfo: {
//         firstName: userInfo.given_name,
//         lastName: userInfo.family_name,
//         email: userInfo.email
//       }
//     });

//   } catch (error) {
//     console.error('Backend Error:', error);
//     res.status(500).json({ error: 'Failed to process request' });
//   }
// });

// In your backend LinkedIn API route
router.post('/check-user', async (req, res) => {
  try {
    const { code } = req.body;
    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', /* ... */);
    
    // Get basic profile info
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${tokenResponse.data.access_token}` }
    });

    // Get profile picture
    const pictureResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', {
      headers: { 'Authorization': `Bearer ${tokenResponse.data.access_token}` }
    });

    // Get email address
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { 'Authorization': `Bearer ${tokenResponse.data.access_token}` }
    });

    const userInfo = {
      firstName: profileResponse.data.localizedFirstName,
      lastName: profileResponse.data.localizedLastName,
      email: emailResponse.data.elements[0]['handle~'].emailAddress,
      pictureUrl: pictureResponse.data.profilePicture?.['displayImage~']?.elements[0]?.identifiers[0]?.identifier,
      profileUrl: `https://www.linkedin.com/in/${profileResponse.data.id}`
    };

    res.json({
      existingUser: false,
      userInfo
    });

  } catch (error) {
    console.error('LinkedIn API error:', error);
    res.status(500).json({ error: 'Failed to process LinkedIn data' });
  }
});

module.exports = router;