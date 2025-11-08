/**
 * Centralized Unique ID Generation Service
 * 
 * This service provides a unified approach to generating unique IDs across the application.
 * It handles race conditions, retries, and ensures uniqueness for all entity types.
 * 
 * Format: PREFIX-50001, PREFIX-50002, etc.
 * Starting number: 50001 for financial/billing, 00001 for organization-level entities
 * 
 * Usage:
 * // For global entities (no tenant isolation)
 * const { generateUniqueId } = require('./services/uniqueIdGeneratorService');
 * const invoiceCode = await generateUniqueId('INVC', InvoiceModel, 'invoiceCode');
 * 
 * // For organization-level entities (tenant-specific IDs)
 * const positionCode = await generateUniqueId('POS', PositionModel, 'positionCode', tenantId);
 * const interviewCode = await generateUniqueId('INT', InterviewModel, 'interviewCode', tenantId);
 */

const mongoose = require('mongoose');

/**
 * Configuration for different entity types
 * Can be extended for specific requirements per entity
 */
const ENTITY_CONFIG = {
  // Invoice
  'INVC': { 
    startNumber: 50001, 
    padLength: 5,
    fieldName: 'invoiceCode',
    maxRetries: 5
  },
  // Wallet
  'WLT': { 
    startNumber: 50001, 
    padLength: 5,
    fieldName: 'walletCode',
    maxRetries: 5
  },
  // Withdrawal
  'WDL': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'withdrawalCode',
    maxRetries: 5
  },
  // Receipt
  'RCP': { 
    startNumber: 50001, 
    padLength: 5,
    fieldName: 'receiptCode',
    maxRetries: 10  // Increased retries due to frequent conflicts
  },
  // Payment (PMT) - alternate prefix used in some controllers
  'PMT': { 
    startNumber: 50001, 
    padLength: 5,
    fieldName: 'paymentCode',
    maxRetries: 5
  },
  // Organization Request
  'ORG': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'organizationRequestCode',
    maxRetries: 5
  },
  // Outsource Interviewer Request
  'OINT': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'outsourceRequestCode',
    maxRetries: 5
  },
  // Interview
  'INT': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'interviewCode',
    maxRetries: 5
  },
  // Interview Request
  'INT-RQST': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'interviewRequestCode',
    maxRetries: 5
  },
  // Mock Interview
  'MINT': { 
    startNumber: 50001,  // Starting from 50001 as per requirement
    padLength: 5,
    fieldName: 'mockInterviewCode',
    maxRetries: 5
  },
  // Support Desk Ticket
  'SPT': { 
    startNumber: 50001,  // Starting from 50001 as per requirement
    padLength: 5,
    fieldName: 'ticketCode',
    maxRetries: 5
  },
  // Task
  'TSK': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'taskCode',
    maxRetries: 5
  },
  // Position
  'POS': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'positionCode',
    maxRetries: 5
  },
  // Assessment Template
  'ASMT-TPL': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'assessmentTemplateCode',
    maxRetries: 5
  },
  // ScheduleAssessment
  'ASMT': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'scheduledAssessmentCode',
    maxRetries: 5
  },
  // Interview Template
  'INT-TPL': { 
    startNumber: 1, 
    padLength: 5,
    fieldName: 'interviewTemplateCode',
    maxRetries: 5
  },
  // Default configuration for custom prefixes
  'DEFAULT': { 
    startNumber: 50001, 
    padLength: 5,
    fieldName: 'code',
    maxRetries: 5
  }
};

/**
 * Generate a unique ID for any entity type
 * 
 * @param {string} prefix - The prefix for the ID (e.g., 'INVC', 'WLT', 'WD')
 * @param {Model} Model - The Mongoose model to query
 * @param {string} fieldName - The field name in the model that stores the unique ID
 * @param {ObjectId} tenantId - Optional: Tenant ID for organization-level entities
 * @param {number} padLength - Optional: Length to pad the number (default: from config or 5)
 * @param {number} startNumber - Optional: Starting number (default: from config or 50001)
 * @param {number} maxRetries - Optional: Maximum retry attempts (default: from config or 5)
 * @returns {Promise<string>} The generated unique ID
 * @throws {Error} If unable to generate unique ID after max retries
 */
