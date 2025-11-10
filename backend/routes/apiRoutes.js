// v1.0.0  -  Ashraf  -  Assessment_Template permission name changed to AssessmentTemplates
// v1.0.1  -  Ashraf  -  fixed postion and interviews rounds and questions no populates
// v1.0.2  -  Ashraf  -  fixed interview questions and rounds filter issue
// v1.0.3  -  Ashraf  -  fixed interview template model populate issues
// v1.0.4  -  Ashraf  -  fixed assessment model sort issue,because assessment is in loop
// v1.0.5  -  Mansoor  -  fixed mockinterview model mapping issue
// v1.0.6  -  Ashraf  -  fixed assessment to assessment template,schedule assessment to assessment schema
// v1.0.7  -  Ashraf  -  fixed feedback model mapping issue
// v1.0.8  -  Venkatesh  -  fixed tenantquestions model mapping issue and add tenantinterviewquestions and tenantassessmentquestions model mapping
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Candidate } = require('../models/candidate.js');
// <-------------------------------v1.0.6
const Assessment = require("../models/Assessment/assessmentTemplates.js");
const AssessmentList = require("../models/Assessment/AssessmentList.js");
// ------------------------------v1.0.6 >
const { Position } = require('../models/Position/position.js');
const InterviewTemplate = require("../models/InterviewTemplate");
const { Interview } = require('../models/Interview/Interview.js');
// v1.0.5 <-----------------------------
const { MockInterview } = require('../models/Mockinterview/mockinterview.js');
const { MockInterviewRound } = require('../models/Mockinterview/mockinterviewRound.js');
// v1.0.5-------------------------------->
const { TenantQuestions } = require('../models/tenantQuestions');
const TenantQuestionsListNames = require('../models/QuestionBank/tenantQuestionsListNames.js');
const { TenantInterviewQuestions } = require('../models/QuestionBank/tenantInterviewQuestions.js');//<--------v1.0.8-----
const { TenantAssessmentQuestions } = require('../models/QuestionBank/tenantAssessmentQuestions.js');//<--------v1.0.8-----
const { InterviewRounds } = require('../models/Interview/InterviewRounds.js');
const InterviewQuestions = require('../models/Interview/selectedInterviewQuestion.js');
const { Users } = require('../models/Users');
const { permissionMiddleware } = require('../middleware/permissionMiddleware');
// <-------------------------------v1.0.6
const ScheduledAssessmentSchema = require('../models/Assessment/assessmentsSchema.js');

// ------------------------------v1.0.6 >
// <-------------------------------v1.0.7

