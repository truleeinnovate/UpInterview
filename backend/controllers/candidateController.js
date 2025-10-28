//<-----v1.0.1---Venkatesh------add permission
const mongoose = require('mongoose');
// const { Candidate } = require('../models/Candidate/candidate.js');
const CandidatePosition = require('../models/CandidatePosition.js');
const { validateCandidateData, candidateUpdateSchema } = require('../validations/candidateValidation.js');
// const { hasPermission } = require("../middleware/permissionMiddleware");
const { Candidate } = require('../models/candidate.js');
const { Interview } = require('../models/Interview/Interview.js');
const { CandidateAssessment } = require('../models/Assessment/candidateAssessment.js');



 
// Add a new Candidate
const addCandidatePostCall = async (req, res) => {

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Candidate';

  let newCandidate = null;

  // console.log("req.body", req.body);

  try {

     // Joi validation
     const { isValid, errors } = validateCandidateData(req.body);
    //  console.log("isValid", isValid);
    //  console.log("errors", errors);
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
      ownerId,
      tenantId,
      Technology,
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "OwnerId field is required" });
    }

    //res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
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
      Phone,
      CountryCode,
      Date_Of_Birth,
      Gender,
      HigherQualification,
      UniversityCollege,
      CurrentExperience, // CurrentExperience is related to total experience in Ui mentioned. 
      CurrentRole,
      RelevantExperience,
      Technology,
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
      feedType: 'info',
      action: {
        name: 'candidate_created',
        description: `Candidate was created successfully`,
      },
      ownerId,
      parentId: newCandidate._id,
      parentObject: 'Candidate',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `Candidate was created successfully`,
    };

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Create Candidate',
      requestBody: req.body,
      message: 'Candidate created successfully',
      status: 'success',
      responseBody: newCandidate,
    };

    console.log("newCandidate response", newCandidate);

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Candidate created successfully',
      data: newCandidate,
    });
  } catch (error) {

    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Candidate',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    // Send error response
    res.status(500).json({
      status: 'error',
      message: 'Failed to create candidate. Please try again later.',
      data: { error: error.message },
    });
  }
};

// patch call 
const updateCandidatePatchCall = async (req, res) => {

  res.locals.loggedByController = true;
  res.locals.processName = 'Update Candidate';

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

        //console.log("effectivePermissions",res.locals?.effectivePermissions)
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

    

    // Compare current values with updateFields to identify changes
    // const changes = Object.entries(updateFields)
    //   .filter(([key, newValue]) => {
    //     const oldValue = currentCandidate[key];

    //     // Normalize PositionId (convert to string for comparison)
    //     if (key === "PositionId") {
    //       return oldValue?.toString() !== newValue?.toString();
    //     }

    //     // Handle arrays (e.g., `skills`) by comparing stringified versions
    //     if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    //       const normalizeArray = (array) =>
    //         array
    //           .map((item) => {
    //             const { _id, ...rest } = item; // Ignore _id for comparison
    //             return rest;
    //           })
    //           .sort((a, b) => a.skill.localeCompare(b.skill)); // Sort by `skill` or another key

    //       return (
    //         JSON.stringify(normalizeArray(oldValue)) !==
    //         JSON.stringify(normalizeArray(newValue))
    //       );
    //     }

    //     // Handle dates (convert to ISO strings for comparison)
    //     if (
    //       (oldValue instanceof Date || new Date(oldValue).toString() !== "Invalid Date") &&
    //       (newValue instanceof Date || new Date(newValue).toString() !== "Invalid Date")
    //     ) {
    //       return new Date(oldValue).toISOString() !== new Date(newValue).toISOString();
    //     }

    //     // Default comparison for strings, numbers, and other types
    //     return oldValue !== newValue;
    //   })
    //   .map(([key, newValue]) => ({
    //     fieldName: key,
    //     oldValue: currentCandidate[key],
    //     newValue,
    //   }));



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
            (oldValue instanceof Date || new Date(oldValue).toString() !== "Invalid Date") &&
            (newValue instanceof Date || new Date(newValue).toString() !== "Invalid Date")
          ) {
            return new Date(oldValue).toISOString() !== new Date(newValue).toISOString();
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
        status: 'no_changes',
        message: 'No changes detected, candidate details remain the same',
      });
    }

    // Perform the update
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        ...updateFields,
        updatedBy: ownerId 
      },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found after update" });
    }

    console.log("updatedCandidate ", updatedCandidate);
    


    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      // action: 'candidate_updated',
      action: {
        name: 'candidate_updated',
        description: `Candidate was updated`,
      },
      ownerId,
      parentId: candidateId,
      parentObject: 'Candidate',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: isEmptyValue(oldValue) ? isEmptyValue(newValue)
        : `${fieldName} updated from `
        , // '${oldValue}' to '${newValue}'
      })),
      history: changes,
    };
    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Candidate',
      requestBody: req.body,
      message: 'Candidate updated successfully',
      status: 'success',
      responseBody: updatedCandidate,
    };

    // Send response
    res.status(203).json({
      status: 'Updated successfully',
      message: 'Candidate updated successfully',
      data: updatedCandidate,
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Candidate',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};




const getCandidates = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;
    // console.log('[getCandidates] Query params:', { tenantId, ownerId });
    const query = tenantId ? { tenantId } : ownerId ? { ownerId } : {};
    // console.log('[getCandidates] Mongo query:', query);

    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
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
    console.log('[getCandidates] Candidates found:', candidates);
    res.json(candidates);
  } catch (error) {
    console.error('[getCandidates] Error:', error.message);
    res.status(500).json({ message: 'Error fetching candidates', error });
  }
};






