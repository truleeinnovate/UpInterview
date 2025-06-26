
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
// const RolesPermissionObject = require('../models/RolesPermissionObject');
// const RoleOverrides = require('../models/RoleOverrides');
// const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// const modelMapping = {
//   candidate: Candidate,
//   position: Position,
//   interview: Interview,
//   mockinterview: MockInterview,
//   tenentquestions: TenantQuestions,
//   users: Users,
//   rolesdata: RolesPermissionObject
// };

// router.get('/:model', permissionMiddleware, async (req, res) => {
//   try {
//     const { model } = req.params;
//     console.log("model", model);

//     const { tenantId, userId, inheritedRoleIds, permissions, isImpersonating } = req;

//     const DataModel = modelMapping[model.toLowerCase()];
//     if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//     }

//     const modelName = model.charAt(0).toUpperCase() + model.slice(1);
//     if (!permissions[modelName]?.View && !permissions.SuperAdmin?.ViewAll) {
//       return res.status(403).json({ error: `No permission to view ${modelName}` });
//     }

//     let query = {};
//     if (permissions.SuperAdmin?.ViewAll && !isImpersonating) {
//       // Internal roles view all data
//     } else {
//       query.tenantId = tenantId;
//       if (inheritedRoleIds.length > 0) {
//         const accessibleUsers = await Users.find({
//           tenantId,
//           roleId: { $in: inheritedRoleIds }
//         }).select('_id');
//         const userIds = accessibleUsers.map(user => user._id);
//         query.$or = [
//           { createdBy: { $in: userIds } },
//           { ownerId: userId }
//         ];
//       } else {
//         query.ownerId = userId;
//       }
//     }

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
//           inheritedRoleIds: res.locals.inheritedRoleIds
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

//         const interviewQuestions = await InterviewQuestions.find({
//           interviewId: { $in: interviewIds }
//         }).select('roundId snapshot');

//         const roundsWithQuestions = roundsData.map(round => {
//           const matchingQuestions = interviewQuestions.filter(q => q.roundId.equals(round._id));
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
//           inheritedRoleIds: res.locals.inheritedRoleIds
//         });

//       default:
//         query = DataModel.find(query);
//     }

//     const data = await query.exec();
//     res.status(200).json({
//       data: data || [],
//       permissions: res.locals.permissions,
//       inheritedRoleIds: res.locals.inheritedRoleIds
//     });
//   } catch (error) {
//     console.error(`Error fetching data for ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// });


// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Candidate } = require('../models/Candidate');
const Position = require('../models/Position');
const Interview = require('../models/Interview');
const MockInterview = require('../models/MockInterview');
const TenantQuestions = require('../models/TenantQuestions');
const TenantQuestionsListNames = require('../models/TenantQuestionsListNames');
const InterviewRounds = require('../models/InterviewRounds');
const InterviewQuestions = require('../models/InterviewQuestions');
const Users = require('../models/Users');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// Define model requirements at the top of your file
const modelRequirements = {
  candidate: {
    model: Candidate,
    permissionName: 'Candidates',
    requiredPermission: 'View'
  },
  position: {
    model: Position,
    permissionName: 'Positions',
    requiredPermission: 'View'
  },
  interview: {
    model: Interview,
    permissionName: 'Interviews',
    requiredPermission: 'View'
  },
  mockinterview: {
    model: MockInterview,
    permissionName: 'MockInterviews',
    requiredPermission: 'View'
  },
  tenantquestions: {
    model: TenantQuestions,
    permissionName: 'QuestionBank',
    requiredPermission: 'View'
  }
};

// Then update getModelMapping to use this:
const getModelMapping = (permissions) => {
  return Object.entries(modelRequirements).reduce((acc, [key, config]) => {
    const modelPerms = permissions?.[config.permissionName] || {};
    
    acc[key] = {
      model: config.model,
      permissionName: config.permissionName,
      hasViewPermission: modelPerms[config.requiredPermission] === true
    };
    return acc;
  }, {});
};

