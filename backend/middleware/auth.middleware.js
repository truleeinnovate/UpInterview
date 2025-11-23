const { verifyApiKey } = require('../utils/apiKeyUtils');

/**
 * Middleware to verify API key
 */
const apiKeyAuth = async (req, res, next) => {
    try {
        // Get API key from header or query parameter
        const apiKey = req.headers['x-api-key'] || req.query.apiKey;
        
        console.log('Received API key:', apiKey); // Debug log
        
        if (!apiKey) {
            console.log('API key is missing');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'API key is required. Please provide it in the X-API-Key header or apiKey query parameter.'
            });
        }

        // Verify the API key
        const isValid = await verifyApiKey(apiKey);
        console.log('API key validation result:', isValid); // Debug log
        
        if (!isValid) {
            console.log('Invalid API key provided');
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Invalid API key'
            });
        }

        // If API key is valid, proceed to the next middleware/route handler
        console.log('API key is valid, proceeding to route handler');
        next();
    } catch (error) {
        console.error('API Key verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to verify API key',
            details: error.message
        });
    }
};

module.exports = {
    verifyApiKey: apiKeyAuth
};