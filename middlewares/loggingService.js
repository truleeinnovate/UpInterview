const internalLogController = require('../controllers/internalLogController');
// const integrationLogController = require('../controllers/integrationLogController');
const historyFeedsController = require('../controllers/feedsController');


//Middelware for intergration Logging
exports.integrationLoggingMiddleware = async (req, res, next) => {
    // Skip logging for internal log routes
    if (req.originalUrl.includes('/integration-logs')) {
        return next();
    }

    const startTime = Date.now();

    // Create a flag on the response object
    res.locals.shouldLog = true;

    // Override res.json to ensure we only log once
    const originalJson = res.json;
    res.json = function (body) {
        if (res.locals.shouldLog) {
            res.locals.shouldLog = false; // Prevent further logging

            const responseData = res.locals.responseData || body;

            const logDetails = {
                logId: `log_${Date.now()}`,
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
            integrationLogController.createIntegrationLog(logDetails)
                .then(log => console.log('Log created:', log.logId))
                .catch(error => console.error('Error creating log:', error.message));
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

    res.json = function (body) {
        const logData = res.locals.logData;
        if (logData) {
            const logDetails = {
                ...logData,
                logId: `log_${Date.now()}`,
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
                .then(() => console.log('Log created:', logDetails))
                .catch((error) => console.error('Error creating log:', error.message));
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
                console.log('Feed created successfully:', feedLog);
            } catch (error) {
                console.error('Error creating feed:', error.message);
            }
        }

        return originalJson.call(this, body);
    };

    next();
};
