// // routes/apiRoutes.js
// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Candidate = require('../models/Candidate');
// const Position = require('../models/Position');
// const Interview = require('../models/Interview');
// const MockInterview = require('../models/MockInterview');
// const TenantQuestions = require('../models/TenantQuestions');
// const TenantQuestionsListNames = require('../models/TenantQuestionsListNames');
// const InterviewRounds = require('../models/InterviewRounds');
// const InterviewQuestions = require('../models/InterviewQuestions');
// const Users = require('../models/Users');
// const Role = require('../models/Role');
// const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// const modelMapping = {
//   candidate: Candidate,
//   position: Position,
//   interview: Interview,
//   mockinterview: MockInterview,
//   tenentquestions: TenantQuestions,
//   users: Users,
//   rolesdata: Role
// };

// router.get('/:model', permissionMiddleware, async (req, res) => {
//   try {
//     const { model } = req.params;
//     const { tenantId, userId, roleLevel, permissions } = req;

//     const DataModel = modelMapping[model.toLowerCase()];
//     if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//     }

//     // Check View permission
//     const modelName = model.charAt(0).toUpperCase() + model.slice(1);
//     if (!permissions[modelName]?.View) {
//       return res.status(403).json({ error: `No permission to view ${modelName}` });
//     }

//     // Build query
//     let query = { tenantId };
//     if (roleLevel) {
//       // Fetch users with roles >= user's role level
//       const accessibleRoles = await Role.find({ tenantId, level: { $gte: roleLevel } }).select('_id');
//       const roleIds = accessibleRoles.map(role => role._id);
//       const accessibleUsers = await Users.find({ tenantId, roleId: { $in: roleIds } }).select('_id');
//       const userIds = accessibleUsers.map(user => user._id);
//       query.$or = [
//         { createdBy: { $in: userIds } },
//         { ownerId: userId }
//       ];
//     } else {
//       query.ownerId = userId; // Individual users only see their own data
//     }

//     // Handle specific models
//     switch (model.toLowerCase()) {
//       case 'mockinterview':
//         query = DataModel.find(query).populate({
//           path: 'rounds.interviewers',
//           model: 'Contacts',
//           select: 'firstName lastName email'
//         });
//         break;

//       case 'tenentquestions':
//         const lists = await TenantQuestionsListNames.find(query);
//         const questions = await TenantQuestions.find({
//           ...query,
//           tenantListId: { $in: lists.map(list => list._id) }
//         })
//           .populate({
//             path: 'suggestedQuestionId',
//             model: 'SuggestedQuestions'
//           })
//           .populate({
//             path: 'tenantListId',
//             model: 'TenantQuestionsListNames',
//             select: 'label name ownerId tenantId'
//           });

//         const groupedQuestions = {};
//         lists.forEach(list => {
//           groupedQuestions[list.label] = [];
//         });

//         questions.forEach(question => {
//           const questionData = question.isCustom ? question : question.suggestedQuestionId;
//           question.tenantListId.forEach(list => {
//             if (groupedQuestions[list.label]) {
//               groupedQuestions[list.label].push({
//                 ...questionData._doc,
//                 label: list.label,
//                 listId: list._id
//               });
//             }
//           });
//         });

//         return res.status(200).json({
//           data: groupedQuestions,
//           permissions: res.locals.permissions,
//           roleLevel: res.locals.roleLevel
//         });

//       case 'position':
//         query = DataModel.find(query).populate({
//           path: 'rounds.interviewers',
//           model: 'Contacts',
//           select: 'firstName lastName email'
//         });
//         break;

//       case 'interview':
//         query = DataModel.find(query)
//           .populate({ path: 'candidateId', model: 'Candidate' })
//           .populate({ path: 'positionId', model: 'Position' })
//           .populate({ path: 'templateId', model: 'InterviewTemplate' });

//         const interviews = await query.exec();
//         const interviewIds = interviews.map(interview => interview._id);

//         const roundsData = await InterviewRounds.find({ interviewId: { $in: interviewIds } })
//           .populate({
//             path: 'interviewers',
//             model: 'Contacts',
//             select: 'firstName lastName email'
//           });

//         const interviewQuestionData = await InterviewQuestions.find({
//           interviewId: { $in: interviewIds }
//         }).select('roundId snapshot');

//         const roundsWithQuestions = roundsData.map(round => {
//           const matchingQuestions = interviewQuestionData.filter(q => q.roundId.equals(round._id));
//           return {
//             ...round._doc,
//             questions: matchingQuestions
//           };
//         });

