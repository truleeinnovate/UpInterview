// v1.0.0 - Application Controller for managing candidate applications to positions

const mongoose = require("mongoose");
const { Application } = require("../models/Application.js");
const { Position } = require("../models/Position/position.js");
const { Candidate } = require("../models/candidate.js");
const { generateApplicationNumber } = require("../services/uniqueIdGeneratorService");

/**
 * Get all applications for a specific candidate
 */
const getApplicationsByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;

        if (!candidateId) {
            return res.status(400).json({ message: "Candidate ID is required" });
        }

        // Query by candidateId only - get all applications for this candidate
        const query = { candidateId };

        console.log("[APPLICATION] Fetching applications for candidateId:", candidateId);

        const applications = await Application.find(query)
            .populate({
                path: "positionId",
                select: "title status companyname",
            })
            .populate("candidateId", "FirstName LastName Email")
            .populate("interviewId", "interviewCode status")
            .sort({ _id: -1 })
            .lean();

        console.log("[APPLICATION] Found", applications.length, "applications");

        res.status(200).json({
            success: true,
            data: applications,
            total: applications.length,
        });
    } catch (error) {
        console.error("Error fetching applications by candidate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

/**
 * Get all applications for a specific position
 */
const getApplicationsByPosition = async (req, res) => {
    try {
        const { positionId } = req.params;

        if (!positionId) {
            return res.status(400).json({ message: "Position ID is required" });
        }

        // Query by positionId only - get all applications for this position
        const query = { positionId };

        const applications = await Application.find(query)
            .populate("candidateId", "FirstName LastName Email Phone")
            .populate("positionId", "title status")
            .populate("interviewId", "interviewCode status")
            .sort({ _id: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: applications,
            total: applications.length,
        });
    } catch (error) {
        console.error("Error fetching applications by position:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

/**
 * Create a new application
 */
const createApplication = async (req, res) => {
    try {
        const { candidateId, positionId, status, currentStage } = req.body;

        // Get tenant and user from auth context
        const tenantId = res.locals.auth?.actingAsTenantId || req.body.tenantId;
        const userId = res.locals.auth?.actingAsUserId || req.body.userId;

        // Validation
        if (!candidateId) {
            return res.status(400).json({
                field: "candidateId",
                message: "Candidate is required",
            });
        }

        if (!positionId) {
            return res.status(400).json({
                field: "positionId",
                message: "Position is required",
            });
        }

        if (!tenantId) {
            return res.status(400).json({
                message: "Tenant ID is required",
            });
        }

        // Check if candidate exists
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Check if position exists
        const position = await Position.findById(positionId);
        if (!position) {
            return res.status(404).json({ message: "Position not found" });
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({
            candidateId,
            positionId,
            tenantId,
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "Application already exists for this candidate and position",
                data: existingApplication,
            });
        }

        // Generate application number in format: NAME-TECH-YEAR-0001
        const applicationNumber = await generateApplicationNumber(candidate, position, tenantId);

        // Validate companyId - only use if it's a valid ObjectId, not a string
        const companyId = position.companyname && mongoose.Types.ObjectId.isValid(position.companyname)
            ? position.companyname
            : null;

        // Create application
        const application = await Application.create({
            applicationNumber,
            candidateId,
            positionId,
            tenantId,
            companyId,
            status: status || "NEW",
            currentStage: currentStage || "Application Submitted",
            ownerId: userId,
            createdBy: userId,
        });

        // Populate the created application for response
        const populatedApplication = await Application.findById(application._id)
            .populate("positionId", "title status")
            .populate("candidateId", "FirstName LastName Email")
            .lean();

        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: populatedApplication,
        });
    } catch (error) {
        console.error("Error creating application:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Application already exists for this candidate and position",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create application",
            error: error.message,
        });
    }
};

/**
 * Update an existing application
 */
const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, currentStage, interviewId } = req.body;
        const userId = res.locals.auth?.actingAsUserId || req.body.userId;

        // Find existing application
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Build update object
        const updateData = {
            updatedBy: userId,
        };

        if (status) updateData.status = status;
        if (currentStage) updateData.currentStage = currentStage;
        if (interviewId) updateData.interviewId = interviewId;

        // Update application
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate("positionId", "title status")
            .populate("candidateId", "FirstName LastName Email")
            .populate("interviewId", "interviewCode status")
            .lean();

        res.status(200).json({
            success: true,
            message: "Application updated successfully",
            data: updatedApplication,
        });
    } catch (error) {
        console.error("Error updating application:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update application",
            error: error.message,
        });
    }
};

/**
 * Get single application by ID
 */
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id)
            .populate({
                path: "positionId",
                select: "title status companyname",
                populate: {
                    path: "companyname",
                    select: "companyName",
                },
            })
            .populate("candidateId", "FirstName LastName Email Phone")
            .populate("interviewId", "interviewCode status")
            .lean();

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch application",
            error: error.message,
        });
    }
};

module.exports = {
    getApplicationsByCandidate,
    getApplicationsByPosition,
    createApplication,
    updateApplication,
    getApplicationById,
};