async function generateUniqueId(
  prefix,
  Model,
  fieldName = null,
  tenantId = null,
  padLength = null,
  startNumber = null,
  maxRetries = null
) {
  // Get configuration for this prefix
  const config = ENTITY_CONFIG[prefix] || ENTITY_CONFIG['DEFAULT'];
  
  // Use provided values or fall back to config
  const effectiveFieldName = fieldName || config.fieldName;
  const effectivePadLength = padLength || config.padLength;
  const effectiveStartNumber = startNumber || config.startNumber;
  const effectiveMaxRetries = maxRetries || config.maxRetries;
  
  let attempts = 0;
  
  while (attempts < effectiveMaxRetries) {
    try {
      // Find the last document with this field to get the highest number
      const query = {};
      query[effectiveFieldName] = { 
        $exists: true,
        $regex: new RegExp(`^${prefix}-\\d+$`)  // Only match proper format
      };
      
      // Add tenant filter for organization-level entities
      if (tenantId) {
        query.tenantId = tenantId;
      }
      
      // Sort by the actual field in descending order to get the highest code
      const sortQuery = {};
      sortQuery[effectiveFieldName] = -1;
      
      const lastDoc = await Model.findOne(query)
        .sort(sortQuery)
        .select(effectiveFieldName)
        .lean();
      
      let nextNumber = effectiveStartNumber;
      
      if (lastDoc && lastDoc[effectiveFieldName]) {
        // Extract number from PREFIX-XXXXX format
        const regex = new RegExp(`${prefix}-(\\d+)`);
        const match = lastDoc[effectiveFieldName].match(regex);
        
        if (match) {
          const lastNumber = parseInt(match[1], 10);
          // Increment from last number or start from effectiveStartNumber
          nextNumber = lastNumber >= effectiveStartNumber ? lastNumber + 1 : effectiveStartNumber;
        }
      }
      
      // Add attempts offset to reduce collision probability in concurrent scenarios
      const uniqueNumber = nextNumber + attempts;
      const uniqueId = `${prefix}-${String(uniqueNumber).padStart(effectivePadLength, '0')}`;
      
      // Check if this ID already exists (handles race conditions)
      const existingQuery = {};
      existingQuery[effectiveFieldName] = uniqueId;
      
      // Also filter by tenantId if provided
      if (tenantId) {
        existingQuery.tenantId = tenantId;
      }
      
      const existingDoc = await Model.findOne(existingQuery).lean();
      
      if (!existingDoc) {
        // ID is unique, return it
        console.log(`[UniqueID] Generated ${uniqueId} for ${Model.modelName}${tenantId ? ` (tenant: ${tenantId})` : ''} (attempt ${attempts + 1})`);
        return uniqueId;
      }
      
      // If ID exists, log and retry
      console.warn(`[UniqueID] ${uniqueId} already exists in ${Model.modelName}, retrying...`);
      attempts++;
      
    } catch (error) {
      console.error(`[UniqueID] Error generating ID for ${Model.modelName}:`, error);
      
      // For database connection errors, throw immediately
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
        throw error;
      }
      
      attempts++;
      
      // For other errors, continue trying
      if (attempts >= effectiveMaxRetries) {
        throw new Error(
          `Failed to generate unique ID for ${Model.modelName} after ${effectiveMaxRetries} attempts: ${error.message}`
        );
      }
    }
  }
  
  // If we exhausted all retries, throw error
  throw new Error(
    `Unable to generate unique ${effectiveFieldName} for ${Model.modelName} after ${effectiveMaxRetries} attempts. Please try again.`
  );
}




/**
 * Validate if a unique ID follows the correct format
 * 
 * @param {string} id - The ID to validate
 * @param {string} prefix - The expected prefix
 * @returns {boolean} True if valid format
 */
function validateUniqueId(id, prefix) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  const config = ENTITY_CONFIG[prefix] || ENTITY_CONFIG['DEFAULT'];
  const regex = new RegExp(`^${prefix}-\\d{${config.padLength}}$`);
  
  return regex.test(id);
}

/**
 * Extract the numeric part from a unique ID
 * 
 * @param {string} id - The ID to parse
 * @param {string} prefix - The prefix to remove
 * @returns {number|null} The numeric part or null if invalid
 */
function extractNumberFromId(id, prefix) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  
  const regex = new RegExp(`${prefix}-(\\d+)`);
  const match = id.match(regex);
  
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Get configuration for a specific prefix
 * 
 * @param {string} prefix - The prefix to get config for
 * @returns {Object} Configuration object
 */
function getConfig(prefix) {
  return ENTITY_CONFIG[prefix] || ENTITY_CONFIG['DEFAULT'];
}

/**
 * Add or update configuration for a custom prefix
 * 
 * @param {string} prefix - The prefix to configure
 * @param {Object} config - Configuration object
 */
function configurePrefix(prefix, config) {
  ENTITY_CONFIG[prefix] = {
    ...ENTITY_CONFIG['DEFAULT'],
    ...config
  };
}

module.exports = {
  generateUniqueId,
  validateUniqueId,
  extractNumberFromId,
  getConfig,
  configurePrefix,
  ENTITY_CONFIG
};