//         const interviewsWithRounds = interviews.map(interview => {
//           const interviewRounds = roundsWithQuestions.filter(round => round.interviewId.equals(interview._id));
//           return {
//             ...interview._doc,
//             rounds: interviewRounds
//           };
//         });

//         return res.status(200).json({
//           data: interviewsWithRounds,
//           permissions: res.locals.permissions,
//           roleLevel: res.locals.roleLevel
//         });

//       default:
//         query = DataModel.find(query);
//     }

//     const data = await query.exec();
//     res.status(200).json({
//       data: data || [],
//       permissions: res.locals.permissions,
//       roleLevel: res.locals.roleLevel
//     });
//   } catch (error) {
//     console.error(`Error fetching data for ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// });

// // CRUD operations for all models
// router.post('/:model', permissionMiddleware, async (req, res) => {
//   try {
//     const { model } = req.params;
//     const { tenantId, userId, permissions } = req;

//     const DataModel = modelMapping[model.toLowerCase()];
//     if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//     }

//     const modelName = model.charAt(0).toUpperCase() + model.slice(1);
//     if (!permissions[modelName]?.Create) {
//       return res.status(403).json({ error: `No permission to create ${modelName}` });
//     }

//     const data = await DataModel.create({
//       ...req.body,
//       tenantId,
//       ownerId: userId,
//       createdBy: userId
//     });

//     res.status(201).json({
//       data,
//       permissions: res.locals.permissions,
//       roleLevel: res.locals.roleLevel
//     });
//   } catch (error) {
//     console.error(`Error creating ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// router.put('/:model/:id', permissionMiddleware, async (req, res) => {
//   try {
//     const { model, id } = req.params;
//     const { tenantId, userId, roleLevel, permissions } = req;

//     const DataModel = modelMapping[model.toLowerCase()];
//     if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//     }

//     const modelName = model.charAt(0).toUpperCase() + model.slice(1);
//     if (!permissions[modelName]?.Edit) {
//       return res.status(403).json({ error: `No permission to edit ${modelName}` });
//     }

//     const record = await DataModel.findOne({ _id: id, tenantId });
//     if (!record) {
//       return res.status(404).json({ error: `${modelName} not found` });
//     }

//     if (roleLevel) {
//       const creator = await Users.findById(record.createdBy).populate('roleId');
//       if (record.ownerId.toString() !== userId && (!creator.roleId || creator.roleId.level < roleLevel)) {
//         return res.status(403).json({ error: `No permission to edit this ${modelName}` });
//       }
//     } else if (record.ownerId.toString() !== userId) {
//       return res.status(403).json({ error: `No permission to edit this ${modelName}` });
//     }

//     const updatedRecord = await DataModel.findByIdAndUpdate(
//       id,
//       { ...req.body, updatedBy: userId },
//       { new: true }
//     );

//     res.json({
//       data: updatedRecord,
//       permissions: res.locals.permissions,
//       roleLevel: res.locals.roleLevel
//     });
//   } catch (error) {
//     console.error(`Error updating ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// router.delete('/:model/:id', permissionMiddleware, async (req, res) => {
//   try {
//     const { model, id } = req.params;
//     const { tenantId, userId, roleLevel, permissions } = req;

//     const DataModel = modelMapping[model.toLowerCase()];
//     if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//     }

//     const modelName = model.charAt(0).toUpperCase() + model.slice(1);
//     if (!permissions[modelName]?.Delete) {
//       return res.status(403).json({ error: `No permission to delete ${modelName}` });
//     }

//     const record = await DataModel.findOne({ _id: id, tenantId });
//     if (!record) {
//       return res.status(404).json({ error: `${modelName} not found` });
//     }

//     if (roleLevel) {
//       const creator = await Users.findById(record.createdBy).populate('roleId');
//       if (record.ownerId.toString() !== userId && (!creator.roleId || creator.roleId.level < roleLevel)) {
//         return res.status(403).json({ error: `No permission to delete this ${modelName}` });
//       }
//     } else if (record.ownerId.toString() !== userId) {
//       return res.status(403).json({ error: `No permission to delete this ${modelName}` });
//     }

//     await DataModel.findByIdAndDelete(id);
//     res.json({
//       message: `${modelName} deleted`,
//       permissions: res.locals.permissions,
//       roleLevel: res.locals.roleLevel
//     });
//   } catch (error) {
//     console.error(`Error deleting ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// module.exports = router;