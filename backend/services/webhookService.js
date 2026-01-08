const axios = require("axios");
const crypto = require("crypto");
const Integration = require("../models/Integration");
const IntegrationLogs = require("../models/IntegrationLogs");
const { v4: uuidv4 } = require("uuid");

// Define available event types (must match frontend IntegrationsTab availableEvents ids)
const EVENT_TYPES = {
  INTERVIEW_ROUND_STATUS_UPDATED: "interview.round.status.updated",
  ASSESSMENT_STATUS_UPDATED: "assessment.status.updated",
  FEEDBACK_STATUS_UPDATED: "feedback.status.updated",
};

// Define allowed status changes for webhook triggers
const ALLOWED_STATUS_CHANGES = {
  INTERVIEW: ['RequestSent', 'Scheduled', 'Rescheduled', 'Completed', 'Rejected', 'Selected', 'Cancelled', 'NoShow'],
  ASSESSMENT: ['scheduled', 'cancelled', 'completed', 'expired', 'failed'],
  FEEDBACK: ['submitted']
};

// Helper function to check if status change should trigger webhook
const shouldTriggerWebhook = (eventType, status, previousStatus = null) => {
  
  switch (eventType) {
    case EVENT_TYPES.INTERVIEW_ROUND_STATUS_UPDATED:
      const shouldTriggerInterview = ALLOWED_STATUS_CHANGES.INTERVIEW.includes(status);
      return shouldTriggerInterview;
      
    case EVENT_TYPES.ASSESSMENT_STATUS_UPDATED:
      const shouldTriggerAssessment = ALLOWED_STATUS_CHANGES.ASSESSMENT.includes(status);
      return shouldTriggerAssessment;
      
    case EVENT_TYPES.FEEDBACK_STATUS_UPDATED:
      const shouldTriggerFeedback = ALLOWED_STATUS_CHANGES.FEEDBACK.includes(status);
      return shouldTriggerFeedback;
      
    default:
      return true; // Allow unknown event types by default
  }
};

const triggerWebhook = async (eventType, data, tenantId) => {
  try {

    // Check if webhook should be triggered based on status
    const status = data.status || data.newStatus;
    const previousStatus = data.previousStatus || data.oldStatus;
    
    if (!shouldTriggerWebhook(eventType, status, previousStatus)) {
      return;
    }

    // Build the query with tenantId only if it's provided
    const query = {
      enabled: true,
      events: eventType,
    };

    if (tenantId) {
      // Query by tenantId field (ObjectId)
      query.tenantId = tenantId;
    }
    
    // First check if there are any integrations (enabled or disabled) for this event
    const allIntegrations = await Integration.find({
      events: eventType,
      ...(tenantId && { tenantId })
    });
    
    
    if (allIntegrations.length === 0) {
      return;
    }

    const enabledIntegrations = allIntegrations.filter(integration => integration.enabled);
    const disabledIntegrations = allIntegrations.filter(integration => !integration.enabled);
    
    
    if (enabledIntegrations.length === 0) {
      return;
    }

    // Create a single consolidated log for all webhook calls
    const webhookResults = [];
    let overallSuccess = true;
    let successCount = 0;
    let errorCount = 0;

    // Process all enabled integrations and collect results
    await Promise.allSettled(
      enabledIntegrations.map(async (integration) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const payload = {
            event: eventType,
            data,
            timestamp: new Date().toISOString(),
          };

          const config = {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Your-App-Name/1.0'
            },
            signal: controller.signal,
            timeout: 10000, // 10 second timeout
            validateStatus: () => true // This will ensure we get the response even for error status codes
          };

          // Add authentication headers if configured
          if (integration.authentication) {
            const { type, bearerToken, apiKey, basicAuth, hmacSecret } = integration.authentication;

            if (type === 'bearer_token' && bearerToken) {
              config.headers['Authorization'] = `Bearer ${bearerToken}`;
            }
            else if (type === 'api_key' && apiKey?.headerName && apiKey?.keyValue) {
              config.headers[apiKey.headerName] = apiKey.keyValue;
            }
            else if (type === 'basic_auth' && basicAuth?.username && basicAuth?.password) {
              const credentials = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString('base64');
              config.headers['Authorization'] = `Basic ${credentials}`;
            }
            else if (type === 'hmac' && hmacSecret) {
              const hmac = crypto.createHmac('sha256', hmacSecret);
              const signature = hmac.update(JSON.stringify(payload)).digest('hex');
              config.headers['X-Signature'] = signature;
            }
          }

          const response = await axios.post(
            integration.webhookUrl,
            payload,
            config
          );

          // Determine if the webhook was actually successful (2xx status codes)
          const isSuccess = response.status >= 200 && response.status < 300;
          
          if (isSuccess) {
            successCount++;
          } else {
            errorCount++;
            overallSuccess = false;
          }

          // Collect result for consolidated log
          webhookResults.push({
            integrationName: integration.name || "unnamed",
            webhookUrl: integration.webhookUrl,
            status: response.status,
            statusText: response.statusText,
            success: isSuccess,
            error: !isSuccess ? {
              type: "http_error",
              status: response.status,
              statusText: response.statusText,
              data: response.data
            } : null,
            response: {
              status: response.status,
              statusText: response.statusText,
              data: response.data
            }
          });

        } catch (error) {
          errorCount++;
          overallSuccess = false;
          
          let errorDetails = {};
          
          if (error.name === "AbortError") {
            errorDetails = {
              type: "timeout",
              message: "Webhook request timed out after 10 seconds"
            };
          } else if (error.response) {
            errorDetails = {
              type: "http_error",
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              headers: error.response.headers
            };
          } else if (error.request) {
            errorDetails = {
              type: "no_response",
              message: "No response received from webhook URL",
              request: error.request
            };
          } else {
            errorDetails = {
              type: "setup_error",
              message: error.message
            };
          }

          // Collect error result for consolidated log
          webhookResults.push({
            integrationName: integration.name || "unnamed",
            webhookUrl: integration.webhookUrl,
            status: null,
            statusText: null,
            success: false,
            error: errorDetails,
            response: null
          });
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );

    // Create single consolidated log
    await createConsolidatedWebhookLog({
      eventType,
      data,
      tenantId,
      webhookResults,
      overallSuccess,
      successCount,
      errorCount,
      totalWebhooks: enabledIntegrations.length
    });

  } catch (error) {

  }
};

