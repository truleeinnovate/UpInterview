const { Candidate } = require("../models/candidate.js");
const { Position } = require("../models/Position/position.js");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const ApiKey = require("../models/ApiKey.js");

const getTenantAndUserFromApiKey = async (req) => {
  try {
    // Get API key from Authorization header (Bearer token) or x-api-key header
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'];
    
    let apiKey = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    }
    
    if (!apiKey) {
      return { error: "Missing API key in headers" };
    }
    
    // Find the API key in database
    const apiKeyDoc = await ApiKey.findOne({ 
      key: apiKey, 
      enabled: true 
    });
    
    if (!apiKeyDoc) {
      return { error: "Invalid or disabled API key" };
    }
    
    // Update last used and usage count
    apiKeyDoc.lastUsed = new Date();
    apiKeyDoc.usageCount += 1;
    await apiKeyDoc.save();
    
    console.log(`[API_KEY] Valid API key used: ${apiKeyDoc.key.substring(0, 8)}... for tenant: ${apiKeyDoc.tenantId}`);
    
    return {
      tenantId: apiKeyDoc.tenantId,
      userId: apiKeyDoc.ownerId,
      apiKey: apiKeyDoc
    };
  } catch (error) {
    console.error("[API_KEY] Error validating API key:", error);
    return { error: "Error validating API key" };
  }
};

// Helper function to check API key permissions
const checkApiKeyPermission = (apiKey, requiredPermission) => {
  if (!apiKey || !apiKey.permissions || !Array.isArray(apiKey.permissions)) {
    return false;
  }
  return apiKey.permissions.includes(requiredPermission);
};

// const getTenantAndUserFromCookies = (req) => {
//   return {
//     tenantId: req.cookies?.tenantId,
//     userId: req.cookies?.userId,
//   };
// };

/**
 * Create a single candidate via external API
 */
