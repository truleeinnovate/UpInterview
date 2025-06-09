const { TenantQuestions } = require("../models/myQuestionList");


exports.newQuestion = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create question';
  try {
    const {
      ownerId,
      tenantId,
    } = req.body;
    console.log("Request body for new question:", req.body);
    
    const newquestion = new TenantQuestions(req.body);
    await newquestion.save();

    console.log("New question created successfully:", newquestion);
    
    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'info',
      action: {
        name: 'question_created',
        description: `Question was created`,
      },
      ownerId,
      parentId: newquestion._id,
      parentObject: 'TenantQuestion',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `Question was created successfully`,
    };
    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Create question',
      requestBody: req.body,
      status: 'success',
      message: 'New question created successfully',
      responseBody: newquestion,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'New question created successfully',
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create question',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
}

// edit question also add 

exports.updateQuestion = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update question';

  const questionId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;
  // const questionId = req.params.id;
  // const updateData = req.body; // Capture only fields being updated.

  if (!questionId) {
    return res.status(400).json({ message: "Question ID is required." });
  }

  try {
    const currentQuestion = await TenantQuestions.findById(questionId).lean();

  // Compare current values with updateFields to identify changes
  const changes = Object.entries(updateFields)
  .filter(([key, newValue]) => {
    const oldValue = currentQuestion[key];

       // Ignore unchanged values, including those with same reference
       if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        return JSON.stringify(oldValue) !== JSON.stringify(newValue); // Deep comparison for arrays
      }

    // Default comparison for strings, numbers, and other types
    return oldValue !== newValue;
  })
  .map(([key, newValue]) => ({
    fieldName: key,
    oldValue: currentQuestion[key],
    newValue,
  }));


// If no changes detected, return early
if (changes.length === 0) {
  return res.status(200).json({
    status: 'no_changes',
    message: 'No changes detected, candidate details remain the same',
  });
}

    const updatedQuestion = await TenantQuestions.findByIdAndUpdate(
      questionId,
      updateFields,
      { new: true } // Ensures the returned document is the updated one.
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      action: {
        name: 'question_updated',
        description: `Question was updated`,
      },
      ownerId,
      parentId: questionId,
      parentObject: 'TenantQuestion',
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
      processName: 'Update question',
      requestBody: req.body,
      message: 'Question updated successfully',
      status: 'success',
      responseBody: updatedQuestion,
    };


    res.status(201).json({
      status: "success",
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
  // Handle errors
  res.locals.logData = {
    tenantId,
    ownerId,
    processName: 'Update question',
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

// app.put('/newquestion/:id', async (req, res) => {
//   const questionId = req.params.id;
//   const { questionText,
//     questionType,
//     skill,
//     tags,
//     difficultyLevel,
//     score,
//     correctAnswer,
//     options,
//     programming,
//     hints,
//     isAutoAssessment,
//     autoAssessment,
//     isActive,
//     tenentListId,
//     charLimits } = req.body;

//   if (questionId) {
//     try {
//       const updatedQuestion = await TenentQuestions.findByIdAndUpdate(questionId, {
//         questionText,
//         questionType,
//         tenentListId,
//         skill,
//         tags,
//         difficultyLevel,
//         score,
//         correctAnswer,
//         options,
//         programming,
//         hints,
//         isAutoAssessment,
//         autoAssessment,
//         isActive,
//         charLimits

//       }, { new: true });

//       if (!updatedQuestion) {
//         return res.status(404).json({ message: "Question not found." });
//       }
//       res.status(200).json(updatedQuestion);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   } else {
//     res.status(400).json({ message: "Question ID is required." });
//   }
// });
