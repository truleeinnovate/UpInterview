//<-----v1.0.1---Venkatesh------add permission
const mongoose = require("mongoose");
// const { Candidate } = require('../models/Candidate/candidate.js');
const CandidatePosition = require("../models/CandidatePosition.js");
const {
  validateCandidateData,
  candidateUpdateSchema,
} = require("../validations/candidateValidation.js");
const { hasPermission } = require("../middleware/permissionMiddleware");
const { Candidate } = require("../models/candidate.js");
const { Resume } = require("../models/Resume.js");
const { Interview } = require("../models/Interview/Interview.js");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");
const { Users } = require("../models/Users");
const { RoleMaster } = require("../models/MasterSchemas/RoleMaster.js");

// Add a new Candidate
const addCandidatePostCall = async (req, res) => {
  console.log("🚀 [addCandidatePostCall] Starting candidate creation process");

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Candidate";
  let newCandidate = null;

  try {
    console.log("📝 [addCandidatePostCall] Validating request body:", req.body);

    // Joi validation
    const { isValid, errors } = validateCandidateData(req.body);
    if (!isValid) {
      console.log("❌ [addCandidatePostCall] Validation failed:", errors);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    console.log("✅ [addCandidatePostCall] Validation passed");

    const {
      FirstName,
      LastName,
      Email,
      externalId,
      Phone,
      CountryCode,
      Date_Of_Birth,
      Gender,
      HigherQualification,
      UniversityCollege,
      CurrentExperience,
      CurrentRole,
      RelevantExperience,
      skills,
      PositionId,
      // Technology,
      linkedInUrl,
    } = req.body;

    // Get ownerId and tenantId from request body
    console.log("🔍 [addCandidatePostCall] Extracting ownerId and tenantId");
    const ownerId = req.body.ownerId;
    const tenantId = req.body.tenantId;
    console.log("📋 [addCandidatePostCall] OwnerId:", ownerId, "TenantId:", tenantId);

    if (!ownerId) {
      console.log("❌ [addCandidatePostCall] Missing ownerId");
      return res.status(400).json({
        error: "OwnerId field is required in the request body",
        context: "Missing owner identification",
      });
    }

    console.log("✅ [addCandidatePostCall] Owner validation passed");

    //res.locals.loggedByController = true;
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    //   const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.Candidates, 'Create')
    //  //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'Create')
    //   if (!canCreate) {
    //     return res.status(403).json({ message: 'Forbidden: missing Candidates.Create permission' });
    //   }
    //-----v1.0.1--->

    // Create candidate with only personal info fields
    newCandidate = new Candidate({
      FirstName,
      LastName,
      Email,
      externalId,
      Phone,
      CountryCode,
      Date_Of_Birth,
      Gender,
      ownerId,
      tenantId,
      createdBy: ownerId,
      linkedInUrl,
    });

    await newCandidate.save();

    console.log('✅ [addCandidatePostCall] Candidate saved successfully');

    // Create Resume with professional/resume-related fields
    const { ImageData, resume: resumeFile, source } = req.body;

    const newResume = new Resume({
      candidateId: newCandidate._id,
      fileUrl: resumeFile?.path || null,
      HigherQualification,
      UniversityCollege,
      CurrentExperience,
      RelevantExperience,
      CurrentRole,
      skills,
      ImageData,
      resume: resumeFile,
      source: source || "MANUAL",
      isActive: true,
      uploadedAt: new Date(),
      ownerId,
      tenantId,
      createdBy: ownerId,
    });

    await newResume.save();

    console.log('✅ [addCandidatePostCall] Resume saved successfully');

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "candidate_created",
        description: `Candidate was created successfully`,
      },
      ownerId,
      parentId: newCandidate._id,
      parentObject: "Candidate",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Candidate was created successfully`,
    };

    console.log("✅ [addCandidatePostCall] Feed generated successfully");

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create Candidate",
      requestBody: req.body,
      message: "Candidate created successfully",
      status: "success",
      responseBody: newCandidate,
    };

    console.log("✅ [addCandidatePostCall] Log generated successfully");

    // Send response
    res.status(201).json({
      status: "success",
      message: "Candidate created successfully",
      data: newCandidate,
    });

    console.log("✅ [addCandidatePostCall] Response sent successfully");
  } catch (error) {
    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Candidate",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    console.log("❌ [addCandidatePostCall] Error generated successfully");

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to create candidate. Please try again later.",
      data: { error: error.message },
    });

    console.log("❌ [addCandidatePostCall] Error response sent successfully");
  }
};

// patch call Candidate
const updateCandidatePatchCall = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Candidate";

  const candidateId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    // this is ranjith code
    // ✅ Step 1: Validate incoming request body
    const { error } = candidateUpdateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.context.key] = err.message;
        return acc;
      }, {});
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    //  this is venkatesh code
    //res.locals.loggedByController = true;
    //----v1.0.1---->

    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    // const canCreate =
    // await hasPermission(res.locals?.effectivePermissions?.Candidates, 'Edit')
    // //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'Edit')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing Candidates.Edit permission' });
    // }
    //-----v1.0.1--->

    // feeds related data
    const currentCandidate = await Candidate.findById(candidateId).lean();

    if (!currentCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // ✅ Utility function to detect empty values  // added by Ranjith

    const isEmptyValue = (val) => {
      return (
        val === null ||
        val === undefined ||
        (typeof val === "string" && val.trim() === "")
      );
    };

    // ✅ Compare current values with updateFields to identify changes // changed by Ranjith
    const changes = Object.entries(updateFields)
      .filter(([key, newValue]) => {
        const oldValue = currentCandidate[key];

        // ✅ Skip when both old & new are empty  // added by Ranjith
        if (isEmptyValue(oldValue) && isEmptyValue(newValue)) {
          return false;
        }

        // Normalize PositionId (convert to string for comparison)
        if (key === "PositionId") {
          return oldValue?.toString() !== newValue?.toString();
        }

        // Handle arrays (e.g., `skills`)
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          const normalizeArray = (array) =>
            array
              .map((item) => {
                const { _id, ...rest } = item; // Ignore _id for comparison
                return rest;
              })
              .sort((a, b) => a.skill.localeCompare(b.skill));

          return (
            JSON.stringify(normalizeArray(oldValue)) !==
            JSON.stringify(normalizeArray(newValue))
          );
        }

        // Handle dates
        if (
          (oldValue instanceof Date ||
            new Date(oldValue).toString() !== "Invalid Date") &&
          (newValue instanceof Date ||
            new Date(newValue).toString() !== "Invalid Date")
        ) {
          return (
            new Date(oldValue).toISOString() !==
            new Date(newValue).toISOString()
          );
        }

        // Default comparison for strings, numbers, etc.
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentCandidate[key],
        newValue,
      }));

    // If no changes detected, return early
    if (changes.length === 0) {
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected",
        data: null,
      });
    }

    // Separate candidate fields and resume fields
    const candidateFields = ['FirstName', 'LastName', 'Email', 'Phone', 'CountryCode', 'Date_Of_Birth', 'Gender', 'externalId'];
    const resumeFields = ['HigherQualification', 'UniversityCollege', 'CurrentExperience', 'RelevantExperience', 'CurrentRole', 'skills', 'ImageData', 'resume', 'source'];

    const candidateUpdateData = { updatedBy: ownerId };
    const resumeUpdateData = { updatedBy: ownerId };

    Object.keys(updateFields).forEach(key => {
      if (candidateFields.includes(key)) {
        candidateUpdateData[key] = updateFields[key];
      } else if (resumeFields.includes(key)) {
        resumeUpdateData[key] = updateFields[key];
      }
    });

    // Update Candidate
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      candidateUpdateData,
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found after update" });
    }

    // Update or create Resume if resume fields are present
    if (Object.keys(resumeUpdateData).length > 1) {
      await Resume.findOneAndUpdate(
        { candidateId, isActive: true },
        { $set: resumeUpdateData },
        { new: true, upsert: true }
      );
      console.log('✅ [updateCandidatePatchCall] Resume updated successfully');
    }

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: "update",
      // action: 'candidate_updated',
      action: {
        name: "candidate_updated",
        description: `Candidate was updated`,
      },
      ownerId,
      parentId: candidateId,
      parentObject: "Candidate",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: isEmptyValue(oldValue)
          ? isEmptyValue(newValue)
          : `${fieldName} updated from `, // '${oldValue}' to '${newValue}'
      })),
      history: changes,
    };
    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update Candidate",
      requestBody: req.body,
      message: "Candidate updated successfully",
      status: "success",
      responseBody: updatedCandidate,
    };

    // Send response
    res.status(203).json({
      status: "Updated successfully",
      message: "Candidate updated successfully",
      data: updatedCandidate,
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update Candidate",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// serach and pagincation functionality

// Optimized candidate query with pagination
const getCandidatesData = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = "",
      status,
      tech,
      minExperience,
      maxExperience,
      minRelevantExperience,
      maxRelevantExperience,
      roles,
      universities,
      createdDate,
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build base candidate query
    let candidateQuery = { tenantId: req.tenantId };

    // Search optimization - use text index
    if (search) {
      candidateQuery.$text = { $search: search };
    }

    // Use aggregation to join with Resume collection
    const pipeline = [
      { $match: candidateQuery },
      // Lookup active resume for each candidate
      {
        $lookup: {
          from: "resume",
          let: { candidateId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$candidateId", "$$candidateId"] },
                    { $eq: ["$isActive", true] }
                  ]
                }
              }
            }
          ],
          as: "activeResume"
        }
      },
      // Unwind the resume (will be null if no active resume)
      {
        $unwind: {
          path: "$activeResume",
          preserveNullAndEmptyArrays: true
        }
      },
    ];

    // Add resume-based filters
    if (status) {
      pipeline.push({
        $match: { "activeResume.HigherQualification": { $in: status.split(",") } }
      });
    }

    if (tech) {
      pipeline.push({
        $match: { "activeResume.skills.skill": { $in: tech.split(",") } }
      });
    }

    if (minExperience || maxExperience) {
      const expMatch = {};
      if (minExperience) expMatch.$gte = parseInt(minExperience);
      if (maxExperience) expMatch.$lte = parseInt(maxExperience);
      pipeline.push({
        $match: { "activeResume.CurrentExperience": expMatch }
      });
    }

    // Project the fields we need - with fallback to legacy candidate fields
    pipeline.push({
      $project: {
        FirstName: 1,
        LastName: 1,
        Email: 1,
        Phone: 1,
        createdAt: 1,
        // Resume fields with fallback to legacy candidate fields (for backward compatibility)
        CurrentExperience: { $ifNull: ["$activeResume.CurrentExperience", "$CurrentExperience"] },
        skills: { $ifNull: ["$activeResume.skills", "$skills"] },
        HigherQualification: { $ifNull: ["$activeResume.HigherQualification", "$HigherQualification"] },
        ImageData: { $ifNull: ["$activeResume.ImageData", "$ImageData"] },
        CurrentRole: { $ifNull: ["$activeResume.CurrentRole", "$CurrentRole"] },
      }
    });

    // Sort, skip, and limit
    pipeline.push(
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    // Get total count
    const countPipeline = pipeline.slice(0, pipeline.findIndex(p => p.$sort));
    countPipeline.push({ $count: "total" });

    const [candidates, countResult] = await Promise.all([
      Candidate.aggregate(pipeline),
      Candidate.aggregate(countPipeline)
    ]);

    // Debug logging
    // console.log('📊 [getCandidatesData] Pipeline results:', {
    //   candidatesCount: candidates.length,
    //   firstCandidate: candidates[0] ? {
    //     _id: candidates[0]._id,
    //     FirstName: candidates[0].FirstName,
    //     skills: candidates[0].skills,
    //     HigherQualification: candidates[0].HigherQualification,
    //   } : 'No candidates'
    // });

    const total = countResult[0]?.total || 0;

    res.json({
      data: candidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dedicated search endpoint for better performance
const searchCandidates = async (req, res) => {
  try {
    const { search, filters = {}, limit = 50 } = req.body;

    let candidateMatch = { tenantId: req.tenantId };

    if (search) {
      // Use regex for partial matching - consider text index for better performance
      const searchRegex = new RegExp(search, "i");
      candidateMatch.$or = [
        { FirstName: searchRegex },
        { LastName: searchRegex },
        { Email: searchRegex },
        { Phone: searchRegex },
      ];
    }

    // Use aggregation to join with Resume collection
    const pipeline = [
      { $match: candidateMatch },
      // Lookup active resume
      {
        $lookup: {
          from: "resume",
          let: { candidateId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$candidateId", "$$candidateId"] },
                    { $eq: ["$isActive", true] }
                  ]
                }
              }
            }
          ],
          as: "activeResume"
        }
      },
      {
        $unwind: {
          path: "$activeResume",
          preserveNullAndEmptyArrays: true
        }
      },
      // Project fields with resume data
      {
        $project: {
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Phone: 1,
          CurrentExperience: "$activeResume.CurrentExperience"
        }
      },
      { $limit: parseInt(limit) }
    ];

    const results = await Candidate.aggregate(pipeline);

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCandidates = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;

    const query = tenantId ? { tenantId } : ownerId ? { ownerId } : {};

    res.locals.loggedByController = true;

    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    //   const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.Candidates, 'View')
    //  //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'View')
    //   if (!canCreate) {
    //     return res.status(403).json({ message: 'Forbidden: missing Candidates.View permission' });
    //   }
    //-----v1.0.1--->

    const candidates = await Candidate.find(query).lean();

    res.json(candidates);
  } catch (error) {
    console.error("[getCandidates] Error:", error.message);
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    const auth = res.locals.auth || {};
    const { actingAsTenantId } = auth;

    // Base query by ID; if we have a tenant scope from auth, enforce it
    const query = actingAsTenantId
      ? { _id: id, tenantId: actingAsTenantId }
      : { _id: id };

    const candidate = await Candidate.findOne(query)
      .lean();

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Fetch active resume for the candidate
    const activeResume = await Resume.findOne({
      candidateId: id,
      isActive: true
    }).lean();

    // Get role details from resume's CurrentRole
    let roleDetails = null;
    if (activeResume?.CurrentRole) {
      roleDetails = await RoleMaster.findOne({ roleName: activeResume.CurrentRole })
        .select("roleName roleLabel")
        .lean();
    }

    // Combine candidate with active resume data
    const response = {
      ...candidate,
      // Include resume fields for backward compatibility
      ...(activeResume && {
        HigherQualification: activeResume.HigherQualification,
        UniversityCollege: activeResume.UniversityCollege,
        CurrentExperience: activeResume.CurrentExperience,
        RelevantExperience: activeResume.RelevantExperience,
        CurrentRole: activeResume.CurrentRole,
        skills: activeResume.skills,
        ImageData: activeResume.ImageData,
        resume: activeResume.resume,
      }),
      roleDetails,
      activeResume, // Include full resume object as well
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("🔥 [getCandidateById] Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching candidate", error: error.message });
  }
};

// const getCandidatePositionById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ message: "Candidate ID is required" });
//     }

//     res.locals.loggedByController = true;

//     //<-----v1.0.1---
//     // Permission: Tasks.Create (or super admin override)
//     //   const canCreate =
//     //   await hasPermission(res.locals?.effectivePermissions?.Candidates, 'View')
//     //  //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'View')
//     //   if (!canCreate) {
//     //     return res.status(403).json({ message: 'Forbidden: missing Candidates.View permission' });
//     //   }
//     //-----v1.0.1--->

//     const candidate = await Candidate.findById(id).lean();

//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     const candidatePositions = await CandidatePosition.aggregate([
//       {
//         $match: { candidateId: new mongoose.Types.ObjectId(id) },
//       },
//       {
//         $lookup: {
//           from: "positions",
//           localField: "positionId",
//           foreignField: "_id",
//           as: "positionDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$positionDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//     ]);

//     const positionDetails = candidatePositions.map((pos) => ({
//       positionId: pos.positionId,
//       status: pos.status,
//       interviewId: pos.interviewId,
//       interviewRound: pos.interviewRound,
//       interviewFeedback: pos.interviewFeedback,
//       offerDetails: pos.offerDetails,
//       applicationDate: pos.applicationDate,
//       updatedAt: pos.updatedAt,
//       positionInfo: pos.positionDetails
//         ? {
//             title: pos.positionDetails.title || "",
//             companyname: pos.positionDetails.companyname || "",
//             jobdescription: pos.positionDetails.jobdescription || "",
//             minexperience: pos.positionDetails.minexperience || 0,
//             maxexperience: pos.positionDetails.maxexperience || 0,
//             skills: pos.positionDetails.skills || [],
//             additionalnotes: pos.positionDetails.additionalnotes || "",
//             rounds: pos.positionDetails.rounds || [],
//             createdBy: pos.positionDetails.CreatedBy || "",
//             lastModifiedById: pos.positionDetails.LastModifiedById || "",
//             ownerId: pos.positionDetails.ownerId || "",
//             tenantId: pos.positionDetails.tenantId || "",
//             createdDate: pos.positionDetails.createdDate || "",
//           }
//         : null,
//     }));

//     const response = {
//       ...candidate,
//       appliedPositions: positionDetails || [],
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("🔥 [getCandidatePositionById] Error:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching candidate", error: error.message });
//   }
// };

// Delete candidate by ID
const deleteCandidate = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Delete Candidate";

  const { id } = req.params;

  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid candidate ID format",
      });
    }

    // Check if candidate exists
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        status: "error",
        message: "Candidate not found",
      });
    }

    // Check if candidate exists in Interview schema
    const existingInterview = await Interview.findOne({ candidateId: id });

    // Check if candidate exists in CandidateAssessment schema
    const existingAssessment = await CandidateAssessment.findOne({
      candidateId: id,
    });

    if (existingInterview || existingAssessment) {
      // Candidate linked elsewhere — do not delete
      return res.status(400).json({
        status: "error",
        message: existingInterview
          ? "Candidate cannot be deleted. Found in Interview records."
          : "Candidate cannot be deleted. Found in Candidate Assessment records.",
      });
    }

    // Safe to delete
    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return res.status(404).json({
        status: "error",
        message: "Candidate not found or already deleted",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting candidate:", error);

    res.status(500).json({
      status: "error",
      message: "Internal server error while deleting candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getCandidates,
  addCandidatePostCall,
  updateCandidatePatchCall,
  searchCandidates,
  getCandidatesData,
  getCandidateById,
  //getCandidatePositionById,
  deleteCandidate,
};