exports.createCandidate = async (req, res) => {
  try {
    // Use API key validation instead of cookies
    const authResult = await getTenantAndUserFromApiKey(req);
    
    if (authResult.error) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Create Candidate",
        requestBody: req.body,
        message: authResult.error,
        status: "error",
        integrationName: "external-api",
        flowType: "create-candidate",
      };
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }
    
    const { tenantId, userId, apiKey } = authResult;
    console.log('tenantId, userId:', tenantId, userId)
    
    // Check if the API key has candidates:write permission
    if (!checkApiKeyPermission(apiKey, 'candidates:write')) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: userId,
        processName: "External Create Candidate",
        requestBody: req.body,
        message: "Insufficient permissions. Required: candidates:write",
        status: "error",
        integrationName: "external-api",
        flowType: "create-candidate",
      };
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions. Required: candidates:write",
        code: 403,
        availablePermissions: apiKey.permissions
      });
    }

    const candidateData = {
      ...req.body,
      tenantId: tenantId,
      createdBy: userId,
      ownerId: userId,
      // Ensure externalId is preserved if provided
      ...(req.body.externalId && { externalId: req.body.externalId }),
    };

    const candidate = await Candidate.create(candidateData);

    console.log(`[EXTERNAL_API] Candidate created via API: ${candidate._id} for tenant: ${tenantId}`);

    // Generate logs for success
    const responseData = {
      id: candidate._id,
      FirstName: candidate.FirstName,
      LastName: candidate.LastName,
      Email: candidate.Email,
      Phone: candidate.Phone,
      CountryCode: candidate.CountryCode,
      Date_Of_Birth: candidate.Date_Of_Birth,
      Gender: candidate.Gender,
      HigherQualification: candidate.HigherQualification,
      UniversityCollege: candidate.UniversityCollege,
      CurrentExperience: candidate.CurrentExperience,
      RelevantExperience: candidate.RelevantExperience,
      CurrentRole: candidate.CurrentRole,
      skills: candidate.skills,
      // resume: candidate.resume,
      externalId: candidate.externalId,
      tenantId: candidate.tenantId,
      ownerId: candidate.ownerId,
      createdBy: candidate.createdBy,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };

    res.locals.logData = {
      ownerId: userId,
      processName: "External Create Candidate",
      requestBody: req.body,
      message: "Candidate created successfully via external API",
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "create-candidate",
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("External candidate creation error:", error);

    // 1. Validation Errors (400) - Missing required fields, invalid data formats
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));

      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid candidate data - required fields missing or invalid",
        code: 400,
        details: errors,
        suggestion: "Please check all required fields and data formats"
      });
    }

    // 2. Duplicate Entry Errors (409) - Email, phone, or other unique field conflicts
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const duplicateValue = error.keyValue[duplicateField];
      
      return res.status(409).json({
        success: false,
        error: "Duplicate Entry",
        message: `A candidate with this ${duplicateField} already exists`,
        code: 409,
        field: duplicateField,
        value: duplicateValue,
        suggestion: `Use a different ${duplicateField} or update existing candidate`
      });
    }

    // 3. Cast Errors (400) - Invalid data type conversion
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Data Type Error",
        message: `Invalid data type for field ${error.path}: expected ${error.kind}`,
        code: 400,
        field: error.path,
        value: error.value,
        expectedType: error.kind,
        suggestion: "Ensure all fields have correct data types"
      });
    }

    // 4. JSON Syntax Errors (400) - Malformed request body
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: "JSON Syntax Error",
        message: "Invalid JSON format in request body",
        code: 400,
        suggestion: "Please check JSON syntax and structure"
      });
    }

    // 5. Database Connection Errors (503) - MongoDB unavailable
    if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
      return res.status(503).json({
        success: false,
        error: "Database Unavailable",
        message: "Unable to connect to database",
        code: 503,
        suggestion: "Please try again later or contact support"
      });
    }

    // 6. Authentication/Authorization Errors (401/403) - API key issues
    if (error.message && error.message.includes("API key")) {
      const statusCode = error.message.includes("Invalid") ? 401 : 403;
      return res.status(statusCode).json({
        success: false,
        error: statusCode === 401 ? "Authentication Failed" : "Authorization Failed",
        message: error.message,
        code: statusCode,
        suggestion: "Check your API key and permissions"
      });
    }

    // 7. Rate Limiting Errors (429) - Too many requests
    if (error.name === "RateLimitError") {
      return res.status(429).json({
        success: false,
        error: "Rate Limit Exceeded",
        message: "Too many requests - please wait before trying again",
        code: 429,
        retryAfter: error.retryAfter || 60,
        suggestion: "Reduce request frequency or upgrade your plan"
      });
    }

    // 8. File/Document Size Errors (413) - Request too large
    if (error.name === "PayloadTooLargeError") {
      return res.status(413).json({
        success: false,
        error: "Request Too Large",
        message: "Request body exceeds maximum allowed size",
        code: 413,
        maxSize: error.limit,
        suggestion: "Reduce the size of your request data"
      });
    }

    // 9. Required Field Missing (400) - Specific check for essential fields
    const requiredFields = ['FirstName', 'LastName', 'Email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Required Fields Missing",
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 400,
        missingFields: missingFields,
        suggestion: "Please provide all required fields"
      });
    }

    // 10. Email Format Validation (400) - Invalid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.Email && !emailRegex.test(req.body.Email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Email Format",
        message: "Email address is not in a valid format",
        code: 400,
        field: "Email",
        value: req.body.Email,
        suggestion: "Please provide a valid email address (e.g., user@example.com)"
      });
    }

    // 11. Phone Number Validation (400) - Invalid phone format
    if (req.body.Phone && !/^\d{10,15}$/.test(req.body.Phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        error: "Invalid Phone Number",
        message: "Phone number must be 10-15 digits",
        code: 400,
        field: "Phone",
        value: req.body.Phone,
        suggestion: "Please provide a valid phone number (10-15 digits)"
      });
    }

    // 12. Generic Server Error (500) - Catch-all for unexpected errors
    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "External Create Candidate",
      requestBody: req.body,
      message: "Internal server error while creating candidate",
      status: "error",
      integrationName: "external-api",
      flowType: "create-candidate",
    };

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while creating candidate",
      code: 500,
      suggestion: "Please try again or contact support if the problem persists",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Bulk create candidates via external API
 */
