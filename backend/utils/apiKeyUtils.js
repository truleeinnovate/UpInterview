const ApiKey = require('../models/ApiKey');

/**
 * Verify if the provided API key is valid
 * @param {string} apiKey - The API key to verify
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */

const verifyApiKey = async (apiKey) => {
    try {
        if (!apiKey) {
            console.log('No API key provided');
            return false;
        }

        // For testing, we'll accept any non-empty API key
        // In production, you should validate against a database or environment variable
        console.log('Verifying API key:', apiKey);
        return !!apiKey; // Accept any non-empty key for testing

    } catch (error) {
        console.error('Error verifying API key:', error);
        return false;
    }
};

module.exports = {
    verifyApiKey
};