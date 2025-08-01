// v1.0.0 - Ashok - modified logId to auto numbers internal and integration logs
const internalLogController = require('../controllers/internalLogController.js');
// const integrationLogController = require('../controllers/integrationLogController');
const historyFeedsController = require('../controllers/feedsController.js');
// v1.0.0 <------------------------------------------------------------------
const InternalLog = require("../models/InternalLog.js");
const IntegrationLogs = require("../models/IntegrationLogs.js");
// v1.0.0 ------------------------------------------------------------------>


//Middelware for intergration Logging
exports.integrationLoggingMiddleware = async (req, res, next) => {
    // Skip logging for internal log routes
    if (req.originalUrl.includes('/integration-logs')) {
        return next();
    }

    const startTime = Date.now();

    // Create a flag on the response object
    res.locals.shouldLog = true;

    // v1.0.0 <---------------------------------------------------------------
    // Generate custom logId (INTG-00001, INTG-00002, ...)
    const lastLog = await IntegrationLogs.findOne({})
        .sort({ _id: -1 })
        .select('logId')
        .lean();

    let nextLogId = 'INTG-00001';
    if (lastLog?.logId) {
        const match = lastLog.logId.match(/INTG-(\d+)/);
        if (match) {
            const nextNumber = parseInt(match[1], 10) + 1;
            nextLogId = `INTG-${String(nextNumber).padStart(5, '0')}`;
        }
    }
    // v1.0.0 --------------------------------------------------------------->

    // Override res.json to ensure we only log once
    const originalJson = res.json;
    res.json = function (body) {
        if (res.locals.shouldLog) {
            res.locals.shouldLog = false; // Prevent further logging

            const responseData = res.locals.responseData || body;

            const logDetails = {
                // v1.0.0 <---------------------------------------------------------------
                logId: lastLog,
                // v1.0.0 --------------------------------------------------------------->
                tenantId: '',
                ownerId: '',
                status: responseData.status || (res.statusCode >= 400 ? 'error' : 'success'),
                code: res.statusCode.toString(),
                message: (res.statusCode >= 400 ? 'Error occurred' : 'Request succeeded'), //responseData.message ||
                serverName: 'InterviewSaaS-Server',
                severity: res.statusCode >= 500 ? 'high' : 'low',
                processName: 'Create Candidate',
                executionTime: `${Date.now() - startTime}ms`,
                requestHeaders: '',
                requestEndPoint: req.originalUrl,
                requestMethod: req.method,
                requestBody: req.body,
                responseDetails: '',
                responseStatusCode: res.statusCode.toString(),
                responseBody: JSON.stringify(responseData),
                ipAddress: '',
                correlationId: '',
                userAgent: '',
                comments: '',

            };

            // Create log asynchronously
            internalLogController.createLog(logDetails)
                // .then(log => console.log('Log created:', log.logId))
                // .catch(error => console.error('Error creating log:', error.message));
        }

        return originalJson.call(this, body);
    };

    next();
};
//Middelware for internal Logging
// exports.internalLoggingMiddleware = async (req, res, next) => {
//     // Skip logging for internal log routes
//     if (req.originalUrl.includes('/internal-logs')) {
//         return next();
//     }

//     const startTime = Date.now();

//     // Create a flag on the response object
//     res.locals.shouldLog = true;

//     // Override res.json to ensure we only log once
//     const originalJson = res.json;
//     res.json = function (body) {
//         if (res.locals.shouldLog) {
//             res.locals.shouldLog = false; // Prevent further logging

//             const responseData = res.locals.responseData || body;

//             const logDetails = {
// logId: `log_${Date.now()}`,
// status: responseData.status || (res.statusCode >= 400 ? 'error' : 'success'),
// code: res.statusCode.toString(),
// message: (res.statusCode >= 400 ? 'Error occurred' : 'Request succeeded'), //responseData.message ||
// serverName: 'InterviewSaaS-Server',
// severity: res.statusCode >= 500 ? 'high' : 'low',
// processName: res.locals.processName || 'Unknown Process',
// executionTime: `${Date.now() - startTime}ms`,
// requestEndPoint: req.originalUrl,
// requestMethod: req.method,
// requestBody: req.body,
// responseStatusCode: res.statusCode.toString(),
// responseError: responseData.status === 'error'
//     ? { message: responseData.message, stack: responseData.stack || null } // Developer-friendly error
//     : null,
// responseMessage: responseData.message,
// responseBody: JSON.stringify(responseData),
// ownerId: responseData.ownerId || req.body.ownerId || null,
// tenantId: responseData.tenantId || req.body.tenantId || null
//             };

