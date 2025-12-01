const Integration = require("../models/Integration");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");

// @desc    Make authenticated API call using integration
// @route   POST /integrations/:id/call
// @access  Private
exports.makeApiCall = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { method = "GET", endpoint = "", data = {} } = req.body;
  const logId = uuidv4();
  const ownerId = req.user?.id || "system"; // Get user ID from auth or use 'system'

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Make API Call";

  try {
    const integration = await Integration.findById(id);
    if (!integration) {
      // Generate logs for the error
      res.locals.logData = {
        tenantId: req.body.tenantId,
        ownerId,
        processName: "Make API Call",
        requestBody: req.body,
        message: "Integration not found",
        status: "error",
        integrationName: "unknown",
        flowType: "api-request",
      };
      return res
        .status(404)
        .json({ success: false, message: "Integration not found" });
    }

    if (!integration.enabled) {
      // Generate logs for the error
      res.locals.logData = {
        tenantId: req.body.tenantId,
        ownerId,
        processName: "Make API Call",
        requestBody: req.body,
        message: "Integration is disabled",
        status: "error",
        integrationName: integration.name,
        flowType: "api-request",
      };
      return res
        .status(400)
        .json({ success: false, message: "Integration is disabled" });
    }

    const headers = {};

    // Add authentication header based on integration type
    if (integration.authentication.type === "api_key") {
      headers[integration.authentication.apiKey.headerName] =
        integration.authentication.apiKey.keyValue;
    } else if (integration.authentication.type === "bearer_token") {
      headers[
        "Authorization"
      ] = `Bearer ${integration.authentication.bearerToken}`;
    } else if (integration.authentication.type === "basic_auth") {
      const token = Buffer.from(
        `${integration.authentication.basicAuth.username}:${integration.authentication.basicAuth.password}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${token}`;
    }

    // Add custom headers
    if (
      integration.authentication.customHeader &&
      integration.authentication.customHeader.name
    ) {
      headers[integration.authentication.customHeader.name] =
        integration.authentication.customHeader.value;
    }

    // Use webhookUrl as the base URL for API calls
    if (!integration.webhookUrl) {
      throw new Error("No webhook URL found for this integration");
    }

    // For testing with JSONPlaceholder, we'll use a hardcoded base URL
    // const baseUrl = 'https://jsonplaceholder.typicode.com';
    const baseUrl = integration.baseUrl;
    const fullUrl = `${baseUrl}${
      endpoint.startsWith("/") ? "" : "/"
    }${endpoint}`;

    let response;
    try {
      response = await axios({
        method: method.toLowerCase(),
        url: fullUrl,
        headers,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
      });
    } catch (error) {
      const errorResponse = error.response || {};
      
      // Generate logs for the error
      res.locals.logData = {
        tenantId: req.body.tenantId,
        ownerId,
        processName: "Make API Call",
        requestBody: { method, endpoint, data },
        message: `API call failed: ${error.message}`,
        status: "error",
        integrationName: integration.name,
        flowType: "api-request",
      };

      return res.status(errorResponse.status || 500).json({
        success: false,
        message: errorResponse.statusText || "API call failed",
        status: errorResponse.status || 500,
        data: errorResponse.data || {},
      });
    }

    // Generate logs for success
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId,
      processName: "Make API Call",
      requestBody: { method, endpoint, data },
      message: `API call successful to ${endpoint}`,
      status: "success",
      responseBody: response.data,
      integrationName: integration.name,
      flowType: "api-request",
    };

    res.status(200).json({
      success: true,
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    const errorResponse = error.response || {};

    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId,
      processName: "Make API Call",
      requestBody: { method, endpoint, data },
      message: error.message,
      status: "error",
      responseBody: errorResponse.data,
    };

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
  const signature =
    req.headers["x-hub-signature-256"] || req.headers["x-signature"];
  const logId = uuidv4();

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Handle Webhook";

  try {
    const integration = await Integration.findById(id);
    if (!integration) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "Handle Webhook",
        requestBody: req.body,
        message: "Integration not found",
        status: "error",
        integrationName: "unknown",
        flowType: "webhook",
      };
      return res
        .status(404)
        .json({ success: false, message: "Integration not found" });
    }

    if (!integration.enabled) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "Handle Webhook",
        requestBody: req.body,
        message: "Integration is disabled",
        status: "error",
        integrationName: integration.name,
        flowType: "webhook",
      };
      return res
        .status(400)
        .json({ success: false, message: "Integration is disabled" });
    }

    // Verify webhook signature if secret is configured
    if (integration.authentication.webhookSecret) {
      const hmac = crypto.createHmac(
        "sha256",
        integration.authentication.webhookSecret
      );
      const digest =
        "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

      if (signature !== digest) {
        // Generate logs for the error
        res.locals.logData = {
          ownerId: "system",
          processName: "Handle Webhook",
          requestBody: req.body,
          message: "Invalid webhook signature",
          status: "error",
          integrationName: integration.name,
          flowType: "webhook",
        };
        return res
          .status(401)
          .json({ success: false, message: "Invalid signature" });
      }
    }

    // Process the webhook data here
    // You can add your custom logic based on the integration type and event type
    const eventType =
      req.headers["x-github-event"] || req.headers["x-event-type"] || "unknown";

    // Log the webhook
    res.locals.logData = {
      ownerId: "system",
      processName: "Handle Webhook",
      requestBody: req.body,
      message: `Webhook received: ${eventType}`,
      status: "success",
      integrationName: integration.name,
      flowType: "webhook",
      metadata: {
        eventType,
        headers: req.headers,
      },
    };

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "Handle Webhook",
      requestBody: req.body,
      message: error.message,
      status: "error",
      integrationName: "unknown",
      flowType: "webhook",
    };

    res
      .status(500)
      .json({ success: false, message: "Error processing webhook" });
  }
});

