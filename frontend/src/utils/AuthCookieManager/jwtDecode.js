// src/utils/jwtDecode.js

/**
 * Decodes a JWT token and returns its payload.
 * @param {string} token - The JWT token to decode.
 * @returns {object|null} - The decoded payload or null if decoding fails.
 */
export const decodeJwt = (token) => {
  try {
    if (!token) {
      return {}; // Return empty object instead of throwing an error
    }

    // Split the token into parts (header, payload, signature)
    const [, payloadBase64] = token.split('.');

    if (!payloadBase64) {
      throw new Error('Invalid token format');
    }

    // Decode the base64 payload
    const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayload);

    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error.message);
    return {}; // Return empty object for any other errors
  }
};