const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      // console.log("❌ [getCandidateById] No ID provided");
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
  //   const canCreate =
  //   await hasPermission(res.locals?.effectivePermissions?.Candidates, 'View')
  //  //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'View')
  //   if (!canCreate) {
  //     return res.status(403).json({ message: 'Forbidden: missing Candidates.View permission' });
  //   }
    //-----v1.0.1--->

    const candidate = await Candidate.findById(id).lean();
    // console.log("✅ [getCandidateById] Candidate fetched:", candidate);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidatePositions = await CandidatePosition.aggregate([
      {
        $match: { candidateId: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: 'positions',
          localField: 'positionId',
          foreignField: '_id',
          as: 'positionDetails'
        }
      },
      {
        $unwind: {
          path: '$positionDetails',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    // console.log("📦 [getCandidateById] Candidate Positions:", candidatePositions);

    const positionDetails = candidatePositions.map(pos => ({
      positionId: pos.positionId,
      status: pos.status,
      interviewId: pos.interviewId,
      interviewRound: pos.interviewRound,
      interviewFeedback: pos.interviewFeedback,
      offerDetails: pos.offerDetails,
      applicationDate: pos.applicationDate,
      updatedAt: pos.updatedAt,
      positionInfo: pos.positionDetails ? {
        title: pos.positionDetails.title || '',
        companyname: pos.positionDetails.companyname || '',
        jobdescription: pos.positionDetails.jobdescription || '',
        minexperience: pos.positionDetails.minexperience || 0,
        maxexperience: pos.positionDetails.maxexperience || 0,
        skills: pos.positionDetails.skills || [],
        additionalnotes: pos.positionDetails.additionalnotes || '',
        rounds: pos.positionDetails.rounds || [],
        createdBy: pos.positionDetails.CreatedBy || '',
        lastModifiedById: pos.positionDetails.LastModifiedById || '',
        ownerId: pos.positionDetails.ownerId || '',
        tenantId: pos.positionDetails.tenantId || '',
        createdDate: pos.positionDetails.createdDate || ''
      } : null
    }));

    const response = {
      ...candidate,
      appliedPositions: positionDetails || []
    };

    console.log("candidate getCandidateById response",response);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("🔥 [getCandidateById] Error:", error);
    res.status(500).json({ message: "Error fetching candidate", error: error.message });
  }
};

// // Delete candidate by ID
// const deleteCandidate = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = "Delete Candidate";

//   const { id } = req.params;

//   try {
//     // // Permission check - adjust permission name as needed
//     // const canDelete = await hasPermission(res.locals?.effectivePermissions?.Candidates, 'Delete');
//     // if (!canDelete) {
//     //   return res.status(403).json({ message: 'Forbidden: missing Candidates.Delete permission' });
//     // }

