const axios = require("axios");
const crypto = require("crypto");
const Integration = require("../models/Integration");

// Define available event types
const EVENT_TYPES = {
    CANDIDATE_CREATED: 'candidate.created',
    CANDIDATE_UPDATED: 'candidate.updated',
    POSITION_CREATED: 'position.created',
    POSITION_UPDATED: 'position.updated'
};

const triggerWebhook = async (eventType, data, tenantId) => {
    console.log(`[Webhook] Triggering ${eventType}${tenantId ? ` for tenant ${tenantId}` : ''}`);
    try {
        // Build the query with tenantId only if it's provided
        const query = {
            enabled: true,
            events: eventType
        };
        
        // Only add tenantId to the query if it's provided
        if (tenantId) {
            query.tenantId = tenantId;
        }

        const integrations = await Integration.find(query);

        console.log(`[Webhook] Found ${integrations.length} integrations for event ${eventType}`);

        if (integrations.length === 0) {
            console.log('[Webhook] No active integrations found for this event type');
            return;
        }

        // Process each integration with timeout
        await Promise.all(
            integrations.map(async (integration) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                try {
                    const payload = {
                        event: eventType,
                        data,
                        timestamp: new Date().toISOString()
                    };

                    const config = {
                        headers: {},
                        signal: controller.signal,
                        timeout: 10000 // 10 second timeout
                    };

                    // ... rest of the config setup ...

                    const response = await axios.post(integration.webhookUrl, payload, config);
                    console.log(`Webhook ${eventType} sent to ${integration.webhookUrl}`, {
                        status: response.status,
                        statusText: response.statusText
                    });

                } catch (error) {
                    if (error.name === 'AbortError') {
                        console.error(`Webhook timeout for ${integration.webhookUrl}`);
                    } else {
                        console.error(`Error sending webhook to ${integration.webhookUrl}:`, {
                            message: error.message,
                            code: error.code,
                            config: {
                                url: error.config?.url,
                                method: error.config?.method,
                                headers: error.config?.headers
                            },
                            response: {
                                status: error.response?.status,
                                data: error.response?.data
                            }
                        });
                    }
                } finally {
                    clearTimeout(timeoutId);
                }
            })
        );
    } catch (error) {
        console.error('Error in triggerWebhook:', {
            message: error.message,
            stack: error.stack,
            eventType,
            tenantId
        });
    }
};

module.exports = { EVENT_TYPES, triggerWebhook };