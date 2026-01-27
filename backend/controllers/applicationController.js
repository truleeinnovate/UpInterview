// v1.0.0 - Application Controller for managing candidate applications to positions

const mongoose = require("mongoose");
const { Application } = require("../models/Application.js");
const { Position } = require("../models/Position/position.js");
const { Candidate } = require("../models/candidate.js");
const { generateApplicationNumber } = require("../services/uniqueIdGeneratorService");
const { ScreeningResult } = require("../models/ScreeningResult");
const { Resume } = require("../models/Resume.js");
const { screenResumeWithAI } = require("../services/resumeScreening/aiScreeningService");
const { triggerWebhook, EVENT_TYPES } = require("../services/webhookService");

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
            .sort({ createdAt: -1 })
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
/**
 * Get all applications for a specific position with enriched candidate data
 */
const getApplicationsByPosition = async (req, res) => {
    try {
        const { positionId } = req.params;

        if (!positionId) {
            return res.status(400).json({ message: "Position ID is required" });
        }

        // Query by positionId only - get all applications for this position
        // Use aggregation to fetch rich data from Resume
        const applications = await Application.aggregate([
            { $match: { positionId: new mongoose.Types.ObjectId(positionId) } },
            // { $sort: { createdAt: -1 } },

            // Lookup Candidate
            {
                $lookup: {
                    from: "candidates",
                    localField: "candidateId",
                    foreignField: "_id",
                    as: "candidate"
                }
            },
            { $unwind: "$candidate" },

            // Lookup ALL Resumes for the candidate (no pipeline filter)
            {
                $lookup: {
                    from: "resume",
                    localField: "candidate._id",
                    foreignField: "candidateId",
                    as: "resumes"
                }
            },

            // Pick the active resume (or null)
            {
                $addFields: {
                    resume: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$resumes",
                                    as: "r",
                                    cond: { $eq: ["$$r.isActive", true] }
                                }
                            },
                            0
                        ]
                    }
                }
            },

            // Optional: clean up – remove the resumes array if you don't need it
            { $unset: "resumes" },

            // Lookup ScreeningResult (Fallback for missing scores in Application)
            // Match using resume._id and positionId
            {
                $lookup: {
                    from: "screeningresult",
                    let: { rId: "$resume._id", pId: "$positionId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$resumeId", "$$rId"] },
                                        { $eq: ["$positionId", "$$pId"] }
                                    ]
                                }
                            }
                        },
                        { $project: { metadata: 1, recommendation: 1 } }
                    ],
                    as: "screeningResult"
                }
            },
            {
                $unwind: {
                    path: "$screeningResult",
                    preserveNullAndEmptyArrays: true
                }
            },


            // Lookup Position
            {
                $lookup: {
                    from: "positions",
                    localField: "positionId",
                    foreignField: "_id",
                    as: "position"
                }
            },
            { $unwind: "$position" },

            // Lookup Interview (optional, keep preserveNullAndEmptyArrays)
            {
                $lookup: {
                    from: "interviews",
                    localField: "interviewId",
                    foreignField: "_id",
                    as: "interview"
                }
            },
            {
                $unwind: {
                    path: "$interview",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Final projection (same structure as before)
            {
                $project: {
                    _id: 1,
                    applicationNumber: 1,
                    status: 1,
                    currentStage: 1,
                    // Fallback to screeningResult if Application.screeningScore is missing (SWAPPED PRIORITY: Check ScreeningResult first)
                    screeningScore: {
                        $ifNull: [
                            "$screeningResult.metadata.score",
                            { $ifNull: ["$screeningScore", 0] }
                        ]
                    },
                    screeningDecision: {
                        $ifNull: [
                            "$screeningResult.recommendation",
                            "$screeningDecision"
                        ]
                    },
                    createdAt: 1,
                    updatedAt: 1,

                    positionId: {
                        _id: "$position._id",
                        title: "$position.title",
                        status: "$position.status"
                    },

                    interviewId: {
                        _id: "$interview._id",
                        interviewCode: "$interview.interviewCode",
                        status: "$interview.status"
                    },

                    candidateId: {
                        _id: "$candidate._id",
                        FirstName: "$candidate.FirstName",
                        LastName: "$candidate.LastName",
                        Email: "$candidate.Email",
                        Phone: "$candidate.Phone",
                        CountryCode: "$candidate.CountryCode",

                        // Resume fields with fallback
                        HigherQualification: { $ifNull: ["$resume.HigherQualification", "Not Provided"] },
                        CurrentExperience: { $ifNull: ["$resume.CurrentExperience", 0] },
                        // RelevantExperience: { $ifNull: ["$resume.RelevantExperience", 0] },
                        skills: { $ifNull: ["$resume.skills", []] },
                        // ImageData: { $ifNull: ["$resume.ImageData", null] },
                        resumeId: "$resume._id",
                        profileJSON: "$resume.parsedJson",
                        certifications: "$resume.certifications",
                        languages: "$resume.languages"
                    }
                }
            }
        ]);


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
// this will use to create application with already created postion and candidate
const createApplication = async (req, res) => {
    try {
        const { candidateId, positionId, status, currentStage, type, screeningData, resumeId: providedResumeId } = req.body;

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

        // NEW: Prefer provided resumeId, fallback to latest resume
        let resumeId;

        if (providedResumeId) {
            resumeId = providedResumeId;
        } else {
            const resume = await Resume.findOne({ candidateId });
            if (!resume) {
                console.warn("No resume found — skipping ScreeningResult");
            } else {
                resumeId = resume._id;
            }
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
            status: status || "New",
            currentStage: currentStage || "Application Submitted",
            ownerId: userId,
            createdBy: userId,
            // vvvv FIX: Save screening data to Application document vvvv
            screeningScore: screeningData ? (Number(screeningData.matchPercentage || screeningData.match_percentage || screeningData.score || screeningData.metadata?.score) || 0) : undefined,
            screeningDecision: screeningData ? (screeningData.recommendation || screeningData.screening_result?.recommendation) : undefined,
        });

        // Populate the created application for response
        const populatedApplication = await Application.findById(application._id)
            .populate("positionId", "title status")
            .populate("candidateId", "FirstName LastName Email")
            .lean();


        // ────────────────────────────────────────────────────────────────
        // NEW: Create / Update ScreeningResult ONLY if from candidate screening
        // ────────────────────────────────────────────────────────────────
        let screeningResult = null;

        if (type === "candidate-screening" && screeningData) {
            try {
                 const resume = await Resume.findOne({ candidateId });
                if (!resume) {
                    console.warn("No resume found for candidate — skipping ScreeningResult");
                } else {
                    const resumeId = resume._id;

                    // Extract score and other fields from potential snake_case or nested structures
                    const score = Number(screeningData.matchPercentage || screeningData.match_percentage || screeningData.score || screeningData.metadata?.score) || 0;
                    const skillMatch = Number(screeningData.skillMatch || screeningData.skill_match) || 0;
                    const experienceMatch = Number(screeningData.experienceMatch || screeningData.experience_match) || 0;

                    const screeningPayload = {
                        resumeId,
                        positionId,
                        tenantId,
                        metadata: {
                            score: score,
                            skillMatch: skillMatch,
                            experienceMatch: experienceMatch,
                            matchedSkills: screeningData.matchedSkills || screeningData.extractedSkills || screeningData.screening_result?.extracted_skills || [],
                            missingSkills: screeningData.missingSkills || screeningData.screening_result?.missingSkills || [],
                            summary: screeningData.summary || screeningData.screening_result?.summary || "",
                            strengths: screeningData.strengths || screeningData.screening_result?.strengths || [],
                            concerns: screeningData.concerns || screeningData.gaps || screeningData.screening_result?.concerns || [],
                            method: screeningData.method || screeningData.metadata?.method || "SYSTEM",
                            // Capture additional rich analysis data
                            languages: screeningData.languages || screeningData.screening_result?.languages || screeningData.metadata?.languages || [],
                            certifications: screeningData.certifications || screeningData.screening_result?.certifications || screeningData.metadata?.certifications || [],
                            projects: screeningData.projects || screeningData.screening_result?.projects || screeningData.metadata?.projects || [],
                            workHistory: screeningData.workHistory || screeningData.screening_result?.workHistory || screeningData.metadata?.workHistory || [],
                            education: screeningData.education || screeningData.screening_result?.education || screeningData.metadata?.education || "",
                            experienceYears: screeningData.experienceYears || screeningData.screening_result?.experience_years || screeningData.metadata?.experienceYears || null
                        },
                        recommendation: screeningData.recommendation || screeningData.screening_result?.recommendation || "HOLD",
                        screenedBy: screeningData.method || screeningData.metadata?.method || "SYSTEM",
                        screenedAt: new Date(),
                        ownerId: userId,
                        createdBy: userId
                    };

                    screeningResult = await ScreeningResult.findOneAndUpdate(
                        { resumeId, positionId },
                        screeningPayload,
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    console.log("ScreeningResult created/updated:", screeningResult._id);
                }
            } catch (screenErr) {
                console.error("Failed to create/update ScreeningResult (application saved):", screenErr);
                // Do NOT fail the response — just log
            }
        }

        // Final success response
        res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: {
                application: populatedApplication,
                screeningResult: screeningResult ? {
                    id: screeningResult._id,
                    recommendation: screeningResult.recommendation,
                    metadata: screeningResult.metadata
                } : null
            }
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

/**
 * Filter applications by candidate and position
 */
const filterApplications = async (req, res) => {
    try {
        const { candidateId, positionId } = req.query;

        console.log("Filtering applications with:", { candidateId, positionId });

        if (!candidateId || !positionId) {
            return res.status(400).json({
                message: "Both candidateId and positionId are required for filtering"
            });
        }

        const query = {
            candidateId: new mongoose.Types.ObjectId(candidateId),
            positionId: new mongoose.Types.ObjectId(positionId)
        };

        const applications = await Application.find(query)
            .populate({
                path: "positionId",
                select: "title status companyname",
                populate: {
                    path: "companyname",
                    select: "companyName",
                },
            })
            .populate("candidateId", "FirstName LastName Email")
            .populate("interviewId", "interviewCode status")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: applications,
            total: applications.length,
        });

    } catch (error) {
        console.error("Error filtering applications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to filter applications",
            error: error.message,
        });
    }
};

