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
  },
  tenantquestions: {
    model: TenantQuestions,
    permissionName: 'QuestionBank',
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
  try {
    const { model } = req.params;
    const authToken = req.cookies.authToken || req.headers.authorization?.split('Bearer ')[1];
    const permissionsHeader = req.headers['x-permissions'];

    // Log incoming headers and cookies
    console.log('--- Incoming Request ---');
    console.log('authToken:', authToken);
    console.log('permissionsHeader:', permissionsHeader);
    console.log('req.cookies:', req.cookies);
    console.log('req.headers:', req.headers);

    // Log res.locals as soon as possible
    console.log('--- res.locals after permissionMiddleware ---');
    console.log('res.locals:', res.locals);

    if (permissionsHeader) {
      try {
        const permissions = JSON.parse(permissionsHeader);
        console.log('Parsed permissions:', permissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
      }
    }

    if (!authToken) {
      console.log('No authToken found');
      return res.status(401).json({ error: 'Unauthorized: Missing auth token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { userId, tenantId } = decoded;
    console.log('userId:', userId, 'tenantId:', tenantId);

    if (!userId || !tenantId) {
      console.log('Missing userId or tenantId in JWT');
      return res.status(401).json({ error: 'Unauthorized: Missing userId or tenantId' });
    }

    // Log all permission-related locals
    const {
      effectivePermissions = {},
      superAdminPermissions = null,
      inheritedRoleIds = [],
      isImpersonating = false,
      effectivePermissions_RoleType = null,
      effectivePermissions_RoleLevel = null,
      effectivePermissions_RoleName = null,
      impersonatedUser_roleType = null,
      impersonatedUser_roleName = null
    } = res.locals;

    console.log('--- Permission Data from res.locals ---');
    console.log('effectivePermissions:', effectivePermissions);
    console.log('superAdminPermissions:', superAdminPermissions);
    console.log('inheritedRoleIds:', inheritedRoleIds);
    console.log('isImpersonating:', isImpersonating);
    console.log('effectivePermissions_RoleType:', effectivePermissions_RoleType);
    console.log('effectivePermissions_RoleLevel:', effectivePermissions_RoleLevel);
    console.log('effectivePermissions_RoleName:', effectivePermissions_RoleName);
    console.log('impersonatedUser_roleType:', impersonatedUser_roleType);
    console.log('impersonatedUser_roleName:', impersonatedUser_roleName);

    const permissionsToCheck = superAdminPermissions || effectivePermissions;
    const modelMapping = getModelMapping(permissionsToCheck);
    const modelConfig = modelMapping[model.toLowerCase()];
    if (!modelConfig) {
      return res.status(400).json({ message: `Invalid model: ${model}` });
    }

    const { model: DataModel, permissionName, hasViewPermission } = modelConfig;

    if (!DataModel || typeof DataModel.find !== 'function') {
      console.error(`Invalid DataModel for ${model}:`, DataModel);
      return res.status(500).json({ error: `Invalid model configuration for ${model}` });
    }

 let query = {};

if (permissionsToCheck?.SuperAdmin?.ViewAll) {
  // SuperAdmin: no restrictions
} else {
  // Use values from res.locals
  const roleType = effectivePermissions_RoleType;
  const roleName = effectivePermissions_RoleName;

  if (roleType === 'individual') {
    // Individual: only see their own tenant's data
    query.tenantId = tenantId;
  } else if (roleType === 'organization') {
    if (roleName === 'Admin') {
      // Organization Admin: see all data for their tenant
      query.tenantId = tenantId;
    } else {
      // Not Admin
      if (inheritedRoleIds?.length > 0) {
        // Has inherited roles: show data for users with those roles
        const accessibleUsers = await Users.find({
          tenantId,
          roleId: { $in: inheritedRoleIds },
        }).select('_id');
        const userIds = accessibleUsers.map((user) => user._id);
        query.tenantId = tenantId;
        query.ownerId = { $in: userIds };
      } else {
        // No inherited roles: show only own data
        query.tenantId = tenantId;
        query.ownerId = userId;
      }
    }
  } else {
    // Fallback: restrict by tenant
    query.tenantId = tenantId;
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

    res.status(200).json({
      data,
    });
  } catch (error) {
    console.error(`Error fetching data for model ${req.params.model}:`, error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;