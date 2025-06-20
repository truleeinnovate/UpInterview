const { TenantQuestions } = require("../models/tenantQuestions");

const mongoose = require('mongoose');

// exports.newQuestion = async (req, res) => {
//   try {
//     const { suggestedQuestionId, tenantListId, ownerId, tenantId} = req.body;
//     console.log('req.body:',req.body)
    
//     if (!suggestedQuestionId || (!tenantId && !ownerId)) {
//       return res.status(400).json({ message: 'Missing required fields: suggestedQuestionId and either tenantId or ownerId' });
//     }

//     const questionData = {
//       suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId),
//       ...(tenantListId && { tenantListId: tenantListId.map(id => new mongoose.Types.ObjectId(id)) }),
//       ...(ownerId && { ownerId }),
//       ...(tenantId && { tenantId })
//     };

//     const newQuestion = await TenantQuestions.create(questionData);

//     res.locals.feedData = {
//       tenantId,
//       feedType: 'info',
//       action: {
//           name: 'question_created',
//           description: `Question was created`,
//       },
//       ownerId,
//       parentId: newQuestion._id,
//       parentObject: 'TenantQuestion',
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? 'high' : 'low',
//       message: `Question was created successfully`,
//   };

//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: 'Create question',
//       requestBody: req.body,
//       status: 'success',
//       message: 'New question created successfully',
//       responseBody: newQuestion,
//   };
//     res.status(201).json({
//       status: 'success',
//       message: 'Question created successfully',
//       data: newQuestion,
//     });
//   } catch (error) {
//         res.locals.logData = {
//             tenantId: req.body.tenantId,
//             ownerId: req.body.ownerId,
//             processName: 'Create question',
//             requestBody: req.body,
//             message: error.message,
//             status: 'error',
//         };
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };

exports.newQuestion = async (req, res) => {
  try {
    const { isEdit, ...questionBody } = req.body;
    const { suggestedQuestionId, tenantListId, ownerId, tenantId } = questionBody;
    
    if (!tenantId && !ownerId) {
      return res.status(400).json({ message: 'Missing required fields: either tenantId or ownerId' });
    }

    let questionData;
    //console.log('questionBody:',questionBody)
    // Remove invalid id
    if (!suggestedQuestionId) delete questionBody.suggestedQuestionId;

    if (!suggestedQuestionId){
      // Prepare question data with all fields
      questionData = {
        ...questionBody,
        ...(tenantListId && { tenantListId: tenantListId.map(id => new mongoose.Types.ObjectId(id)) }),
        ...(ownerId && { ownerId }),
        ...(tenantId && { tenantId })
      };
      
    } else{
      // Prepare question data with suggestedQuestionId
      questionData = {
        ...{suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId)},
        ...(tenantListId && { tenantListId: tenantListId.map(id => new mongoose.Types.ObjectId(id)) }),
        ...(ownerId && { ownerId }),
        ...(tenantId && { tenantId })
      };
    }
    //console.log('questionData:',questionData)

    const newQuestion = await TenantQuestions.create(questionData);
    //console.log('Created question:', newQuestion)

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
      message: 'Question created successfully',
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
  try {
    res.locals.loggedByController = true;
    res.locals.processName = 'Update question';

    //console.log('req.params.id:',req.params.id)

    const questionId = req.params.id;
    //console.log('questionId:',questionId)
    const { tenantId, ownerId, tenantListId, ...updateFields } = req.body;
    // console.log('suggestedQuestionId:',updateFields.suggestedQuestionId)
    console.log('updateFields:',updateFields)

    // Remove invalid id
    if (!updateFields.suggestedQuestionId) delete updateFields.suggestedQuestionId;
    
    const question = await TenantQuestions.findById(questionId);
    
    if (!question) return res.status(404).json({ message: 'Question not found' });

  
    
    // Remove duplicates and convert to ObjectIds
    const uniqueListIds = [...new Set(tenantListId)].map(id => new mongoose.Types.ObjectId(id));
    // apply any other fields being edited
    Object.assign(question, updateFields);

    // if (tenantListId) {
    //       const uniqueListIds = [...new Set(tenantListId)]
    //                             .map(id => new mongoose.Types.ObjectId(id));
    //       question.tenantListId = uniqueListIds;
    //     }
      
    //     // apply any other fields being edited
    //     Object.assign(question, updateFields);

    const changes = [
      {
        fieldName: 'tenantListId',
        oldValue: question.tenantListId.map(String),
        newValue: uniqueListIds.map(String)
      }
    ];
    
    question.tenantListId = uniqueListIds;
    await question.save();

    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      action: {
        name: 'question_updated',
        description: `Question was updated`,
      },
      ownerId,
      parentId: question._id,
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
      responseBody: question,
    };
    
    res.status(200).json({
      status: 'success',
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    const { tenantId, ownerId } = req.body;
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

exports.getQuestionBySuggestedId = async (req, res) => {
  const suggestedQuestionId = req.params.suggestedQuestionId;
  const { tenantId, ownerId } = req.query;

  if (!suggestedQuestionId || (!tenantId && !ownerId)) {
    return res.status(400).json({ message: 'Missing required fields: suggestedQuestionId and either tenantId or ownerId' });
  }

  try {
    let question;
    const query = {
      suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId)
    };

    if (tenantId) {
      query.tenantId = tenantId;
      question = await TenantQuestions.findOne(query).populate('tenantListId');
    } else if (ownerId) {
      query.ownerId = ownerId;
      question = await TenantQuestions.findOne(query).populate('tenantListId');
    }

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Ensure list IDs are strings
    const responseData = {
      ...question.toObject(),
      tenantListId: question.tenantListId.map(id => id._id?.toString() || id.toString())
    };

    res.status(200).json({
      status: 'success',
      message: 'Question retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