const FeedbackModel = require('../models/feedback.js');
const { Contacts } = require('../models/Contacts.js');
const CandidatePosition = require('../models/CandidatePosition.js');
const { CandidateAssessment } = require('../models/Assessment/candidateAssessment.js');
// ------------------------------v1.0.7 >

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

  assessmentlist: {
    model: AssessmentList,
    permissionName: 'AssessmentTemplates',
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
  },
  // v1.0.5---------------------------->
  // <------------------------v1.0.7
  feedback: {
    model: null, // Will be handled specially in the switch case
    permissionName: 'Feedback',
    requiredPermission: 'View'
  }
  // ------------------------------v1.0.7 >
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

    // Get user information from res.locals (set by permissionMiddleware)
    let { userId, tenantId } = res.locals;

    // If res.locals doesn't have user info, try to extract from token directly
    if (!userId || !tenantId) {
      // console.log('[2.1] No user info in res.locals, trying direct token extraction');

      // Try to get token from cookies first, then from Authorization header
      let authToken = req.cookies.authToken;

      if (!authToken) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authToken = authHeader.substring(7);
          // console.log('[2.2] Got token from Authorization header');
        }
      }

      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
          userId = decoded.userId;
          tenantId = decoded.tenantId;
          // console.log('[2.3] Extracted user info from token:', { userId, tenantId });
        } catch (err) {
          console.error('[2.4] JWT verification failed:', err.message);
        }
      }
    }

    if (!userId || !tenantId) {

      return res.status(401).json({ error: 'Unauthorized: Missing userId or tenantId' });
    }

    const {
      effectivePermissions,
      inheritedRoleIds,
      effectivePermissions_RoleType,
      effectivePermissions_RoleName,
    } = res.locals;

    const modelMapping = getModelMapping(effectivePermissions);

    const modelConfig = modelMapping[model.toLowerCase()];

    if (!modelConfig) {
      return res.status(400).json({ message: `Invalid model: ${model}` });
    }

    const { model: DataModel, hasViewPermission } = modelConfig;


    // Special handling for feedback model which has custom logic
    if (model.toLowerCase() === 'feedback') {
      // console.log('[10] Processing feedback model with custom logic - skipping DataModel validation');
    } else if (!DataModel || typeof DataModel.find !== 'function') {
      console.error('[10] Invalid DataModel configuration - returning 500');
      return res.status(500).json({ error: `Invalid model configuration for ${model}` });
    }
    // ------------------------------v1.0.7 >
    // Base query - always enforce tenant boundary
    // let query = model.toLowerCase() === 'scheduleassessment' ? { organizationId: tenantId } : { tenantId };
    // console.log('[11] Initial query with tenantId:', query);


    let query = {}
    const roleType = effectivePermissions_RoleType;
    const roleName = effectivePermissions_RoleName;

    if (roleType === 'individual') {
      query.ownerId = userId;
    } else if (roleType === 'organization' && roleName !== 'Admin') {


      if (inheritedRoleIds?.length > 0) {
        const accessibleUsers = await Users.find({
          tenantId,
          roleId: { $in: inheritedRoleIds },
        }).select('_id');

        const userIds = accessibleUsers.map(user => user._id);

        // ✅ Include current user's own ID as well
        userIds.push(userId);

        // ✅ Remove duplicates just in case
        query.ownerId = { $in: [...new Set(userIds.map(id => id.toString()))] };
      } else {
        query.ownerId = userId;
      }


    } else if (roleType === 'organization' && roleName === 'Admin') {
      query.tenantId = tenantId;

    }

    let data;
    switch (model.toLowerCase()) {
      case 'mockinterview':
        // console.log('[19] Processing MockInterview model');
        const mockInterviews = await DataModel.find(query).lean();
        const interviewIds1 = mockInterviews.map((interview) => interview._id);
        const mockInterviewRoundsData = await MockInterviewRound.find({
          mockInterviewId: { $in: interviewIds1 },
        })
          .populate({
            path: 'interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();
        data = mockInterviews.map((interview) => ({
          ...interview,
          rounds: mockInterviewRoundsData.filter((round) => round.mockInterviewId.toString() === interview._id.toString()),
        }));



        // console.log('[20] Found', data.length, 'MockInterview records');
        break;

      case 'tenantquestions':
        //<--------v1.0.8-----
        // console.log('[21] Processing TenantQuestions model (aggregated from interview + assessment)');
        const lists = await TenantQuestionsListNames.find(query).lean();
        // console.log('[22] Found', lists.length, 'question lists');

        const listIds = lists.map((list) => list._id);
        // console.log('[23] List IDs to filter questions:', listIds);

        // Fetch across all tenant question sources in parallel
        const [interviewQs, assessmentQs] = await Promise.all([
          TenantInterviewQuestions.find({
            ...query,
            tenantListId: { $in: listIds },
          })
            .populate({ path: 'suggestedQuestionId', model: 'InterviewQuestions' })
            .populate({ path: 'tenantListId', model: 'TenantQuestionsListNames', select: 'label name ownerId type tenantId' })
            .lean(),
          TenantAssessmentQuestions.find({
            ...query,
            tenantListId: { $in: listIds },
          })
            .populate({ path: 'suggestedQuestionId', model: 'AssessmentQuestions' })
            .populate({ path: 'tenantListId', model: 'TenantQuestionsListNames', select: 'label name ownerId type tenantId' })
            .lean(),
        ]);

        const questions = [...interviewQs, ...assessmentQs];

        // console.log('[24] Found', questions.length, 'questions matching lists');

        const groupedQuestions = lists.reduce((acc, list) => {
          acc[list.label] = [];
          return acc;
        }, {});

        questions.forEach((question) => {
          const questionData = question.isCustom ? question : question.suggestedQuestionId;
          (question.tenantListId || []).forEach((list) => {//--------v1.0.8----->
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
        // console.log('[25] Grouped questions by', Object.keys(groupedQuestions).length, 'categories');
        break;

      case 'interview':

        const interviewQueryParams = {
          searchQuery: req.query.searchQuery,
          status: req.query.status, // FIX: Changed from interviewStatus to status
          tech: req.query.tech,
          experienceMin: req.query.experienceMin,
          experienceMax: req.query.experienceMax,
          interviewType: req.query.interviewType,
          interviewMode: req.query.interviewMode,
          position: req.query.position,
          company: req.query.company,
          roundStatus: req.query.roundStatus,
          interviewer: req.query.interviewer,
          createdDate: req.query.createdDate,
          interviewDateFrom: req.query.interviewDateFrom,
          interviewDateTo: req.query.interviewDateTo,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };


        data = await handleInterviewFiltering({
          query,
          DataModel,
          ...interviewQueryParams
        });
        console.log("data", data);




        // const interviews = await DataModel.find(query)
        //   .populate({ path: 'candidateId', model: 'Candidate' })
        //   .populate({ path: 'positionId', model: 'Position' })
        //   .populate({ path: 'templateId', model: 'InterviewTemplate' })
        //   .lean();

        // // console.log('[27] Found', interviews.length, 'interviews');
        // const interviewIds = interviews.map((interview) => interview._id);
        // // console.log('[28] Interview IDs for related data:', interviewIds);
        // // <------------------------------- v1.0.1 
        // const roundsData = await InterviewRounds.find({
        //   interviewId: { $in: interviewIds },
        //   // ------------------------------ v1.0.1 >
        // })
        //   .populate({
        //     path: 'interviewers',
        //     model: 'Contacts',
        //     select: 'firstName lastName email',
        //   })
        //   .lean();

        // // console.log('[29] Found', roundsData.length, 'interview rounds');

        // const interviewQuestions = await InterviewQuestions.find({
        //   interviewId: { $in: interviewIds },
        //   // <------------------------------- v1.0.1 
        // })
        //   .select('roundId snapshot')
        //   .lean();

        // // console.log('[30] Found', interviewQuestions.length, 'interview questions');
        // // <------------------------------- v1.0.2 
        // const roundsWithQuestions = roundsData.map((round) => ({
        //   ...round,
        //   questions: interviewQuestions.filter((q) => q.roundId.toString() === round._id.toString()),
        // }));

        // data = interviews.map((interview) => ({
        //   // <------------------------------- v1.0.2 
        //   ...interview,
        //   rounds: roundsWithQuestions.filter((round) => round.interviewId.toString() === interview._id.toString()),
        // }));
        // ------------------------------ v1.0.2 >
        // console.log('[31] Final interview data with rounds and questions prepared');
        break;

      // <------------------------------- v1.0.3 
      case 'interviewtemplate':
        // console.log('[34] Processing InterviewTemplate model');
        // Use the existing query (which has tenantId and ownerId filters) and add standard templates
        query = {
          $or: [
            { type: 'standard' }, // Standard templates are accessible to all
            {
              $and: [
                { type: 'custom' },
                query, // Reuse the base query with tenantId and ownerId filters
              ],
            },
          ],
        };

        data = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
          .lean();

        break;
      // ------------------------------ v1.0.4 >

      case 'assessment'://assessment templates

        query = {
          $or: [
            { type: 'standard' }, // Standard templates are accessible to all
            {
              $and: [
                { type: 'custom' },
                query, // Reuse the base query with tenantId and ownerId filters
              ],
            },
          ],
        };
        // console.log('[36] Processing Assessment model');
        data = await DataModel.find(query)
          .lean();
        // console.log('[37] Found', data.length, 'Assessment records');
        break;

      case 'scheduleassessment': {
        const { assessmentId } = req.query;

        // Base filter: tenant + ownership (already built in `query`)
        const scheduledFilter = {
          ...query,           // includes tenantId, ownerId (or $in for inherited roles)
          isActive: true,
        };

        // Only add assessmentId filter if it's provided AND valid
        if (assessmentId) {
          if (!mongoose.isValidObjectId(assessmentId)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid assessmentId format'
            });
          }
          scheduledFilter.assessmentId = assessmentId;
        }

        // 1. Fetch active scheduled assessments (filtered by assessmentId if provided)
        const scheduledAssessments = await ScheduledAssessmentSchema
          .find(scheduledFilter)
          .select('_id order expiryAt status createdAt assessmentId')
          .lean();

        // If no assessments found, return empty array
        if (!scheduledAssessments.length) {
          data = [];
          break;
        }

        // 2. Get all candidate assessments for these scheduled IDs
        const scheduledIds = scheduledAssessments.map(sa => sa._id);

        const candidateAssessments = await CandidateAssessment.find({
          scheduledAssessmentId: { $in: scheduledIds }
        })
          .populate('candidateId')
          .lean();


        // 3. Group candidates under each scheduled assessment
        const schedulesWithCandidates = scheduledAssessments.map(schedule => {
          const candidates = candidateAssessments.filter(
            ca => ca.scheduledAssessmentId.toString() === schedule._id.toString()
          );
          return {
            _id: schedule._id,
            assessmentId: schedule.assessmentId,
            order: schedule.order,
            expiryAt: schedule.expiryAt,
            status: schedule.status,
            createdAt: schedule.createdAt,
            candidates,
          };
        });

        data = schedulesWithCandidates;
        console.log("scheduleassessment", data);
        break;
      }
      // ------------------------------ v1.0.4 >
      case 'assessmentlist':
        query = {
          $or: [
            { type: 'standard' }, // Standard templates are accessible to all
            {
              $and: [
                { type: 'custom' },
                query, // Reuse the base query with tenantId and ownerId filters
              ],
            },
          ],
        };
        data = await DataModel.find(query);
        break;


      case 'position':

        // query search params based on that will get the data
        // query search params based on that will get the data
        const {
          page, limit, searchQuery,
          location, tech, company,
          experienceMin, experienceMax,
          salaryMin, salaryMax,
          createdDate
        } = req.query;

        const parsedPositionPage = parseInt(page) || 1;
        const parsedPositionLimit = parseInt(limit) || 10;
        const positionSkip = (parsedPositionPage - 1) * parsedPositionLimit;

        // Apply search
        if (searchQuery) {
          const searchRegex = new RegExp(searchQuery, 'i');
          query.$or = [
            { title: searchRegex },
            { companyname: searchRegex },
            { Location: searchRegex },
            { positionCode: searchRegex }
          ];
        }

        // Apply location filter
        if (location) {
          const locations = Array.isArray(location) ? location : [location];
          query.Location = { $in: locations };
        }

        // Apply tech/skills filter
        if (tech) {
          const techs = Array.isArray(tech) ? tech : [tech];
          query['skills.skill'] = { $in: techs };
        }

        // Apply company filter
        if (company) {
          const companies = Array.isArray(company) ? company : [company];
          query.companyname = { $in: companies };
        }

        // Apply experience filter
        const positionExpMin = parseInt(experienceMin) || 0;
        const positionExpMax = parseInt(experienceMax) || Infinity;
        if (positionExpMin > 0 || positionExpMax < Infinity) {
          query.$and = query.$and || [];
          if (positionExpMin > 0) query.$and.push({ minexperience: { $gte: positionExpMin } });
          if (positionExpMax < Infinity) query.$and.push({ maxexperience: { $lte: positionExpMax } });
        }

        // Apply salary filter
        const positionSalMin = parseInt(salaryMin) || 0;
        const positionSalMax = parseInt(salaryMax) || Infinity;

        // Apply salary filter - CORRECT WAY
        if (positionSalMin > 0 || positionSalMax < Infinity) {
          query.$and = query.$and || [];

          if (positionSalMin > 0) {
            query.$and.push({
              $or: [
                { maxSalary: { $gte: positionSalMin } },
                { minSalary: { $gte: positionSalMin } }
              ]
            });
          }
          if (positionSalMax < Infinity) {
            query.$and.push({
              $or: [
                { minSalary: { $lte: positionSalMax } },
                { maxSalary: { $lte: positionSalMax } }
              ]
            });
          }
        }

        // Apply created date filter
        if (createdDate === 'last7') {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          query.createdAt = { $gte: date };
        } else if (createdDate === 'last30') {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          query.createdAt = { $gte: date };
        }

        // Fetch paginated data with sort
        const positionData = await DataModel.find(query)
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'firstName lastName email',
          })
           .sort({ _id : -1 })
          // .sort({ createdAt: -1 })
          .skip(positionSkip)
          .limit(parsedPositionLimit)
          .lean();

        // Get total count
        total = await DataModel.countDocuments(query);

        dataObj = {
          positions: positionData,
          total,
          page: parsedPositionPage,
          totalPages: Math.ceil(total / parsedPositionLimit)
        };

        data = dataObj;
        break;

      // data = await DataModel.find(query)
      //   .populate({
      //     path: 'rounds.interviewers',
      //     model: 'Contacts',
      //     select: 'firstName lastName email',
      //   })
      //   .lean();
      // console.log('[33] Found', data.length, 'Position records');
      // break;

      case 'feedback':
        // console.log('[34] Processing Feedback model with complex logic');

        // Get all interviews for the current tenant/owner (using the already filtered query)
        const feedbackInterviews = await Interview.find(query)
          .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
          .populate('positionId', 'title companyname jobDescription Location')
          .lean();

        // console.log('[35] Found', feedbackInterviews.length, 'interviews for feedback lookup');

        // Get all interview round IDs from these interviews
        const feedbackInterviewIds = feedbackInterviews.map(interview => interview._id);
        const feedbackInterviewRounds = await InterviewRounds.find({
          interviewId: { $in: feedbackInterviewIds }
        }).lean();

        const feedbackRoundIds = feedbackInterviewRounds.map(round => round._id);
        // console.log('[36] Found', feedbackRoundIds.length, 'interview round IDs');

        // Get feedback based on round IDs and tenant/owner matching
        // The query already includes tenantId and ownerId filtering from the general logic above
        let feedbackQuery = {
          $or: [
            { interviewRoundId: { $in: feedbackRoundIds } },
            { tenantId: tenantId }
          ]
        };

        // For non-admin users, also include feedback they own (the general logic already handles this)
        if (roleType === 'individual' || (roleType === 'organization' && roleName !== 'Admin')) {
          feedbackQuery.$or.push({ ownerId: userId });
        }

        // console.log('[37] Feedback query:', JSON.stringify(feedbackQuery, null, 2));

        const feedbacks = await FeedbackModel.find(feedbackQuery)
          .populate('candidateId', 'FirstName LastName Email Phone skills CurrentExperience')
          .populate('positionId', 'title companyname jobDescription Location')
          .populate('interviewRoundId', 'roundTitle interviewMode interviewType interviewerType duration instructions dateTime status')
          .populate('interviewerId', 'firstName lastName email')
          .populate('ownerId', 'firstName lastName email')
          .lean();

        // console.log('[38] Found', feedbacks.length, 'feedback records');

        // Get interview questions for each feedback
        const feedbackWithQuestions = await Promise.all(feedbacks.map(async (feedback) => {
          const preSelectedQuestions = await InterviewQuestions.find({
            roundId: feedback.interviewRoundId?._id
          }).lean();

          return {
            ...feedback,
            preSelectedQuestions,
            // Add action buttons based on status
            canEdit: feedback.status === 'draft',
            canView: true
          };
        }));

        data = feedbackWithQuestions;
        // console.log('[39] Final feedback data prepared with', data.length, 'records');
        break;

      case "candidate":

        const {
          page: candidatePage = 1,
          limit: candidateLimit = 10,
          search: candidateSearch,
          status: candidateStatus,
          tech: candidateTech,
          experienceMin: candidateExperienceMin,
          experienceMax: candidateExperienceMax,
          relevantExperienceMin: candidateRelevantExperienceMin,
          relevantExperienceMax: candidateRelevantExperienceMax,
          roles: candidateRoles,
          universities: candidateUniversities,
          createdDate: candidateCreatedDate
        } = req.query;

        const parsedCandidatePage = parseInt(candidatePage) || 1;
        const parsedCandidateLimit = parseInt(candidateLimit) || 10;
        const candidateSkip = (parsedCandidatePage - 1) * parsedCandidateLimit;

        // Apply search
        if (candidateSearch) {
          const searchRegex = new RegExp(candidateSearch, 'i');
          query.$or = [
            { FirstName: searchRegex },
            { LastName: searchRegex },
            { Email: searchRegex },
            { Phone: searchRegex }
          ];
        }

        // Apply filters
        if (candidateStatus) {
          const statuses = Array.isArray(candidateStatus) ? candidateStatus : [candidateStatus];
          query.HigherQualification = { $in: statuses };
        }

        if (candidateTech) {
          const techs = Array.isArray(candidateTech) ? candidateTech : [candidateTech];
          query['skills.skill'] = { $in: techs };
        }

        const candidateExpMin = parseInt(candidateExperienceMin) || 0;
        const candidateExpMax = parseInt(candidateExperienceMax) || Infinity;
        if (candidateExpMin > 0 || candidateExpMax < Infinity) {
          query.CurrentExperience = {};
          if (candidateExpMin > 0) query.CurrentExperience.$gte = candidateExpMin;
          if (candidateExpMax < Infinity) query.CurrentExperience.$lte = candidateExpMax;
        }

        const candidateRelExpMin = parseInt(candidateRelevantExperienceMin) || 0;
        const candidateRelExpMax = parseInt(candidateRelevantExperienceMax) || Infinity;
        if (candidateRelExpMin > 0 || candidateRelExpMax < Infinity) {
          query.RelevantExperience = {};
          if (candidateRelExpMin > 0) query.RelevantExperience.$gte = candidateRelExpMin;
          if (candidateRelExpMax < Infinity) query.RelevantExperience.$lte = candidateRelExpMax;
        }

        if (candidateRoles) {
          const roleList = Array.isArray(candidateRoles) ? candidateRoles : [candidateRoles];
          query.CurrentRole = { $in: roleList };
        }

        if (candidateUniversities) {
          const uniList = Array.isArray(candidateUniversities) ? candidateUniversities : [candidateUniversities];
          query.UniversityCollege = { $in: uniList };
        }

        if (candidateCreatedDate === 'last7') {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          query.createdAt = { $gte: date };
        } else if (candidateCreatedDate === 'last30') {
          const date = new Date();
          date.setDate(date.getDate() - 30);
          query.createdAt = { $gte: date };
        }

        // Fetch paginated data with sort
        const candidateData = await Candidate.find(query)
         .sort({ _id : -1 })
          // .sort({ createdAt: -1 })
          .skip(candidateSkip)
          .limit(parsedCandidateLimit)
          .lean();

        // Get total count
        total = await Candidate.countDocuments(query);

        dataObj = {
          candidate: candidateData,
          total
        };

        data = dataObj;
        break;

      // data = await DataModel.find(query).lean();
      // break;  

      default:
        // console.log('[40] Processing generic model:', model);
        data = await DataModel.find(query).lean();

    }

    // console.log('[36] Sending response with data');
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
  // console.log('--- REQUEST PROCESSING COMPLETE ---');
});


