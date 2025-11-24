const ApiKey = require("../models/ApiKey");
const { v4: uuidv4 } = require("uuid");

/**
 * API Key Authentication Middleware
 * Validates API keys, checks permissions, rate limits, and tracks usage
 */
const apiKeyAuth = (requiredPermission = null) => {
  return async (req, res, next) => {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Add requestId to request for tracking
    req.requestId = requestId;

    try {
      // Extract API key from various sources
      const apiKey = extractApiKey(req);

      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: "API key required",
          requestId,
          error: "MISSING_API_KEY",
        });
      }

      // Find the API key in database
      const keyDoc = await ApiKey.findOne({ key: apiKey });

      if (!keyDoc) {
        return res.status(401).json({
          success: false,
          message: "Invalid API key",
          requestId,
          error: "INVALID_API_KEY",
        });
      }

      // Check if key is enabled and not expired
      if (!keyDoc.isValid) {
        const reason = !keyDoc.enabled ? "disabled" : "expired";
        return res.status(401).json({
          success: false,
          message: `API key is ${reason}`,
          requestId,
          error: reason.toUpperCase(),
        });
      }

      // Check IP restrictions
      const clientIP = getClientIP(req);
      if (!keyDoc.isIPAllowed(clientIP)) {
        return res.status(403).json({
          success: false,
          message: "IP address not allowed",
          requestId,
          error: "IP_NOT_ALLOWED",
        });
      }

      // Check rate limits
      const rateLimitCheck = keyDoc.checkRateLimit();
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded (${rateLimitCheck.limit})`,
          requestId,
          error: "RATE_LIMIT_EXCEEDED",
          resetTime: rateLimitCheck.resetTime,
          limit: rateLimitCheck.limit,
        });
      }

      // Check permissions if required
      if (requiredPermission && !keyDoc.hasPermission(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requestId,
          error: "INSUFFICIENT_PERMISSIONS",
          required: requiredPermission,
        });
      }

      // Update usage analytics
      const endpoint = `${req.method} ${req.route?.path || req.path}`;
      await keyDoc.updateUsage(endpoint, false);

      // Add API key info to request
      req.apiKey = {
        id: keyDoc._id,
        organization: keyDoc.organization,
        permissions: keyDoc.permissions,
        keyId: keyDoc.key.substring(0, 8) + "...",
      };

      // Automatically set user context from API key (if available)
      if (keyDoc.ownerId) {
        req.user = {
          _id: keyDoc.ownerId,
          userId: keyDoc.ownerId,
        };
      }
      if (keyDoc.tenantId) {
        req.tenantId = keyDoc.tenantId;
      }

      // Log successful authentication
      const duration = Date.now() - startTime;

      next();
    } catch (error) {
      console.error(`🔑 [ApiKeyAuth] Error - Request ID: ${requestId}:`, error);

      // Try to update error count if we have the key
      try {
        const apiKey = extractApiKey(req);
        if (apiKey) {
          const keyDoc = await ApiKey.findOne({ key: apiKey });
          if (keyDoc) {
            await keyDoc.updateUsage(req.path, true);
          }
        }
      } catch (updateError) {
        // Ignore update errors in error handling
      }

      return res.status(500).json({
        success: false,
        message: "Authentication error",
        requestId,
        error: "AUTH_ERROR",
      });
    }
  };
};

/**
 * Extract API key from various sources:
 * 1. Authorization header: "Bearer up_..."
 * 2. X-API-Key header
 * 3. Query parameter: ?api_key=up_...
 */
const extractApiKey = (req) => {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const xApiKey = req.headers["x-api-key"];
  if (xApiKey) {
    return xApiKey;
  }

  // Check query parameter
  const queryKey = req.query.api_key;
  if (queryKey) {
    return queryKey;
  }

  return null;
};

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    "127.0.0.1"
  );
};

/**
 * Middleware to require specific permissions
 */
const requirePermission = (permission) => {
  return apiKeyAuth(permission);
};

/**
 * Middleware to check if user has any of the specified permissions
 */
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    const requestId = uuidv4();

    try {
      const apiKey = extractApiKey(req);
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          message: "API key required",
          requestId,
          error: "MISSING_API_KEY",
        });
      }

      const keyDoc = await ApiKey.findOne({ key: apiKey });
      if (!keyDoc || !keyDoc.isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid or inactive API key",
          requestId,
          error: "INVALID_API_KEY",
        });
      }

      // Check if key has any of the required permissions
      const hasAnyPermission = permissions.some((permission) =>
        keyDoc.hasPermission(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requestId,
          error: "INSUFFICIENT_PERMISSIONS",
          required: permissions,
        });
      }

      // Add API key info to request
      req.apiKey = {
        id: keyDoc._id,
        organization: keyDoc.organization,
        permissions: keyDoc.permissions,
        keyId: keyDoc.key.substring(0, 8) + "...",
      };

      // Automatically set user context from API key (if available)
      if (keyDoc.ownerId) {
        req.user = {
          _id: keyDoc.ownerId,
          userId: keyDoc.ownerId,
        };
      }
      if (keyDoc.tenantId) {
        req.tenantId = keyDoc.tenantId;
      }

      next();
    } catch (error) {
      console.error(
        `🔑 [RequireAnyPermission] Error - Request ID: ${requestId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: "Permission check error",
        requestId,
        error: "PERMISSION_ERROR",
      });
    }
  };
};

module.exports = {
  apiKeyAuth,
  requirePermission,
  requireAnyPermission,
  extractApiKey,
  getClientIP,
};
