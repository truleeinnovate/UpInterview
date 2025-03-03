const { Candidate } = require('../models/candidate');

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching candidates', error });
  }
};


exports.createCandidate = async (req, res) => {
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
      skills,
      PositionId,
      ownerId,
      tenantId,
      CreatedBy,
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
      skills,
      PositionId,
      ownerId,
      tenantId,
      CreatedBy,
      CreatedDate: new Date(),
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


exports.updateCandidate = async (req, res) => {
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
      updateFields,
      { new: true } // Return the updated candidate document
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
// check that where we are using this code
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
