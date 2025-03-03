const mongoose = require('mongoose');
 
const IntegrationLogsSchema = new mongoose.Schema({
    timeStamp: { type: Date, default: Date.now }, // Log creation timestamp
    logId: { type: String, required: true },      // Unique identifier for the log
    tenantId: { type: String },                  // Reference to tenant
    ownerId: { type: String, required: true },   // Owner of the log
    status: { 
        type: String, 
        enum: ['success', 'error', 'warning'], 
        required: true 
    }, // Log status (generic for success, error, warning)
    code: { type: String },                      // Generic code for success or error
    message: { type: String },                   // Generic message for success or error
    serverName: { type: String },                // Name of the server where the process ran
    severity: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: null 
    }, // Severity level
    processName: { type: String, required: true }, // Name of the process or service
    executionTime: { type: String },             // Time taken for the execution
    requestEndPoint: { type: String },           // API endpoint or resource accessed
    requestMethod: { 
        type: String, 
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
        required: true 
    }, // HTTP Method
    requestBody: { type: mongoose.Schema.Types.Mixed, default: null }, // Captures the raw request payload
    requestHeaders: { type: mongoose.Schema.Types.Mixed, default: null }, // Optional request headers
    responseStatusCode: { type: Number },        // Response code returned
    responseDetails: { type: String },           // Additional details about the response
    responseBody: { type: mongoose.Schema.Types.Mixed, default: null }, // Captures the raw response
    ipAddress: { type: String },                // Source IP address
    correlationId: { type: String },            // Correlation ID for distributed tracing
    userAgent: { type: String },                // User-Agent for request context
    comments: { type: String, default: null }   // Optional comments for additional context
}, { timestamps: true });
 
module.exports = mongoose.model('IntegrationLogs', IntegrationLogsSchema);




// const integrationLogsSchema = new mongoose.Schema({
//     logId: { type: String, required: true },      // Unique identifier for the log
//     status: { 
//         type: String, 
//         enum: ['success', 'error', 'warning'], 
//         required: true 
//     }, // Log status (generic for success, error, warning)
//     errorCode: { type: String, required: false },     // Generic code for success or error
//     message: { type: String, required: false },  // Generic message for success or error
//     serverName: { type: String },                // Name of the server where the process ran
//     severity: { 
//         type: String, 
//         enum: ['low', 'medium', 'high'], 
//         default: 'low' 
//     }, // Severity level
//     processName: { type: String, required: true },// Name of the process or service
//     duration: { type: String },             // Time taken for the execution
//     requestEndPoint: { type: String },           // API endpoint or resource accessed
//     requestMethod: { 
//         type: String, 
//         enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
//         required: true 
//     }, // HTTP Method
//     requestBody: { type: mongoose.Schema.Types.Mixed, default: null }, // Captures the raw request payload
//     responseStatusCode: { type: String },        // Response code returned
//     responseError: { type: String },           // Additional details about the response
//     responseMessage: { type: String, default: null },    // Optional comments for additional context
//     integrationName: { type: String },
//     flowType: { type: String },
//     dateTime: { type: Date, default: Date.now},
//     responseBody: { type: mongoose.Schema.Types.Mixed, default: null },
    
// }, { timestamps: true });

// module.exports = mongoose.model('IntegrationLogs', integrationLogsSchema);
