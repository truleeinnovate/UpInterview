const ApiKey = require("../models/ApiKey");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

// @desc    Get all API keys for authenticated user
// @route   GET /api/api-keys
// @access  Private
exports.getApiKeys = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    // Debug: Check authentication context
    console.log(`[${requestId}] Auth context:`, {
      hasAuth: !!res.locals.auth,
      auth: res.locals.auth,
      headers: req.headers
    });

    const apiKeys = await ApiKey.find({ tenantId: res.locals.auth?.actingAsTenantId }) // Remove createdBy filter - get all API keys
      .select("-__v");

    const duration = Date.now() - startTime;

    console.log(`[${requestId}] Found ${apiKeys.length} API keys`);

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      data: apiKeys,
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching API keys:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);

    res.status(500).json({
      success: false,
      message: "Error fetching API keys",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Create new API key
// @route   POST /api/api-keys
// @access  Private
exports.createApiKey = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { organization, permissions } = req.body;

  // Extract user context from auth middleware
  const auth = res.locals.auth;
  const ownerId = auth?.actingAsUserId;
  const tenantId = auth?.actingAsTenantId;

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create API Key";

  try {
    // Validate authentication - require user context for new API keys
    if (!ownerId || !tenantId) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "Create API Key",
        requestBody: req.body,
        message: "Authentication required to create API keys",
        status: "error",
        integrationName: "api-keys",
        flowType: "create-api-key",
      };
      return res.status(401).json({
        success: false,
        message: "Authentication required to create API keys",
        requestId,
      });
    }

    // Validate input
    if (
      !organization ||
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Organization and permissions are required",
        requestId,
      });
    }

    // Validate permissions with simplified system
    const validPermissions = [
      "candidates:read",
      "candidates:write",
      "candidates:bulk",
      "positions:read",
      "positions:write",
      "positions:bulk",
      "ats:read",
      "ats:write"
    ];
    const invalidPermissions = permissions.filter(
      (p) => !validPermissions.includes(p)
    );

    if (invalidPermissions.length > 0) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId,
        processName: "Create API Key",
        requestBody: req.body,
        message: `Invalid permissions: ${invalidPermissions.join(
          ", "
        )}. Valid permissions: ${validPermissions.join(", ")}`,
        status: "error",
        integrationName: "api-keys",
        flowType: "create-api-key",
      };
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(
          ", "
        )}. Valid permissions: ${validPermissions.join(", ")}`,
        requestId,
      });
    }

    // Generate API key
    let key;
    let keyExists = true;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      key = ApiKey.generateKey();
      const existingKey = await ApiKey.findOne({ key });
      keyExists = !!existingKey;
      attempts++;
    } while (keyExists && attempts < maxAttempts);

    if (keyExists) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId,
        processName: "Create API Key",
        requestBody: req.body,
        message: "Unable to generate unique API key",
        status: "error",
        integrationName: "api-keys",
        flowType: "create-api-key",
      };
      return res.status(500).json({
        success: false,
        message: "Unable to generate unique API key",
        requestId,
      });
    }

    // Create API key with simplified fields
    const apiKey = await ApiKey.create({
      key,
      organization: organization.trim(),
      permissions,
      ownerId,
      tenantId,
    });

    const duration = Date.now() - startTime;

    // Generate logs for success
    res.locals.logData = {
      ownerId,
      processName: "Create API Key",
      requestBody: req.body,
      message: "API key created successfully",
      status: "success",
      responseBody: { id: apiKey._id },
      integrationName: "api-keys",
      flowType: "create-api-key",
    };

    res.status(201).json({
      success: true,
      data: apiKey,
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error creating API key:`, error);

    // Generate logs for the error
    res.locals.logData = {
      ownerId: ownerId || "system",
      processName: "Create API Key",
      requestBody: req.body,
      message: "Error creating API key",
      status: "error",
      integrationName: "api-keys",
      flowType: "create-api-key",
    };

    res.status(500).json({
      success: false,
      message: "Error creating API key",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Delete API key
// @route   DELETE /api/api-keys/:id
// @access  Private
exports.deleteApiKey = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { id } = req.params;

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Delete API Key";

  try {
    // Find the API key (no user filtering)
    const apiKey = await ApiKey.findOne({ _id: id });

    if (!apiKey) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "Delete API Key",
        requestBody: { id },
        message: "API key not found",
        status: "error",
        integrationName: "api-keys",
        flowType: "delete-api-key",
      };
      return res.status(404).json({
        success: false,
        message: "API key not found",
        requestId,
      });
    }

    // Delete the API key
    await ApiKey.findByIdAndDelete(id);

    const duration = Date.now() - startTime;

    // Generate logs for success
    res.locals.logData = {
      ownerId: "system",
      processName: "Delete API Key",
      requestBody: { id },
      message: "API key deleted successfully",
      status: "success",
      responseBody: { id },
      integrationName: "api-keys",
      flowType: "delete-api-key",
    };

    res.status(200).json({
      success: true,
      message: "API key deleted successfully",
      data: { id },
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error deleting API key:`, error);

    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "Delete API Key",
      requestBody: { id },
      message: "Error deleting API key",
      status: "error",
      integrationName: "api-keys",
      flowType: "delete-api-key",
    };

    res.status(500).json({
      success: false,
      message: "Error deleting API key",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Update API key (enable/disable)
// @route   PATCH /api/api-keys/:id
// @access  Private
exports.updateApiKey = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { id } = req.params;
  const { enabled } = req.body;

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update API Key";

  try {
    // Find and update the API key (no user filtering)
    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: id },
      { enabled },
      { new: true, runValidators: true }
    );

    if (!apiKey) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "Update API Key",
        requestBody: req.body,
        message: "API key not found",
        status: "error",
        integrationName: "api-keys",
        flowType: "update-api-key",
      };
      return res.status(404).json({
        success: false,
        message: "API key not found",
        requestId,
      });
    }

    const duration = Date.now() - startTime;

    // Generate logs for success
    res.locals.logData = {
      ownerId: "system",
      processName: "Update API Key",
      requestBody: req.body,
      message: `API key ${enabled ? "enabled" : "disabled"} successfully`,
      status: "success",
      responseBody: { id: apiKey._id },
      integrationName: "api-keys",
      flowType: "update-api-key",
    };

    res.status(200).json({
      success: true,
      data: apiKey,
      message: `API key ${enabled ? "enabled" : "disabled"} successfully`,
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error updating API key:`, error);

    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "Update API Key",
      requestBody: req.body,
      message: "Error updating API key",
      status: "error",
      integrationName: "api-keys",
      flowType: "update-api-key",
    };

    res.status(500).json({
      success: false,
      message: "Error updating API key",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Get API key usage statistics
// @route   GET /api/api-keys/:id/stats
// @access  Private
exports.getApiKeyStats = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { id } = req.params;

  try {
    const apiKey = await ApiKey.findOne({ _id: id }) // No user filtering
      .select(
        "key organization permissions enabled lastUsed usageCount createdAt"
      );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
        requestId,
      });
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        ...apiKey.toObject(),
        maskedKey: apiKey.maskKey(),
      },
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching API key stats:`, error);

    res.status(500).json({
      success: false,
      message: "Error fetching API key stats",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Validate API key
// @route   POST /api/api-keys/validate
// @access  Public (for testing)
exports.validateApiKey = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const { key, permission } = req.body;

  try {
    if (!key) {
      return res.status(400).json({
        success: false,
        message: "API key is required",
        requestId,
      });
    }

    const apiKey = await ApiKey.findOne({ key });

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
        requestId,
        error: "INVALID_API_KEY",
      });
    }

    // Check if key is valid
    if (!apiKey.isValid) {
      const reason = !apiKey.enabled ? "disabled" : "expired";
      return res.status(401).json({
        success: false,
        message: `API key is ${reason}`,
        requestId,
        error: reason.toUpperCase(),
      });
    }

    // Check permission if specified
    let hasPermission = true;
    if (permission) {
      hasPermission = apiKey.hasPermission(permission);
    }

    // Check rate limits
    const rateLimitCheck = apiKey.checkRateLimit();

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        organization: apiKey.organization,
        permissions: apiKey.permissions,
        hasPermission,
        rateLimit: {
          allowed: rateLimitCheck.allowed,
          limit: rateLimitCheck.limit,
          resetTime: rateLimitCheck.resetTime,
        },
        expiresAt: apiKey.expiresAt,
        maskedKey: apiKey.maskKey(),
      },
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error validating API key:`, error);

    res.status(500).json({
      success: false,
      message: "Error validating API key",
      error: error.message,
      requestId,
      duration,
    });
  }
});

