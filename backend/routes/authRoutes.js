// const express = require('express');
// const router = express.Router();
// const { refreshTokenIfNeeded } = require('../utils/jwt');

// // Endpoint to refresh the token
// router.post('/refresh-token', (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     const newToken = refreshTokenIfNeeded(token);
//     if (!newToken) {
//       return res.status(200).json({ 
//         message: 'Token does not need refresh yet',
//         token: null
//       });
//     }

//     return res.status(200).json({ 
//       message: 'Token refreshed successfully',
//       token: newToken
//     });
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }
// });

// module.exports = router;
