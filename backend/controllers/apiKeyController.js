const ApiKey = require('../models/ApiKey');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all API keys for authenticated user
// @route   GET /api/api-keys
// @access  Private
exports.getApiKeys = asyncHandler(async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    const apiKeys = await ApiKey.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      data: apiKeys,
      requestId,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching API keys:`, error);

    res.status(500).json({
      success: false,
      message: 'Error fetching API keys',
      error: error.message,
      requestId,
      duration
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

  try {
    // Validate input
    if (!organization || !permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization and permissions are required',
        requestId
      });
    }

    // Validate permissions
    const validPermissions = ['read', 'write', 'delete'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        requestId
      });
    }

    // Generate unique API key
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
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique API key',
        requestId
      });
    }

    // Create API key
    const apiKey = await ApiKey.create({
      key,
      organization: organization.trim(),
      permissions,
      createdBy: req.user.id
    });

    const duration = Date.now() - startTime;

    res.status(201).json({
      success: true,
      data: apiKey,
      requestId,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error creating API key:`, error);

    res.status(500).json({
      success: false,
      message: 'Error creating API key',
      error: error.message,
      requestId,
      duration
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

  try {
    // Find the API key
    const apiKey = await ApiKey.findOne({ _id: id, createdBy: req.user.id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
        requestId
      });
    }

    // Delete the API key
    await ApiKey.findByIdAndDelete(id);

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
      data: { id },
      requestId,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error deleting API key:`, error);

    res.status(500).json({
      success: false,
      message: 'Error deleting API key',
      error: error.message,
      requestId,
      duration
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

  try {
    // Find and update the API key
    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { enabled },
      { new: true, runValidators: true }
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
        requestId
      });
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: apiKey,
      message: `API key ${enabled ? 'enabled' : 'disabled'} successfully`,
      requestId,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error updating API key:`, error);

    res.status(500).json({
      success: false,
      message: 'Error updating API key',
      error: error.message,
      requestId,
      duration
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
    const apiKey = await ApiKey.findOne({ _id: id, createdBy: req.user.id })
      .select('key organization permissions enabled lastUsed usageCount createdAt');

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
        requestId
      });
    }

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        ...apiKey.toObject(),
        maskedKey: apiKey.maskKey()
      },
      requestId,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error fetching API key stats:`, error);

    res.status(500).json({
      success: false,
      message: 'Error fetching API key stats',
      error: error.message,
      requestId,
      duration
    });
  }
});
