// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const { Users } = require('../models/Users');
// const config = require('../config');

// router.post('/token', async (req, res) => {
//     try {
//         console.log('Processing LinkedIn authentication...');
//         const { code } = req.body;

//         if (!code) {
//             return res.status(400).json({ error: 'Authorization code is required' });
//         }

//         // Exchange code for tokens
//         const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
//             params: {
//                 grant_type: 'authorization_code',
//                 code,
//                 redirect_uri: config.REACT_APP_REDIRECT_URI,
//                 client_id: config.REACT_APP_CLIENT_ID,
//                 client_secret: config.REACT_APP_CLIENT_SECRET
//             }
//         });

//         // Get user profile
//         const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
//             headers: {
//                 'Authorization': `Bearer ${tokenResponse.data.access_token}`
//             }
//         });

//         // Get user email
//         const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
//             headers: {
//                 'Authorization': `Bearer ${tokenResponse.data.access_token}`
//             }
//         });

//         const userEmail = emailResponse.data.elements[0]['handle~'].emailAddress;

//         // Check if user exists
//         const existingUser = await Users.findOne({ Email: userEmail });

//         res.json({
//             access_token: tokenResponse.data.access_token,
//             userInfo: {
//                 email: userEmail,
//                 firstName: profileResponse.data.localizedFirstName,
//                 lastName: profileResponse.data.localizedLastName,
//                 id: profileResponse.data.id
//             },
//             existingUser: Boolean(existingUser)
//         });

//     } catch (error) {
//         console.error('LinkedIn authentication error:', error);
//         res.status(500).json({ 
//             error: 'Authentication failed',
//             details: error.message 
//         });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Users } = require('../models/Users');
const config = require('../config');

router.post('/token', async (req, res) => {
    try {
      console.log('Backend: 1. Received token request');
      const { code } = req.body;
  
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
  
      console.log('Backend: 3. Got access token, fetching profile');
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)', {
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access_token}`
        }
      });
  
      console.log('Backend: 4. Fetching email');
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${tokenResponse.data.access_token}`
        }
      });
  
      const userEmail = emailResponse.data.elements[0]['handle~'].emailAddress;
      console.log('Backend: 5. Checking if user exists:', userEmail);
      
      const existingUser = await Users.findOne({ Email: userEmail });
      console.log('Backend: 6. User exists:', Boolean(existingUser));
  
      res.json({
        success: true,
        existingUser: Boolean(existingUser),
        userInfo: {
          email: userEmail,
          firstName: profileResponse.data.localizedFirstName,
          lastName: profileResponse.data.localizedLastName,
          id: profileResponse.data.id
        }
      });
  
    } catch (error) {
      console.error('Backend: Error in LinkedIn authentication:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Authentication failed',
        details: error.response?.data || error.message 
      });
    }
  });

module.exports = router;