// @desc    Get usage analytics for all API keys
// @route   GET /api/api-keys/analytics
// @access  Private
exports.getUsageAnalytics = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    const analytics = await ApiKey.aggregate([
      {
        $group: {
          _id: null,
          totalKeys: { $sum: 1 },
          activeKeys: { $sum: { $cond: [{ $eq: ["$enabled", true] }, 1, 0] } },
          expiredKeys: {
            $sum: { $cond: [{ $lt: ["$expiresAt", new Date()] }, 1, 0] },
          },
          totalRequests: { $sum: "$usageAnalytics.totalRequests" },
          totalErrors: { $sum: "$usageAnalytics.errorCount" },
          avgRequestsPerKey: { $avg: "$usageAnalytics.totalRequests" },
        },
      },
    ]);

    const topEndpoints = await ApiKey.aggregate([
      { $unwind: "$usageAnalytics.endpointsUsed" },
      {
        $group: {
          _id: "$usageAnalytics.endpointsUsed.endpoint",
          totalCalls: { $sum: "$usageAnalytics.endpointsUsed.count" },
          uniqueKeys: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          endpoint: "$_id",
          totalCalls: 1,
          uniqueKeys: { $size: "$uniqueKeys" },
        },
      },
      { $sort: { totalCalls: -1 } },
      { $limit: 10 },
    ]);

    const organizationStats = await ApiKey.aggregate([
      {
        $group: {
          _id: "$organization",
          keyCount: { $sum: 1 },
          totalRequests: { $sum: "$usageAnalytics.totalRequests" },
          avgRequests: { $avg: "$usageAnalytics.totalRequests" },
        },
      },
      { $sort: { totalRequests: -1 } },
    ]);

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalKeys: 0,
          activeKeys: 0,
          expiredKeys: 0,
          totalRequests: 0,
          totalErrors: 0,
          avgRequestsPerKey: 0,
        },
        topEndpoints,
        organizationStats,
      },
      requestId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching usage analytics:`, error);

    res.status(500).json({
      success: false,
      message: "Error fetching usage analytics",
      error: error.message,
      requestId,
      duration,
    });
  }
});
