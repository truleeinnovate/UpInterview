//<---v1.0.0---Venkatesh---added tenantInterviewQuestions and tenantAssessmentQuestions
//<----v1.0.1----Venkatesh---add validations

const { TenantQuestions } = require("../models/tenantQuestions");
const {
  TenantInterviewQuestions,
} = require("../models/QuestionBank/tenantInterviewQuestions");
const {
  TenantAssessmentQuestions,
} = require("../models/QuestionBank/tenantAssessmentQuestions");
const QuestionbankFavList = require("../models/QuestionBank/tenantQuestionsListNames.js");

const mongoose = require("mongoose");
//<----v1.0.1----
const {
  validateCreateTenantQuestion,
  validateUpdateTenantQuestion,
} = require("../validations/tenantQuestionValidation");
const { hasPermission } = require("../middleware/permissionMiddleware");
//----v1.0.1---->

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
    const {
      suggestedQuestionId,
      tenantListId,
      ownerId,
      tenantId,
      isInterviewType,
    } = questionBody; //<---v1.0.0---
    //console.log("interviewType=",isInterviewType);

    //<----v1.0.1----
    // Joi validation (simple and aligned with frontend rules)
    const { errors, isValid } = validateCreateTenantQuestion(questionBody);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    //----v1.0.1---->

    if (!tenantId && !ownerId) {
      return res.status(400).json({
        message: "Validation failed",
        errors: {
          tenantId: "Either tenantId or ownerId is required",
          ownerId: "Either ownerId or tenantId is required",
        },
      });
    }

    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    // const canCreate =
    // await hasPermission(res.locals?.effectivePermissions?.QuestionBank, 'Create')
    // //await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Create')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing QuestionBank.Create permission' });
    // }
    //-----v1.0.1--->

    let questionData;
    //console.log('questionBody:',questionBody)
    // Remove invalid id
    if (!suggestedQuestionId) delete questionBody.suggestedQuestionId;

    if (!suggestedQuestionId) {
      // Prepare question data with all fields
      questionData = {
        ...questionBody,
        isInterviewQuestionType: isInterviewType,
        ...(tenantListId && {
          tenantListId: tenantListId.map(
            (id) => new mongoose.Types.ObjectId(id),
          ),
        }),
        ...(ownerId && { ownerId }),
        ...(tenantId && { tenantId }),
      };
    } else {
      // Prepare question data with suggestedQuestionId
      questionData = {
        ...{
          suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId),
        },
        isInterviewQuestionType: isInterviewType,
        ...(tenantListId && {
          tenantListId: tenantListId.map(
            (id) => new mongoose.Types.ObjectId(id),
          ),
        }),
        ...(ownerId && { ownerId }),
        ...(tenantId && { tenantId }),
      };
    }
    //console.log('questionData:',questionData)

    //<---v1.0.0---
    //const newQuestion = await TenantQuestions.create(questionData);
    const Model = isInterviewType
      ? TenantInterviewQuestions
      : TenantAssessmentQuestions;
    const newQuestion = await Model.create(questionData);
    //---v1.0.0--->
    //console.log('Created question:', newQuestion);
    //console.log('Created question:', newQuestion)

    res.locals.feedData = {
      tenantId,
      feedType: "info",
      action: {
        name: "question_created",
        description: `Question was created`,
      },
      ownerId,
      parentId: newQuestion._id,
      parentObject: "TenantQuestion",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Question was created successfully`,
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Create question",
      requestBody: req.body,
      status: "success",
      message: "New question created successfully",
      responseBody: newQuestion,
    };
    res.status(201).json({
      status: "success",
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create question",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };
    res.status(500).json({ status: "error", message: error.message });
  }
};

// edit question also add
// Helper function to validate ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// exports.updateQuestion = async (req, res) => {
//   try {
//     res.locals.loggedByController = true;
//     res.locals.processName = 'Update question';

//     const questionId = req.params.id;
//     const { tenantId, ownerId, tenantListId, ...updateFields } = req.body;
//     console.log('updateFields:', updateFields);

//     //<----v1.0.1----
//     // Validate id param
//     if (!isValidObjectId(questionId)) {
//       return res.status(400).json({ message: 'Validation failed', errors: { id: 'Invalid question id' } });
//     }

//     // Joi validation for update
//     {
//       const { errors, isValid } = validateUpdateTenantQuestion(req.body);
//       if (!isValid) {
//         return res.status(400).json({ message: 'Validation failed', errors });
//       }
//     }
//     //----v1.0.1---->
//         res.locals.loggedByController = true;
//         //console.log("effectivePermissions",res.locals?.effectivePermissions)
//         //<-----v1.0.1---
//         // Permission: Tasks.Create (or super admin override)
//         const canCreate =
//         await hasPermission(res.locals?.effectivePermissions?.QuestionBank, 'Edit')
//         //await hasPermission(res.locals?.superAdminPermissions?.QuestionBank, 'Edit')
//         if (!canCreate) {
//           return res.status(403).json({ message: 'Forbidden: missing QuestionBank.Edit permission' });
//         }
//         //-----v1.0.1--->

//     // Remove invalid id
//     if (!updateFields.suggestedQuestionId) delete updateFields.suggestedQuestionId;

//     //<---v1.0.0---
//     // Try to find the question across models (assessment, interview, legacy)
//     let Model = null;
//     let question = await TenantAssessmentQuestions.findById(questionId);
//     if (question) Model = TenantAssessmentQuestions;
//     if (!question) {
//       question = await TenantInterviewQuestions.findById(questionId);
//       if (question) Model = TenantInterviewQuestions;
//     }
//     // if (!question) {
//     //   question = await TenantQuestions.findById(questionId);
//     //   if (question) Model = TenantQuestions;
//     // }

//     if (!question) return res.status(404).json({ message: 'Question not found' });

//     //<---v1.0.0---
//     // Handle list updates if provided
//     let uniqueListIds = null;
//     if (Array.isArray(tenantListId)) {
//       uniqueListIds = [...new Set(tenantListId)].map(id => new mongoose.Types.ObjectId(id));
//       question.tenantListId = uniqueListIds;
//     }
//     //---v1.0.0--->
//     // apply any other fields being edited
//     Object.assign(question, updateFields);
//     // Ensure identifiers are set when provided (important for individual accounts)
//     if (tenantId) question.tenantId = tenantId;
//     if (ownerId) question.ownerId = ownerId;

//     //<---v1.0.0---
//     const changes = [];
//     if (uniqueListIds) {
//       changes.push({
//         fieldName: 'tenantListId',
//         oldValue: question.tenantListId?.map(String),
//         newValue: uniqueListIds.map(String)
//       });//---v1.0.0--->
//     }
//     console.log("changes", changes);
//     console.log("changes.length",changes.length);

//     await question.save();

//     res.locals.feedData = {
//       tenantId,
//       feedType: 'update',
//       action: {
//         name: 'question_updated',
//         description: `Question was updated`,
//       },
//       ownerId,
//       parentId: question._id,
//       parentObject: 'TenantQuestion',
//       metadata: req.body,
//       severity: res.statusCode >= 500 ? 'high' : 'low',
//       fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
//         fieldName,
//         message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
//       })),
//       history: changes,
//     };

//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: 'Update question',
//       requestBody: req.body,
//       message: 'Question updated successfully',
//       status: 'success',
//       responseBody: question,
//     };

//     res.status(200).json({
//       status: 'success',
//       message: 'Question updated successfully',
//       data: question
//     });
//   } catch (error) {
//     const { tenantId, ownerId } = req.body;
//     res.locals.logData = {
//       tenantId,
//       ownerId,
//       processName: 'Update question',
//       requestBody: req.body,
//       message: error.message,
//       status: 'error',
//     };
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// };

exports.updateQuestion = async (req, res) => {
  try {
    res.locals.loggedByController = true;
    res.locals.processName = "Update question";

    const questionId = req.params.id;
    let {
      tenantId,
      ownerId,
      tenantListId,
      isInterviewType,
      isEdit,
      ...updateFields
    } = req.body;
    console.log(
      "UPDATED FIELDS ==================================> ",
      updateFields,
    );

    // Map UI field -> DB field
    if (typeof isInterviewType !== "undefined") {
      updateFields.isInterviewQuestionType = isInterviewType;
    }

    // Drop UI-only fields
    // isEdit is only for FE toggling, never persisted
    delete updateFields.isEdit;

    // Validate id param
    if (!isValidObjectId(questionId)) {
      return res.status(400).json({
        message: "Validation failed",
        errors: { id: "Invalid question id" },
      });
    }

    // Joi validation
    {
      const { errors, isValid } = validateUpdateTenantQuestion(req.body);
      if (!isValid) {
        return res.status(400).json({ message: "Validation failed", errors });
      }
    }

    // Permission check
    // const canEdit = await hasPermission(res.locals?.effectivePermissions?.QuestionBank, 'Edit');
    // if (!canEdit) {
    //   return res.status(403).json({
    //     message: 'Forbidden: missing QuestionBank.Edit permission'
    //   });
    // }

    // Find the question
    let question = await TenantAssessmentQuestions.findById(questionId);
    if (!question) {
      question = await TenantInterviewQuestions.findById(questionId);
    }
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const original = question.toObject();
    const changes = [];

    // Handle tenantListId
    if (Array.isArray(tenantListId)) {
      const uniqueListIds = [...new Set(tenantListId)].map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      const oldIds = (original.tenantListId || []).map(String);
      const newIds = uniqueListIds.map(String);

      if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
        changes.push({
          fieldName: "tenantListId",
          oldValue: oldIds,
          newValue: newIds,
        });
        question.tenantListId = uniqueListIds;
      }
    }

    // -------------------- NEW FOR MCQ OPTIONS ----------------------------------------
    // Check each update field
    // for (const key of Object.keys(updateFields)) {
    //   if (String(original[key] ?? "") !== String(updateFields[key] ?? "")) {
    //     changes.push({
    //       fieldName: key,
    //       oldValue: original[key],
    //       newValue: updateFields[key],
    //     });
    //     question[key] = updateFields[key];
    //   }
    // }

    // Check each update field
    for (const key of Object.keys(updateFields)) {
      const oldValue = original[key];
      const newValue = updateFields[key];

      const isDifferent =
        JSON.stringify(oldValue ?? "") !== JSON.stringify(newValue ?? "");

      if (isDifferent) {
        changes.push({
          fieldName: key,
          oldValue: oldValue,
          newValue: newValue,
        });

        // Use .set() or direct assignment to ensure Mongoose tracks the change
        question.set(key, newValue);
      }
    }
    // -------------------- NEW FOR MCQ OPTIONS  ----------------------------------------

    // Explicit tenantId/ownerId
    if (tenantId && String(original.tenantId ?? "") !== String(tenantId)) {
      changes.push({
        fieldName: "tenantId",
        oldValue: original.tenantId,
        newValue: tenantId,
      });
      question.tenantId = tenantId;
    }
    if (ownerId && String(original.ownerId ?? "") !== String(ownerId)) {
      changes.push({
        fieldName: "ownerId",
        oldValue: original.ownerId,
        newValue: ownerId,
      });
      question.ownerId = ownerId;
    }

    // 🚨 If no changes, exit early
    if (changes.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No changes detected",
        data: question,
      });
    }

    await question.save();

    res.locals.feedData = {
      tenantId,
      feedType: "update",
      action: { name: "question_updated", description: `Question was updated` },
      ownerId,
      parentId: question._id,
      parentObject: "TenantQuestion",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update question",
      requestBody: req.body,
      message: "Question updated successfully",
      status: "success",
      responseBody: question,
    };

    res.status(200).json({
      status: "success",
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    const { tenantId, ownerId } = req.body;
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: "Update question",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getQuestionBySuggestedId = async (req, res) => {
  const suggestedQuestionId = req.params.suggestedQuestionId;
  const { tenantId, ownerId } = req.query;

  //<----v1.0.1----
  // Required fields validation with consistent error shape
  {
    const errors = {};
    if (!suggestedQuestionId) {
      errors.suggestedQuestionId = "suggestedQuestionId is required";
    }
    if (!tenantId && !ownerId) {
      errors.tenantId = "Either tenantId or ownerId is required";
      errors.ownerId = "Either ownerId or tenantId is required";
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
  }

  if (!isValidObjectId(suggestedQuestionId)) {
    return res.status(400).json({
      message: "Validation failed",
      errors: { suggestedQuestionId: "Invalid suggestedQuestionId" },
    });
  }
  //----v1.0.1---->

  res.locals.loggedByController = true;
  //console.log("effectivePermissions",res.locals?.effectivePermissions)
  //<-----v1.0.1---
  // Permission: Tasks.Create (or super admin override)
  // const canCreate =
  // await hasPermission(res.locals?.effectivePermissions?.QuestionBank, 'View')
  // //await hasPermission(res.locals?.superAdminPermissions?.QuestionBank, 'View')
  // if (!canCreate) {
  //   return res.status(403).json({ message: 'Forbidden: missing QuestionBank.View permission' });
  // }
  //-----v1.0.1--->

  try {
    let question;
    const baseQuery = {
      suggestedQuestionId: new mongoose.Types.ObjectId(suggestedQuestionId),
    };

    //<---v1.0.0---
    // Build query with tenant/owner filter
    const query = {
      ...baseQuery,
      ...(tenantId ? { tenantId } : {}),
      ...(ownerId ? { ownerId } : {}),
    };

    // Try across models in order: assessment, interview, legacy
    question =
      await TenantAssessmentQuestions.findOne(query).populate("tenantListId");
    if (!question) {
      question =
        await TenantInterviewQuestions.findOne(query).populate("tenantListId");
    }
    // if (!question) {
    //   question = await TenantQuestions.findOne(query).populate('tenantListId');
    // }

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Ensure list IDs are strings
    const responseData = {
      ...question.toObject(),
      tenantListId: (question.tenantListId || []).map(
        (id) => id._id?.toString() || id.toString(),
      ), //---v1.0.0--->
    };

    res.status(200).json({
      status: "success",
      message: "Question retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE API for questions
exports.deleteQuestionsById = async (req, res) => {
  try {
    const { deleteType, questionIds, label, questionType, tenantId, ownerId } =
      req.body;
    // const {  } = req.user; // Assuming you have user authentication

    // Validate input
    if (
      !deleteType ||
      (deleteType === "selected" &&
        (!questionIds || !Array.isArray(questionIds)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
    }

    let result;
    let labelresult;

    // Determine which collection to use based on question type
    const QuestionModel =
      questionType === "Interview Questions"
        ? TenantInterviewQuestions
        : TenantAssessmentQuestions;

    if (deleteType === "all") {
      // Delete all questions from a specific label
      if (!label) {
        return res.status(400).json({
          success: false,
          message: "Label is required for deleting all questions",
        });
      }

      // First find the list ID for the given label
      const list = await QuestionbankFavList.findOne({
        _id: label,
        // tenantId: tenantId,
        // ownerId: ownerId
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: "Label not found",
        });
      }

      // console.log("list",list);
      // console.log("tenantId",tenantId);
      // console.log("ownerId",ownerId);

      // Delete all questions with this list ID
      result = await QuestionModel.deleteMany({
        tenantListId: list._id,
        // tenantId: tenantId,
        // ownerId: ownerId
      });

      labelresult = await QuestionbankFavList.deleteOne({ _id: list._id });

      res.json({
        success: true,
        message: `Deleted all questions from ${label}`,
        deletedCount: result.deletedCount,
      });
    } else if (deleteType === "selected") {
      const validQuestionIds = questionIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id),
      );

      if (validQuestionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid question IDs provided",
        });
      }

      // First find the list ID for the given label
      const list = await QuestionbankFavList.findOne({ _id: label });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: "Label not found",
        });
      }

      // Fetch all selected questions
      // Fetch all selected docs (custom OR suggested wrapper)
      const questions = await QuestionModel.find({
        $or: [
          { _id: { $in: validQuestionIds } }, // custom questions
          { suggestedQuestionId: { $in: validQuestionIds } }, // suggested wrappers
        ],
        tenantListId: list._id,
      });

      let deletedCount = 0;
      let updatedCount = 0;

      for (const q of questions) {
        if (
          q.tenantListId.length === 1 &&
          q.tenantListId[0].toString() === list._id.toString()
        ) {
          // 🚨 Case 1: Only one label → delete whole question
          await QuestionModel.deleteOne({ _id: q._id });
          deletedCount++;
        } else {
          // 🚨 Case 2: Multiple labels → just remove this label from array
          await QuestionModel.updateOne(
            { _id: q._id },
            { $pull: { tenantListId: list._id } },
          );
          updatedCount++;
        }
      }

      res.json({
        success: true,
        message: `Processed ${questions.length} questions`,
        deletedCount,
        updatedCount,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid deleteType. Use 'all' or 'selected'",
      });
    }
  } catch (error) {
    console.error("Error deleting questions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