// @desc    Update an integration
// @route   PUT /integrations/:id
// @access  Private
exports.updateIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Integration";

  try {
    // Find the integration by ID
    let integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found",
      });
    }

    // Update the integration with new data
    integration = await Integration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Log the update
    res.locals.logData = {
      ownerId: req.user?.id || "system",
      processName: "Update Integration",
      requestBody: updateData,
      message: "Integration updated successfully",
      status: "success",
      integrationName: integration.name,
      flowType: "update-integration",
    };

    res.status(200).json({
      success: true,
      data: integration,
    });
  } catch (error) {
    console.error("Error updating integration:", error);

    // Log the error
    res.locals.logData = {
      ownerId: req.user?.id || "system",
      processName: "Update Integration",
      requestBody: updateData,
      message: "Failed to update integration",
      status: "error",
      integrationName: updateData.name || "unknown",
      flowType: "update-integration",
    };

    res.status(500).json({
      success: false,
      message: "Failed to update integration",
      error: error.message,
    });
  }
});

// @desc    Delete an integration
// @route   DELETE /integrations/:id
// @access  Private
exports.deleteIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    const integration = await Integration.findById(id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found",
        requestId,
      });
    }

    await Integration.findByIdAndDelete(id);

    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      message: "Integration deleted successfully",
      data: { id },
      requestId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[${requestId}] Error deleting integration:`, error);
    res.status(500).json({
      success: false,
      message: "Error deleting integration",
      error: error.message,
      requestId,
    });
  }
});

// @desc    Get all integrations
// @route   GET /integrations
// @access  Private
exports.getIntegrations = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    // Filter by tenantId if provided in query params
    const query = {};
    if (req.query.tenantId) {
      query.tenantId = req.query.tenantId;
    }

    const integrations = await Integration.find(query).lean();
    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      count: integrations.length,
      data: integrations,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`[${requestId}] Error fetching integrations:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching integrations",
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

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Integration";

  try {
    // Add user to req.body if user is authenticated
    if (req.user && req.user.id) {
      req.body.createdBy = req.user.id;
      req.body.updatedBy = req.user.id;
    }

    const integration = await Integration.create(req.body);
    const duration = Date.now() - startTime;

    // Log successful creation
    res.locals.logData = {
      ownerId: "system",
      processName: "Create Integration",
      requestBody: req.body,
      message: "Successfully created integration",
      status: "success",
      responseBody: { id: integration._id },
      integrationName: integration.name,
      flowType: "create-integration",
    };

    res.status(201).json({
      success: true,
      data: integration,
      requestId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    res.locals.logData = {
      ownerId: "system",
      processName: "Create Integration",
      requestBody: req.body,
      message: "Error creating integration",
      status: "error",
      integrationName: req.body.name || "unknown",
      flowType: "create-integration",
    };

    console.error(`[${requestId}] Error creating integration:`, error);
    res.status(500).json({
      success: false,
      message: "Error creating integration",
      error: error.message,
      requestId,
    });
  }
});