// Helper function to create a single consolidated webhook log
const createConsolidatedWebhookLog = async ({ eventType, data, tenantId, webhookResults, overallSuccess, successCount, errorCount, totalWebhooks }) => {
  try {
    const logData = {
      logId: `INTG-${uuidv4()}`,
      ownerId: "system", // Use system for consolidated logs
      status: overallSuccess ? "success" : "error",
      message: overallSuccess 
        ? `Webhook batch completed for ${eventType}: ${successCount}/${totalWebhooks} successful`
        : `Webhook batch partially failed for ${eventType}: ${successCount}/${totalWebhooks} successful, ${errorCount} failed`,
      serverName: process.env.SERVER_NAME || "backend",
      severity: overallSuccess ? "low" : "medium", // Medium for partial failures
      processName: "webhook-service",
      requestEndPoint: "multiple-webhooks", // Indicate multiple webhooks
      requestMethod: "POST",
      requestBody: JSON.stringify({
        event: eventType,
        data,
        timestamp: new Date().toISOString(),
        webhookCount: totalWebhooks
      }),
      responseStatusCode: overallSuccess ? 200 : 207, // 207 for multi-status
      responseError: !overallSuccess ? JSON.stringify({
        failedWebhooks: webhookResults.filter(r => !r.success).map(r => ({
          integrationName: r.integrationName,
          webhookUrl: r.webhookUrl,
          error: r.error
        }))
      }) : null,
      responseMessage: overallSuccess ? "All webhooks successful" : "Partial webhook success",
      integrationName: "multiple-integrations",
      flowType: "webhook-trigger",
      tenantId: tenantId,
      dateTime: new Date(),
      responseBody: JSON.stringify({
        summary: {
          total: totalWebhooks,
          successful: successCount,
          failed: errorCount,
          overallSuccess
        },
        results: webhookResults.map(r => ({
          integrationName: r.integrationName,
          webhookUrl: r.webhookUrl,
          status: r.status,
          success: r.success
        }))
      }),
    };

    const log = new IntegrationLogs(logData);
    await log.save();
    
  } catch (logError) {
    // Don't throw the error to prevent breaking the main webhook flow
  }
};

module.exports = { EVENT_TYPES, triggerWebhook, shouldTriggerWebhook, ALLOWED_STATUS_CHANGES };