exports.bulkCreateCandidates = async (req, res) => {
  try {
    // Validate input array
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Candidates",
        requestBody: req.body,
        message: "Please provide a valid JSON array of candidates",
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-candidates",
      };
      return res.status(400).json({
        success: false,
        error: "Invalid Input",
        message: "Please provide a valid JSON array of candidates",
        code: 400,
        suggestion: "Ensure request body is an array with at least one candidate"
      });
    }

    // Check if candidates array is too large
    if (req.body.length > 50) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Candidates",
        requestBody: req.body,
        message: "Maximum 50 candidates allowed per bulk request",
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-candidates",
      };
      return res.status(413).json({
        success: false,
        error: "Request Too Large",
        message: "Maximum 50 candidates allowed per bulk request",
        code: 413,
        requestedCount: req.body.length,
        maxAllowed: 50,
        suggestion: "Split your request into smaller batches"
      });
    }

    // Get tenant and user info from API key (not cookies for external API)
    const authResult = await getTenantAndUserFromApiKey(req);
    
    if (authResult.error) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Candidates",
        requestBody: req.body,
        message: authResult.error,
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-candidates",
      };
      return res.status(401).json({
        success: false,
        error: "Authentication Required",
        message: authResult.error,
        code: 401,
        suggestion: "Ensure valid API key is provided in headers"
      });
    }

    const { tenantId, userId } = authResult;

    // Validate each candidate has required fields
    const requiredFields = ['FirstName', 'LastName', 'Email'];
    const validationErrors = [];
    
    req.body.forEach((candidate, index) => {
      const missingFields = requiredFields.filter(field => !candidate[field]);
      if (missingFields.length > 0) {
        validationErrors.push({
          index: index,
          missingFields: missingFields,
          email: candidate.Email || 'N/A'
        });
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Some candidates have missing required fields",
        code: 400,
        details: validationErrors,
        suggestion: "Ensure all candidates have FirstName, LastName, and Email"
      });
    }

    const candidates = req.body.map((candidate) => ({
      ...candidate,
      tenantId: tenantId,
      createdBy: userId,
      ownerId: userId,
      // Ensure externalId is preserved if provided
      ...(candidate.externalId && { externalId: candidate.externalId }),
    }));

    const result = await Candidate.insertMany(candidates, { ordered: false });

    // Generate logs for success
    const responseData = result.map(candidate => ({
      id: candidate._id,
      FirstName: candidate.FirstName,
      LastName: candidate.LastName,
      Email: candidate.Email,
      Phone: candidate.Phone,
      CountryCode: candidate.CountryCode,
      Date_Of_Birth: candidate.Date_Of_Birth,
      Gender: candidate.Gender,
      HigherQualification: candidate.HigherQualification,
      UniversityCollege: candidate.UniversityCollege,
      CurrentExperience: candidate.CurrentExperience,
      RelevantExperience: candidate.RelevantExperience,
      CurrentRole: candidate.CurrentRole,
      skills: candidate.skills,
      // resume: candidate.resume,
      externalId: candidate.externalId,
      tenantId: candidate.tenantId,
      ownerId: candidate.ownerId,
      createdBy: candidate.createdBy,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    }));

    res.locals.logData = {
      ownerId: userId,
      processName: "External Bulk Create Candidates",
      requestBody: { count: req.body.length },
      message: `Successfully created ${result.length} candidates via external API`,
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "bulk-create-candidates",
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Bulk candidate creation error:", error);

    // 1. Duplicate Entry Errors (207) - Some candidates already exist
    if (error.code === 11000) {
      const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;
      const createdCount = error.result ? error.result.nInserted : 0;
      
      return res.status(207).json({
        success: true,
        message: "Partial success - some candidates already exist",
        code: 207,
        data: {
          created: createdCount,
          duplicates: duplicateCount,
          total: req.body.length,
          tenantId: req.body.tenantId,
          createdAt: new Date(),
        },
        warnings: ["Some duplicate entries were skipped"],
        suggestion: "Check duplicate candidates and update existing ones if needed"
      });
    }

    // 2. Validation Errors (400) - Invalid data in candidates
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));

      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid candidate data in bulk request",
        code: 400,
        details: errors,
        suggestion: "Please check all candidate data formats and required fields"
      });
    }

    // 3. Cast Errors (400) - Invalid data types
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Data Type Error",
        message: `Invalid data type for field ${error.path}: expected ${error.kind}`,
        code: 400,
        field: error.path,
        value: error.value,
        expectedType: error.kind,
        suggestion: "Ensure all fields have correct data types"
      });
    }

    // 4. JSON Syntax Errors (400) - Malformed request body
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: "JSON Syntax Error",
        message: "Invalid JSON format in request body",
        code: 400,
        suggestion: "Please check JSON syntax and structure"
      });
    }

    // 5. Database Connection Errors (503) - MongoDB unavailable
    if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
      return res.status(503).json({
        success: false,
        error: "Database Unavailable",
        message: "Unable to connect to database",
        code: 503,
        suggestion: "Please try again later or contact support"
      });
    }

    // 6. Request Too Large Errors (413) - Payload exceeds limit
    if (error.name === "PayloadTooLargeError") {
      return res.status(413).json({
        success: false,
        error: "Request Too Large",
        message: "Request body exceeds maximum allowed size",
        code: 413,
        maxSize: error.limit,
        suggestion: "Reduce the size of your request data"
      });
    }

    // 7. Generic Server Error (500) - Catch-all for unexpected errors
    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "External Bulk Create Candidates",
      requestBody: { count: req.body?.length },
      message: "Internal server error while creating bulk candidates",
      status: "error",
      integrationName: "external-api",
      flowType: "bulk-create-candidates",
    };

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while creating bulk candidates",
      code: 500,
      suggestion: "Please try again or contact support if the problem persists",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Bulk create positions via external API
 */