//             // Create log asynchronously
//             internalLogController.createLog(logDetails)
//                 .then(log => console.log('Log created:', log.logId))
//                 .catch(error => console.error('Error creating log:', error.message));
//         }

//         return originalJson.call(this, body);
//     };

//     next();
// };

exports.internalLoggingMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const originalJson = res.json;

    // v1.0.0 <---------------------------------------------------------------
    // Generate custom logId (ILOG-00001, ILOG-00002, ...)
    const lastLog = await InternalLog.findOne({})
        .sort({ _id: -1 })
        .select('logId')
        .lean();

    let nextLogId = 'ILOG-00001';
    if (lastLog?.logId) {
        const match = lastLog.logId.match(/ILOG-(\d+)/);
        if (match) {
            const nextNumber = parseInt(match[1], 10) + 1;
            nextLogId = `ILOG-${String(nextNumber).padStart(5, '0')}`;
        }
    }
    // v1.0.0 --------------------------------------------------------------->
    res.json = function (body) {
        const logData = res.locals.logData;
        if (logData) {
            const logDetails = {
                ...logData,
                // v1.0.0 <---------------------------------------------------------------
                logId: nextLogId,
                // v1.0.0 --------------------------------------------------------------->
                executionTime: `${Date.now() - startTime}ms`,
                requestEndPoint: req.originalUrl,
                requestMethod: req.method,
                responseStatusCode: res.statusCode.toString(),

                code: res.statusCode.toString(),
                message: (res.statusCode >= 400 ? 'Error occurred' : 'Request succeeded'), //responseData.message ||
                serverName: 'InterviewSaaS-Server',
                severity: res.statusCode >= 500 ? 'high' : 'low',
                requestEndPoint: req.originalUrl,
                requestMethod: req.method,
                responseStatusCode: res.statusCode.toString(),
                responseError: res.statusCode >= 400
                    ? { message: body?.message || 'Error occurred', stack: body?.stack || null }
                    : null, // Error details for failures
                responseMessage: body?.message || null,
            };

            // Log details
            internalLogController.createLog(logDetails)
                // .then(() => console.log('Log created:', logDetails))
                // .catch((error) => console.error('Error creating log:', error.message));
        }

        return originalJson.call(this, body);
    };

    next();
};



//Middelware for Feeds Logging
// exports.FeedsMiddleware = async (req, res, next) => {
//     console.log(res.locals.responseData, "res.locals.responseData")
//     console.log('FeedsMiddleware called for path:', req.originalUrl);

//     // Skip logging for feeds routes to prevent infinite loops
//     // if (req.originalUrl.includes('/feeds')) {
//     //     return next();
//     // }

//     // Create a flag on the response object
//     // res.locals.shouldLog = true;


//     // Override res.json to ensure we only log once
//     const originalJson = res.json;
//     res.json = async function (body) {
//         const feedData = res.locals.feedData;
//         // if (!res.locals.shouldLog || res.headersSent) {
//         //     console.log('Skipping feed creation:', {
//         //         shouldLog: res.locals.shouldLog,
//         //         headersSent: res.headersSent
//         //     });
//         //     return originalJson.call(this, body);
//         // }

//         // res.locals.shouldLog = false; // Prevent further logging
//         // console.log('Response intercepted, loggedByController:', res.locals.loggedByController);

//         // Prepare feed data based on source
//         // const feedData1 = {
//         //     tenantId: res.locals.responseData?.tenantId || req.body?.tenantId,
//         //     feedType: res.locals.responseData?.feedType,
//         //     action: res.locals.responseData?.action,
//         //     ownerId: res.locals.responseData?.ownerId || req.body?.ownerId,
//         //     parentId: res.locals.responseData?.parentId,
//         //     parentObject: res.locals.responseData?.parentObject,
//         //     metadata: res.locals.responseData?.metadata || {},
//         //     message: res.locals.responseData?.message || 'Feed message not provided',
//         //     history: res.locals.responseData?.history || []
//         // };
//         // console.log('Attempting to create feed with data:', feedData);



//         try {
//             const log = await historyFeedsController.createFeed(feedData);
//             console.log('Feed created successfully with ID:', log._id);
//             console.log('Feed data saved:', log);
//         } catch (error) {
//             console.error('Error creating feed:', error);
//             console.error('Error details:', {
//                 message: error.message,
//                 stack: error.stack
//             });
//         }

//         return originalJson.call(this, body);
//     };


//     next();
// };

exports.FeedsMiddleware = async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function (body) {
        const feedData = res.locals.feedData;
        if (feedData) {
            try {
                const feedLog = await historyFeedsController.createFeed(feedData);
            } catch (error) {
                console.error('Error creating feed:', error.message);
            }
        }

        return originalJson.call(this, body);
    };

    next();
};
