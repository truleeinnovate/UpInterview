const mongoose = require('mongoose');
const { Candidate } = require('../models/candidate.js');
const CandidatePosition = require('../models/CandidatePosition.js');


// patch call 
const updateCandidatePatchCall = async (req, res) => {

  res.locals.loggedByController = true;
  res.locals.processName = 'Update Candidate';

  const candidateId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    // feeds related data
    const currentCandidate = await Candidate.findById(candidateId).lean();

    if (!currentCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(updateFields)
      .filter(([key, newValue]) => {
        const oldValue = currentCandidate[key];

        // Normalize PositionId (convert to string for comparison)
        if (key === "PositionId") {
          return oldValue?.toString() !== newValue?.toString();
        }

        // Handle arrays (e.g., `skills`) by comparing stringified versions
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          const normalizeArray = (array) =>
            array
              .map((item) => {
                const { _id, ...rest } = item; // Ignore _id for comparison
                return rest;
              })
              .sort((a, b) => a.skill.localeCompare(b.skill)); // Sort by `skill` or another key

          return (
            JSON.stringify(normalizeArray(oldValue)) !==
            JSON.stringify(normalizeArray(newValue))
          );
        }

        // Handle dates (convert to ISO strings for comparison)
        if (
          (oldValue instanceof Date || new Date(oldValue).toString() !== "Invalid Date") &&
          (newValue instanceof Date || new Date(newValue).toString() !== "Invalid Date")
        ) {
          return new Date(oldValue).toISOString() !== new Date(newValue).toISOString();
        }

        // Default comparison for strings, numbers, and other types
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
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
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
    res.status(201).json({
      status: 'success',
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


// Add a new Candidate
const addCandidatePostCall = async (req, res) => {

  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Candidate';

  let newCandidate = null;

  try {
    const {
      FirstName,
      LastName,
      Email,
      Phone,
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
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({ error: "OwnerId field is required" });
    }

    newCandidate = new Candidate({
      FirstName,
      LastName,
      Email,
      Phone,
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




const getCandidates = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;
    // console.log('[getCandidates] Query params:', { tenantId, ownerId });
    const query = tenantId ? { tenantId } : ownerId ? { ownerId } : {};
    // console.log('[getCandidates] Mongo query:', query);
    const candidates = await Candidate.find(query);
    // console.log('[getCandidates] Candidates found:', candidates.length);
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

    const candidate = await Candidate.findById(id);
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
      ...candidate.toObject(),
      appliedPositions: positionDetails || []
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("🔥 [getCandidateById] Error:", error);
    res.status(500).json({ message: "Error fetching candidate", error: error.message });
  }
};




module.exports = { getCandidates, addCandidatePostCall, updateCandidatePatchCall, getCandidateById }






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
