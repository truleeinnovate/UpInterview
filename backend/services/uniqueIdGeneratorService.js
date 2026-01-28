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

const mongoose = require("mongoose");

// Sequence counter model for atomic ID generation
// One document per sequence scope (prefix or prefix:tenantId)
const sequenceCounterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g., 'INT' or 'INT:<tenantId>'
    seq: { type: Number, required: true },
    meta: {
      prefix: { type: String },
      padLength: { type: Number },
      startNumber: { type: Number },
      tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        default: null,
      },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "sequence_counters" }
);

const SequenceCounter =
  mongoose.models.SequenceCounter ||
  mongoose.model("SequenceCounter", sequenceCounterSchema);

/**
 * Configuration for different entity types
 * Can be extended for specific requirements per entity
 */
const ENTITY_CONFIG = {
  // Invoice
  INVC: {
    startNumber: 50001,
    padLength: 5,
    fieldName: "invoiceCode",
    maxRetries: 5,
  },
  // Wallet
  WLT: {
    startNumber: 50001,
    padLength: 5,
    fieldName: "walletCode",
    maxRetries: 5,
  },
  // Withdrawal
  WDL: {
    startNumber: 1,
    padLength: 5,
    fieldName: "withdrawalCode",
    maxRetries: 5,
  },
  // Receipt
  RCP: {
    startNumber: 50001,
    padLength: 5,
    fieldName: "receiptCode",
    maxRetries: 10, // Increased retries due to frequent conflicts
  },
  // Payment (PMT) - alternate prefix used in some controllers
  PMT: {
    startNumber: 50001,
    padLength: 5,
    fieldName: "paymentCode",
    maxRetries: 5,
  },
  // Organization Request
  ORG: {
    startNumber: 1,
    padLength: 5,
    fieldName: "organizationRequestCode",
    maxRetries: 5,
  },
  // Outsource Interviewer Request
  OINT: {
    startNumber: 1,
    padLength: 5,
    fieldName: "outsourceRequestCode",
    maxRetries: 5,
  },
  // Interview
  INT: {
    startNumber: 1,
    padLength: 5,
    fieldName: "interviewCode",
    maxRetries: 5,
  },
  // Interview Request
  "INT-RQST": {
    startNumber: 1,
    padLength: 5,
    fieldName: "interviewRequestCode",
    maxRetries: 5,
  },
  // Mock Interview
  MINT: {
    startNumber: 50001, // Starting from 50001 as per requirement
    padLength: 5,
    fieldName: "mockInterviewCode",
    maxRetries: 5,
  },
  // Support Desk Ticket
  SPT: {
    startNumber: 50001, // Starting from 50001 as per requirement
    padLength: 5,
    fieldName: "ticketCode",
    maxRetries: 5,
  },
  // Task
  TSK: {
    startNumber: 1,
    padLength: 5,
    fieldName: "taskCode",
    maxRetries: 5,
  },
  // Position
  POS: {
    startNumber: 1,
    padLength: 5,
    fieldName: "positionCode",
    maxRetries: 5,
  },
  // Assessment Template
  "ASMT-TPL": {
    startNumber: 1,
    padLength: 5,
    fieldName: "assessmentTemplateCode",
    maxRetries: 5,
  },
  // ScheduleAssessment
  ASMT: {
    startNumber: 1,
    padLength: 5,
    fieldName: "scheduledAssessmentCode",
    maxRetries: 5,
  },
  // Interview Template
  "INT-TPL": {
    startNumber: 1,
    padLength: 5,
    fieldName: "interviewTemplateCode",
    maxRetries: 5,
  },
  //loggingServices
  ILOG: {
    startNumber: 1,
    padLength: 5,
    fieldName: "logId",
    maxRetries: 5,
  },
  // Application
  APPNUM: {
    startNumber: 1,
    padLength: 5,
    fieldName: "applicationNumber",
    maxRetries: 5,
  },
  // Default configuration for custom prefixes
  DEFAULT: {
    startNumber: 50001,
    padLength: 5,
    fieldName: "code",
    maxRetries: 5,
  },
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
  const config = ENTITY_CONFIG[prefix] || ENTITY_CONFIG["DEFAULT"];

  // Use provided values or fall back to config
  const effectiveFieldName = fieldName || config.fieldName;
  const effectivePadLength = padLength ?? config.padLength;
  const effectiveStartNumber = startNumber ?? config.startNumber;
  const effectiveMaxRetries = Math.max(1, maxRetries ?? config.maxRetries);

  const key = getSequenceKey(prefix, tenantId);

  for (let attempts = 0; attempts < effectiveMaxRetries; attempts++) {
    try {
      // 1) Atomically get the next sequence number for this scope
      const nextSeq = await getNextSequence(
        prefix,
        tenantId,
        effectiveStartNumber,
        effectivePadLength
      );
      const uniqueId = `${prefix}-${String(nextSeq).padStart(
        effectivePadLength,
        "0"
      )}`;

      // 2) Quick existence check (should almost never hit in normal flow)
      const existingQuery = { [effectiveFieldName]: uniqueId };
      if (tenantId) existingQuery.tenantId = tenantId;
      const exists = await Model.exists(existingQuery);

      if (!exists) {
        return uniqueId;
      }

      // 3) Rare case: legacy data ahead of counter. Bump counter to current max and retry.
      const maxExisting = await getMaxExistingNumber(
        Model,
        effectiveFieldName,
        prefix,
        tenantId,
        effectiveStartNumber
      );

      await SequenceCounter.findOneAndUpdate(
        { key },
        { $max: { seq: Math.max(maxExisting, nextSeq) } },
        { upsert: true }
      );

      console.warn(
        `[UniqueID] Detected existing ${uniqueId} in ${Model.modelName
        }. Advanced sequence to ${Math.max(
          maxExisting,
          nextSeq
        )} and retrying...`
      );
      // continue;
    } catch (error) {
      // For database connection errors, throw immediately
      if (
        error?.name === "MongoNetworkError" ||
        error?.name === "MongoServerError"
      ) {
        throw error;
      }

      if (attempts === effectiveMaxRetries - 1) {
        throw new Error(
          `Failed to generate unique ID for ${Model.modelName} after ${effectiveMaxRetries} attempts: ${error.message}`
        );
      }
    }
  }

  // Should not reach here due to return/throw in loop
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
  if (!id || typeof id !== "string") {
    return false;
  }

  const config = ENTITY_CONFIG[prefix] || ENTITY_CONFIG["DEFAULT"];
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
  if (!id || typeof id !== "string") {
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
  return ENTITY_CONFIG[prefix] || ENTITY_CONFIG["DEFAULT"];
}

/**
 * Add or update configuration for a custom prefix
 *
 * @param {string} prefix - The prefix to configure
 * @param {Object} config - Configuration object
 */
function configurePrefix(prefix, config) {
  ENTITY_CONFIG[prefix] = {
    ...ENTITY_CONFIG["DEFAULT"],
    ...config,
  };
}

/**
 * Helpers (internal)
 */

function getSequenceKey(prefix, tenantId) {
  return tenantId ? `${prefix}:${tenantId}` : prefix;
}

async function getNextSequence(prefix, tenantId, startNumber, padLength) {
  const key = getSequenceKey(prefix, tenantId);
  const now = new Date();

  // Use aggregation pipeline update to avoid modifier conflicts on the same path
  // seq = (ifNull(seq, start-1)) + 1
  const pipeline = [
    {
      $set: {
        seq: {
          $add: [{ $ifNull: ["$seq", Math.max((startNumber ?? 1) - 1, 0)] }, 1],
        },
        updatedAt: now,
        meta: {
          prefix,
          padLength,
          startNumber,
          tenantId: tenantId || null,
        },
      },
    },
  ];

  // Use native driver to avoid Mongoose modifier-path conflict checks
  const coll = SequenceCounter.collection;
  let res;
  try {
    res = await coll.findOneAndUpdate({ key }, pipeline, {
      upsert: true,
      returnDocument: "after",
    });
  } catch (e) {
    try {
      // Fallback for older drivers/servers without pipeline update support
      // 1) Ensure document exists with starting value (no conflict on seq)
      await coll.updateOne(
        { key },
        {
          $setOnInsert: {
            seq: Math.max((startNumber ?? 1) - 1, 0),
            meta: {
              prefix,
              padLength,
              startNumber,
              tenantId: tenantId || null,
            },
          },
          $set: { updatedAt: now },
        },
        { upsert: true }
      );

      // 2) Atomically increment to get next sequence
      res = await coll.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 }, $set: { updatedAt: now } },
        { returnDocument: "after" }
      );
    } catch (e2) {
      // Last-chance fallback for very old drivers
      res = await coll.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 }, $set: { updatedAt: now } },
        { upsert: true, returnOriginal: false }
      );
    }
  }

  const doc = res?.value || res;
  return doc.seq;
}

