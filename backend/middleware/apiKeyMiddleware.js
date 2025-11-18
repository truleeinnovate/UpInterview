const ApiKey = require('../models/ApiKey');
const asyncHandler = require('express-async-handler');

// @desc    Validate API key for protected endpoints
// @access  Public (but validates API key)
const validateApiKey = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required',
      code: 'API_KEY_MISSING'
    });
  }

  try {
    // Find the API key in database
    const keyDoc = await ApiKey.findOne({ 
      key: apiKey, 
      enabled: true 
    }).populate('createdBy', 'email name');

    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or disabled API key',
        code: 'API_KEY_INVALID'
      });
    }

    // Check if key has expired
    if (keyDoc.expiresAt && new Date() > keyDoc.expiresAt) {
      return res.status(401).json({
        success: false,
        message: 'API key has expired',
        code: 'API_KEY_EXPIRED'
      });
    }

    // Update usage statistics
    await keyDoc.updateUsage();

    // Attach API key info to request
    req.apiKey = {
      id: keyDoc._id,
      organization: keyDoc.organization,
      permissions: keyDoc.permissions,
      createdBy: keyDoc.createdBy,
      usageCount: keyDoc.usageCount
    };

    // Attach user info from API key creator
    req.user = keyDoc.createdBy;

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating API key',
      code: 'API_KEY_VALIDATION_ERROR'
    });
  }
});

// @desc    Check if API key has required permission
// @access  Middleware function
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No API key found',
        code: 'NO_API_KEY'
      });
    }

    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission,
        available: req.apiKey.permissions
      });
    }

    next();
  };
};

// @desc    Rate limiting for API keys (basic implementation)
// @access  Middleware function
const apiKeyRateLimit = (maxRequests = 1000, windowMs = 3600000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const keyId = req.apiKey.id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this key
    let keyRequests = requests.get(keyId) || [];

    // Filter out old requests outside the window
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (keyRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: maxRequests,
        windowMs,
        retryAfter: Math.ceil((keyRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    keyRequests.push(now);
    requests.set(keyId, keyRequests);

    // Clean up old entries periodically
    if (requests.size > 10000) {
      for (const [k, timestamps] of requests.entries()) {
        const filtered = timestamps.filter(timestamp => timestamp > windowStart);
        if (filtered.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, filtered);
        }
      }
    }

    next();
  };
};

module.exports = {
  validateApiKey,
  requirePermission,
  apiKeyRateLimit
};
