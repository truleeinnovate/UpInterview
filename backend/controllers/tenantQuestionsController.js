const { TenantQuestions } = require("../models/tenantQuestions");


const mongoose = require('mongoose');

exports.newQuestion = async (req, res) => {
    res.locals.loggedByController = true;
    res.locals.processName = 'Create question';
    try {
        const {
            ownerId,
            tenantId,
            suggestedQuestionId,
            tenantListId = [],
            isCustom = false,
        } = req.body;

        if (!ownerId || !tenantId || (!suggestedQuestionId && !isCustom)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate tenantListId entries
        if (tenantListId.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: 'Invalid tenantListId values' });
        }

        const newQuestion = new TenantQuestions({
            ...req.body,
            tenantListId: Array.isArray(tenantListId) ? tenantListId : [tenantListId],
            createdBy: ownerId,
            updatedBy: ownerId,
        });

        await newQuestion.save();

        console.log('New question created successfully:', newQuestion);

        res.locals.feedData = {
            tenantId,
            feedType: 'info',
            action: {
                name: 'question_created',
                description: `Question was created`,
            },
            ownerId,
            parentId: newQuestion._id,
            parentObject: 'TenantQuestion',
            metadata: req.body,
            severity: res.statusCode >= 500 ? 'high' : 'low',
            message: `Question was created successfully`,
        };

        res.locals.logData = {
            tenantId,
            ownerId,
            processName: 'Create question',
            requestBody: req.body,
            status: 'success',
            message: 'New question created successfully',
            responseBody: newQuestion,
        };

        res.status(201).json({
            status: 'success',
            message: 'New question created successfully',
            data: newQuestion,
        });
    } catch (error) {
        res.locals.logData = {
            tenantId: req.body.tenantId,
            ownerId: req.body.ownerId,
            processName: 'Create question',
            requestBody: req.body,
            message: error.message,
            status: 'error',
        };
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// edit question also add 
// Helper function to validate ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.updateQuestion = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update question';

  const questionId = req.params.id;
  const { tenantId, ownerId, tenantListId, ...updateFields } = req.body;
  console.log('tenant-----------',questionId)

  if (!questionId) {
    return res.status(400).json({ message: "Question ID is required." });
  }

  try {
    const currentQuestion = await TenantQuestions.findById(questionId).lean();
    if (!currentQuestion) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Filter out any invalid IDs
    const validListIds = tenantListId.filter(isValidObjectId);
    if (validListIds.length !== tenantListId.length) {
      throw new Error('Some of the provided list IDs are invalid');
    }

    // Prepare update data
    const updateData = { ...updateFields, updatedBy: ownerId };
    if (tenantListId) {
      updateData.tenantListId = Array.isArray(tenantListId) ? tenantListId : [tenantListId];
    }

    // Compare current values with updateData to identify changes
    const changes = Object.entries(updateData)
      .filter(([key, newValue]) => {
        const oldValue = currentQuestion[key];
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          return JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort());
        }
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentQuestion[key],
        newValue,
      }));

    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, question details remain the same',
      });
    }

    const updatedQuestion = await TenantQuestions.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true }
    ).populate('tenantListId');

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

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update question',
      requestBody: req.body,
      message: 'Question updated successfully',
      status: 'success',
      responseBody: updatedQuestion,
    };

    res.status(200).json({
      status: "success",
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update question',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// exports.updateByOwner = async (req, res) => {
//   const { tenantListId } = req.body;
//   const { ownerId } = req.query;
//   console.log('tenantlistyid ----', tenantListId);
//   console.log('owner -----',ownerId)

//   if (!tenantListId || !ownerId) {
//     return res.status(400).json({ message: 'Missing required fields: tenantListId and ownerId' });
//   }

//   try {
//     const updatedOwner = await TenantQuestions.updateMany(
//       { ownerId },
//       {
//         $push: { tenantListId },
//         $set: { updatedBy: ownerId },
//       },
//       { new: true }
//     );

//     if (!updatedOwner) {
//       return res.status(404).json({ message: 'No owner found with given Id' });
//     }

//     const changes = Object.keys(req.body).map((key) => {
//       return {
//         fieldName: key,
//         oldValue: updatedOwner[key],
//         newValue: req.body[key],
//       };
//     });

//     const logData = {
//       tenantId: ownerId,
//       ownerId,
//       processName: 'Update owner',
//       requestBody: req.body,
//       message: 'Owner updated successfully',
//       status: 'success',
//       responseBody: updatedOwner,
//       fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
//         fieldName,
//         message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
//       })),
//     };

//     res.locals.logData = logData;

//     res.status(200).json({
//       status: "success",
//       message: "Owner updated successfully",
//       data: updatedOwner,
//     });
//   } catch (error) {
//     res.locals.logData = {
//       tenantId: ownerId,
//       ownerId,
//       processName: 'Update owner',
//       requestBody: req.body,
//       message: error.message,
//       status: 'error',
//     };
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };


exports.getQuestionBySuggestedId = async (req, res) => {
  // res.locals.loggedByController = true;
  // res.locals.processName = 'Get question by suggested ID';
  const suggestedQuestionId = req.params.suggestedQuestionId;
  const { tenantId, ownerId } = req.query;
  console.log('suggestedQuestionId:', suggestedQuestionId);
  console.log('tenantId:', tenantId);
  console.log('ownerId:', ownerId);

  if (!suggestedQuestionId || (!tenantId && !ownerId)) {
    return res.status(400).json({ message: 'Missing required fields: suggestedQuestionId and either tenantId or ownerId' });
  }

  try {
    const query = {
      suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId),
    };
    console.log('query:', query);

    if (tenantId) {
      query.tenantId = tenantId;
    } else if (ownerId) {
      query.ownerId = ownerId;
    }

    const question = await TenantQuestions.findOne(query).populate('tenantListId');
    console.log('question:', question);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Question retrieved successfully',
      data: question,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};