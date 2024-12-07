const IntegrationLog = require('../models/IntegrationLogs');

const saveIntegrationLogs = async (endpoint, requestBody, responseStatus, responseBody, message = '') => {
    try {
        // Remove the 'skills' field from responseBody if it exists
        const { skills, ...filteredResponseBody } = responseBody || {};

        const log = new IntegrationLog({
            endpoint,
            requestBody,
            responseStatus,
            responseBody: filteredResponseBody,
            message
        });
        await log.save();
    } catch (logError) {
        console.error('Error saving integration log:', logError);
    }
};

module.exports = saveIntegrationLogs;