// v1.0.0  - mansoor - removed the sort by createdAt in the mock interview controller to save the mockinterview in the online
// v1.0.1 - Ashok - added the sort by _id in the createMockInterview controller
// v1.0.2 - Added backend validation for mock interview
// controllers/mockInterviewController.js
const { MockInterview } = require("../models/mockinterview");
const { validateMockInterview, mockInterviewUpdateSchema } = require("../validations/mockInterviewValidation");

exports.createMockInterview = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create mock interview";

  try {
    // Validate request data
    const validation = validateMockInterview(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validation.errors
      });
    }

    const {
      skills,
      ownerId,
      tenantId,
      candidateName,
      higherQualification,
      currentExperience,
      technology,
      Role,
      jobDescription,
      rounds,
      createdById,
      lastModifiedById,
    } = req.body;

    // ✅ Generate custom mockInterviewCode like MINT-00001
    const lastMockInterview = await MockInterview.findOne({})
      // <---------------- v1.0.0
      // .sort({ createdAt: -1 })
      // v1.0.1 ------------------------------------->
      .sort({_id:-1})
      // v1.0.1 <-------------------------------------
      // v1.0.0------------------->
      .select("mockInterviewCode")
      .lean();

    let nextNumber = 1;
    if (lastMockInterview?.mockInterviewCode) {
      const match = lastMockInterview.mockInterviewCode.match(/MINT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const mockInterviewCode = `MINT-${String(nextNumber).padStart(5, "0")}`;

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
      mockInterviewCode,
      createdBy: createdById || ownerId, // Map createdById to createdBy, fallback to ownerId
      updatedBy: lastModifiedById || createdById || ownerId, // Map lastModifiedById to updatedBy
    });
    const newMockInterview = await mockInterview.save();
    // const mockInterviews = await MockInterview.find({ ownerId });
    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "mock_interview_created",
        description: `Mock interview was created successfully`,
      },
      ownerId,
      parentId: newMockInterview._id,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Mock interview was created successfully`,
    };

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create mock interview",
      requestBody: req.body,
      message: "Mock interview created successfully",
      status: "success",
      responseBody: newMockInterview,
    };

    // Send response
    res.status(201).json({
      status: "success",
      message: "Mock interview created successfully",
      data: newMockInterview,
    });
  } catch (error) {
    console.error("Error creating mock interview:", error);
    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create mock interview",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to create mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};

exports.updateMockInterview = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update mock interview";
  const mockId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    // Validate update data
    const { error } = mockInterviewUpdateSchema.validate(updateFields, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        // Handle nested field paths
        let field = err.path.join(".");
        if (field.includes(".0.")) {
          field = field.replace(/\.\d+\./g, ".");
        }
        errors[field] = err.message;
      });
      
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors
      });
    }
    const currentMockInterview = await MockInterview.findById(mockId);
    if (!currentMockInterview) {
      console.error("MockInterview not found for ID:", mockId);
      return res.status(404).json({ message: "MockInterview not found" });
    }

    // Track changes for logging
    const changes = [];

    // Handle skills update (replace entirely - don't merge)
    if (updateFields.skills && Array.isArray(updateFields.skills)) {
      // Track changes for logging
      changes.push({
        fieldName: "skills",
        oldValue: currentMockInterview.skills.map((s) => s.skill),
        newValue: updateFields.skills.map((s) => s.skill),
      });
      
      // Replace the entire skills array with the new one
      currentMockInterview.skills = updateFields.skills;
    }

    // Handle rounds update
    if (
      updateFields.rounds &&
      Array.isArray(updateFields.rounds) &&
      updateFields.rounds.length > 0
    ) {
      const newRound = updateFields.rounds[0]; // Assume single round for now
      const oldRound = currentMockInterview.rounds || {};

      // Track changes in rounds fields
      Object.entries(newRound).forEach(([key, newValue]) => {
        const oldValue = oldRound[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            fieldName: `rounds.${key}`,
            oldValue: oldValue === undefined ? "undefined" : oldValue,
            newValue,
          });
        }
      });

      // Special handling for status
      if (newRound.status === "Reschedule") {
        newRound.status = "scheduled";
      } else if (newRound.status === "cancel") {
        newRound.status = "cancelled";
      }

      // Update interviewers (ensure it's an array of ObjectIds)
      if (newRound.interviewers) {
        currentMockInterview.rounds.interviewers = newRound.interviewers.map(
          (id) => id
        );
      }

      // Update other round fields
      currentMockInterview.rounds = {
        ...currentMockInterview.rounds,
        ...newRound,
      };
      currentMockInterview.markModified("rounds");
    }

    // Map frontend fields to schema fields
    if (updateFields.createdById) {
      updateFields.createdBy = updateFields.createdById;
      delete updateFields.createdById;
    }
    if (updateFields.lastModifiedById) {
      updateFields.updatedBy = updateFields.lastModifiedById;
      delete updateFields.lastModifiedById;
    }

    // Update top-level fields
    const topLevelFields = [
      "candidateName",
      "higherQualification",
      "currentExperience",
      "technology",
      "jobDescription",
      "Role",
      "createdBy",
      "updatedBy",
    ];
    topLevelFields.forEach((field) => {
      if (
        updateFields[field] !== undefined &&
        currentMockInterview[field] !== updateFields[field]
      ) {
        changes.push({
          fieldName: field,
          oldValue: currentMockInterview[field],
          newValue: updateFields[field],
        });
        currentMockInterview[field] = updateFields[field];
      }
    });

    // Save the updated document
    const updatedMockInterview = await currentMockInterview.save();

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: "update",
      action: {
        name: "mock_interview_updated",
        description: `Mock interview was updated successfully`,
      },
      ownerId,
      parentId: mockId,
      parentObject: "Mock interview",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
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
      processName: "Update mock interview",
      requestBody: req.body,
      message: "Mock interview updated successfully",
      status: "success",
      responseBody: updatedMockInterview,
    };

    // Send response
    res.status(200).json({
      status: "success",
      message: "Mock interview updated successfully",
      data: updatedMockInterview,
    });
  } catch (error) {
    console.error("Error updating MockInterview:", error);
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update mock interview",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    res.status(500).json({
      status: "error",
      message: "Failed to update mock interview. Please try again later.",
      data: { error: error.message },
    });
  }
};

// Validate mock interview data endpoint
exports.validateMockInterview = async (req, res) => {
  try {
    const { page } = req.params; // For page-wise validation
    const isPage1Only = page === "page1";
    
    // Validate the data
    const validation = validateMockInterview(req.body, isPage1Only);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Validation successful",
      data: validation.value
    });
  } catch (error) {
    console.error("Error validating mock interview:", error);
    return res.status(500).json({
      success: false,
      message: "Validation error",
      errors: { general: error.message }
    });
  }
};