exports.bulkCreatePositions = async (req, res) => {
  try {
    // Validate input array
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Positions",
        requestBody: req.body,
        message: "Please provide a valid JSON array of positions",
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-positions",
      };
      return res.status(400).json({
        success: false,
        error: "Invalid Input",
        message: "Please provide a valid JSON array of positions",
        code: 400,
        suggestion: "Ensure request body is an array with at least one position"
      });
    }

    // Check if positions array is too large
    if (req.body.length > 50) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Positions",
        requestBody: req.body,
        message: "Maximum 50 positions allowed per bulk request",
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-positions",
      };
      return res.status(413).json({
        success: false,
        error: "Request Too Large",
        message: "Maximum 50 positions allowed per bulk request",
        code: 413,
        requestedCount: req.body.length,
        maxAllowed: 50,
        suggestion: "Split your request into smaller batches"
      });
    }

    // Validate each position has required fields
    const requiredFields = ['title', 'companyName', 'location'];
    const validationErrors = [];
    
    req.body.forEach((position, index) => {
      const missingFields = requiredFields.filter(field => !position[field]);
      if (missingFields.length > 0) {
        validationErrors.push({
          index: index,
          missingFields: missingFields,
          title: position.title || 'N/A'
        });
      }
    });

    if (validationErrors.length > 0) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Bulk Create Positions",
        requestBody: req.body,
        message: "Some positions have missing required fields",
        status: "error",
        integrationName: "external-api",
        flowType: "bulk-create-positions",
      };
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Some positions have missing required fields",
        code: 400,
        details: validationErrors,
        suggestion: "Ensure all positions have title, companyName, and location"
      });
    }

    const positions = req.body.map((position) => ({
      ...position,
      tenantId: req.tenantId || "external_tenant",
      createdBy: req.user?._id || "external_api",
      status: position.status || "open",
      // Ensure externalId is preserved if provided
      ...(position.externalId && { externalId: position.externalId }),
    }));

    const result = await Position.insertMany(positions, { ordered: false });

    // Generate logs for success
    const responseData = result.map(position => ({
      id: position._id,
      title: position.title,
      companyname: position.companyname,
      jobDescription: position.jobDescription,
      minexperience: position.minexperience,
      maxexperience: position.maxexperience,
      Location: position.Location,
      skills: position.skills,
      externalId: position.externalId,
      tenantId: position.tenantId,
      ownerId: position.ownerId,
      createdBy: position.createdBy,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    }));

    res.locals.logData = {
      ownerId: req.user?._id || "external_api",
      processName: "External Bulk Create Positions",
      requestBody: { count: req.body.length },
      message: `Successfully created ${result.length} positions via external API`,
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "bulk-create-positions",
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Bulk position creation error:", error);

    // 1. Duplicate Entry Errors (207) - Some positions already exist
    if (error.code === 11000) {
      const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;
      const createdCount = error.result ? error.result.nInserted : 0;

      return res.status(207).json({
        success: true,
        message: "Partial success - some positions already exist",
        code: 207,
        data: {
          created: createdCount,
          duplicates: duplicateCount,
          total: req.body.length,
          tenantId: req.tenantId || "external_tenant",
          createdAt: new Date(),
        },
        warnings: ["Some duplicate entries were skipped"],
        suggestion: "Check duplicate positions and update existing ones if needed"
      });
    }

    // 2. Validation Errors (400) - Invalid data in positions
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));

      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid position data in bulk request",
        code: 400,
        details: errors,
        suggestion: "Please check all position data formats and required fields"
      });
    }

    // 3. Cast Errors (400) - Invalid data types
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Data Type Error",
        message: `Invalid data type for field ${error.path}: expected ${error.kind}`,
        code: 400,
        field: error.path,
        value: error.value,
        expectedType: error.kind,
        suggestion: "Ensure all fields have correct data types"
      });
    }

    // 4. JSON Syntax Errors (400) - Malformed request body
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: "JSON Syntax Error",
        message: "Invalid JSON format in request body",
        code: 400,
        suggestion: "Please check JSON syntax and structure"
      });
    }

    // 5. Database Connection Errors (503) - MongoDB unavailable
    if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
      return res.status(503).json({
        success: false,
        error: "Database Unavailable",
        message: "Unable to connect to database",
        code: 503,
        suggestion: "Please try again later or contact support"
      });
    }

    // 6. Request Too Large Errors (413) - Payload exceeds limit
    if (error.name === "PayloadTooLargeError") {
      return res.status(413).json({
        success: false,
        error: "Request Too Large",
        message: "Request body exceeds maximum allowed size",
        code: 413,
        maxSize: error.limit,
        suggestion: "Reduce the size of your request data"
      });
    }

    // 7. Generic Server Error (500) - Catch-all for unexpected errors
    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "External Bulk Create Positions",
      requestBody: { count: req.body?.length },
      message: "Internal server error while creating bulk positions",
      status: "error",
      integrationName: "external-api",
      flowType: "bulk-create-positions",
    };

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while creating bulk positions",
      code: 500,
      suggestion: "Please try again or contact support if the problem persists",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create a single position via external API
 */