/**
 * Update application status based on action
 */
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, status: providedStatus } = req.body;
        const userId = res.locals.auth?.actingAsUserId || req.body.userId;

        if (!id) {
            return res.status(400).json({ message: "Application ID is required" });
        }

        // Determine new status based on action or direct status
        let newStatus = providedStatus;
        let newStage = null;
        let screeningResultData = null;

        if (action) {
            switch (action) {
                case 'Run AI Screening':
                    newStatus = 'SCREENED';
                    newStage = 'Screening Completed';

                    // --- TRIGGER AI SCREENING ---
                    try {
                        const app = await Application.findById(id);
                        if (!app) throw new Error("Application not found");

                        const position = await Position.findById(app.positionId);
                        const resume = await Resume.findOne({ candidateId: app.candidateId, isActive: true }).sort({ createdAt: -1 });

                        if (position && resume) {
                            const resumeData = {
                                name: `${resume.parsedJson?.extractedProfile?.name || ''}`,
                                email: resume.parsedJson?.extractedProfile?.email,
                                phone: resume.parsedJson?.extractedProfile?.phone,
                                skills: resume.skills?.map(s => s.skill) || [],
                                experience: resume.CurrentExperience,
                                education: resume.HigherQualification,
                                rawText: resume.parsedJson?.fullText || resume.parsedJson?.resumeText || ""
                            };

                            console.log(`[AI SCREENING] Triggered for App ${id}`);
                            const aiResult = await screenResumeWithAI(resumeData, position);

                            if (aiResult.success) {
                                screeningResultData = {
                                    screeningScore: aiResult.data.score || 0,
                                    screeningDecision: aiResult.data.recommendation || 'HOLD',
                                    screeningNotes: aiResult.data.analysis || '',
                                    screeningResult: {
                                        metadata: {
                                            score: aiResult.data.score,
                                            skillMatch: aiResult.data.skillMatch,
                                            strengths: aiResult.data.strengths,
                                            concerns: aiResult.data.concerns,
                                            summary: aiResult.data.analysis,
                                            aiRecommendation: aiResult.data.recommendation
                                        }
                                    }
                                };
                            }
                        }
                    } catch (screenError) {
                        console.error("AI Screening trigger failed:", screenError);
                        // Continue to update status even if screening fails, or maybe set a flag?
                    }
                    // -----------------------------
                    break;
                case 'Reject':
                case 'REJECTED':
                    newStatus = 'REJECTED';
                    newStage = 'Rejected';
                    break;
                case 'Schedule Interview':
                    newStatus = 'INTERVIEWING';
                    newStage = 'Interview Scheduled';
                    break;
                case 'Offer':
                    newStatus = 'OFFERED'; // or DECISION based on schema
                    newStage = 'Offer Released';
                    break;
                case 'Hire':
                    newStatus = 'HIRED'; // stored in atsStatus usually, but let's check schema
                    newStage = 'Hired';
                    break;
                case 'Withdraw':
                case 'WITHDRAWN':
                case 'Withdraw Application':
                    newStatus = 'WITHDRAWN';
                    newStage = 'Application Withdrawn';
                    break;
                default:
                    // If action matches a valid status directly
                    newStatus = action.toUpperCase();
            }
        }

        if (!newStatus) {
            return res.status(400).json({ message: "Valid action or status is required" });
        }

        const updateData = {
            status: newStatus,
            updatedBy: userId,
            ...screeningResultData // Merge screening results if available
        };

        if (newStage) {
            updateData.currentStage = newStage;
        }

        // Special handling for HIRED/OFFERED if they live in atsStatus
        if (['HIRED', 'OFFERED'].includes(newStatus)) {
            updateData.atsStatus = newStatus;
            // Maybe keep main status as DECISION or similar? 
            // For now, based on schema enum, OFFERED is not in main status enum?
            // Schema enum: New, APPLIED, SCREENED, INTERVIEWING, DECISION, REJECTED, WITHDRAWN
            // So if OFFERED/HIRED, main status might be DECISION.
            if (newStatus === 'HIRED' || newStatus === 'OFFERED') {
                updateData.status = 'DECISION';
            }
        }

        console.log(`[UPDATE STATUS] App: ${id}, Action: ${action} -> Status: ${updateData.status}, Stage: ${updateData.currentStage}`);

        // Get original application before update for webhook payload
        const originalApplication = await Application.findById(id).lean();

        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate("positionId", "title status")
            .populate("candidateId", "FirstName LastName Email")
            .populate("interviewId", "interviewCode status")
            .lean();

        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Trigger webhook for application status update
        try {
            const webhookPayload = {
                applicationId: updatedApplication._id,
                applicationNumber: updatedApplication.applicationNumber,
                tenantId: updatedApplication.tenantId,
                ownerId: updatedApplication.ownerId,
                candidateId: updatedApplication.candidateId,
                positionId: updatedApplication.positionId,
                interviewId: updatedApplication.interviewId,
                status: updatedApplication.status,
                currentStage: updatedApplication.currentStage,
                previousStatus: originalApplication.status, // old status before update
                previousStage: originalApplication.currentStage, // old stage before update
                updatedAt: updatedApplication.updatedAt,
                event: "application.status.updated",
            };

            console.log(
                `[APPLICATION WEBHOOK] Triggering status update webhook for application ${updatedApplication._id} with status: ${updatedApplication.status}`
            );
            await triggerWebhook(
                EVENT_TYPES.APPLICATION_STATUS_UPDATED,
                webhookPayload,
                updatedApplication.tenantId
            );
            console.log(
                `[APPLICATION WEBHOOK] Status update webhook sent successfully for application ${updatedApplication._id}`
            );
        } catch (webhookError) {
            console.error(
                "[APPLICATION WEBHOOK] Error triggering application status update webhook:",
                webhookError
            );
            // Continue execution even if webhook fails
        }

        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            data: updatedApplication,
        });

    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update application status",
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
    filterApplications,
    updateApplicationStatus,
};