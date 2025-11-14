const Integration = require('../models/Integration');
const IntegrationLog = require('../models/IntegrationLogs');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const crypto = require('crypto');

// Helper function to create integration log
const createLog = async (logData) => {
  try {
    const log = new IntegrationLog({
      logId: uuidv4(),
      ownerId: logData.ownerId || 'system', // Default to 'system' if not provided
      status: logData.status || 'success',
      errorCode: logData.errorCode || null,
      message: logData.message || '',
      serverName: process.env.SERVER_NAME || 'backend',
      // Map common severity levels to valid ones
      severity: (() => {
        const severityMap = {
          'error': 'high',
          'critical': 'high',
          'warning': 'medium',
          'info': 'low',
          'debug': 'low'
        };
        const inputSeverity = String(logData.severity || 'info').toLowerCase();
        return severityMap[inputSeverity] || 'low';
      })(),
      processName: 'integration-service',
      requestEndPoint: logData.requestEndPoint || '',
      requestMethod: logData.requestMethod || '',
      requestBody: logData.requestBody ? (typeof logData.requestBody === 'string' ? logData.requestBody : JSON.stringify(logData.requestBody)) : '',
      responseStatusCode: logData.responseStatusCode || 200,
      responseError: logData.responseError ? (typeof logData.responseError === 'string' ? logData.responseError : JSON.stringify(logData.responseError)) : null,
      responseMessage: logData.responseMessage || '',
      integrationName: logData.integrationName || 'internal',
      flowType: logData.flowType || 'api-request',
      dateTime: new Date(),
      responseBody: logData.responseBody ? (typeof logData.responseBody === 'string' ? logData.responseBody : JSON.stringify(logData.responseBody)) : null,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating integration log:', error.message);
    if (error.errors) {
      console.error('Validation errors:', Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      })));
    }
    // Don't throw the error to prevent breaking the main flow
    return null;
  }
};