exports.createPosition = async (req, res) => {
  try {
    // Use API key validation instead of cookies
    const authResult = await getTenantAndUserFromApiKey(req);
    
    if (authResult.error) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: "system",
        processName: "External Create Position",
        requestBody: req.body,
        message: authResult.error,
        status: "error",
        integrationName: "external-api",
        flowType: "create-position",
      };
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }
    
    const { tenantId, userId, apiKey } = authResult;
    
    // Check if the API key has positions:write permission
    if (!checkApiKeyPermission(apiKey, 'positions:write')) {
      // Generate logs for the error
      res.locals.logData = {
        ownerId: userId,
        processName: "External Create Position",
        requestBody: req.body,
        message: "Insufficient permissions. Required: positions:write",
        status: "error",
        integrationName: "external-api",
        flowType: "create-position",
      };
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions. Required: positions:write",
        availablePermissions: apiKey.permissions
      });
    }

    const positionData = {
      ...req.body,
      tenantId: tenantId,
      ownerId: userId,
      createdBy: userId,
      // Ensure externalId is preserved if provided
      ...(req.body.externalId && { externalId: req.body.externalId }),
    };

    const position = await Position.create(positionData);

    console.log(`[EXTERNAL_API] Position created via API: ${position._id} for tenant: ${tenantId}`);

    // Generate logs for success
    const responseData = {
      id: position._id,
      title: position.title,
      companyname: position.companyname,
      jobDescription: position.jobDescription,
      minexperience: position.minexperience,
      maxexperience: position.maxexperience,
      Location: position.Location,
      skills: position.skills,
      externalId: position.externalId,
      tenantId: position.tenantId,
      ownerId: position.ownerId,
      createdBy: position.createdBy,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt,
    };

    res.locals.logData = {
      ownerId: userId,
      processName: "External Create Position",
      requestBody: req.body,
      message: "Position created successfully via external API",
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "create-position",
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("External position creation error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid position data",
        code: 400,
        details: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate Entry",
        message: "A position with this title already exists",
        code: 409,
        field: "title",
      });
    }

    // Generate logs for the error
    res.locals.logData = {
      ownerId: "system",
      processName: "External Create Position",
      requestBody: req.body,
      message: "Internal server error while creating position",
      status: "error",
      integrationName: "external-api",
      flowType: "create-position",
    };

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create position",
      code: 500,
    });
  }
};

