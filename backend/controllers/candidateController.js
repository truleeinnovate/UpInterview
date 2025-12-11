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
const { Interview } = require("../models/Interview/Interview.js");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");
const { Users } = require("../models/Users");
const { RoleMaster } = require("../models/MasterSchemas/RoleMaster.js");

// Add a new Candidate
const addCandidatePostCall = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Candidate";
  let newCandidate = null;

  try {
    // Joi validation
    const { isValid, errors } = validateCandidateData(req.body);
    if (!isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

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
    } = req.body;

    // Get ownerId and tenantId from request body
    const ownerId = req.body.ownerId;
    const tenantId = req.body.tenantId;

    if (!ownerId) {
      return res.status(400).json({
        error: "OwnerId field is required in the request body",
        context: "Missing owner identification",
      });
    }

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

    newCandidate = new Candidate({
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
      CurrentExperience, // CurrentExperience is related to total experience in Ui mentioned.
      CurrentRole,
      RelevantExperience,
      // Technology,
      skills,
      PositionId,
      ownerId,
      tenantId,
      createdBy: ownerId,
    });

    await newCandidate.save();

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

    // Send response
    res.status(201).json({
      status: "success",
      message: "Candidate created successfully",
      data: newCandidate,
    });
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

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to create candidate. Please try again later.",
      data: { error: error.message },
    });
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

    // Perform the update
    const updateData = {
      ...updateFields,
      updatedBy: ownerId,
    };

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found after update" });
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

    // Build query efficiently
    let query = { tenantId: req.tenantId };

    // Search optimization - use text index
    if (search) {
      query.$text = { $search: search };
    }

    // Filter optimizations
    if (status) {
      query.HigherQualification = { $in: status.split(",") };
    }

    if (tech) {
      query["skills.skill"] = { $in: tech.split(",") };
    }

    if (minExperience || maxExperience) {
      query.CurrentExperience = {};
      if (minExperience) query.CurrentExperience.$gte = parseInt(minExperience);
      if (maxExperience) query.CurrentExperience.$lte = parseInt(maxExperience);
    }

    // Add other filters similarly...

    // Get total count (can be optimized with estimatedDocumentsCount for large datasets)
    const total = await Candidate.countDocuments(query);

    // Fetch paginated data with only needed fields
    const candidates = await Candidate.find(query)
      .select(
        "FirstName LastName Email Phone CurrentExperience skills HigherQualification ImageData createdAt CurrentRole"
      )
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean for better performance

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

    let query = { tenantId: req.tenantId };

    if (search) {
      // Use regex for partial matching - consider text index for better performance
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { FirstName: searchRegex },
        { LastName: searchRegex },
        { Email: searchRegex },
        { Phone: searchRegex },
      ];
    }

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    const results = await Candidate.find(query)
      .select("FirstName LastName Email Phone CurrentExperience")
      .limit(parseInt(limit))
      .lean();

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

    const { actingAsUserId, actingAsTenantId } = res.locals.auth;

    if (!actingAsUserId || !actingAsTenantId) {
      return res
        .status(400)
        .json({ message: "OwnerId or TenantId ID is required" });
    }

    if (!id) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    let query = { _id: id };

    const candidate = await Candidate.findOne(query)
      // .populate("CurrentRole", "roleName roleLabel")
      .lean();

    const role = await RoleMaster.findOne({ roleName: candidate.CurrentRole })
      .select("roleName roleLabel")
      .lean();

    candidate.roleDetails = role || null;

    // console.log("candidate", candidate);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json(candidate);
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
