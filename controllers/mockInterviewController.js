// controllers/mockInterviewController.js
const { MockInterview } = require('../models/mockinterview');

exports.createMockInterview = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Create mock interview';

  try {

    const { title, skills, dateTime, interviewer, interviewType, duration, instructions, status, ownerId, tenantId, candidateName, higherQualification, currentExperience, technology, jobResponsibilities } = req.body;

    const mockInterview = new MockInterview({
      title,
      skills,
      dateTime,
      interviewer,
      interviewType,
      duration,
      instructions,
      status,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      jobResponsibilities,
      ownerId,
      tenantId
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
    const currentMockInterview = await MockInterview.findById(mockId).lean();

    if (!currentMockInterview) {
      console.error('MockInterview not found for ID:', mockId);
      return res.status(404).json({ message: 'MockInterview not founddd' });
    }
    

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(updateFields)
      .filter(([key, newValue]) => {
        const oldValue = currentMockInterview[key];

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
        oldValue: currentMockInterview[key],
        newValue,
      }));


    // If no changes detected, return early
    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, candidate details remain the same',
      });
    }


    const updatedMockInterview = await MockInterview.findByIdAndUpdate(
      mockId,
      updateFields,
      // { ...newMockinterviewData, ModifiedDate: new Date() },
      { new: true }
    );

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