// GET route for fetching data for a given model
router.get('/:model', permissionMiddleware, async (req, res) => {
  try {
    const { model } = req.params;
    const authToken = req.cookies.authToken || req.headers.authorization?.split('Bearer ')[1];

    if (!authToken) {
      console.error('No auth token found');
      return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
    }

    // Decode JWT directly
    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token', details: err.message });
    }

    const { userId, tenantId, impersonatedUserId } = decoded;
    console.log('userId:', userId, 'tenantId:', tenantId, 'impersonatedUserId:', impersonatedUserId);
    const isImpersonating = !!impersonatedUserId;

    if (!userId && !impersonatedUserId) {
      console.error('Missing userId and impersonatedUserId');
      return res.status(401).json({ error: 'Unauthorized: Missing both userId and impersonatedUserId' });
    }

    // Get permissions from res.locals
    const { effectivePermissions, superAdminPermissions, inheritedRoleIds } = res.locals;
    const permissionsToCheck = superAdminPermissions || effectivePermissions;

    // Get model mapping with permissions
    const modelMapping = getModelMapping(permissionsToCheck);

    // Validate model
    const modelConfig = modelMapping[model.toLowerCase()];
    if (!modelConfig) {
      return res.status(400).json({ message: `Invalid model: ${model}` });
    }

    const { model: DataModel, permissionName, hasViewPermission } = modelConfig;

    // Check permissions based on model requirements
    // if (!hasViewPermission) {
    //   return res.status(403).json({
    //     error: `Missing required permissions for ${permissionName}`,
    //     required: modelRequirements[model.toLowerCase()].requiredPermissions,
    //     available: permissionsToCheck?.[permissionName] || {}
    //   });
    // }

    // Validate DataModel
    if (!DataModel || typeof DataModel.find !== 'function') {
      console.error(`Invalid DataModel for ${model}:`, DataModel);
      return res.status(500).json({ error: `Invalid model configuration for ${model}` });
    }

    // Build query based on permissions
    let query = {};
    if (permissionsToCheck?.SuperAdmin?.ViewAll && !isImpersonating) {
      // Super Admins view all data
    } else {
      // Regular users or impersonated Super Admins are restricted to tenant data
      query.tenantId = tenantId;

      // Apply role-based filtering if inheritedRoleIds exist
      if (inheritedRoleIds?.length > 0) {
        const accessibleUsers = await Users.find({
          tenantId,
          roleId: { $in: inheritedRoleIds },
        }).select('_id');
        const userIds = accessibleUsers.map((user) => user._id);
        query.$or = [
          // { createdBy: { $in: userIds } },
          { ownerId: userId },
        ];
      } else {
        // No inherited roles: limit to data owned by the user or tenant
        query.$or = [
          { ownerId: userId },
          { tenantId },
        ];
      }
    }

    let data;
    switch (model.toLowerCase()) {
      case 'mockinterview':
        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        break;

      case 'tenantquestions':
        const lists = await TenantQuestionsListNames.find(query).lean();
        const listIds = lists.map((list) => list._id);

        const questions = await TenantQuestions.find({
          ...query,
          tenantListId: { $in: listIds },
        })
          .populate({
            path: 'suggestedQuestionId',
            model: 'SuggestedQuestions',
          })
          .populate({
            path: 'tenantListId',
            model: 'TenantQuestionsListNames',
            select: 'label name ownerId tenantId',
          })
          .lean();

        const groupedQuestions = lists.reduce((acc, list) => {
          acc[list.label] = [];
          return acc;
        }, {});

        questions.forEach((question) => {
          const questionData = question.isCustom ? question : question.suggestedQuestionId;
          question.tenantListId.forEach((list) => {
            if (groupedQuestions[list.label]) {
              groupedQuestions[list.label].push({
                ...questionData,
                label: list.label,
                listId: list._id,
              });
            }
          });
        });

        data = groupedQuestions;
        break;

      case 'interview':
        const interviews = await DataModel.find(query)
          .populate({ path: 'candidateId', model: 'Candidate' })
          .populate({ path: 'positionId', model: 'Position' })
          .populate({ path: 'templateId', model: 'InterviewTemplate' })
          .lean();

        const interviewIds = interviews.map((interview) => interview._id);

        const roundsData = await InterviewRounds.find({ interviewId: { $in: interviewIds } })
          .populate({
            path: 'interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();

        const interviewQuestions = await InterviewQuestions.find({
          interviewId: { $in: interviewIds },
        })
          .select('roundId snapshot')
          .lean();

        const roundsWithQuestions = roundsData.map((round) => ({
          ...round,
          questions: interviewQuestions.filter((q) => q.roundId.equals(round._id)),
        }));

        data = interviews.map((interview) => ({
          ...interview,
          rounds: roundsWithQuestions.filter((round) => round.interviewId.equals(interview._id)),
        }));
        break;

      default:
        data = await DataModel.find(query).lean();
    }

    // Return consistent response format
    res.status(200).json({
      data,
      // permissions: permissionsToCheck,
      // inheritedRoleIds: inheritedRoleIds || [],
    });
  } catch (error) {
    console.error(`Error fetching data for model ${req.params.model}:`, error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// CRUD operations (unchanged from previous)
router.post('/:model', permissionMiddleware, async (req, res) => {
  try {
    const { model } = req.params;
    const { tenantId, userId, permissions } = req;

    const DataModel = modelMapping[model.toLowerCase()];
    if (!DataModel) {
      return res.status(400).json({ message: 'Invalid model' });
    }

    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    if (!permissions[modelName]?.Create && !permissions.SuperAdmin?.CreateAll) {
      return res.status(403).json({ error: `No permission to create ${modelName}` });
    }

    const data = await DataModel.create({
      ...req.body,
      tenantId,
      ownerId: userId,
      createdBy: userId
    });

    res.status(201).json({
      data,
      permissions: res.locals.permissions,
      inheritedRoleIds: res.locals.inheritedRoleIds
    });
  } catch (error) {
    console.error(`Error creating ${model}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:model/:id', permissionMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;
    const { tenantId, userId, inheritedRoleIds, permissions } = req;

    const DataModel = modelMapping[model.toLowerCase()];
    if (!DataModel) {
      return res.status(400).json({ message: 'Invalid model' });
    }

    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    if (!permissions[modelName]?.Edit && !permissions.SuperAdmin?.EditAll) {
      return res.status(403).json({ error: `No permission to edit ${modelName}` });
    }

    const record = await DataModel.findOne({ _id: id, tenantId });
    if (!record) {
      return res.status(404).json({ error: `${modelName} not found` });
    }

    if (inheritedRoleIds.length > 0 && !permissions.SuperAdmin?.EditAll) {
      const creator = await Users.findById(record.createdBy).populate('roleId');
      if (record.ownerId.toString() !== userId && !inheritedRoleIds.includes(creator.roleId?._id)) {
        return res.status(403).json({ error: `No permission to edit this ${modelName}` });
      }
    }

    const updatedRecord = await DataModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: userId },
      { new: true }
    );

    res.json({
      data: updatedRecord,
      permissions: res.locals.permissions,
      inheritedRoleIds: res.locals.inheritedRoleIds
    });
  } catch (error) {
    console.error(`Error updating ${model}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:model/:id', permissionMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;
    const { tenantId, userId, inheritedRoleIds, permissions } = req;

    const DataModel = modelMapping[model.toLowerCase()];
    if (!DataModel) {
      return res.status(400).json({ message: 'Invalid model' });
    }

    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    if (!permissions[modelName]?.Delete && !permissions.SuperAdmin?.DeleteAll) {
      return res.status(403).json({ error: `No permission to delete ${modelName}` });
    }

    const record = await DataModel.findOne({ _id: id, tenantId });
    if (!record) {
      return res.status(404).json({ error: `${modelName} not found` });
    }

    if (inheritedRoleIds.length > 0 && !permissions.SuperAdmin?.DeleteAll) {
      const creator = await Users.findById(record.createdBy).populate('roleId');
      if (record.ownerId.toString() !== userId && !inheritedRoleIds.includes(creator.roleId?._id)) {
        return res.status(403).json({ error: `No permission to delete this ${modelName}` });
      }
    }

    await DataModel.findByIdAndDelete(id);
    res.json({
      message: `${modelName} deleted`,
      permissions: res.locals.permissions,
      inheritedRoleIds: res.locals.inheritedRoleIds
    });
  } catch (error) {
    console.error(`Error deleting ${model}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;