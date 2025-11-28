const axios = require("axios");
const crypto = require("crypto");
const Integration = require("../models/Integration");

// Define available event types (must match frontend IntegrationsTab availableEvents ids)
const EVENT_TYPES = {
  INTERVIEW_ROUND_STATUS_UPDATED: "interview.round.status.updated",
  ASSESSMENT_STATUS_UPDATED: "assessment.status.updated",
  FEEDBACK_STATUS_UPDATED: "feedback.status.updated",
};

const triggerWebhook = async (eventType, data, tenantId) => {
  try {
    console.log(`[Webhook] Triggering webhook for event: ${eventType}, tenant: ${tenantId || 'all'}`);

    // Build the query with tenantId only if it's provided
    const query = {
      enabled: true,
      events: eventType,
    };

    if (tenantId) {
      // Query by tenantId field (ObjectId)
      query.tenantId = tenantId;
    }

    console.log(`[Webhook] Querying integrations with:`, query);
    
    // First check if there are any integrations (enabled or disabled) for this event
    const allIntegrations = await Integration.find({
      events: eventType,
      ...(tenantId && { tenantId })
    });
    
    console.log(`[Webhook] Found ${allIntegrations.length} total integrations for event ${eventType}`);
    
    if (allIntegrations.length === 0) {
      console.log(`[Webhook] No integrations configured for event: ${eventType}`);
      return;
    }

    const enabledIntegrations = allIntegrations.filter(integration => integration.enabled);
    const disabledIntegrations = allIntegrations.filter(integration => !integration.enabled);
    
    console.log(`[Webhook] Found ${enabledIntegrations.length} enabled and ${disabledIntegrations.length} disabled integrations`);
    
    if (enabledIntegrations.length === 0) {
      console.log(`[Webhook] All integrations are disabled for event: ${eventType}. Skipping webhook triggers.`);
      return;
    }

    // Process only enabled integrations with timeout
    await Promise.all(
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

          console.log(`[Webhook] Sending to ${integration.webhookUrl} with payload:`, {
            event: eventType,
            dataKeys: Object.keys(data),
            timestamp: payload.timestamp
          });

          const response = await axios.post(
            integration.webhookUrl,
            payload,
            config
          );

          console.log(`[Webhook] Response from ${integration.webhookUrl}:`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data
          });

        } catch (error) {
          if (error.name === "AbortError") {
            console.error(`[Webhook] Timeout sending to ${integration.webhookUrl}`);
          } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`[Webhook] Error response from ${integration.webhookUrl}:`, {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            });
          } else if (error.request) {
            // The request was made but no response was received
            console.error(`[Webhook] No response from ${integration.webhookUrl}:`, error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error(`[Webhook] Error setting up request to ${integration.webhookUrl}:`, error.message);
          }
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );
  } catch (error) {
    console.error("[Webhook] Error in triggerWebhook:", {
      message: error.message,
      stack: error.stack,
      eventType,
      tenantId,
    });
  }
};

module.exports = { EVENT_TYPES, triggerWebhook };