/**
 * Fetch candidates by email, upId, or externalId
 */
exports.getCandidates = async (req, res) => {
  try {
    const { email, upId, externalId } = req.query;
    
    // Validate that at least one query parameter is provided
    if (!email && !upId && !externalId) {
      // Generate error log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Candidates",
        requestQuery: req.query,
        message: "Missing query parameters - at least one of email, upId, or externalId must be provided",
        status: "error",
        integrationName: "external-api",
        flowType: "get-candidates",
      };
      return res.status(400).json({
        success: false,
        error: "Missing Query Parameters",
        message: "At least one of email, upId, or externalId must be provided",
        code: 400,
        suggestion: "Provide email, upId, or externalId as query parameter"
      });
    }

    // Build query object
    const query = {};
    
    if (email) {
      query.Email = email;
    }
    if (upId) {
      query._id = upId;
    }
    if (externalId) {
      query.externalId = externalId;
    }

    // Find candidates
    const candidates = await Candidate.find(query)
      .select('-__v -password') // Exclude sensitive fields
      .lean(); // Return plain JavaScript objects

    if (candidates.length === 0) {
      // Generate not found log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Candidates",
        requestQuery: req.query,
        message: "No candidates found matching the provided criteria",
        status: "error",
        integrationName: "external-api",
        flowType: "get-candidates",
      };
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "No candidates found matching the provided criteria",
        code: 404,
        query: req.query
      });
    }

    // Generate response
    const responseData = {
      success: true,
      message: "Candidates retrieved successfully",
      code: 200,
      data: {
        candidates: candidates,
        count: candidates.length,
        query: req.query,
        retrievedAt: new Date().toISOString(),
      },
    };

    // Generate success log
    res.locals.logData = {
      ownerId: "system",
      processName: "External Get Candidates",
      requestQuery: req.query,
      message: `Successfully retrieved ${candidates.length} candidates via external API`,
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "get-candidates",
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("External get candidates error:", error);

    // Handle different error types
    if (error.name === "CastError") {
      // Generate cast error log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Candidates",
        requestQuery: req.query,
        message: `Invalid ID format provided: ${error.message}`,
        status: "error",
        integrationName: "external-api",
        flowType: "get-candidates",
      };
      return res.status(400).json({
        success: false,
        error: "Invalid ID Format",
        message: "Invalid upId format provided",
        code: 400,
        field: error.path,
        value: error.value,
        suggestion: "Provide a valid MongoDB ObjectId for upId"
      });
    }

    // Generate general error log
    res.locals.logData = {
      ownerId: "system",
      processName: "External Get Candidates",
      requestQuery: req.query,
      message: "Internal server error while fetching candidates",
      status: "error",
      integrationName: "external-api",
      flowType: "get-candidates",
    };

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while fetching candidates",
      code: 500,
      suggestion: "Please try again or contact support if the problem persists",
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Fetch positions by upId or externalId
 */
