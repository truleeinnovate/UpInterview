const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const crypto = require("crypto");

// Configuration - should be environment variables in production
const PROJECT_ID = "109f21d910b05cbb564f";
const BACKEND_ENDPOINT = "https://managedservices-prod.rteappbuilder.com";
const PLATFORM_ID = "turnkey_web";
const APP_ID = "0b37194e651b4615994c3c1e89f4d4ea";

// Generate unique request ID
function getUniqueID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get authentication token for unauthenticated flow
async function getAuthToken() {
  const requestId = getUniqueID();
  const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;

  try {
    const response = await fetch(url, {
      method: "GET", // Changed to GET for unauth flow
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        "X-Project-ID": PROJECT_ID,
        "X-Platform-ID": PLATFORM_ID,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth error response:", errorText);
      throw new Error(
        `Authentication failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.token) {
      return data.token;
    }

    throw new Error("No token received from authentication endpoint");
  } catch (error) {
    console.error("Token fetch error:", error);
    throw error;
  }
}

router.post("/create-video-room", async (req, res) => {
  try {
    const { title, enablePSTN = false } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({
        error: "Room title is required",
        details: "Please provide a valid room title",
      });
    }

    // Step 1: Get authentication token
    let token;
    try {
      token = await getAuthToken();
    } catch (err) {
      console.error("Authentication failed:", err);
      return res.status(401).json({
        error: "Failed to get authentication token",
        details: err.message,
        suggestion: "Please check your project credentials and configuration",
        debugInfo: {
          projectId: PROJECT_ID,
          platformId: PLATFORM_ID,
          backendEndpoint: BACKEND_ENDPOINT,
          authUrl: `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`,
        },
      });
    }

    // Step 2: Create the room using GraphQL mutation
    const query = `
      mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
        createChannel(title: $title, enablePSTN: $enablePSTN) {
          passphrase { 
            host 
            view 
          }
          channel
          title
          pstn { 
            number 
            dtmf 
            error { 
              code 
              message 
            } 
          }
        }
      }
    `;

    const graphqlUrl = `${BACKEND_ENDPOINT}/v1/query`;

    const requestId = getUniqueID();
    const graphqlResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Project-ID": PROJECT_ID,
        "X-Platform-ID": PLATFORM_ID,
        "X-Request-Id": requestId,
      },
      body: JSON.stringify({
        query,
        variables: {
          title: title.trim(),
          enablePSTN: Boolean(enablePSTN),
        },
      }),
    });

    if (!graphqlResponse.ok) {
      const errorText = await graphqlResponse.text();
      console.error("GraphQL error response:", errorText);
      throw new Error(
        `Room creation failed: ${graphqlResponse.status} - ${errorText}`
      );
    }

    const data = await graphqlResponse.json();

    // Handle GraphQL errors
    if (data.errors && data.errors.length > 0) {
      console.error("GraphQL errors:", data.errors);
      return res.status(500).json({
        error: "Room creation failed",
        details: data.errors[0].message || "GraphQL mutation error",
        graphqlErrors: data.errors,
      });
    }

    // Validate response data
    if (!data.data || !data.data.createChannel) {
      console.error("Invalid GraphQL response:", data);
      return res.status(500).json({
        error: "Invalid response from room creation service",
        details: "No channel data received",
        responseData: data,
      });
    }

    const channelData = data.data.createChannel;

    // Get base URL for generating full links
    // const baseUrl = 'https://109f21d910b05cbb564f-shikhars-projects-762a1929.vercel.app'; // Your frontend URL
    const baseUrl =
      `${config.REACT_APP_API_URL_FRONTEND}` ||
      /^https:\/\/[a-z0-9-]+\.app\.upinterview\.io$/;

    // Prepare response with proper host and attendee links
    const response = {
      success: true,
      roomData: {
        // Full URLs for direct access
        hostUrl: channelData.passphrase?.host
          ? `${baseUrl}/${channelData.passphrase.host}`
          : null,
        attendeeUrl: channelData.passphrase?.view
          ? `${baseUrl}/${channelData.passphrase.view}`
          : null,

        // Room IDs for programmatic access
        hostId: channelData.passphrase?.host || null,
        attendeeId: channelData.passphrase?.view || null,

        // Additional room info
        channel: channelData.channel || null,
        title: channelData.title || title,

        // PSTN information
        pstn: {
          enabled: enablePSTN,
          ...(enablePSTN && channelData.pstn
            ? {
                number: channelData.pstn.number || null,
                pin: channelData.pstn.dtmf || null,
                ...(channelData.pstn.error
                  ? {
                      error: {
                        code: channelData.pstn.error.code,
                        message: channelData.pstn.error.message,
                      },
                    }
                  : {}),
              }
            : {}),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("=== Room Creation Error ===");
    console.error("Error details:", error);

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');
// const crypto = require('crypto');

// // Configuration - should be environment variables in production
// const PROJECT_ID = '109f21d910b05cbb564f';
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';
// const APP_ID = '0b37194e651b4615994c3c1e89f4d4ea';
// const APP_CERTIFICATE = '369d998f054c49fa9d15e90c4862b13d';

// // Generate unique request ID
// function getUniqueID() {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

// // Get authentication token with proper credentials
// async function getAuthToken() {
//   const requestId = getUniqueID();
//   const url = `${BACKEND_ENDPOINT}/v1/login`;

//   try {
//     console.log('Attempting authentication to:', url);

//     // Generate the auth string using APP_ID and APP_CERTIFICATE
//     const authString = Buffer.from(`${APP_ID}:${APP_CERTIFICATE}`).toString('base64');

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Basic ${authString}`,
//         'X-Request-Id': requestId,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID
//       },
//       body: JSON.stringify({
//         project_id: PROJECT_ID,
//         platform_id: PLATFORM_ID
//       })
//     });

//     console.log('Auth response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Auth error response:', errorText);
//       throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('Auth response data:', data);

//     if (data.token) {
//       console.log('Successfully obtained token');
//       return data.token;
//     }

//     throw new Error('No token received from authentication endpoint');
//   } catch (error) {
//     console.error('Token fetch error:', error);
//     throw error;
//   }
// }

// router.post('/create-video-room', async (req, res) => {
//   try {
//     const { title, enablePSTN = false } = req.body;

//     console.log('=== Video Room Creation Request ===');
//     console.log('Request body:', req.body);

//     // Validate required fields
//     if (!title || title.trim() === '') {
//       return res.status(400).json({
//         error: 'Room title is required',
//         details: 'Please provide a valid room title'
//       });
//     }

//     // Step 1: Get authentication token
//     console.log('Getting authentication token...');
//     let token;
//     try {
//       token = await getAuthToken();
//       console.log('Authentication successful');
//     } catch (err) {
//       console.error('Authentication failed:', err);
//       return res.status(401).json({
//         error: 'Failed to get authentication token',
//         details: err.message,
//         suggestion: 'Please check your project credentials and configuration',
//         debugInfo: {
//           projectId: PROJECT_ID,
//           platformId: PLATFORM_ID,
//           backendEndpoint: BACKEND_ENDPOINT,
//           authUrl: `${BACKEND_ENDPOINT}/v1/login`
//         }
//       });
//     }

//     // Step 2: Create the room using GraphQL mutation
//     const query = `
//       mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//         createChannel(title: $title, enablePSTN: $enablePSTN) {
//           passphrase {
//             host
//             view
//           }
//           channel
//           title
//           pstn {
//             number
//             dtmf
//             error {
//               code
//               message
//             }
//           }
//         }
//       }
//     `;

//     const graphqlUrl = `${BACKEND_ENDPOINT}/v1/query`;
//     console.log('Making GraphQL request to:', graphqlUrl);

//     const requestId = getUniqueID();
//     const graphqlResponse = await fetch(graphqlUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID,
//         'X-Request-Id': requestId,
//       },
//       body: JSON.stringify({
//         query,
//         variables: {
//           title: title.trim(),
//           enablePSTN: Boolean(enablePSTN)
//         }
//       })
//     });

//     console.log('GraphQL response status:', graphqlResponse.status);

//     if (!graphqlResponse.ok) {
//       const errorText = await graphqlResponse.text();
//       console.error('GraphQL error response:', errorText);
//       throw new Error(`Room creation failed: ${graphqlResponse.status} - ${errorText}`);
//     }

//     const data = await graphqlResponse.json();
//     console.log('GraphQL response data:', JSON.stringify(data, null, 2));

//     // Handle GraphQL errors
//     if (data.errors && data.errors.length > 0) {
//       console.error('GraphQL errors:', data.errors);
//       return res.status(500).json({
//         error: 'Room creation failed',
//         details: data.errors[0].message || 'GraphQL mutation error',
//         graphqlErrors: data.errors
//       });
//     }

//     // Validate response data
//     if (!data.data || !data.data.createChannel) {
//       console.error('Invalid GraphQL response:', data);
//       return res.status(500).json({
//         error: 'Invalid response from room creation service',
//         details: 'No channel data received',
//         responseData: data
//       });
//     }

//     const channelData = data.data.createChannel;
//     console.log('Channel data received:', channelData);

//     // Prepare response
//     const response = {
//       success: true,
//       roomData: {
//         hostLink: channelData.passphrase?.host || null,
//         attendeeLink: channelData.passphrase?.view || null,
//         channel: channelData.channel || null,
//         title: channelData.title || title,
//         pstn: {
//           enabled: enablePSTN,
//           ...(enablePSTN && channelData.pstn ? {
//             number: channelData.pstn.number || null,
//             pin: channelData.pstn.dtmf || null,
//             ...(channelData.pstn.error ? {
//               error: {
//                 code: channelData.pstn.error.code,
//                 message: channelData.pstn.error.message
//               }
//             } : {})
//           } : {})
//         }
//       }
//     };

//     console.log('=== Room Created Successfully ===');
//     res.json(response);

//   } catch (error) {
//     console.error('=== Room Creation Error ===');
//     console.error('Error details:', error);

//     res.status(500).json({
//       error: 'Internal server error',
//       details: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');

// // Configuration - use environment variables in production
// const PROJECT_ID = '109f21d910b05cbb564f'; // Must match your frontend config
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';

// // Generate unique request ID
// function getUniqueID() {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

// // Get authentication token for unauthenticated flow
// // async function getUnauthToken() {
// //   const requestId = getUniqueID();
// //   const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;

// //   try {
// //     console.log('Attempting unauthenticated login to:', url);

// //     const response = await fetch(url, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'X-Request-Id': requestId,
// //       },
// //       body: JSON.stringify({})
// //     });

// //     console.log('Auth response status:', response.status);

// //     if (!response.ok) {
// //       const errorText = await response.text();
// //       console.error('Auth error response:', errorText);
// //       throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
// //     }

// //     const data = await response.json();
// //     console.log('Auth response data:', data);

// //     if (data.token) {
// //       console.log('Successfully obtained token');
// //       return data.token;
// //     }

// //     throw new Error('No token received from authentication endpoint');
// //   } catch (error) {
// //     console.error('Unauthenticated token fetch error:', error);
// //     throw error;
// //   }
// // }

// async function getUnauthToken() {
//   const requestId = getUniqueID();
//   const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;

//   try {
//     console.log('Attempting unauthenticated login to:', url);
//     console.log('Request details:', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Request-Id': requestId,
//       },
//       body: JSON.stringify({})
//     });

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Request-Id': requestId,
//       },
//       body: JSON.stringify({})
//     });

//     console.log('Full response:', {
//       status: response.status,
//       statusText: response.statusText,
//       headers: Object.fromEntries(response.headers.entries())
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Auth error response:', errorText);
//       throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('Auth response data:', data);

//     if (data.token) {
//       console.log('Successfully obtained token');
//       return data.token;
//     }

//     throw new Error('No token received from authentication endpoint');
//   } catch (error) {
//     console.error('Unauthenticated token fetch error:', {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       type: error.type
//     });
//     throw error;
//   }
// }

// router.post('/create-video-room', async (req, res) => {
//   try {
//     const { title, enablePSTN = false } = req.body;

//     console.log('=== Video Room Creation Request ===');

//     // Validate required fields
//     if (!title || title.trim() === '') {
//       return res.status(400).json({
//         error: 'Room title is required',
//         details: 'Please provide a valid room title'
//       });
//     }

//     // Step 1: Get authentication token
//     console.log('Getting authentication token...');
//     let token;
//     try {
//       token = await getUnauthToken();
//       console.log('Authentication successful');
//     } catch (err) {
//       console.error('Authentication failed:', err);
//       return res.status(401).json({
//         error: 'Failed to get authentication token',
//         details: err.message,
//         suggestion: 'Please check your project configuration',
//         debugInfo: {
//           projectId: PROJECT_ID,
//           platformId: PLATFORM_ID,
//           backendEndpoint: BACKEND_ENDPOINT,
//           authUrl: `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`
//         }
//       });
//     }

//     // Step 2: Create the room using GraphQL mutation
//     const query = `
//       mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//         createChannel(title: $title, enablePSTN: $enablePSTN) {
//           passphrase {
//             host
//             view
//           }
//           channel
//           title
//           pstn {
//             number
//             dtmf
//             error {
//               code
//               message
//             }
//           }
//         }
//       }
//     `;

//     const graphqlUrl = `${BACKEND_ENDPOINT}/v1/query`;
//     console.log('Making GraphQL request to:', graphqlUrl);

//     const requestId = getUniqueID();
//     const graphqlResponse = await fetch(graphqlUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID,
//         'X-Request-Id': requestId,
//       },
//       body: JSON.stringify({
//         query,
//         variables: {
//           title: title.trim(),
//           enablePSTN: Boolean(enablePSTN)
//         }
//       })
//     });

//     console.log('GraphQL response status:', graphqlResponse.status);

//     if (!graphqlResponse.ok) {
//       const errorText = await graphqlResponse.text();
//       console.error('GraphQL error response:', errorText);
//       throw new Error(`Room creation failed: ${graphqlResponse.status} - ${errorText}`);
//     }

//     const data = await graphqlResponse.json();
//     console.log('GraphQL response data:', JSON.stringify(data, null, 2));

//     // Handle GraphQL errors
//     if (data.errors && data.errors.length > 0) {
//       console.error('GraphQL errors:', data.errors);
//       return res.status(500).json({
//         error: 'Room creation failed',
//         details: data.errors[0].message || 'GraphQL mutation error',
//         graphqlErrors: data.errors
//       });
//     }

//     // Validate response data
//     if (!data.data || !data.data.createChannel) {
//       console.error('Invalid GraphQL response:', data);
//       return res.status(500).json({
//         error: 'Invalid response from room creation service',
//         details: 'No channel data received',
//         responseData: data
//       });
//     }

//     const channelData = data.data.createChannel;
//     console.log('Channel data received:', channelData);

//     // Prepare response
//     const response = {
//       success: true,
//       roomData: {
//         hostLink: channelData.passphrase?.host || null,
//         attendeeLink: channelData.passphrase?.view || null,
//         channel: channelData.channel || null,
//         title: channelData.title || title,
//         pstn: {
//           enabled: enablePSTN,
//           ...(enablePSTN && channelData.pstn ? {
//             number: channelData.pstn.number || null,
//             pin: channelData.pstn.dtmf || null,
//             ...(channelData.pstn.error ? {
//               error: {
//                 code: channelData.pstn.error.code,
//                 message: channelData.pstn.error.message
//               }
//             } : {})
//           } : {})
//         }
//       }
//     };

//     res.json(response);

//   } catch (error) {
//     console.error('=== Room Creation Error ===');
//     console.error('Error details:', error);

//     res.status(500).json({
//       error: 'Internal server error',
//       details: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// module.exports = router;

// //bolt latest code

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');

// const PROJECT_ID = 'a7d0e911f3e34e35bbedcc619e801273';
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';

// // Generate unique request ID (matching frontend pattern)
// function getUniqueID() {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

// // Get authentication token for unauthenticated flow (matching frontend pattern)
// async function getUnauthToken() {
//   const requestId = getUniqueID();
//   const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;

//   try {
//     console.log('Attempting unauthenticated login to:', url);

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Only send request tracking headers, no auth headers for unauth flow
//         'X-Request-Id': requestId,
//       },
//       // Don't send credentials for unauthenticated flow, but keep empty body
//       body: JSON.stringify({})
//     });

//     console.log('Auth response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Auth error response:', errorText);
//       throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('Auth response data:', data);

//     if (data.token) {
//       console.log('Successfully obtained token');
//       return data.token;
//     }

//     throw new Error('No token received from authentication endpoint');
//   } catch (error) {
//     console.error('Unauthenticated token fetch error:', error);
//     throw error;
//   }
// }

// router.post('/create-video-room', async (req, res) => {
//   try {
//     const { title, enablePSTN = false } = req.body;

//     console.log('=== Video Room Creation Request ===');

//     // Validate required fields
//     if (!title || title.trim() === '') {
//       return res.status(400).json({
//         error: 'Room title is required',
//         details: 'Please provide a valid room title'
//       });
//     }

//     // Step 1: Get authentication token using unauthenticated flow
//     console.log('Getting authentication token...');
//     let token;
//     try {
//       token = await getUnauthToken();
//       console.log('Authentication successful');
//     } catch (err) {
//       console.error('Authentication failed:', err);
//       return res.status(401).json({
//         error: 'Failed to get authentication token',
//         details: err.message,
//         suggestion: 'Please check your project configuration or try again later',
//         debugInfo: {
//           projectId: PROJECT_ID,
//           platformId: PLATFORM_ID,
//           backendEndpoint: BACKEND_ENDPOINT,
//           authUrl: `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`
//         }
//       });
//     }

//     // Step 2: Create the room using GraphQL mutation
//     const query = `
//       mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//         createChannel(title: $title, enablePSTN: $enablePSTN) {
//           passphrase {
//             host
//             view
//           }
//           channel
//           title
//           pstn {
//             number
//             dtmf
//             error {
//               code
//               message
//             }
//           }
//         }
//       }
//     `;

//     const graphqlUrl = `${BACKEND_ENDPOINT}/v1/query`;
//     console.log('Making GraphQL request to:', graphqlUrl);

//     const requestId = getUniqueID();
//     const graphqlResponse = await fetch(graphqlUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID,
//         'X-Request-Id': requestId,
//       },
//       body: JSON.stringify({
//         query,
//         variables: {
//           title: title.trim(),
//           enablePSTN: Boolean(enablePSTN)
//         }
//       })
//     });

//     console.log('GraphQL response status:', graphqlResponse.status);

//     if (!graphqlResponse.ok) {
//       const errorText = await graphqlResponse.text();
//       console.error('GraphQL error response:', errorText);
//       throw new Error(`Room creation failed: ${graphqlResponse.status} - ${errorText}`);
//     }

//     const data = await graphqlResponse.json();
//     console.log('GraphQL response data:', JSON.stringify(data, null, 2));

//     // Handle GraphQL errors
//     if (data.errors && data.errors.length > 0) {
//       console.error('GraphQL errors:', data.errors);
//       return res.status(500).json({
//         error: 'Room creation failed',
//         details: data.errors[0].message || 'GraphQL mutation error',
//         graphqlErrors: data.errors
//       });
//     }

//     // Validate response data
//     if (!data.data || !data.data.createChannel) {
//       console.error('Invalid GraphQL response:', data);
//       return res.status(500).json({
//         error: 'Invalid response from room creation service',
//         details: 'No channel data received',
//         responseData: data
//       });
//     }

//     const channelData = data.data.createChannel;
//     console.log('Channel data received:', channelData);

//     // Prepare response
//     const response = {
//       success: true,
//       authMethod: 'unauthenticated',
//       roomData: {
//         hostLink: channelData.passphrase?.host || null,
//         attendeeLink: channelData.passphrase?.view || null,
//         channel: channelData.channel || null,
//         title: channelData.title || title,
//       }
//     };

//     // Add PSTN data if enabled
//     if (enablePSTN && channelData.pstn) {
//       if (channelData.pstn.error) {
//         response.roomData.pstn = {
//           enabled: true,
//           error: {
//             code: channelData.pstn.error.code,
//             message: channelData.pstn.error.message
//           }
//         };
//       } else {
//         response.roomData.pstn = {
//           enabled: true,
//           number: channelData.pstn.number || null,
//           pin: channelData.pstn.dtmf || null,
//           error: null
//         };
//       }
//     } else {
//       response.roomData.pstn = {
//         enabled: false
//       };
//     }

//     // Validate that we have the essential data
//     if (!response.roomData.hostLink || !response.roomData.attendeeLink) {
//       console.error('Missing essential room data:', response.roomData);
//       return res.status(500).json({
//         error: 'Incomplete room data',
//         details: 'Host or attendee link is missing',
//         receivedData: response.roomData
//       });
//     }

//     console.log('=== Room Created Successfully ===');
//     console.log('Room details:', {
//       title: response.roomData.title,
//       channel: response.roomData.channel,
//       authMethod: 'unauthenticated',
//       pstnEnabled: enablePSTN,
//       hostLink: response.roomData.hostLink ? 'present' : 'missing',
//       attendeeLink: response.roomData.attendeeLink ? 'present' : 'missing'
//     });

//     res.json(response);

//   } catch (error) {
//     console.error('=== Room Creation Error ===');
//     console.error('Error details:', error);
//     console.error('Stack trace:', error.stack);

//     res.status(500).json({
//       error: 'Internal server error',
//       details: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// module.exports = router;

// latest // claude ai

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');

// const PROJECT_ID = 'a7d0e911f3e34e35bbedcc619e801273';
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';

// // Get unauthenticated token (main method used by frontend)
// async function getUnauthToken(user_id = null) {
//   let url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;
//   if (user_id) {
//     url += `&user_id=${user_id}`;
//   }

//   const response = await fetch(url, {
//     method: 'POST', // Should be POST, not GET
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Platform-ID': PLATFORM_ID,
//       'X-Project-ID': PROJECT_ID
//     }
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`HTTP ${response.status}: ${errorText}`);
//   }

//   const data = await response.json();
//   if (data.token) return data.token;
//   throw new Error(`No token in response: ${JSON.stringify(data)}`);
// }

// // Try IDP login (email/password) - fallback method
// async function tryIDPAuth(email, password) {
//   const url = `${BACKEND_ENDPOINT}/v1/idp/login`;
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Platform-ID': PLATFORM_ID,
//       'X-Project-ID': PROJECT_ID
//     },
//     body: JSON.stringify({
//       email,
//       password,
//       project_id: PROJECT_ID,
//       platform_id: PLATFORM_ID,
//     })
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`HTTP ${response.status}: ${errorText}`);
//   }

//   const data = await response.json();
//   if (data.token) return data.token;
//   throw new Error(`IDP auth failed: ${JSON.stringify(data)}`);
// }

// router.post('/create-video-room', async (req, res) => {
//   const { title, enablePSTN = false, email, password, user_id } = req.body;

//   console.log('Creating video room with params:', { title, enablePSTN, hasEmail: !!email, hasPassword: !!password, user_id });

//   let token = null;
//   let authErrors = [];

//   // 1. First try unauthenticated flow (primary method)
//   try {
//     console.log('Attempting unauthenticated login...');
//     token = await getUnauthToken(user_id);
//     console.log('Unauthenticated login successful, token length:', token?.length);
//   } catch (err) {
//     console.error('Unauthenticated login failed:', err.message);
//     authErrors.push(`Unauth flow: ${err.message}`);
//   }

//   // 2. If no token and credentials provided, try IDP auth
//   if (!token && email && password) {
//     try {
//       console.log('Attempting IDP authentication...');
//       token = await tryIDPAuth(email, password);
//       console.log('IDP authentication successful, token length:', token?.length);
//     } catch (err) {
//       console.error('IDP authentication failed:', err.message);
//       authErrors.push(`IDP auth: ${err.message}`);
//     }
//   }

//   if (!token) {
//     console.error('All authentication methods failed:', authErrors);
//     return res.status(401).json({
//       error: 'Failed to get auth token',
//       details: authErrors.length > 0 ? authErrors.join('; ') : 'No valid auth method',
//       authErrors: authErrors,
//       debug: {
//         PROJECT_ID,
//         BACKEND_ENDPOINT,
//         PLATFORM_ID,
//         hasEmail: !!email,
//         hasPassword: !!password,
//         user_id
//       }
//     });
//   }

//   // Create the room using GraphQL mutation
//   const query = `
//     mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//       createChannel(title: $title, enablePSTN: $enablePSTN) {
//         passphrase {
//           host
//           view
//         }
//         channel
//         title
//         pstn {
//           number
//           dtmf
//           error {
//             code
//             message
//           }
//         }
//       }
//     }
//   `;

//   try {
//     const response = await fetch(`${BACKEND_ENDPOINT}/v1/query`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID
//       },
//       body: JSON.stringify({
//         query,
//         variables: { title, enablePSTN }
//       })
//     });

//     const data = await response.json();

//     if (data.errors) {
//       return res.status(500).json({
//         error: 'GraphQL mutation failed',
//         details: data.errors
//       });
//     }

//     if (!data.data || !data.data.createChannel) {
//       return res.status(500).json({
//         error: 'Invalid response from createChannel mutation',
//         details: 'No channel data returned'
//       });
//     }

//     const channelData = data.data.createChannel;

//     // Structure response to match frontend expectations
//     const response_data = {
//       success: true,
//       hostLink: channelData.passphrase?.host || '',
//       attendeeLink: channelData.passphrase?.view || '',
//       channel: channelData.channel,
//       title: channelData.title,
//       roomId: {
//         host: channelData.passphrase?.host || '',
//         attendee: channelData.passphrase?.view || ''
//       }
//     };

//     // Add PSTN info if enabled and available
//     if (enablePSTN && channelData.pstn) {
//       if (channelData.pstn.error?.code || channelData.pstn.error?.message) {
//         response_data.pstn = {
//           number: '',
//           pin: '',
//           error: {
//             code: channelData.pstn.error?.code,
//             message: channelData.pstn.error?.message
//           }
//         };
//       } else {
//         response_data.pstn = {
//           number: channelData.pstn.number || '',
//           pin: channelData.pstn.dtmf || '',
//           error: null
//         };
//       }
//     }

//     res.json(response_data);

//   } catch (err) {
//     console.error('Room creation error:', err);
//     res.status(500).json({
//       error: 'Failed to create video room',
//       details: err.message
//     });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');

// const PROJECT_ID = 'a7d0e911f3e34e35bbedcc619e801273';
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';

// // Get authentication token for unauthenticated flow
// async function getUnauthToken() {
//   const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID,
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();

//     if (data.token) {
//       return data.token;
//     }

//     throw new Error('No token received from authentication endpoint');
//   } catch (error) {
//     console.error('Unauthenticated token fetch error:', error);
//     throw error;
//   }
// }

// // Try IDP login (email/password) - for authenticated users
// async function tryIDPAuth(email, password) {
//   const url = `${BACKEND_ENDPOINT}/v1/idp/login`;

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID,
//       },
//       body: JSON.stringify({
//         email,
//         password,
//         project_id: PROJECT_ID,
//         platform_id: PLATFORM_ID,
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`IDP Auth failed with status: ${response.status}`);
//     }

//     const data = await response.json();

//     if (data.token) {
//       return data.token;
//     }

//     return null;
//   } catch (error) {
//     console.error('IDP Auth error:', error);
//     return null;
//   }
// }

// router.post('/create-video-room', async (req, res) => {
//   try {
//     const { title, enablePSTN = false, email, password } = req.body;

//     // Validate required fields
//     if (!title || title.trim() === '') {
//       return res.status(400).json({
//         error: 'Room title is required',
//         details: 'Please provide a valid room title'
//       });
//     }

//     let token = null;
//     let authMethod = 'unauthenticated';

//     // Step 1: Try IDP auth if email/password provided
//     if (email && password) {
//       try {
//         token = await tryIDPAuth(email, password);
//         if (token) {
//           authMethod = 'idp';
//         }
//       } catch (err) {
//         console.warn('IDP auth failed, falling back to unauthenticated:', err.message);
//       }
//     }

//     // Step 2: If no token from IDP, use unauthenticated flow
//     if (!token) {
//       try {
//         token = await getUnauthToken();
//         authMethod = 'unauthenticated';
//       } catch (err) {
//         console.error('Unauthenticated token fetch failed:', err);
//         return res.status(401).json({
//           error: 'Failed to get authentication token',
//           details: err.message,
//           suggestion: 'Please check your project configuration or try again later'
//         });
//       }
//     }

//     if (!token) {
//       return res.status(401).json({
//         error: 'Authentication failed',
//         details: 'Unable to obtain valid authentication token',
//         authMethod: authMethod
//       });
//     }

//     // Step 3: Create the room using GraphQL mutation
//     const query = `
//       mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//         createChannel(title: $title, enablePSTN: $enablePSTN) {
//           passphrase {
//             host
//             view
//           }
//           channel
//           title
//           pstn {
//             number
//             dtmf
//             error {
//               code
//               message
//             }
//           }
//         }
//       }
//     `;

//     const graphqlResponse = await fetch(`${BACKEND_ENDPOINT}/v1/query`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID
//       },
//       body: JSON.stringify({
//         query,
//         variables: {
//           title: title.trim(),
//           enablePSTN: Boolean(enablePSTN)
//         }
//       })
//     });

//     if (!graphqlResponse.ok) {
//       throw new Error(`GraphQL request failed with status: ${graphqlResponse.status}`);
//     }

//     const data = await graphqlResponse.json();

//     // Handle GraphQL errors
//     if (data.errors && data.errors.length > 0) {
//       console.error('GraphQL errors:', data.errors);
//       return res.status(500).json({
//         error: 'Room creation failed',
//         details: data.errors[0].message || 'GraphQL mutation error',
//         graphqlErrors: data.errors
//       });
//     }

//     // Validate response data
//     if (!data.data || !data.data.createChannel) {
//       return res.status(500).json({
//         error: 'Invalid response from room creation service',
//         details: 'No channel data received'
//       });
//     }

//     const channelData = data.data.createChannel;

//     // Prepare response
//     const response = {
//       success: true,
//       authMethod: authMethod,
//       roomData: {
//         hostLink: channelData.passphrase?.host || null,
//         attendeeLink: channelData.passphrase?.view || null,
//         channel: channelData.channel || null,
//         title: channelData.title || title,
//       }
//     };

//     // Add PSTN data if enabled
//     if (enablePSTN && channelData.pstn) {
//       if (channelData.pstn.error) {
//         response.roomData.pstn = {
//           enabled: true,
//           error: {
//             code: channelData.pstn.error.code,
//             message: channelData.pstn.error.message
//           }
//         };
//       } else {
//         response.roomData.pstn = {
//           enabled: true,
//           number: channelData.pstn.number || null,
//           pin: channelData.pstn.dtmf || null,
//           error: null
//         };
//       }
//     } else {
//       response.roomData.pstn = {
//         enabled: false
//       };
//     }

//     // Validate that we have the essential data
//     if (!response.roomData.hostLink || !response.roomData.attendeeLink) {
//       return res.status(500).json({
//         error: 'Incomplete room data',
//         details: 'Host or attendee link is missing',
//         receivedData: response.roomData
//       });
//     }

//     console.log('Room created successfully:', {
//       title: response.roomData.title,
//       channel: response.roomData.channel,
//       authMethod: authMethod,
//       pstnEnabled: enablePSTN
//     });

//     res.json(response);

//   } catch (error) {
//     console.error('Room creation error:', error);

//     res.status(500).json({
//       error: 'Internal server error',
//       details: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // Health check endpoint
// router.get('/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     service: 'video-room-api',
//     timestamp: new Date().toISOString(),
//     config: {
//       projectId: PROJECT_ID,
//       platformId: PLATFORM_ID,
//       backendEndpoint: BACKEND_ENDPOINT
//     }
//   });
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fetch = require('node-fetch');

// const PROJECT_ID = 'a7d0e911f3e34e35bbedcc619e801273';
// const BACKEND_ENDPOINT = 'https://managedservices-prod.rteappbuilder.com';
// const PLATFORM_ID = 'turnkey_web';

// // Try IDP login (email/password)
// async function tryIDPAuth(email, password) {
//   const url = `${BACKEND_ENDPOINT}/v1/idp/login`;
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       email,
//       password,
//       project_id: PROJECT_ID,
//       platform_id: PLATFORM_ID,
//     })
//   });
//   const data = await response.json();
//   if (data.token) return data.token;
//   return null;
// }

// // Try token login (no password, just project/platform)
// async function tryTokenAuth() {
//   const url = `${BACKEND_ENDPOINT}/v1/login?project_id=${PROJECT_ID}&platform_id=${PLATFORM_ID}`;
//   const response = await fetch(url, { method: 'POST' });
//   const data = await response.json();
//   if (data.token) return data.token;
//   return null;
// }

// router.post('/create-video-room', async (req, res) => {
//   const { title, enablePSTN, email, password } = req.body;

//   let token = null;
//   let authError = null;

//   // 1. Try IDP auth if email/password provided
//   if (email && password) {
//     try {
//       token = await tryIDPAuth(email, password);
//     } catch (err) {
//       authError = err.message;
//     }
//   }

//   // 2. If no token, try token auth (unauthenticated)
//   if (!token) {
//     try {
//       token = await tryTokenAuth();
//     } catch (err) {
//       authError = err.message;
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ error: 'Failed to get auth token', details: authError || 'No valid auth method' });
//   }

//   // Step 3: Create the room using the token
//   const query = `
//     mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
//       createChannel(title: $title, enablePSTN: $enablePSTN) {
//         passphrase { host view }
//         channel
//         title
//         pstn { number dtmf error { code message } }
//       }
//     }
//   `;

//   try {
//     const response = await fetch(`${BACKEND_ENDPOINT}/v1/query`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//         'X-Project-ID': PROJECT_ID,
//         'X-Platform-ID': PLATFORM_ID
//       },
//       body: JSON.stringify({
//         query,
//         variables: { title, enablePSTN }
//       })
//     });

//     const data = await response.json();
//     if (data.errors) {
//       return res.status(500).json({ error: data.errors });
//     }
//     res.json({
//       hostLink: data.data.createChannel.passphrase.host,
//       attendeeLink: data.data.createChannel.passphrase.view,
//       channel: data.data.createChannel.channel,
//       title: data.data.createChannel.title,
//       pstn: data.data.createChannel.pstn
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
