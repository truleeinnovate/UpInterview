const { verifyApiKey } = require("../utils/apiKeyUtils");

/**
 * Middleware to verify API key
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    // Get API key from header or query parameter
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message:
          "API key is required. Please provide it in the X-API-Key header or apiKey query parameter.",
      });
    }

    // Verify the API key
    const isValid = await verifyApiKey(apiKey);

    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Invalid API key",
      });
    }

    next();
  } catch (error) {
    console.error("API Key verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to verify API key",
      details: error.message,
    });
  }
};

module.exports = {
  verifyApiKey: apiKeyAuth,
};
