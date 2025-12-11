// // ZegoCloud Token Generator
// // This implements proper ZegoCloud token generation using backend server

// // ZegoCloud App Credentials
// const APP_ID = 1921148917;
// const SERVER_SECRET = '7c3ce8bb2caeee745971ee42629b43af'; // This should be your actual server secret

// // Backend server URL
// const BACKEND_URL = 'http://localhost:5000';

// // Generate a proper ZegoCloud token using backend server
// export const generateZegoToken = async (userID, roomID) => {
//     try {

//         // Call backend server to generate proper token
//         const response = await fetch(`${BACKEND_URL}/generate-token`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 userID: userID,
//                 roomID: roomID
//             })
//         });


//         if (!response.ok) {
//             throw new Error(`Backend server error: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data.token && typeof data.token === 'string') {
//             return {
//                 token: data.token,
//                 tokenV2: data.tokenV2,
//                 simpleToken: data.simpleToken
//             };
//         } else {
//             console.error('Backend response:', data);
//             throw new Error('No valid token received from backend server');
//         }

//     } catch (error) {
//         console.error('Failed to generate ZegoCloud token from backend:', error);
//         // Fallback to client-side token generation
//         return generateFallbackToken(userID, roomID);
//     }
// };

// // Generate a fallback token for testing
// const generateFallbackToken = (userID, roomID) => {
//     const timestamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 15);
//     const tokenData = `${userID}_${roomID}_${timestamp}_${randomString}`;
//     const token = btoa(tokenData);
//     return token;
// };

// // Alternative: Use a simple token for testing
// export const generateSimpleZegoToken = (userID, roomID) => {
//     // Create a token that ZegoCloud might accept for testing
//     const timestamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 15);
//     const tokenData = `${userID}_${roomID}_${timestamp}_${randomString}`;
//     return btoa(tokenData);
// };

// // Check if we're in development mode
// export const isDevelopmentMode = () => {
//     return process.env.NODE_ENV === 'development' ||
//         window.location.hostname === 'localhost' ||
//         window.location.hostname === '127.0.0.1';
// };

// // Generate a token without authentication (for testing only)
// export const generateTestToken = (userID, roomID) => {
//     // This creates a token that might work for testing without proper authentication
//     const timestamp = Math.floor(Date.now() / 1000);
//     const nonce = Math.floor(Math.random() * 1000000);

//     // Create a simple token structure
//     const tokenData = {
//         uid: userID,
//         rid: roomID,
//         ts: timestamp,
//         nonce: nonce,
//         appid: APP_ID
//     };

//     return btoa(JSON.stringify(tokenData));
// };

// // Generate a JWT-like token for ZegoCloud
// export const generateJWTToken = (userID, roomID) => {
//     try {
//         const header = {
//             alg: 'HS256',
//             typ: 'JWT'
//         };

//         const payload = {
//             app_id: APP_ID,
//             user_id: userID,
//             room_id: roomID,
//             privilege: {
//                 1: 1,
//                 2: 1
//             },
//             exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
//             iat: Math.floor(Date.now() / 1000),
//             nonce: Math.floor(Math.random() * 1000000)
//         };

//         // Encode header and payload
//         const encodedHeader = btoa(JSON.stringify(header));
//         const encodedPayload = btoa(JSON.stringify(payload));

//         // Create a simple signature (this is not cryptographically secure)
//         const signature = btoa(`${encodedHeader}.${encodedPayload}.${APP_ID}`);

//         // Return JWT format
//         const token = `${encodedHeader}.${encodedPayload}.${signature}`;

//         return token;

//     } catch (error) {
//         console.error('Failed to generate JWT token:', error);
//         return generateTestToken(userID, roomID);
//     }
// };

// // Generate a token that might work with this specific App ID
// export const generateAppSpecificToken = (userID, roomID) => {
//     try {
//         // Create a token format that might be accepted by this specific App ID
//         const timestamp = Math.floor(Date.now() / 1000);
//         const nonce = Math.floor(Math.random() * 1000000);

//         // Create a token structure that follows ZegoCloud's expected format
//         const tokenData = {
//             app_id: APP_ID,
//             user_id: userID,
//             room_id: roomID,
//             privilege: {
//                 1: 1, // Allow publishing
//                 2: 1  // Allow subscribing
//             },
//             timestamp: timestamp,
//             nonce: nonce,
//             exp: timestamp + 3600, // 1 hour expiration
//             iat: timestamp
//         };

//         // Encode as base64
//         const token = btoa(JSON.stringify(tokenData));
//         return token || '';

//     } catch (error) {
//         console.error('Failed to generate app-specific token:', error);
//         return '';
//     }
// };

// // Simple HMAC simulation (not cryptographically secure, for development only)
// const simpleHMAC = (message, key) => {
//     let hash = 0;
//     for (let i = 0; i < message.length; i++) {
//         const char = message.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash = hash & hash; // Convert to 32-bit integer
//     }
//     for (let i = 0; i < key.length; i++) {
//         const char = key.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash = hash & hash; // Convert to 32-bit integer
//     }
//     return Math.abs(hash).toString(16);
// };

// // Generate a proper ZegoCloud token with HMAC simulation
// export const generateHMACToken = (userID, roomID) => {
//     try {
//         const timestamp = Math.floor(Date.now() / 1000);
//         const nonce = Math.floor(Math.random() * 1000000);

//         // Create the message to sign
//         const message = `${APP_ID}_${userID}_${roomID}_${timestamp}_${nonce}`;

//         // Create a simple HMAC-like signature
//         const signature = simpleHMAC(message, SERVER_SECRET || 'default_secret');

//         // Create the token payload
//         const tokenData = {
//             app_id: APP_ID,
//             user_id: userID,
//             room_id: roomID,
//             privilege: {
//                 1: 1,
//                 2: 1
//             },
//             timestamp: timestamp,
//             nonce: nonce,
//             signature: signature
//         };

//         // Encode as base64
//         const token = btoa(JSON.stringify(tokenData));

//         return token || '';

//     } catch (error) {
//         console.error('Failed to generate HMAC token:', error);
//         return generateAppSpecificToken(userID, roomID);
//     }
// };

// // Generate a token that follows ZegoCloud's exact format
// export const generateZegoCloudToken = async (userID, roomID) => {
//     try {
//         // Try to get token from backend server first
//         const tokenResult = await generateZegoToken(userID, roomID);
//         if (tokenResult && typeof tokenResult === 'object' && tokenResult.token) {
//             return tokenResult; // Return the full object with all tokens
//         } else if (typeof tokenResult === 'string') {
//             return { token: tokenResult }; // Wrap string in object
//         }
//         throw new Error('Invalid token received from backend');
//     } catch (error) {
//         console.error('Failed to generate ZegoCloud format token:', error);
//         const fallbackToken = generateHMACToken(userID, roomID);
//         return { token: fallbackToken };
//     }
// }; 