async function getMaxExistingNumber(
  Model,
  fieldName,
  prefix,
  tenantId,
  startNumber
) {
  const query = {
    [fieldName]: {
      $exists: true,
      $regex: new RegExp(`^${prefix}-\\d+$`),
    },
  };
  if (tenantId) query.tenantId = tenantId;

  const docs = await Model.find(query).select(fieldName).lean();

  if (!docs || !docs.length) {
    return (startNumber ?? 1) - 1;
  }

  const regex = new RegExp(`${prefix}-(\\d+)`);
  let maxNumber = (startNumber ?? 1) - 1;

  for (const doc of docs) {
    const code = doc?.[fieldName];
    if (!code || typeof code !== "string") continue;

    const match = code.match(regex);
    if (match) {
      const num = parseInt(match[1], 10) || 0;
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  return maxNumber;
}

/**
 * Generate application number in format: NAME-TECH-YEAR-0001
 * - NAME: First 5 characters of candidate first name (uppercase)
 * - TECH: First 3 characters of position title (uppercase)
 * - YEAR: Current year
 * - 0001: Sequential number at tenant level (4 digits, padded)
 *
 * @param {Object} candidate - Candidate object with FirstName field
 * @param {Object} position - Position object with title field
 * @param {ObjectId} tenantId - Tenant ID for scoping the sequence
 * @returns {Promise<string>} The generated application number
 */
async function generateApplicationNumber(candidate, position, tenantId) {
  // Get first 4 chars of candidate name (First + Last), removing spaces
  const fullName = (candidate?.FirstName || "") + (candidate?.LastName || "");
  const candidateName = (fullName || "UNKN")
    .replace(/[^a-zA-Z]/g, "") // Remove non-alphabetic characters
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, "X"); // Pad with X if less than 4 chars

  // Get first 3 chars of position title (uppercase)
  const techCode = (position?.title || "POS")
    .replace(/[^a-zA-Z]/g, "") // Remove non-alphabetic characters
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, "X"); // Pad with X if less than 3 chars

  // Get current year
  const currentYear = new Date().getFullYear();

  // Get the next sequential number for this tenant using the sequence counter
  // Use APPNUM prefix to ensure organization-level isolation and correct start number (1)
  const nextSeq = await getNextSequence("APPNUM", tenantId, 1, 4);
  const sequenceNumber = String(nextSeq).padStart(4, "0");

  return `${candidateName}-${techCode}-${currentYear}-${sequenceNumber}`;
}

module.exports = {
  generateUniqueId,
  validateUniqueId,
  extractNumberFromId,
  getConfig,
  configurePrefix,
  generateApplicationNumber,
  ENTITY_CONFIG,
};
