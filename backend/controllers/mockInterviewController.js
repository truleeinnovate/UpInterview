// controllers/mockInterviewController.js
const { MockInterview } = require('../models/mockinterview');

exports.createMockInterview = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Create mock interview';

  try {

    const {  skills, ownerId, tenantId, candidateName, 
      higherQualification, currentExperience, technology, Role,
      jobDescription,rounds, } = req.body;

    const mockInterview = new MockInterview({
      // title,
      skills,
      // dateTime,
      // interviewer,
      // interviewType,
      // duration,
      // instructions,
      Role,
      rounds,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      jobDescription,
      ownerId,
      tenantId,
      
    });
    const newMockInterview = await mockInterview.save();
    // const mockInterviews = await MockInterview.find({ ownerId });
    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'info',
      action: {
        name: 'mock_interview_created',
        description: `Mock interview was created successfully`,
      },
      ownerId,
      parentId: newMockInterview._id,
      parentObject: 'Mock interview',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `Mock interview was created successfully`,
    };

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Create mock interview',
      requestBody: req.body,
      message: 'Mock interview created successfully',
      status: 'success',
      responseBody: newMockInterview,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Mock interview created successfully',
      data: newMockInterview,
    });
  } catch (error) {
    console.error("Error creating mock interview:", error);
    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create mock interview',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    // Send error response
    res.status(500).json({
      status: 'error',
      message: 'Failed to create mock interview. Please try again later.',
      data: { error: error.message },
    });
  }
};

exports.updateMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update mock interview';
  const mockId = req.params.id;

  const { tenantId, ownerId, ...updateFields } = req.body;
  

  try {
    // const existingMockInterview = await MockInterview.findById(mockId);
    const currentMockInterview = await MockInterview.findById(mockId);

    if (!currentMockInterview) {
      console.error('MockInterview not found for ID:', mockId);
      return res.status(404).json({ message: 'MockInterview not founddd' });
    }
    

    // Compare current values with updateFields to identify changes
    // const changes = Object.entries(updateFields)
    //   .filter(([key, newValue]) => {
    //     const oldValue = currentMockInterview[key];

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
    //     oldValue: currentMockInterview[key],
    //     newValue,
    //   }));

     // Handle skills update (ensure no duplicates)
      // Handle skills update (ensure no duplicates)


   // Detect changes in the rounds subdocument
   const changes = [];
   const oldRounds = currentMockInterview.rounds || {}; // Ensure rounds exists
   const newRounds = updateFields.rounds || {
    interviewer: updateFields.interviewer,
    dateTime: updateFields.dateTime,
    duration: updateFields.duration,
    status: updateFields.status,
  }; // Change: Extract rounds from updateFields

  // Compare old and new rounds values to detect changes
  Object.entries(newRounds).forEach(([key, newValue]) => {
    const oldValue = oldRounds[key];
    if (newValue !== undefined && oldValue !== newValue) { // Only consider defined new values
      changes.push({
        fieldName: `rounds.${key}`,
        oldValue: oldValue === undefined ? 'undefined' : oldValue,
        newValue,
      });
    }
  });

  // currentMockInterview.rounds = {
  //   ...currentMockInterview.rounds.toObject(),
  //   ...newRounds,
  // };

   // Handle skills update (ensure no duplicates)
   if (updateFields.skills && Array.isArray(updateFields.skills)) {
     const uniqueSkills = updateFields.skills.filter(
       (skill) => !currentMockInterview.skills.some((existing) => existing.skill === skill.skill)
     );
     currentMockInterview.skills = [...currentMockInterview.skills, ...uniqueSkills];
     // Change: Detect changes in skills
     if (uniqueSkills.length > 0) {
       changes.push({
         fieldName: 'skills',
         oldValue: currentMockInterview.skills.map(s => s.skill),
         newValue: [...currentMockInterview.skills, ...uniqueSkills].map(s => s.skill),
       });
     }
   }

  // Update rounds subdocument directly
  if (Object.keys(newRounds).length > 0) {
    // Change: Special handling for reschedule
    if (newRounds.status === 'Reschedule') {
      newRounds.status = 'scheduled'; // Map 'Reschedule' to 'scheduled'
    } else if (newRounds.status === 'cancel') {
      newRounds.status = 'cancelled';
    }
    currentMockInterview.rounds = {
      ...currentMockInterview.rounds.toObject(),
      ...newRounds,
    };
    currentMockInterview.markModified('rounds');
  }

   // Update top-level fields
   if (updateFields.jobDescription) {
     if (currentMockInterview.jobDescription !== updateFields.jobDescription) {
       changes.push({
         fieldName: 'jobDescription',
         oldValue: currentMockInterview.jobDescription,
         newValue: updateFields.jobDescription,
       });
     }
     currentMockInterview.jobDescription = updateFields.jobDescription;
   }
   if (updateFields.Role) {
     if (currentMockInterview.Role !== updateFields.Role) {
       changes.push({
         fieldName: 'Role',
         oldValue: currentMockInterview.Role,
         newValue: updateFields.Role,
       });
     }
     currentMockInterview.Role = updateFields.Role;
   }
   if (updateFields.candidateName) {
     if (currentMockInterview.candidateName !== updateFields.candidateName) {
       changes.push({
         fieldName: 'candidateName',
         oldValue: currentMockInterview.candidateName,
         newValue: updateFields.candidateName,
       });
     }
     currentMockInterview.candidateName = updateFields.candidateName;
   }
   if (updateFields.higherQualification) {
     if (currentMockInterview.higherQualification !== updateFields.higherQualification) {
       changes.push({
         fieldName: 'higherQualification',
         oldValue: currentMockInterview.higherQualification,
         newValue: updateFields.higherQualification,
       });
     }
     currentMockInterview.higherQualification = updateFields.higherQualification;
   }
   if (updateFields.currentExperience) {
     if (currentMockInterview.currentExperience !== updateFields.currentExperience) {
       changes.push({
         fieldName: 'currentExperience',
         oldValue: currentMockInterview.currentExperience,
         newValue: updateFields.currentExperience,
       });
     }
     currentMockInterview.currentExperience = updateFields.currentExperience;
   }
   if (updateFields.technology) {
     if (currentMockInterview.technology !== updateFields.technology) {
       changes.push({
         fieldName: 'technology',
         oldValue: currentMockInterview.technology,
         newValue: updateFields.technology,
       });
     }
     currentMockInterview.technology =  updateFields.technology;
   }
   if (updateFields.modifiedBy) {
     currentMockInterview.modifiedBy = updateFields.modifiedBy;
   }
   if (updateFields.lastModifiedById) {
     currentMockInterview.lastModifiedById = updateFields.lastModifiedById;
   }

    // Perform the update
    // const updatedMockInterview = await MockInterview.findByIdAndUpdate(
    //   mockId,
    //   updateQuery,
    //   { new: true }  // Return the updated document
    // );
// Save the updated document
const updatedMockInterview = await currentMockInterview.save();
     

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      action: {
        name: 'mock_interview_updated',
        description: `Mock interview was updated successfully`,
      },
      ownerId,
      parentId: mockId,
      parentObject: 'Mock interview',
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
      processName: 'Update mock interview',
      requestBody: req.body,
      message: 'Mock interview created successfully',
      status: 'success',
      responseBody: updatedMockInterview,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Mock interview updated successfully',
      data: updatedMockInterview,
    });
  } catch (error) {
    console.error('Error updating MockInterview:', error);
    // Handle errors
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Create mock interview',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
      data: { error: error.message },

    });
  }
};
