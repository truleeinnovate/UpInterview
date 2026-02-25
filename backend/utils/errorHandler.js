/**
 * Common Error Handler Utility
 * 
 * Use this in any controller's catch block to return a consistent,
 * user-friendly error message to the frontend while logging full
 * error details on the server.
 *
 * Usage:
 *   const { handleApiError } = require("../utils/errorHandler");
 *   
 *   catch (error) {
 *     return handleApiError(res, error, "Create Topup Order");
 *   }
 */

const GENERIC_ERROR_MESSAGE =
    "Something went wrong. Please refresh the screen or contact customer support.";

/**
 * Handles API errors consistently across all controllers.
 *
 * @param {Object}  res      - Express response object
 * @param {Error}   error    - The caught error
 * @param {string}  context  - A short label describing the operation (used in logs)
 * @param {number}  [statusCode=500] - HTTP status code to return (default 500)
 * @returns {Object} Express response
 */
const handleApiError = (res, error, context = "API", statusCode = 500) => {
    // 1. Log full error details on the server for debugging
    console.error(`[${context}] Error:`, error?.message || error);
    if (error?.stack) {
        console.error(`[${context}] Stack:`, error.stack);
    }

    // 2. Populate res.locals.logData for centralised logging (if not already set)
    if (!res.locals.logData) {
        res.locals.logData = {
            processName: context,
            status: "error",
            message: error?.message || "Unknown error",
        };
    }

    // 3. Return generic message to the frontend
    return res.status(statusCode).json({
        message: GENERIC_ERROR_MESSAGE,
        status: false,
    });
};

module.exports = { handleApiError, GENERIC_ERROR_MESSAGE };
