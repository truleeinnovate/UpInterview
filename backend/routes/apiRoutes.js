// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const { Candidate } = require('../models/Candidate');
// const Assessment = require("../models/assessment");
// const { Position } = require('../models/Position');
// const InterviewTemplate = require("../models/InterviewTemplate");

// const { Interview } = require('../models/Interview');
// const MockInterview = require('../models/MockInterview');
// const { TenantQuestions } = require('../models/TenantQuestions');
// const TenantQuestionsListNames = require('../models/TenantQuestionsListNames');
// const { InterviewRounds } = require('../models/InterviewRounds');
// const InterviewQuestions = require('../models/InterviewQuestions');
// const Users = require('../models/Users');
// const { permissionMiddleware } = require('../middleware/permissionMiddleware');

// const modelRequirements = {
//   candidate: {
//     model: Candidate,
//     permissionName: 'Candidates',
//     requiredPermission: 'View'
//   },
//   position: {
//     model: Position,
//     permissionName: 'Positions',
//     requiredPermission: 'View'
//   },
//   interview: {
//     model: Interview,
//     permissionName: 'Interviews',
//     requiredPermission: 'View'
//   },
//   assessment: {
//     model: Assessment,
//     permissionName: 'Assessments',
//     requiredPermission: 'View'
//   },
//   tenantquestions: {
//     model: TenantQuestions,
//     permissionName: 'QuestionBank',
//     requiredPermission: 'View'
//   },
//   interviewtemplate: {
//     model: InterviewTemplate,
//     permissionName: 'InterviewTemplates',
//     requiredPermission: 'View'
//   },
//   tenantquestions: {
//     model: TenantQuestions,
//     permissionName: 'QuestionBank',
//     requiredPermission: 'View'
//   }
// };

// const getModelMapping = (permissions) => {
//   return Object.entries(modelRequirements).reduce((acc, [key, config]) => {
//     const modelPerms = permissions?.[config.permissionName] || {};

//     acc[key] = {
//       model: config.model,
//       permissionName: config.permissionName,
//       hasViewPermission: modelPerms[config.requiredPermission] === true
//     };
//     return acc;
//   }, {});
// };

// router.get('/:model', permissionMiddleware, async (req, res) => {
//   console.log('started api routes page1');
//   try {
//     console.log('started api routes page');
//     const { model } = req.params;
//     const authToken = req.cookies.authToken;
//     const permissionsHeader = req.headers['x-permissions'];

//     console.log('--- [1] Incoming GET /:model request ---');
//     console.log('Model param:', model);
//     console.log('authToken:', !!authToken);
//     console.log('permissionsHeader:', permissionsHeader);

//     if (permissionsHeader) {
//       try {
//         const permissions = JSON.parse(permissionsHeader);
//         console.log('[2] Parsed permissionsHeader:', permissions);
//       } catch (e) {
//         console.error('[2] Error parsing permissionsHeader:', e);
//       }
//     }

//     if (!authToken) {
//       console.log('[3] No authToken found, returning 401');
//       return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(authToken, process.env.JWT_SECRET);
//       console.log('[4] Decoded JWT:', decoded);
//     } catch (err) {
//       console.error('[4] JWT verification failed:', err);
//       return res.status(401).json({ error: 'Unauthorized: Invalid token' });
//     }

//     const { userId, tenantId } = decoded;
//     console.log('[5] userId:', userId, 'tenantId:', tenantId);

//     if (!userId || !tenantId) {
//       console.log('[6] Missing userId or tenantId in JWT, returning 401');
//       return res.status(401).json({ error: 'Unauthorized: Missing userId or tenantId' });
//     }

//     // Permission locals
//     const {
//       effectivePermissions,
//       superAdminPermissions,
//       inheritedRoleIds,
//       isImpersonating,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleLevel,
//       effectivePermissions_RoleName,
//       impersonatedUser_roleType,
//       impersonatedUser_roleName
//     } = res.locals;

//     console.log('[7] Permission Data from res.locals:', {
//       effectivePermissions,
//       superAdminPermissions,
//       inheritedRoleIds,
//       isImpersonating,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleLevel,
//       effectivePermissions_RoleName,
//       impersonatedUser_roleType,
//       impersonatedUser_roleName
//     });

//     // Check if res.locals is empty
//     if (!effectivePermissions && !superAdminPermissions) {
//       console.log('[7.1] No permissions found in res.locals, returning 403');
//       return res.status(403).json({ error: 'Forbidden: No permissions available' });
//     }

