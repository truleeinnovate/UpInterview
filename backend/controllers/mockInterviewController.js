// controllers/mockInterviewController.js
const { MockInterview } = require("../models/mockinterview");

exports.createMockInterview = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create mock interview";

  try {
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
    } = req.body;

    // ✅ Generate custom mockInterviewCode like MINT-00001
    const lastMockInterview = await MockInterview.findOne({})
      .sort({ createdAt: -1 })
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
    const currentMockInterview = await MockInterview.findById(mockId);
    if (!currentMockInterview) {
      console.error("MockInterview not found for ID:", mockId);
      return res.status(404).json({ message: "MockInterview not found" });
    }

    // Track changes for logging
    const changes = [];

    // Handle skills update (merge and avoid duplicates)
    if (updateFields.skills && Array.isArray(updateFields.skills)) {
      const newSkills = updateFields.skills.filter(
        (skill) =>
          !currentMockInterview.skills.some(
            (existing) => existing.skill === skill.skill
          )
      );
      if (newSkills.length > 0) {
        changes.push({
          fieldName: "skills",
          oldValue: currentMockInterview.skills.map((s) => s.skill),
          newValue: [...currentMockInterview.skills, ...newSkills].map(
            (s) => s.skill
          ),
        });
        currentMockInterview.skills = [
          ...currentMockInterview.skills,
          ...newSkills,
        ];
      }
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

    // Update top-level fields
    const topLevelFields = [
      "candidateName",
      "higherQualification",
      "currentExperience",
      "technology",
      "jobDescription",
      "Role",
      "lastModifiedById",
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
