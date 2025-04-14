const mongoose = require('mongoose');

const internalLogSchema = new mongoose.Schema({
    timeStamp: { type: Date, default: Date.now }, // Log creation timestamp
    logId: { type: String, required: true },      // Unique identifier for the log
    status: {
        type: String, 
        enum: ['success', 'error', 'warning'], 
        required: true 
    }, // Log status (generic for success, error, warning)
    code: { type: String, required: false },     // Generic code for success or error
    message: { type: String, required: false },  // Generic message for success or error
    serverName: { type: String },                // Name of the server where the process ran
    severity: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'low' 
    }, // Severity level
    processName: { type: String, required: true },// Name of the process or service
    executionTime: { type: String },             // Time taken for the execution
    requestEndPoint: { type: String },           // API endpoint or resource accessed
    requestMethod: { 
        type: String, 
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
        required: true 
    }, // HTTP Method
    requestBody: { type: mongoose.Schema.Types.Mixed, default: null }, // Captures the raw request payload
    responseStatusCode: { type: String },// Response code  returned
    responseError:{type: String},        
    responseMessage:{type: String},
    responseBody:{type: mongoose.Schema.Types.Mixed, default: null},
    ownerId:{type: String},
    tenantId:{type: String},
    // responseDetails: { type: String },        // Additional details about the response
    // comments: { type: String, default: null },    // Optional comments for additional context
    // createdBy:{type: String},
    // modifiedBy:{type: String}
}, 
{ timestamps: true }); // Automatically adds `createdAt` and `updatedAt` fields
 
module.exports = mongoose.model('InternalLog', internalLogSchema);