//     const permissionsToCheck = superAdminPermissions || effectivePermissions;

//     const modelMapping = getModelMapping(permissionsToCheck);
//     const modelConfig = modelMapping[model.toLowerCase()];
//     console.log('[8] Model config:', modelConfig);

//     if (!modelConfig) {
//       console.log('[8] Invalid model:', model);
//       return res.status(400).json({ message: `Invalid model: ${model}` });
//     }

//     const { model: DataModel, permissionName, hasViewPermission } = modelConfig;
//     console.log('[9] Model config details:', { permissionName, hasViewPermission });

//     if (!DataModel || typeof DataModel.find !== 'function') {
//       console.error('[10] Invalid DataModel for', model, DataModel);
//       return res.status(500).json({ error: `Invalid model configuration for ${model}` });
//     }

//     let query = {};
//     console.log('[10] Initial Query:', query);
    

//     if (permissionsToCheck?.SuperAdmin?.ViewAll) {
//       console.log('[11] SuperAdmin: no restrictions');
//     } else {
//       const roleType = effectivePermissions_RoleType;
//       const roleName = effectivePermissions_RoleName;

//       if (roleType === 'individual') {
//         console.log('[12] Role Type: individual, tenantId:', tenantId);
//         query.tenantId = tenantId;
//       } else if (roleType === 'organization') {
//         console.log('[13] Role Type: organization, roleName:', roleName);

//         if (roleName === 'Admin') {
//           console.log('[14] Organization Admin, tenantId:', tenantId);
//           query.tenantId = tenantId;
//         } else {
//           console.log('[15] Organization, not Admin, roleName:', roleName);

//           if (inheritedRoleIds?.length > 0) {
//             console.log('[16] Inherited Role IDs:', inheritedRoleIds);

//             const accessibleUsers = await Users.find({
//               tenantId,
//               roleId: { $in: inheritedRoleIds },
//             }).select('_id');

//             const userIds = accessibleUsers.map((user) => user._id);
//             console.log('[17] Accessible User IDs:', userIds);

//             query.ownerId = { $in: userIds };
//           } else {
//             console.log('[18] No inherited roles, restricting to userId:', userId);
//             query.ownerId = userId;
//           }
//         }
//       }
//       console.log('[19] Final Query:', query);
//     }

//     let data;
//     switch (model.toLowerCase()) {
//       case 'mockinterview':
//         console.log('[20] Fetching MockInterview data with query:', query);
//         data = await DataModel.find(query)
//           .populate({
//             path: 'rounds.interviewers',
//             model: 'Contacts',
//             select: 'firstName lastName email',
//           })
//           .lean();
//         break;

//       case 'tenantquestions':
//         console.log('[21] Fetching TenantQuestionsListNames with query:', query);
//         const lists = await TenantQuestionsListNames.find(query).lean();
//         const listIds = lists.map((list) => list._id);
//         console.log('[22] List IDs:', listIds);

//         console.log('[23] Fetching TenantQuestions with listIds:', listIds);
//         const questions = await TenantQuestions.find({
//           ...query,
//           tenantListId: { $in: listIds },
//         })
//           .populate({
//             path: 'suggestedQuestionId',
//             model: 'SuggestedQuestions',
//           })
//           .populate({
//             path: 'tenantListId',
//             model: 'TenantQuestionsListNames',
//             select: 'label name ownerId tenantId',
//           })
//           .lean();

//         const groupedQuestions = lists.reduce((acc, list) => {
//           acc[list.label] = [];
//           return acc;
//         }, {});

//         questions.forEach((question) => {
//           const questionData = question.isCustom ? question : question.suggestedQuestionId;
//           question.tenantListId.forEach((list) => {
//             if (groupedQuestions[list.label]) {
//               groupedQuestions[list.label].push({
//                 ...questionData,
//                 label: list.label,
//                 listId: list._id,
//               });
//             }
//           });
//         });

//         data = groupedQuestions;
//         break;

//       case 'interview':
//         console.log('[24] Fetching Interview data with query:', query);
//         const interviews = await DataModel.find(query)
//           .populate({ path: 'candidateId', model: 'Candidate' })
//           .populate({ path: 'positionId', model: 'Position' })
//           .populate({ path: 'templateId', model: 'InterviewTemplate' })
//           .lean();

//         const interviewIds = interviews.map((interview) => interview._id);
//         console.log('[25] Interview IDs:', interviewIds);