// @desc    Make authenticated API call using integration
// @route   POST /integrations/:id/call
// @access  Private
exports.makeApiCall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { method = 'GET', endpoint = '', data = {} } = req.body;
  const logId = uuidv4();
  const ownerId = req.user?.id || 'system'; // Get user ID from auth or use 'system'

  try {
    const integration = await Integration.findById(id);
    if (!integration) {
      await createLog({
        ownerId,
        logId,
        status: 'error',
        errorCode: 'NOT_FOUND',
        message: 'Integration not found',
        requestEndPoint: `/integrations/${id}/call`,
        requestMethod: 'POST',
        requestBody: req.body,
        responseStatusCode: 404,
        severity: 'high'
      });
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    if (!integration.enabled) {
      await createLog({
        ownerId,
        logId,
        status: 'error',
        errorCode: 'INTEGRATION_DISABLED',
        message: 'Integration is disabled',
        requestEndPoint: `/integrations/${id}/call`,
        requestMethod: 'POST',
        requestBody: req.body,
        responseStatusCode: 400,
        severity: 'medium'
      });
      return res.status(400).json({ success: false, message: 'Integration is disabled' });
    }

    const headers = {};

    // Add authentication header based on integration type
    if (integration.authentication.type === 'api_key') {
      headers[integration.authentication.apiKey.headerName] = integration.authentication.apiKey.keyValue;
    } else if (integration.authentication.type === 'bearer_token') {
      headers['Authorization'] = `Bearer ${integration.authentication.bearerToken}`;
    } else if (integration.authentication.type === 'basic_auth') {
      const token = Buffer.from(
        `${integration.authentication.basicAuth.username}:${integration.authentication.basicAuth.password}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${token}`;
    }

    // Add custom headers
    if (integration.authentication.customHeader && integration.authentication.customHeader.name) {
      headers[integration.authentication.customHeader.name] = integration.authentication.customHeader.value;
    }

    // Use webhookUrl as the base URL for API calls
    if (!integration.webhookUrl) {
      throw new Error('No webhook URL found for this integration');
    }

    // For testing with JSONPlaceholder, we'll use a hardcoded base URL
    // const baseUrl = 'https://jsonplaceholder.typicode.com';
    const baseUrl = integration.baseUrl;
    const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    console.log(`Making ${method} request to:`, fullUrl); // Debug log

    let response;
    try {
      response = await axios({
        method: method.toLowerCase(),
        url: fullUrl,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });
    } catch (error) {
      const errorResponse = error.response || {};
      await createLog({
        ownerId,
        logId,
        status: 'error',
        errorCode: 'API_CALL_FAILED',
        message: `API call failed: ${error.message}`,
        requestEndPoint: fullUrl,
        requestMethod: method,
        requestBody: data,
        responseStatusCode: errorResponse.status || 500,
        responseError: errorResponse.data || error.message,
        severity: 'high',
        integrationName: integration.name
      });

      return res.status(errorResponse.status || 500).json({
        success: false,
        message: errorResponse.statusText || 'API call failed',
        status: errorResponse.status || 500,
        data: errorResponse.data || {}
      });
    }

    await createLog({
      ownerId,
      logId,
      status: 'success',
      message: `API call successful to ${endpoint}`,
      requestEndPoint: `/integrations/${id}/call`,
      requestMethod: 'POST',
      requestBody: { method, endpoint, data },
      responseStatusCode: response.status,
      responseBody: response.data,
      integrationName: integration.name,
      flowType: 'api-request',
      severity: 'low'
    });

    res.status(200).json({
      success: true,
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    const errorResponse = error.response || {};

    await createLog({
      logId,
      status: 'error',
      errorCode: 'API_CALL_FAILED',
      message: error.message,
      requestEndPoint: `/integrations/${id}/call`,
      requestMethod: method,
      requestBody: data,
      responseStatusCode: errorResponse.status || 500,
      responseBody: errorResponse.data,
      severity: 'error',
    });

    res.status(errorResponse.status || 500).json({
      success: false,
      message: error.message,
      status: errorResponse.status || 500,
      data: errorResponse.data || {},
    });
  }
});

// @desc    Handle incoming webhook
// @route   POST /integrations/webhook/:id
// @access  Public (should be protected in production with webhook secret)
exports.handleWebhook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature'];
  const logId = uuidv4();

  try {
    const integration = await Integration.findById(id);
    if (!integration) {
      await createLog({
        logId,
        status: 'error',
        errorCode: 'NOT_FOUND',
        message: 'Integration not found',
        requestEndPoint: `/integrations/webhook/${id}`,
        requestMethod: 'POST',
        requestBody: req.body,
        responseStatusCode: 404,
      });
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    if (!integration.enabled) {
      await createLog({
        logId,
        status: 'error',
        errorCode: 'INTEGRATION_DISABLED',
        message: 'Integration is disabled',
        requestEndPoint: `/integrations/webhook/${id}`,
        requestMethod: 'POST',
        requestBody: req.body,
        responseStatusCode: 400,
      });
      return res.status(400).json({ success: false, message: 'Integration is disabled' });
    }

    // Verify webhook signature if secret is configured
    if (integration.authentication.webhookSecret) {
      const hmac = crypto.createHmac('sha256', integration.authentication.webhookSecret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

      if (signature !== digest) {
        await createLog({
          logId,
          status: 'error',
          errorCode: 'INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
          requestEndPoint: `/integrations/webhook/${id}`,
          requestMethod: 'POST',
          requestBody: req.body,
          responseStatusCode: 401,
        });
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }
    }

    // Process the webhook data here
    // You can add your custom logic based on the integration type and event type
    const eventType = req.headers['x-github-event'] || req.headers['x-event-type'] || 'unknown';

    // Log the webhook
    await createLog({
      logId,
      status: 'success',
      message: `Webhook received: ${eventType}`,
      requestEndPoint: `/integrations/webhook/${id}`,
      requestMethod: 'POST',
      requestBody: req.body,
      responseStatusCode: 200,
      metadata: {
        eventType,
        headers: req.headers,
      },
    });

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    await createLog({
      logId,
      status: 'error',
      errorCode: 'WEBHOOK_ERROR',
      message: error.message,
      requestEndPoint: `/integrations/webhook/${id}`,
      requestMethod: 'POST',
      requestBody: req.body,
      responseStatusCode: 500,
      severity: 'error',
    });

    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
});

// @desc    Get all integrations
// @route   GET /integrations
// @access  Private
exports.getIntegrations = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    const integrations = await Integration.find({}).lean();
    const duration = Date.now() - startTime;

    // Log successful request
    await createLog({
      requestId,
      status: 'success',
      message: 'Successfully retrieved integrations',
      requestEndPoint: req.originalUrl,
      requestMethod: req.method,
      requestBody: req.body,
      responseStatusCode: 200,
      responseBody: { count: integrations.length },
      duration,
    });

    res.status(200).json({
      success: true,
      count: integrations.length,
      data: integrations,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    await createLog({
      requestId,
      status: 'error',
      message: 'Error fetching integrations',
      errorCode: 'INTEGRATION_FETCH_ERROR',
      severity: 'error',
      requestEndPoint: req.originalUrl,
      requestMethod: req.method,
      requestBody: req.body,
      responseStatusCode: 500,
      responseError: error.message,
      duration,
    });

    console.error(`[${requestId}] Error fetching integrations:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching integrations',
      error: error.message,
      requestId,
    });
  }
});

// @desc    Create new integration
// @route   POST /integrations
// @access  Private
exports.createIntegration = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    // Add user to req.body if user is authenticated
    if (req.user && req.user.id) {
      req.body.createdBy = req.user.id;
      req.body.updatedBy = req.user.id;
    }

    const integration = await Integration.create(req.body);
    const duration = Date.now() - startTime;

    // Log successful creation
    await createLog({
      requestId,
      status: 'success',
      message: 'Successfully created integration',
      requestEndPoint: req.originalUrl,
      requestMethod: req.method,
      requestBody: req.body,
      responseStatusCode: 201,
      responseBody: { id: integration._id },
      duration,
    });

    res.status(201).json({
      success: true,
      data: integration,
      requestId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    await createLog({
      requestId,
      status: 'error',
      message: 'Error creating integration',
      errorCode: 'INTEGRATION_CREATE_ERROR',
      severity: 'error',
      requestEndPoint: req.originalUrl,
      requestMethod: req.method,
      requestBody: req.body,
      responseStatusCode: 500,
      responseError: error.message,
      duration,
    });

    console.error(`[${requestId}] Error creating integration:`, error);
    res.status(500).json({
      success: false,
      message: 'Error creating integration',
      error: error.message,
      requestId,
    });
  }
});
