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
const Role = require("../models/RolesData.js");
const { RoleMaster } = require("../models/MasterSchemas/RoleMaster.js");
const { Interview } = require("../models/Interview/Interview.js");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");
const { Users } = require("../models/Users");
const { Application } = require("../models/Application.js");
const { ScreeningResult } = require("../models/ScreeningResult.js");

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
      professionalSummary,
      keyAchievements,
      workExperience,
      location,
      // maxSalary,
      // minSalary,
      annualSalary,
      languages,
      certifications,
      noticePeriod

    } = req.body;

    // Get ownerId and tenantId from request body
    console.log("🔍 [addCandidatePostCall] Extracting ownerId and tenantId");
    const ownerId = req.body.ownerId;
    const tenantId = req.body.tenantId;
    console.log(
      "📋 [addCandidatePostCall] OwnerId:",
      ownerId,
      "TenantId:",
      tenantId,
    );

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
      location,
      // minSalary: minSalary ? Number(minSalary) : null,
      // maxSalary: maxSalary ? Number(maxSalary) : null,
      annualSalary: annualSalary ? Number(annualSalary) : null,
      languages: Array.isArray(languages) ? languages : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      noticePeriod,
    });

    await newCandidate.save();

    console.log("✅ [addCandidatePostCall] Candidate saved successfully");

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
      professionalSummary,
      keyAchievements,
      workExperience,
      ImageData,
      resume: resumeFile,
      source: source || "MANUAL",
      isActive: true,
      uploadedAt: new Date(),
      ownerId,
      tenantId,
      createdBy: ownerId,

      // ─── All screening/parsed data goes here ────────
      parsedJson: req.body.screeningData || req.body.parsedJson || {},
    });

    await newResume.save();

    console.log("✅ [addCandidatePostCall] Resume saved successfully");

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
      data: {
        candidate: newCandidate,
        resumeId: newResume._id.toString()  // ← add this
      }
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

    // Fetch active resume for comparison
    const currentResume = await Resume.findOne({ candidateId, isActive: true }).lean();

    // ✅ Utility function to detect empty values
    const isEmptyValue = (val) => {
      return (
        val === null ||
        val === undefined ||
        (typeof val === "string" && val.trim() === "")
      );
    };

    // Helper to normalize arrays for comparison
    const normalizeArray = (array) => {
      if (!Array.isArray(array)) return [];
      return array
        .filter(item => item && typeof item === 'object') // skip invalid items
        .map((item) => {
          const { _id, ...rest } = item;
          return rest;
        })
        .sort((a, b) => {
          // Safe localeCompare – fallback to string comparison if skill missing
          const aSkill = (a.skill || '').toString();
          const bSkill = (b.skill || '').toString();
          return aSkill.localeCompare(bSkill);
        });
    };

    // Helper to check if two values are different
    const isDifferent = (oldValue, newValue, key) => {
      // Skip when both old & new are empty/undefined
      if (isEmptyValue(oldValue) && isEmptyValue(newValue)) {
        return false;
      }

      // Normalize PositionId
      if (key === "PositionId") {
        return oldValue?.toString() !== newValue?.toString();
      }

      // Handle arrays (skills, languages, certifications, workExperience)
      if (Array.isArray(oldValue) || Array.isArray(newValue)) {
        const oldArr = Array.isArray(oldValue) ? oldValue : [];
        const newArr = Array.isArray(newValue) ? newValue : [];

        // Simple arrays of strings (languages, certifications)
        if (key === 'languages' || key === 'certifications') {
          return JSON.stringify(oldArr.sort()) !== JSON.stringify(newArr.sort());
        }

        // Object arrays (skills, workExperience)
        return (
          JSON.stringify(normalizeArray(oldArr)) !==
          JSON.stringify(normalizeArray(newArr))
        );
      }

      // Handle dates
      if (
        (oldValue instanceof Date || (typeof oldValue === 'string' && !isNaN(Date.parse(oldValue)))) &&
        (newValue instanceof Date || (typeof newValue === 'string' && !isNaN(Date.parse(newValue))))
      ) {
        // Should check if it's actually a date field or just looks like one?
        // For now, if both parse to valid dates, compare ISO strings
        // But be careful with non-date strings that might parse as dates (though unlikely with Joi validation)
        // Better to rely on specific key names if possible, but generic is okay for now if defensive.
        // Actually, let's rely on loose equality for strings if date parsing is ambiguous.
        // But Date objects need .getTime() or .toISOString()
        const d1 = new Date(oldValue);
        const d2 = new Date(newValue);
        if (!isNaN(d1) && !isNaN(d2)) {
          return d1.toISOString() !== d2.toISOString();
        }
      }

      // Default comparison
      return oldValue !== newValue;
    };


    // Separate candidate fields and resume fields
    const candidateFields = [
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "CountryCode",
      "Date_Of_Birth",
      "Gender",
      "externalId",
      "linkedInUrl",
      "location",
      // "maxSalary",
      // "minSalary",
      "annualSalary",
      "languages",
      "certifications",
      "noticePeriod"
    ];
    const resumeFields = [
      "HigherQualification",
      "UniversityCollege",
      "CurrentExperience",
      "RelevantExperience",
      "CurrentRole",
      "skills",
      "ImageData",
      "resume",
      "source",
      "professionalSummary",
      "keyAchievements",
      "workExperience",
    ];

    const candidateUpdateData = { updatedBy: ownerId };
    const resumeUpdateData = { updatedBy: ownerId };

    const candidateChanges = [];
    const resumeChanges = [];

    // Process Candidate Fields
    Object.keys(updateFields).forEach((key) => {
      if (candidateFields.includes(key)) {
        const newValue = updateFields[key];
        const oldValue = currentCandidate[key];

        if (isDifferent(oldValue, newValue, key)) {
          candidateUpdateData[key] = newValue;
          candidateChanges.push({ fieldName: key, oldValue, newValue });
        }
      }
      // Process Resume Fields
      else if (resumeFields.includes(key)) {
        const newValue = updateFields[key];
        // Compare against currentResume if it exists, otherwise it's a change (new)
        const oldValue = currentResume ? currentResume[key] : undefined;

        // For ImageData and resume file, we might need special handling if they are objects
        // But assuming isDifferent handles internal object structure or we rely on reference if not deep equal
        // For simple fix, let's trust isDifferent or modify it to handle deep object compare if needed.
        // The normalizeArray handles skills/workExp. 
        // ImageData/resume are objects { path, filename ... }. Strict equality check won't work if new object created.
        // But usually file upload returns new object only if new file uploaded.
        // If "resume" field is passed as same object structure, JSON.stringify might work.
        // Let's add object comparison to isDifferent if needed.

        let changed = false;
        if (!currentResume) {
          changed = !isEmptyValue(newValue); // If no resume, any non-empty value is a change
        } else {
          // Deep compare for objects like ImageData, resume
          if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue) && !(newValue instanceof Date)) {
            // Excluding special keys if any?
            const oldObj = oldValue || {};
            // Simple JSON stringify for now - might be expensive but safe for these small objects
            changed = JSON.stringify(newValue) !== JSON.stringify(oldObj);
          } else {
            changed = isDifferent(oldValue, newValue, key);
          }
        }

        if (changed) {
          resumeUpdateData[key] = newValue;
          resumeChanges.push({ fieldName: key, oldValue, newValue });
        }
      }
    });

    // If no changes detected at all, return early
    if (candidateChanges.length === 0 && resumeChanges.length === 0) {
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected",
        data: null,
      });
    }

    let updatedCandidate = currentCandidate;

    // Update Candidate if there are candidate changes
    if (candidateChanges.length > 0) {
      updatedCandidate = await Candidate.findByIdAndUpdate(
        candidateId,
        candidateUpdateData,
        { new: true, runValidators: true },
      );

      if (!updatedCandidate) {
        return res
          .status(404)
          .json({ message: "Candidate not found after update" });
      }
    }

    // Update or create Resume if resume changes are present
    // Check keys > 1 because updatedBy is always there
    if (Object.keys(resumeUpdateData).length > 1) {

      if (currentResume) {
        // Deactivate the current resume
        await Resume.findByIdAndUpdate(currentResume._id, { isActive: false });

        // Create a new resume version merging old data with new updates
        // We need to exclude _id and createdAt/updatedAt from the old resume copy
        const { _id, createdAt, updatedAt, __v, ...oldResumeData } = currentResume; // currentResume is lean()

        const newResume = new Resume({
          ...oldResumeData,      // Copy existing data
          ...resumeUpdateData,   // Overwrite with new updates
          isActive: true,        // Set as active
          version: (currentResume.version || 1) + 1, // Increment version
          updatedBy: ownerId,     // Ensure updatedBy is set
          uploadedAt: new Date() // Set new upload date
        });

        await newResume.save();
        console.log(`✅ [updateCandidatePatchCall] New Resume version ${(currentResume.version || 1) + 1} created successfully`);

        // Clone existing ScreeningResults for the new resume version
        try {
          const previousScreeningResults = await ScreeningResult.find({ resumeId: currentResume._id });

          if (previousScreeningResults.length > 0) {
            const newScreeningResults = previousScreeningResults.map(result => {
              const { _id, createdAt, updatedAt, __v, ...data } = result.toObject();
              return {
                ...data,
                resumeId: newResume._id,
                // Optionally mark that this was carried over?
              };
            });

            await ScreeningResult.insertMany(newScreeningResults);
            console.log(`✅ [updateCandidatePatchCall] Carried over ${newScreeningResults.length} screening results to new resume version`);
          }
        } catch (srError) {
          console.error("⚠️ [updateCandidatePatchCall] Failed to clone screening results:", srError);
          // Non-blocking error - we still return success for candidate update
        }
      } else {
        // If no active resume exists, create a new one (version 1)
        const newResume = new Resume({
          candidateId,
          ...resumeUpdateData,
          isActive: true,
          version: 1,
          uploadedAt: new Date(),
          ownerId,
          tenantId,
          createdBy: ownerId
        });
        await newResume.save();
        console.log("✅ [updateCandidatePatchCall] New Resume created successfully (Version 1)");
      }
    }

    const allChanges = [...candidateChanges, ...resumeChanges];

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
      fieldMessage: allChanges.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: isEmptyValue(oldValue)
          ? isEmptyValue(newValue) // Should ideally say "set to" or similar
            ? `${fieldName} updated`
            : `${fieldName} set to ${JSON.stringify(newValue)}`
          : `${fieldName} updated`, // Simplified message
      })),
      history: allChanges,
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

    // Search - split multi-word queries for AND matching across name fields
    if (search) {
      // Robustly parse search terms: handle array/string, split by space/comma, decode URI
      let searchString = Array.isArray(search) ? search.join(" ") : String(search);
      try {
        searchString = decodeURIComponent(searchString);
      } catch (e) {
        // ignore decode error
      }

      const searchWords = searchString
        .replace(/,/g, " ") // Treat commas as spaces
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (searchWords.length > 0) {
        // Each word must match at least one field (AND across words)
        candidateQuery.$and = searchWords.map(word => {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const wordRegex = new RegExp(escapedWord, "i");
          return {
            $or: [
              { FirstName: wordRegex },
              { LastName: wordRegex },
              { Email: wordRegex },
              { Phone: wordRegex },
            ]
          };
        });
      }
      //console.log('🔍 [Candidate Search] Terms:', searchWords, 'Query:', JSON.stringify(candidateQuery.$and, (k, v) => v instanceof RegExp ? v.toString() : v));
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
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "activeResume",
        },
      },
      // Unwind the resume (will be null if no active resume)
      {
        $unwind: {
          path: "$activeResume",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Add resume-based filters
    if (status) {
      pipeline.push({
        $match: {
          "activeResume.HigherQualification": { $in: status.split(",") },
        },
      });
    }

    if (tech) {
      pipeline.push({
        $match: { "activeResume.skills.skill": { $in: tech.split(",") } },
      });
    }

    if (minExperience || maxExperience) {
      const expMatch = {};
      if (minExperience) expMatch.$gte = parseInt(minExperience);
      if (maxExperience) expMatch.$lte = parseInt(maxExperience);
      pipeline.push({
        $match: { "activeResume.CurrentExperience": expMatch },
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
        CurrentExperience: {
          $ifNull: ["$activeResume.CurrentExperience", "$CurrentExperience"],
        },
        skills: { $ifNull: ["$activeResume.skills", "$skills"] },
        HigherQualification: {
          $ifNull: [
            "$activeResume.HigherQualification",
            "$HigherQualification",
          ],
        },
        ImageData: { $ifNull: ["$activeResume.ImageData", "$ImageData"] },
        CurrentRole: { $ifNull: ["$activeResume.CurrentRole", "$CurrentRole"] },
        professionalSummary: { $ifNull: ["$activeResume.professionalSummary", "$professionalSummary"] },
        keyAchievements: { $ifNull: ["$activeResume.keyAchievements", "$keyAchievements"] },
        workExperience: { $ifNull: ["$activeResume.workExperience", "$workExperience"] },
      },
    });

    // Sort, skip, and limit
    pipeline.push(
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    );

    // Get total count
    const countPipeline = pipeline.slice(
      0,
      pipeline.findIndex((p) => p.$sort),
    );
    countPipeline.push({ $count: "total" });

    const [candidates, countResult] = await Promise.all([
      Candidate.aggregate(pipeline),
      Candidate.aggregate(countPipeline),
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
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "activeResume",
        },
      },
      {
        $unwind: {
          path: "$activeResume",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project fields with resume data
      {
        $project: {
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Phone: 1,
          CurrentExperience: "$activeResume.CurrentExperience",
        },
      },
      { $limit: parseInt(limit) },
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

    const candidate = await Candidate.findOne(query).lean();

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Fetch active resume for the candidate
    const activeResume = await Resume.findOne({
      candidateId: id,
      isActive: true,
    }).lean();

    // Get role details from resume's CurrentRole
    let roleDetails = null;
    if (activeResume?.CurrentRole) {
      // roleDetails = await Role.findOne({
      //   roleName: activeResume.CurrentRole,
      // })
      //   .select("roleName roleLabel")
      //   .lean();
      roleDetails = await RoleMaster.findOne({
        roleName: activeResume.CurrentRole,
      })
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
        resume: activeResume.resume,
        professionalSummary: activeResume.professionalSummary,
        keyAchievements: activeResume.keyAchievements,
        workExperience: activeResume.workExperience,
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

// ----------------------------- Uniqueness validation apis for Email, phone, linkedin ---------------------------------
// Check if Email exists within a specific Tenant
const checkEmailExists = async (req, res) => {
  try {
    const { email, tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    // Filter by both field and tenantId
    const exists = await Candidate.exists({ Email: email, tenantId });
    res.status(200).json({ exists: !!exists });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking email", error: error.message });
  }
};

// Check if Phone exists within a specific Tenant
const checkPhoneExists = async (req, res) => {
  try {
    const { phone, tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    const exists = await Candidate.exists({ Phone: phone, tenantId });
    res.status(200).json({ exists: !!exists });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking phone", error: error.message });
  }
};

// Check if LinkedIn URL exists within a specific Tenant
const checkLinkedInExists = async (req, res) => {
  try {
    const { url, tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    const exists = await Candidate.exists({ linkedInUrl: url, tenantId });
    res.status(200).json({ exists: !!exists });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking LinkedIn", error: error.message });
  }
};
// ----------------------------- Uniqueness validation apis for Email, phone, linkedin ---------------------------------


// Get all resumes for a candidate
const getCandidateResumes = async (req, res) => {
  try {
    const { id } = req.params;
    const resumes = await Resume.find({ candidateId: id })
      .sort({ _id: -1 })
      .lean();

    res.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Error fetching resumes", error: error.message });
  }
};

// Set a resume as active
const setResumeActive = async (req, res) => {
  try {
    const { candidateId, resumeId } = req.body;

    // Deactivate all resumes for this candidate
    await Resume.updateMany(
      { candidateId },
      { $set: { isActive: false } }
    );

    // Activate the selected resume
    const updatedResume = await Resume.findByIdAndUpdate(
      resumeId,
      { $set: { isActive: true } },
      { new: true }
    );

    res.json({ message: "Resume set as active", resume: updatedResume });
  } catch (error) {
    console.error("Error setting active resume:", error);
    res.status(500).json({ message: "Error updating resume status", error: error.message });
  }
};

// Get stats for a candidate (applications, resumes, interviews)
const getCandidateStats = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = new mongoose.Types.ObjectId(id);

    const [applicationCount, resumeCount, interviewCount] = await Promise.all([
      Application.countDocuments({ candidateId }),
      Resume.countDocuments({ candidateId }),
      Interview.countDocuments({ candidateId, status: 'Completed' }) // Assuming 'Attended' means Completed
    ]);

    res.json({
      applications: applicationCount,
      resumes: resumeCount,
      interviews: interviewCount
    });
  } catch (error) {
    console.error("Error fetching candidate stats:", error);
    res.status(500).json({ message: "Error fetching candidate stats", error: error.message });
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
  // uniqueness validation
  checkEmailExists,
  checkPhoneExists,
  checkLinkedInExists,
  getCandidateResumes,
  setResumeActive,
  getCandidateStats,
};