//         const roundsData = await InterviewRounds.find({ interviewId: { $in: interviewIds } })
//           .populate({
//             path: 'interviewers',
//             model: 'Contacts',
//             select: 'firstName lastName email',
//           })
//           .lean();
//         console.log('[26] Rounds Data:', roundsData.length);

//         const interviewQuestions = await InterviewQuestions.find({
//           interviewId: { $in: interviewIds },
//         })
//           .select('roundId snapshot')
//           .lean();
//         console.log('[27] Interview Questions:', interviewQuestions.length);

//         const roundsWithQuestions = roundsData.map((round) => ({
//           ...round,
//           questions: interviewQuestions.filter((q) => q.roundId.equals(round._id)),
//         }));

//         data = interviews.map((interview) => ({
//           ...interview,
//           rounds: roundsWithQuestions.filter((round) => round.interviewId.equals(interview._id)),
//         }));
//         break;

//       default:
//         console.log('[28] Fetching generic model data with query:', query);
//         data = await DataModel.find(query).lean();
//     }

//     console.log('[29] Sending response data:', Array.isArray(data) ? `Array of length ${data.length}` : typeof data);
//     res.status(200).json({
//       data,
//     });
//   } catch (error) {
//     console.error(`[30] Error fetching data for model ${req.params.model}:`, error);
//     res.status(500).json({ error: 'Internal server error', message: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Candidate } = require('../models/Candidate');
const Assessment = require("../models/assessment");
const { Position } = require('../models/Position');
const InterviewTemplate = require("../models/InterviewTemplate");
const { Interview } = require('../models/Interview');
const MockInterview = require('../models/MockInterview');
const { TenantQuestions } = require('../models/TenantQuestions');
const TenantQuestionsListNames = require('../models/TenantQuestionsListNames');
const { InterviewRounds } = require('../models/InterviewRounds');
const InterviewQuestions = require('../models/InterviewQuestions');
const Users = require('../models/Users');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');

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
  assessment: {
    model: Assessment,
    permissionName: 'Assessments',
    requiredPermission: 'View'
  },
  tenantquestions: {
    model: TenantQuestions,
    permissionName: 'QuestionBank',
    requiredPermission: 'View'
  },
  interviewtemplate: {
    model: InterviewTemplate,
    permissionName: 'InterviewTemplates',
    requiredPermission: 'View'
  }
};

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

