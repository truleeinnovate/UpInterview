const { Candidate } = require("../models/candidate.js");
const { Position } = require("../models/Position/position.js");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// Add this helper function at the top of the file
const getTenantFromApiKey = (req) => {
  // Extract tenant information from the API key if needed
  // For now, we'll return a default tenant ID
  return "default-tenant";
};

const getTenantAndUserFromCookies = (req) => {
  return {
    tenantId: req.cookies?.tenantId,
    userId: req.cookies?.userId,
  };
};

/**
 * Create a single candidate via external API
 */
exports.createCandidate = async (req, res) => {
  try {
    const { tenantId, userId } = getTenantAndUserFromCookies(req);

    if (!tenantId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing tenant or user information in cookies",
      });
    }

    const candidateData = {
      ...req.body,
      externalId: req.body.externalId || `ext_${uuidv4()}`,
      isExternal: true,
      source: req.body.source || "external_api",
      tenantId: tenantId,
      createdBy: userId,
      ownerId: userId,
    };

    const candidate = await Candidate.create(candidateData);

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: {
        candidateId: candidate._id,
        externalId: candidate.externalId,
        referenceId: `CAND-${Date.now()}`,
        nextSteps: "Your candidate profile has been created successfully.",
      },
    });
  } catch (error) {
    // Error handling remains the same
    console.error("External candidate creation error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid candidate data",
        details: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate Entry",
        message: "A candidate with this email already exists",
        field: "email",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create candidate",
      referenceId: `ERR-${Date.now()}`,
    });
  }
};

/**
 * Bulk create candidates via external API
 */
exports.bulkCreateCandidates = async (req, res) => {
  try {
    const { tenantId, userId } = getTenantAndUserFromCookies(req);

    if (!tenantId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing tenant or user information in cookies",
      });
    }

    const candidates = req.body.map((candidate) => ({
      ...candidate,
      externalId: candidate.externalId || `ext_${uuidv4()}`,
      isExternal: true,
      source: candidate.source || "external_api",
      tenantId: tenantId,
      createdBy: userId,
      ownerId: userId,
    }));

    const result = await Candidate.insertMany(candidates, { ordered: false });

    res.status(201).json({
      success: true,
      message: "Bulk candidates created successfully",
      data: {
        created: result.length,
        total: req.body.length,
        referenceId: `BULK-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Bulk candidate creation error:", error);

    if (error.code === 11000) {
      const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;
      const createdCount = error.result ? error.result.nInserted : 0;

      return res.status(207).json({
        success: true,
        message: "Partial success - some candidates were not created",
        data: {
          created: createdCount,
          duplicates: duplicateCount,
          total: req.body.length,
          referenceId: `BULK-PARTIAL-${Date.now()}`,
        },
        warnings: ["Some duplicate entries were skipped"],
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to process bulk candidates",
      referenceId: `ERR-BULK-${Date.now()}`,
    });
  }
};

/**
 * Create a single position via external API
 */
exports.createPosition = async (req, res) => {
  try {
    const positionData = {
      ...req.body,
      externalId: req.body.externalId || `pos_ext_${uuidv4()}`,
      isExternal: true,
      tenantId: req.tenantId || "external_tenant",
      createdBy: req.user?._id || "external_api",
      status: "open", // Default status
    };

    const position = await Position.create(positionData);

    res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: {
        positionId: position._id,
        externalId: position.externalId,
        referenceId: `POS-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("External position creation error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid position data",
        details: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create position",
      referenceId: `ERR-POS-${Date.now()}`,
    });
  }
};

/**
 * Bulk create positions via external API
 */
exports.bulkCreatePositions = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Expected an array of positions",
      });
    }

    const positions = req.body.map((position) => ({
      ...position,
      externalId: position.externalId || `pos_ext_${uuidv4()}`,
      isExternal: true,
      tenantId: req.tenantId || "external_tenant",
      createdBy: req.user?._id || "external_api",
      status: position.status || "open",
    }));

    const result = await Position.insertMany(positions, { ordered: false });

    res.status(201).json({
      success: true,
      message: "Bulk positions created successfully",
      data: {
        created: result.length,
        total: req.body.length,
        referenceId: `BULK-POS-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Bulk position creation error:", error);

    if (error.code === 11000) {
      const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;
      const createdCount = error.result ? error.result.nInserted : 0;

      return res.status(207).json({
        success: true,
        message: "Partial success - some positions were not created",
        data: {
          created: createdCount,
          duplicates: duplicateCount,
          total: req.body.length,
          referenceId: `BULK-POS-PARTIAL-${Date.now()}`,
        },
        warnings: ["Some duplicate entries were skipped"],
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to process bulk positions",
      referenceId: `ERR-BULK-POS-${Date.now()}`,
    });
  }
};