exports.getPositions = async (req, res) => {
  try {
    const { upId, externalId } = req.query;
    
    // Validate that at least one query parameter is provided
    if (!upId && !externalId) {
      // Generate error log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Positions",
        requestQuery: req.query,
        message: "Missing query parameters - at least one of upId or externalId must be provided",
        status: "error",
        integrationName: "external-api",
        flowType: "get-positions",
      };
      return res.status(400).json({
        success: false,
        error: "Missing Query Parameters",
        message: "At least one of upId or externalId must be provided",
        code: 400,
        suggestion: "Provide upId or externalId as query parameter"
      });
    }

    // Build query object
    const query = {};
    
    if (upId) {
      query._id = upId;
    }
    if (externalId) {
      query.externalId = externalId;
    }

    // Find positions
    const positions = await Position.find(query)
      .select('-__v') // Exclude version field
      .lean(); // Return plain JavaScript objects

    if (positions.length === 0) {
      // Generate not found log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Positions",
        requestQuery: req.query,
        message: "No positions found matching the provided criteria",
        status: "error",
        integrationName: "external-api",
        flowType: "get-positions",
      };
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "No positions found matching the provided criteria",
        code: 404,
        query: req.query
      });
    }

    // Generate response
    const responseData = {
      success: true,
      message: "Positions retrieved successfully",
      code: 200,
      data: {
        positions: positions,
        count: positions.length,
        query: req.query,
        retrievedAt: new Date().toISOString(),
      },
    };

    // Generate success log
    res.locals.logData = {
      ownerId: "system",
      processName: "External Get Positions",
      requestQuery: req.query,
      message: `Successfully retrieved ${positions.length} positions via external API`,
      status: "success",
      responseBody: responseData,
      integrationName: "external-api",
      flowType: "get-positions",
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("External get positions error:", error);

    // Handle different error types
    if (error.name === "CastError") {
      // Generate cast error log
      res.locals.logData = {
        ownerId: "system",
        processName: "External Get Positions",
        requestQuery: req.query,
        message: `Invalid ID format provided: ${error.message}`,
        status: "error",
        integrationName: "external-api",
        flowType: "get-positions",
      };
      return res.status(400).json({
        success: false,
        error: "Invalid ID Format",
        message: "Invalid upId format provided",
        code: 400,
        field: error.path,
        value: error.value,
        suggestion: "Provide a valid MongoDB ObjectId for upId"
      });
    }

    // Generate general error log
    res.locals.logData = {
      ownerId: "system",
      processName: "External Get Positions",
      requestQuery: req.query,
      message: "Internal server error while fetching positions",
      status: "error",
      integrationName: "external-api",
      flowType: "get-positions",
    };

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while fetching positions",
      code: 500,
      suggestion: "Please try again or contact support if the problem persists",
      timestamp: new Date().toISOString()
    });
  }
};