async function handleInterviewFiltering(options) {
  const {
    query,
    DataModel,
    searchQuery,
    status,
    tech,
    experienceMin,
    experienceMax,
    interviewType,
    interviewMode,
    position,
    company,
    roundStatus,
    interviewer,
    createdDate,
    interviewDateFrom,
    interviewDateTo,
    page = 1,
    limit = 10
  } = options;

  console.log('🔍 Backend filtering started with:', {
    searchQuery,
    status,
    tenantId: query.tenantId,
    page,
    limit
  });

  try {
    // Start with base query (tenant/organization filtering)
    let matchQuery = { ...query };

    // In handleInterviewFiltering
    if (searchQuery && searchQuery.trim() !== '') {
      const searchQueryTrimmed = searchQuery.trim();
      const searchRegex = new RegExp(searchQueryTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const searchWords = searchQueryTrimmed.toLowerCase().split(/\s+/).filter(Boolean);

      const fullNameOr = searchWords.length > 1 ? [
        {
          $and: [
            { 'candidateId.FirstName': new RegExp(searchWords[0], 'i') },
            { 'candidateId.LastName': new RegExp(searchWords[1], 'i') }
          ]
        },
        {
          $and: [
            { 'candidateId.FirstName': new RegExp(searchWords[1], 'i') },
            { 'candidateId.LastName': new RegExp(searchWords[0], 'i') }
          ]
        }
      ] : [];

      matchQuery.$or = [
        { 'candidateId.FirstName': searchRegex },
        { 'candidateId.LastName': searchRegex },
        { 'candidateId.Email': searchRegex },
        { 'positionId.title': searchRegex },
        { 'positionId.companyname': searchRegex },
        { interviewCode: searchRegex },
        { status: searchRegex },
        ...fullNameOr
      ];
    }

    // ✅ Status filter
    if (status && status.length > 0) {
      const statusArray = Array.isArray(status) ? status : [status];
      matchQuery.status = { $in: statusArray };
    }

    // ✅ Interview Type filter
    if (interviewType && interviewType.length > 0) {
      const typeArray = Array.isArray(interviewType) ? interviewType : [interviewType];
      matchQuery.interviewType = { $in: typeArray };
    }

    // ✅ Interview Mode filter
    if (interviewMode && interviewMode.length > 0) {
      const modeArray = Array.isArray(interviewMode) ? interviewMode : [interviewMode];
      matchQuery.interviewMode = { $in: modeArray };
    }

    // ✅ Created Date filter
    if (createdDate) {
      const date = new Date();
      switch (createdDate) {
        case 'last7':
          date.setDate(date.getDate() - 7);
          matchQuery.createdAt = { $gte: date };
          break;
        case 'last30':
          date.setDate(date.getDate() - 30);
          matchQuery.createdAt = { $gte: date };
          break;
        case 'last90':
          date.setDate(date.getDate() - 90);
          matchQuery.createdAt = { $gte: date };
          break;
        default:
          if (createdDate.includes('-')) {
            matchQuery.createdAt = { $gte: new Date(createdDate) };
          }
      }
    }

    console.log('📋 Final MongoDB matchQuery:', JSON.stringify(matchQuery, null, 2));

    // Use regular find with populate instead of aggregation for better reliability
    let interviews = await DataModel.find(matchQuery)
      .populate({
        path: 'candidateId',
        model: 'Candidate',
        select: 'FirstName LastName Email Phone skills CurrentExperience ImageData'
      })
      .populate({
        path: 'positionId',
        model: 'Position',
        select: 'title companyname Location jobDescription'
      })
      .populate({
        path: 'templateId',
        model: 'InterviewTemplate'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`✅ Found ${interviews.length} interviews after main query`);

    // Get total count for pagination
    const totalCount = await DataModel.countDocuments(matchQuery);
    console.log(`📊 Total count: ${totalCount}`);

    // If no interviews found, return empty result early
    if (!interviews.length) {
      return {
        data: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0
      };
    }

    // Get rounds for all interviews
    const interviewIds = interviews.map(interview => interview._id);
    const roundsData = await InterviewRounds.find({
      interviewId: { $in: interviewIds }
    })
      .populate({
        path: 'interviewers',
        model: 'Contacts',
        select: 'firstName lastName email'
      })
      .lean();

    console.log(`🔄 Found ${roundsData.length} rounds for interviews`);

    // Get questions for all rounds
    const roundIds = roundsData.map(round => round._id);
    const interviewQuestions = await InterviewQuestions.find({
      roundId: { $in: roundIds }
    })
      .select('roundId snapshot')
      .lean();

    console.log(`❓ Found ${interviewQuestions.length} interview questions`);

    // Combine rounds with questions
    const roundsWithQuestions = roundsData.map(round => ({
      ...round,
      questions: interviewQuestions.filter(q =>
        q.roundId && q.roundId.toString() === round._id.toString()
      )
    }));

    // Combine interviews with rounds
    const combinedData = interviews.map(interview => ({
      ...interview,
      rounds: roundsWithQuestions.filter(round =>
        round.interviewId && round.interviewId.toString() === interview._id.toString()
      )
    }));

    console.log(`🎉 Final combined data: ${combinedData.length} interviews`);

    return {
      data: combinedData,
      total: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit)
    };

  } catch (error) {
    console.error('❌ Error in interview filtering:', error);
    throw error;
  }
}



module.exports = router;