//     // Validate ID format
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid candidate ID format'
//       });
//     }

//     // Find the candidate first to get details for logging
//     const candidate = await Candidate.findById(id);
    
//     if (!candidate) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Candidate not found'
//       });
//     };

//     console.log("candidate delete before",candidate);

//     // Store candidate data for logging before deletion
//     // const candidateData = {
//     //   name: `${candidate.FirstName} ${candidate.LastName}`,
//     //   email: candidate.Email,
//     //   id: candidate._id
//     // };

//     // Delete the candidate
//     const deletedCandidate = await Candidate.findByIdAndDelete(id);

//     console.log("candidate delete after",deletedCandidate);
    

//     if (!deletedCandidate) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Candidate not found or already deleted'
//       });
//     }

//     // Set feed data for activity feed
//     // res.locals.feedData = {
//     //   tenantId: candidate.tenantId,
//     //   feedType: "delete",
//     //   action: {
//     //     name: "candidate_deleted",
//     //     description: `Candidate "${candidate.FirstName} ${candidate.LastName}" was deleted`,
//     //   },
//     //   ownerId: candidate.ownerId,
//     //   parentId: id,
//     //   parentObject: "Candidate",
//     //   metadata: {
//     //     candidateName: `${candidate.FirstName} ${candidate.LastName}`,
//     //     candidateEmail: candidate.Email,
//     //     deletedAt: new Date().toISOString()
//     //   },
//     //   severity: "medium",
//     //   fieldMessage: [{
//     //     fieldName: "deletion",
//     //     message: `Candidate "${candidate.FirstName} ${candidate.LastName}" (${candidate.Email}) was permanently deleted`
//     //   }],
//     //   history: [{
//     //     fieldName: "deletion",
//     //     oldValue: `Candidate ${candidate._id}`,
//     //     newValue: null
//     //   }]
//     // };

//     // Set log data for auditing
//     // res.locals.logData = {
//     //   tenantId: candidate.tenantId,
//     //   ownerId: candidate.ownerId,
//     //   processName: "Delete Candidate",
//     //   requestBody: req.body,
//     //   status: "success",
//     //   message: "Candidate deleted successfully",
//     //   responseBody: {
//     //     deletedCandidate: candidateData,
//     //     deletionTime: new Date().toISOString()
//     //   },
//     // };

//     res.status(200).json({
//       status: 'success',
//       message: 'Candidate deleted successfully',
      
//     });

//   } catch (error) {
//     console.error('Error deleting candidate:', error);

//     // // Error logging
//     // res.locals.logData = {
//     //   tenantId: req.body?.tenantId,
//     //   ownerId: req.body?.ownerId,
//     //   processName: "Delete Candidate",
//     //   requestBody: req.body,
//     //   message: error.message,
//     //   status: "error",
//     //   error: error.stack
//     // };

//     res.status(500).json({
//       status: 'error',
//       message: 'Internal server error while deleting candidate',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
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
        status: 'error',
        message: 'Invalid candidate ID format'
      });
    }

    // Check if candidate exists
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found'
      });
    }

    // Check if candidate exists in Interview schema
    const existingInterview = await Interview.findOne({ candidateId: id });

    // Check if candidate exists in CandidateAssessment schema
    const existingAssessment = await CandidateAssessment.findOne({ candidateId: id });

    if (existingInterview || existingAssessment) {
      // Candidate linked elsewhere — do not delete
      return res.status(400).json({
        status: 'error',
        message: existingInterview
          ? 'Candidate cannot be deleted. Found in Interview records.'
          : 'Candidate cannot be deleted. Found in Candidate Assessment records.'
      });
    }

    // Safe to delete
    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found or already deleted'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Candidate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting candidate:', error);

    res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting candidate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




module.exports = { getCandidates, addCandidatePostCall, updateCandidatePatchCall, getCandidateById,deleteCandidate }






// // check that where we are using this code
// exports.getCandidateById = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.params.id);
//     if (!candidate) {
//       return res.status(404).json({ message: 'Candidate not found' });
//     }
//     res.json(candidate);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