router.get('/:model', permissionMiddleware, async (req, res) => {
  console.log('--- STARTING REQUEST PROCESSING ---');
  try {
    const { model } = req.params;
    const authToken = req.cookies.authToken;

    console.log('[1] Request received for model:', model);
    console.log('[2] Auth token exists:', !!authToken);

    if (!authToken) {
      console.log('[3] No auth token - returning 401');
      return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      console.log('[4] JWT decoded successfully');
      console.log('[5] Decoded JWT contents:', {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        // Don't log entire token for security
      });
    } catch (err) {
      console.error('[6] JWT verification failed:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { userId, tenantId } = decoded;
    console.log('[7] User ID:', userId, 'Tenant ID:', tenantId);

    if (!userId || !tenantId) {
      console.log('[8] Missing userId or tenantId - returning 401');
      return res.status(401).json({ error: 'Unauthorized: Missing userId or tenantId' });
    }

    const {
      effectivePermissions,
      inheritedRoleIds,
      effectivePermissions_RoleType,
      effectivePermissions_RoleName,
    } = res.locals;

    console.log('[9] Permission data from res.locals:', {
      roleType: effectivePermissions_RoleType,
      roleName: effectivePermissions_RoleName,
      inheritedRoleIds: inheritedRoleIds?.length || 0,
      hasEffectivePermissions: !!effectivePermissions
    });

    if (!effectivePermissions) {
      console.log('[10] No effective permissions found - returning 403');
      return res.status(403).json({ error: 'Forbidden: No permissions available' });
    }

    const modelMapping = getModelMapping(effectivePermissions);
    console.log('[11] Model mapping for request:', Object.keys(modelMapping));
    
    const modelConfig = modelMapping[model.toLowerCase()];
    console.log('[12] Model config for', model, ':', {
      hasModelConfig: !!modelConfig,
      hasViewPermission: modelConfig?.hasViewPermission,
      modelName: modelConfig?.model?.modelName
    });

    if (!modelConfig) {
      console.log('[13] Invalid model requested - returning 400');
      return res.status(400).json({ message: `Invalid model: ${model}` });
    }

    const { model: DataModel, hasViewPermission } = modelConfig;

    // if (!hasViewPermission) {
    //   console.log('[14] User lacks view permission for model - returning 403');
    //   return res.status(403).json({ error: 'Forbidden: No view permission for this resource' });
    // }

    if (!DataModel || typeof DataModel.find !== 'function') {
      console.error('[15] Invalid DataModel configuration - returning 500');
      return res.status(500).json({ error: `Invalid model configuration for ${model}` });
    }

    // Base query - always enforce tenant boundary
    let query = { tenantId };
    console.log('[16] Initial query with tenantId:', query);

    const roleType = effectivePermissions_RoleType;
    const roleName = effectivePermissions_RoleName;

    console.log('[17] User role details:', {
      roleType,
      roleName,
      isOrganizationAdmin: roleType === 'organization' && roleName === 'Admin'
    });

    if (roleType === 'individual') {
      query.ownerId = userId;
      console.log('[18] Individual user - adding ownerId filter:', query);
    } else if (roleType === 'organization' && roleName !== 'Admin') {
      if (inheritedRoleIds?.length > 0) {
        console.log('[19] Non-admin org user with inherited roles:', inheritedRoleIds);
        const accessibleUsers = await Users.find({
          tenantId,
          roleId: { $in: inheritedRoleIds },
        }).select('_id');
        
        const userIds = accessibleUsers.map(user => user._id);
        console.log('[20] Accessible user IDs from inherited roles:', userIds);
        
        query.ownerId = { $in: userIds };
      } else {
        console.log('[21] Non-admin org user with no inherited roles - using own userId');
        query.ownerId = userId;
      }
      console.log('[22] Final query after org user processing:', query);
    } else {
      console.log('[23] Organization Admin - only tenantId filter applied');
    }
 
    let data;
    switch (model.toLowerCase()) {
      case 'mockinterview':
        console.log('[24] Processing MockInterview model');
        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        console.log('[25] Found', data.length, 'MockInterview records');
        break;

      case 'tenantquestions':
        console.log('[26] Processing TenantQuestions model');
        const lists = await TenantQuestionsListNames.find(query).lean();
        console.log('[27] Found', lists.length, 'question lists');
        
        const listIds = lists.map((list) => list._id);
        console.log('[28] List IDs to filter questions:', listIds);

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

        console.log('[29] Found', questions.length, 'questions matching lists');

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
        console.log('[30] Grouped questions by', Object.keys(groupedQuestions).length, 'categories');
        break;

      case 'interview':
        console.log('[31] Processing Interview model');
        const interviews = await DataModel.find(query)
          .populate({ path: 'candidateId', model: 'Candidate' })
          .populate({ path: 'positionId', model: 'Position' })
          .populate({ path: 'templateId', model: 'InterviewTemplate' })
          .lean();

        console.log('[32] Found', interviews.length, 'interviews');
        const interviewIds = interviews.map((interview) => interview._id);
        console.log('[33] Interview IDs for related data:', interviewIds);

        const roundsData = await InterviewRounds.find({ 
          interviewId: { $in: interviewIds },
          tenantId
        })
          .populate({
            path: 'interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();

        console.log('[34] Found', roundsData.length, 'interview rounds');

        const interviewQuestions = await InterviewQuestions.find({
          interviewId: { $in: interviewIds },
          tenantId
        })
          .select('roundId snapshot')
          .lean();

        console.log('[35] Found', interviewQuestions.length, 'interview questions');

        const roundsWithQuestions = roundsData.map((round) => ({
          ...round,
          questions: interviewQuestions.filter((q) => q.roundId.equals(round._id)),
        }));

        data = interviews.map((interview) => ({
          ...interview,
          rounds: roundsWithQuestions.filter((round) => round.interviewId.equals(interview._id)),
        }));
        console.log('[36] Final interview data with rounds and questions prepared');
        break;

      default:
        console.log('[37] Processing generic model:', model);
        data = await DataModel.find(query).lean();
        console.log('[38] Found', data.length, 'records for model', model);
    }

    console.log('[39] Sending response with data');
    res.status(200).json({ data });
  } catch (error) {
    console.error('[40] Error in request processing:', {
      error: error.message,
      stack: error.stack,
      model: req.params.model,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      requestId: req.id // If you have request ID tracking
    });
  }
  console.log('--- REQUEST PROCESSING COMPLETE ---');
});

module.exports = router;