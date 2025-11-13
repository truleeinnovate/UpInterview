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
    console.log(`[Webhook] Triggering ${eventType}`);
    try {
        // Find all active integrations that are subscribed to this event
        const integrations = await Integration.find({
            enabled: true,
            events: eventType
        });

        console.log(`[Webhook] Found ${integrations.length} integrations for event ${eventType}`);

        if (integrations.length === 0) {
            console.log('[Webhook] No active integrations found for this event type');
            return;
        }

        // Process each integration in parallel
        await Promise.all(
            integrations.map(async (integration) => {
                try {
                    const payload = {
                        event: eventType,
                        data,
                        timestamp: new Date().toISOString()
                    };

                    const config = {
                        headers: {}
                    };

                    // Add authentication based on integration settings
                    if (integration.authentication) {
                        switch (integration.authentication.type) {
                            case 'bearer_token':
                                config.headers.Authorization = `Bearer ${integration.authentication.bearerToken}`;
                                break;
                            case 'api_key':
                                config.headers[integration.authentication.apiKey.headerName] = integration.authentication.apiKey.keyValue;
                                break;
                            case 'basic_auth':
                                const authString = Buffer.from(
                                    `${integration.authentication.basicAuth.username}:${integration.authentication.basicAuth.password}`
                                ).toString('base64');
                                config.headers.Authorization = `Basic ${authString}`;
                                break;
                            case 'hmac_signature':
                                if (integration.authentication.hmacSecret) {
                                    const hmac = crypto.createHmac('sha256', integration.authentication.hmacSecret);
                                    const signature = hmac.update(JSON.stringify(payload)).digest('hex');
                                    config.headers['X-Hub-Signature-256'] = `sha256=${signature}`;
                                }
                                break;
                        }
                    }

                    // Add custom headers if any
                    if (integration.headers) {
                        Object.assign(config.headers, integration.headers);
                    }

                    await axios.post(integration.webhookUrl, payload, config);

                    // Log successful webhook delivery
                    console.log(`Webhook ${eventType} sent to ${integration.webhookUrl}`);

                } catch (error) {
                    console.error(`Error sending webhook to ${integration.webhookUrl}:`, error.message);
                    // You might want to implement retry logic here
                }
            })
        );
    } catch (error) {
        console.error('Error in triggerWebhook:', error);
    }
};

module.exports = { EVENT_TYPES, triggerWebhook };