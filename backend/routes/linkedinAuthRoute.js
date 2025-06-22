const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const { Contacts } = require('../models/Contacts');
const Tenant = require('../models/Tenant');
const config = require('../config.js');

router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const { generateToken } = require('../utils/jwt')

router.post('/check-user', async (req, res) => {
  console.log('config.REACT_APP_REDIRECT_URI from backend linkedinroutes.js', config.REACT_APP_REDIRECT_URI)
  try {
    console.log('Backend: 1. Received user check request', {
      source: 'Local Server',
      requestOrigin: req.headers.origin,
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: req.body
    });
    const { code } = req.body;

    if (!code) {
      console.log('No authorization code provided');
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for token
    console.log('Backend: 2. Exchanging code for token');
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
      console.error('Token exchange error:', error.response?.data || error.message);
      return res.status(500).json({
        error: 'Failed to exchange LinkedIn code for token',
        details: error.response?.data || error.message
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Get user info from LinkedIn
    console.log('Backend: 3. Getting user info from LinkedIn');
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const userInfo = {
      firstName: userInfoResponse.data.given_name,
      lastName: userInfoResponse.data.family_name,
      email: userInfoResponse.data.email?.trim().toLowerCase(),
      pictureUrl: userInfoResponse.data.picture || null,
      profileUrl: `https://www.linkedin.com/in/${userInfoResponse.data.sub}`
    };

    // Check for existing user
    console.log('Backend: 4. Checking database for existing user');
    const existingUser = await Users.findOne({ email: userInfo.email });

    if (existingUser) {
      // Only send user data, not LinkedIn data
      const payload = {
        userId: existingUser._id.toString(),
        tenantId: existingUser.tenantId,
        organization: false,
        timestamp: new Date().toISOString(),
      };
      const token = generateToken(payload);
      const userData = {
        isProfileCompleted: existingUser.isProfileCompleted,
        roleName: existingUser.roleId ? (await Role.findById(existingUser.roleId))?.roleName : null,
        // Add any other fields you want to send
      };
      return res.json({
        existingUser: true,
        email: existingUser.email,
        token,
      });
    } else {
      // Create new User
      const newUser = await Users.create({
        ...userInfo // includes firstName, lastName, email, pictureUrl, profileUrl
      });

      // Create new Tenant
      const newTenant = await Tenant.create({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        ownerId: newUser._id, // who is created this tenant
      });

      // Create new Contact
      await Contacts.create({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        linkedinUrl: userInfo.profileUrl,
        imageData: {
          path: userInfo.pictureUrl
        },
        ownerId: newUser._id,
        tenantId: newTenant._id,
        createdBy: newUser._id
      });

      // Generate token
      const token = generateToken({
        userId: newUser._id.toString(),
        tenantId: newTenant._id.toString(),
        organization: false,
        timestamp: new Date().toISOString()
      });

      return res.json({
        existingUser: false,
        email: newUser.email,
        token,
      });
    }



    //   let token = null;
    //   let userData = null;

    //   if (existingUser) {
    //     // Generate JWT token for existing user
    //     const payload = {
    //       userId: existingUser._id.toString(),
    //       tenantId: existingUser.tenantId,
    //       organization: false, // Assuming LinkedIn users are not organizations
    //       timestamp: new Date().toISOString(),
    //     };
    //     token = generateToken(payload);
    //     userData = {
    //       isProfileCompleted: existingUser.isProfileCompleted,
    //       roleName: existingUser.roleId ? (await Role.findById(existingUser.roleId))?.roleName : null
    //     };
    //   }

    //   console.log('Backend: 5. Sending response');

    //   const responsePayload = {
    //     existingUser: Boolean(existingUser),
    //     userInfo,
    //     token,
    //     ...userData
    //   };

    //   console.log('final response :-', responsePayload);

    //   res.json(responsePayload);

  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({
      error: 'Failed to process LinkedIn data',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;