// v1.0.0  -  Ashraf  -  Assessment_Template permission name changed to AssessmentTemplates
// v1.0.1  -  Ashraf  -  fixed postion and interviews rounds and questions no populates
// v1.0.2  -  Ashraf  -  fixed interview questions and rounds filter issue
// v1.0.3  -  Ashraf  -  fixed interview template model populate issues
// v1.0.4  -  Ashraf  -  fixed assessment model sort issue,because assessment is in loop
// v1.0.5  -  Mansoor  -  fixed mockinterview model mapping issue
// v1.0.6  -  Ashraf  -  fixed assessment to assessment template,schedule assessment to assessment schema
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Candidate } = require('../models/Candidate');
// <-------------------------------v1.0.6
const Assessment = require("../models/assessmentTemplates");
// ------------------------------v1.0.6 >
const { Position } = require('../models/Position');
const InterviewTemplate = require("../models/InterviewTemplate");
const { Interview } = require('../models/Interview');
// v1.0.5 <-----------------------------
const { MockInterview } = require('../models/MockInterview');
// v1.0.5-------------------------------->
const { TenantQuestions } = require('../models/TenantQuestions');
const TenantQuestionsListNames = require('../models/TenantQuestionsListNames');
const { InterviewRounds } = require('../models/InterviewRounds');
const InterviewQuestions = require('../models/InterviewQuestions');
const Users = require('../models/Users');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
// <-------------------------------v1.0.6
const ScheduledAssessmentSchema = require('../models/assessmentsSchema');
// ------------------------------v1.0.6 >

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
    // <---------------------- v1.0.0
    permissionName: 'AssessmentTemplates',
    // ---------------------- v1.0.0 >
    requiredPermission: 'View'
  },
  scheduleassessment: {
    model: ScheduledAssessmentSchema,
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
  },
  // <------------------------v1.0.5
  mockinterview: { // FIXED: added mockinterview mapping
    model: MockInterview,
    permissionName: 'MockInterviews',
    requiredPermission: 'View'
  }
  // v1.0.5---------------------------->
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

    console.log('[1] Request received for model:', model);
    console.log('[1.1] Cookies received:', req.cookies);
    console.log('[1.2] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    // Get user information from res.locals (set by permissionMiddleware)
    let { userId, tenantId } = res.locals;
    console.log('[2] User info from res.locals:', { userId, tenantId });

    // If res.locals doesn't have user info, try to extract from token directly
    if (!userId || !tenantId) {
      console.log('[2.1] No user info in res.locals, trying direct token extraction');

      // Try to get token from cookies first, then from Authorization header
      let authToken = req.cookies.authToken;

      if (!authToken) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authToken = authHeader.substring(7);
          console.log('[2.2] Got token from Authorization header');
        }
      }

      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
          userId = decoded.userId;
          tenantId = decoded.tenantId;
          console.log('[2.3] Extracted user info from token:', { userId, tenantId });
        } catch (err) {
          console.error('[2.4] JWT verification failed:', err.message);
        }
      }
    }

    if (!userId || !tenantId) {
      console.log('[3] Missing userId or tenantId - returning 401');
      return res.status(401).json({ error: 'Unauthorized: Missing userId or tenantId' });
    }

    const {
      effectivePermissions,
      inheritedRoleIds,
      effectivePermissions_RoleType,
      effectivePermissions_RoleName,
    } = res.locals;

    console.log('[4] Permission data from res.locals:', {
      roleType: effectivePermissions_RoleType,
      roleName: effectivePermissions_RoleName,
      inheritedRoleIds: inheritedRoleIds?.length || 0,
      hasEffectivePermissions: !!effectivePermissions
    });

    if (!effectivePermissions) {
      console.log('[5] No effective permissions found - returning 403');
      return res.status(403).json({ error: 'Forbidden: No permissions available' });
    }

    const modelMapping = getModelMapping(effectivePermissions);
    console.log('[6] Model mapping for request:', Object.keys(modelMapping));

    const modelConfig = modelMapping[model.toLowerCase()];
    console.log('[7] Model config for', model, ':', {
      hasModelConfig: !!modelConfig,
      hasViewPermission: modelConfig?.hasViewPermission,
      modelName: modelConfig?.model?.modelName
    });

    if (!modelConfig) {
      console.log('[8] Invalid model requested - returning 400');
      return res.status(400).json({ message: `Invalid model: ${model}` });
    }

    const { model: DataModel, hasViewPermission } = modelConfig;

    // if (!hasViewPermission) {
    //   console.log('[9] User lacks view permission for model - returning 403');
    //   return res.status(403).json({ error: 'Forbidden: No view permission for this resource' });
    // }

    if (!DataModel || typeof DataModel.find !== 'function') {
      console.error('[10] Invalid DataModel configuration - returning 500');
      return res.status(500).json({ error: `Invalid model configuration for ${model}` });
    }

    // Base query - always enforce tenant boundary
    let query = model.toLowerCase() === 'scheduleassessment' ? { organizationId: tenantId } : { tenantId };
    console.log('[11] Initial query with tenantId:', query);

    const roleType = effectivePermissions_RoleType;
    const roleName = effectivePermissions_RoleName;

    console.log('[12] User role details:', {
      roleType,
      roleName,
      isOrganizationAdmin: roleType === 'organization' && roleName === 'Admin'
    });

    if (roleType === 'individual' && model.toLowerCase() !== 'scheduleassessment') {
      query.ownerId = userId;
      console.log('[13] Individual user - adding ownerId filter:', query);
    } else if (roleType === 'organization' && roleName !== 'Admin') {
      if (model.toLowerCase() === 'scheduleassessment') {
        // For scheduled assessments, organization non-admin can see all under same organization
      }
      if (inheritedRoleIds?.length > 0) {
        console.log('[14] Non-admin org user with inherited roles:', inheritedRoleIds);
        const accessibleUsers = await Users.find({
          tenantId,
          roleId: { $in: inheritedRoleIds },
        }).select('_id');

        const userIds = accessibleUsers.map(user => user._id);
        console.log('[15] Accessible user IDs from inherited roles:', userIds);

        query.ownerId = { $in: userIds };
      } else {
        console.log('[16] Non-admin org user with no inherited roles - using own userId');
        query.ownerId = userId;
      }
      console.log('[17] Final query after org user processing:', query);
    } else {
      console.log('[18] Organization Admin - only tenantId filter applied');
      // Ensure scheduled assessments are not restricted by ownerId
      if (model.toLowerCase() === 'scheduleassessment') {
        delete query.ownerId;
      }
    }

    let data;
    switch (model.toLowerCase()) {
      case 'mockinterview':
        console.log('[19] Processing MockInterview model');
        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        console.log('[20] Found', data.length, 'MockInterview records');
        break;

      case 'tenantquestions':
        console.log('[21] Processing TenantQuestions model');
        const lists = await TenantQuestionsListNames.find(query).lean();
        console.log('[22] Found', lists.length, 'question lists');

        const listIds = lists.map((list) => list._id);
        console.log('[23] List IDs to filter questions:', listIds);

        const questions = await TenantQuestions.find({
          ...query,
          tenantListId: { $in: listIds },
        })
          .populate({
            path: 'suggestedQuestionId',
            model: 'suggestedQuestions', // Fix: changed model name to 'suggestedQuestions'
          })
          .populate({
            path: 'tenantListId',
            model: 'TenantQuestionsListNames',
            select: 'label name ownerId tenantId',
          })
          .lean();

        console.log('[24] Found', questions.length, 'questions matching lists');

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
        console.log('[25] Grouped questions by', Object.keys(groupedQuestions).length, 'categories');
        break;



      case 'interview':
        console.log('[26] Processing Interview model');
        const interviews = await DataModel.find(query)
          .populate({ path: 'candidateId', model: 'Candidate' })
          .populate({ path: 'positionId', model: 'Position' })
          .populate({ path: 'templateId', model: 'InterviewTemplate' })
          .lean();

        console.log('[27] Found', interviews.length, 'interviews');
        const interviewIds = interviews.map((interview) => interview._id);
        console.log('[28] Interview IDs for related data:', interviewIds);
        // <------------------------------- v1.0.1 
        const roundsData = await InterviewRounds.find({
          interviewId: { $in: interviewIds },
          // ------------------------------ v1.0.1 >
        })
          .populate({
            path: 'interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();

        console.log('[29] Found', roundsData.length, 'interview rounds');

        const interviewQuestions = await InterviewQuestions.find({
          interviewId: { $in: interviewIds },
          // <------------------------------- v1.0.1 
        })
          .select('roundId snapshot')
          .lean();

        console.log('[30] Found', interviewQuestions.length, 'interview questions');
        // <------------------------------- v1.0.2 
        const roundsWithQuestions = roundsData.map((round) => ({
          ...round,
          questions: interviewQuestions.filter((q) => q.roundId.toString() === round._id.toString()),
        }));

        data = interviews.map((interview) => ({
          // <------------------------------- v1.0.2 
          ...interview,
          rounds: roundsWithQuestions.filter((round) => round.interviewId.toString() === interview._id.toString()),
        }));
        // ------------------------------ v1.0.2 >
        console.log('[31] Final interview data with rounds and questions prepared');
        break;

      // <------------------------------- v1.0.3 
      case 'interviewtemplate':
        console.log('[34] Processing InterviewTemplate model');
        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        console.log('[35] Found', data.length, 'InterviewTemplate records');
        break;
      // ------------------------------ v1.0.4 >

      case 'assessment':
        console.log('[36] Processing Assessment model');
        data = await DataModel.find(query)
          .lean();
        console.log('[37] Found', data.length, 'Assessment records');
        break;
      // ------------------------------ v1.0.4 >

      case 'position':
        console.log('[32] Processing Position model');
        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        console.log('[33] Found', data.length, 'Position records');
        break;
      // ------------------------------ v1.0.1 >

      default:
        console.log('[38] Processing generic model:', model);
        data = await DataModel.find(query).lean();
        console.log('[39] Found', data.length, 'records for model', model);
    }

    console.log('[36] Sending response with data');
    res.status(200).json({ data });
  } catch (error) {
    console.error('[37] Error in request processing:', {
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