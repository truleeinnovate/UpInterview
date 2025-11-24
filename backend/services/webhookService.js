const axios = require("axios");
const crypto = require("crypto");
const Integration = require("../models/Integration");

// Define available event types (must match frontend IntegrationsTab availableEvents ids)
const EVENT_TYPES = {
  INTERVIEW_ROUND_STATUS_UPDATED: "interview.round.status.updated",
  ASSESSMENT_STATUS_UPDATED: "assessment.status.updated",
  FEEDBACK_STATUS_UPDATED: "feedback.status.updated",
};

// Core webhook trigger helper
const triggerWebhook = async (eventType, data, tenantId) => {
  try {
    // Build the query with tenantId only if it's provided
    const query = {
      enabled: true,
      events: eventType,
    };

    if (tenantId) {
      query.organization = tenantId;
    }

    const integrations = await Integration.find(query);

    // Process each integration with timeout
    await Promise.all(
      integrations.map(async (integration) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const payload = {
            event: eventType,
            data,
            timestamp: new Date().toISOString(),
          };

          const config = {
            headers: {},
            signal: controller.signal,
            timeout: 10000, // 10 second timeout
          };

          // TODO: add auth headers (HMAC, API key, etc.) based on integration.authentication

          const response = await axios.post(
            integration.webhookUrl,
            payload,
            config
          );
        } catch (error) {
          if (error.name === "AbortError") {
            console.error(`Webhook timeout for ${integration.webhookUrl}`);
          } else {
            console.error(
              `Error sending webhook to ${integration.webhookUrl}:`,
              {
                message: error.message,
                code: error.code,
                config: {
                  url: error.config?.url,
                  method: error.config?.method,
                  headers: error.config?.headers,
                },
                response: {
                  status: error.response?.status,
                  data: error.response?.data,
                },
              }
            );
          }
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );
  } catch (error) {
    console.error("Error in triggerWebhook:", {
      message: error.message,
      stack: error.stack,
      eventType,
      tenantId,
    });
  }
};

module.exports = { EVENT_TYPES, triggerWebhook };
