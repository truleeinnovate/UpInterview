// v1.0.0  -  Ashraf  -  Assessment_Template permission name changed to AssessmentTemplates
// v1.0.1  -  Ashraf  -  fixed postion and interviews rounds and questions no populates
// v1.0.2  -  Ashraf  -  fixed interview questions and rounds filter issue
// v1.0.3  -  Ashraf  -  fixed interview template model populate issues
// v1.0.4  -  Ashraf  -  fixed assessment model sort issue,because assessment is in loop
// v1.0.5  -  Mansoor  -  fixed mockinterview model mapping issue
// v1.0.6  -  Ashraf  -  fixed assessment to assessment template,schedule assessment to assessment schema
// v1.0.7  -  Ashraf  -  fixed feedback model mapping issue
// v1.0.8  -  Venkatesh  -  fixed tenantquestions model mapping issue and add tenantinterviewquestions and tenantassessmentquestions model mapping
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Candidate } = require("../models/candidate.js");
// <-------------------------------v1.0.6
const Assessment = require("../models/Assessment/assessmentTemplates.js");
const AssessmentList = require("../models/Assessment/AssessmentList.js");
// ------------------------------v1.0.6 >
const { Position } = require("../models/Position/position.js");
const InterviewTemplate = require("../models/InterviewTemplate");
const { Interview } = require("../models/Interview/Interview.js");
// v1.0.5 <-----------------------------
const { MockInterview } = require("../models/Mockinterview/mockinterview.js");
const {
  MockInterviewRound,
} = require("../models/Mockinterview/mockinterviewRound.js");
// v1.0.5-------------------------------->
const { TenantQuestions } = require("../models/tenantQuestions");
const TenantQuestionsListNames = require("../models/QuestionBank/tenantQuestionsListNames.js");
const {
  TenantInterviewQuestions,
} = require("../models/QuestionBank/tenantInterviewQuestions.js"); //<--------v1.0.8-----
const {
  TenantAssessmentQuestions,
} = require("../models/QuestionBank/tenantAssessmentQuestions.js"); //<--------v1.0.8-----
const { InterviewRounds } = require("../models/Interview/InterviewRounds.js");
const InterviewQuestions = require("../models/Interview/selectedInterviewQuestion.js");
const { Users } = require("../models/Users");
const { permissionMiddleware } = require("../middleware/permissionMiddleware");
// <-------------------------------v1.0.6
const ScheduledAssessmentSchema = require("../models/Assessment/assessmentsSchema.js");

// ------------------------------v1.0.6 >
// <-------------------------------v1.0.7

const FeedbackModel = require("../models/feedback.js");
const { Contacts } = require("../models/Contacts.js");
const CandidatePosition = require("../models/CandidatePosition.js");
const {
  CandidateAssessment,
} = require("../models/Assessment/candidateAssessment.js");
const { TenantCompany } = require("../models/TenantCompany/TenantCompany.js");
// ------------------------------v1.0.7 >

const { authContextMiddleware } = require("../middleware/authContext.js");
const { RoleMaster } = require("../models/MasterSchemas/RoleMaster.js");
const { buildPermissionQuery } = require("../utils/buildPermissionQuery");
const { Resume } = require("../models/Resume.js");

const modelRequirements = {
  candidate: {
    model: Candidate,
    permissionName: "Candidates",
    requiredPermission: "View",
  },
  position: {
    model: Position,
    permissionName: "Positions",
    requiredPermission: "View",
  },
  interview: {
    model: Interview,
    permissionName: "Interviews",
    requiredPermission: "View",
  },
  assessment: {
    model: Assessment,
    // <---------------------- v1.0.0
    permissionName: "AssessmentTemplates",
    // ---------------------- v1.0.0 >
    requiredPermission: "View",
  },

  assessmentlist: {
    model: AssessmentList,
    permissionName: "AssessmentTemplates",
    requiredPermission: "View",
  },
  scheduleassessment: {
    model: ScheduledAssessmentSchema,
    permissionName: "Assessments",
    requiredPermission: "View",
  },
  tenantquestions: {
    model: TenantQuestions,
    permissionName: "QuestionBank",
    requiredPermission: "View",
  },
  interviewtemplate: {
    model: InterviewTemplate,
    permissionName: "InterviewTemplates",
    requiredPermission: "View",
  },
  // <------------------------v1.0.5
  mockinterview: {
    // FIXED: added mockinterview mapping
    model: MockInterview,
    permissionName: "MockInterviews",
    requiredPermission: "View",
  },
  // v1.0.5---------------------------->
  // <------------------------v1.0.7
  feedback: {
    model: null, // Will be handled specially in the switch case
    permissionName: "Feedback",
    requiredPermission: "View",
  },
  // ------------------------------v1.0.7 >
};

const getModelMapping = (permissions) => {
  return Object.entries(modelRequirements).reduce((acc, [key, config]) => {
    const modelPerms = permissions?.[config.permissionName] || {};
    acc[key] = {
      model: config.model,
      permissionName: config.permissionName,
      hasViewPermission: modelPerms[config.requiredPermission] === true,
    };
    return acc;
  }, {});
};

router.get(
  "/:model",
  permissionMiddleware,
  authContextMiddleware,
  async (req, res) => {
    try {
      const { model } = req.params;

      const {
        actingAsUserId,
        actingAsTenantId,
        onBehalfOfUserId,
        isImpersonating,
        isSuperAdminOnly,
        isEffectiveOnly,
      } = res.locals.auth;

      // // Get user information from res.locals (set by permissionMiddleware)
      // let { userId, tenantId } = res.locals;

      // // If res.locals doesn't have user info, try to extract from token directly
      // if (!userId || !tenantId) {
      //   // console.log('[2.1] No user info in res.locals, trying direct token extraction');

      //   // Try to get token from cookies first, then from Authorization header
      //   let authToken = req.cookies.authToken;

      //   if (!authToken) {
      //     const authHeader = req.headers.authorization;
      //     if (authHeader && authHeader.startsWith("Bearer ")) {
      //       authToken = authHeader.substring(7);
      //       // console.log('[2.2] Got token from Authorization header');
      //     }
      //   }

      //   if (authToken) {
      //     try {
      //       const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      //       userId = decoded.userId;
      //       tenantId = decoded.tenantId;
      //       // console.log('[2.3] Extracted user info from token:', { userId, tenantId });
      //     } catch (err) {
      //       console.error("[2.4] JWT verification failed:", err.message);
      //     }
      //   }
      // }

      let userId = actingAsUserId;
      let tenantId = actingAsTenantId;

      if (!userId || !tenantId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing userId or tenantId" });
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
      if (model.toLowerCase() === "feedback") {
        // console.log('[10] Processing feedback model with custom logic - skipping DataModel validation');
      } else if (!DataModel || typeof DataModel.find !== "function") {
        console.error("[10] Invalid DataModel configuration - returning 500");
        return res
          .status(500)
          .json({ error: `Invalid model configuration for ${model}` });
      }
      // ------------------------------v1.0.7 >
      // Base query - always enforce tenant boundary
      // let query = model.toLowerCase() === 'scheduleassessment' ? { organizationId: tenantId } : { tenantId };
      // console.log('[11] Initial query with tenantId:', query);

      const permissionQuery = await buildPermissionQuery(
        userId,
        tenantId,
        inheritedRoleIds || [],
        effectivePermissions_RoleType,
        effectivePermissions_RoleName
      );

      let query = { ...permissionQuery };
      const roleType = effectivePermissions_RoleType;
      const roleName = effectivePermissions_RoleName;

      // if (roleType === "individual") {
      //   query.ownerId = userId;
      // } else if (roleType === "organization" && roleName !== "Admin") {
      //   if (inheritedRoleIds?.length > 0) {
      //     const accessibleUsers = await Users.find({
      //       tenantId,
      //       roleId: { $in: inheritedRoleIds },
      //     }).select("_id");

      //     const userIds = accessibleUsers.map((user) => user._id);

      //     // ✅ Include current user's own ID as well
      //     userIds.push(userId);

      //     // ✅ Remove duplicates just in case
      //     query.ownerId = {
      //       $in: [...new Set(userIds.map((id) => id.toString()))],
      //     };
      //   } else {
      //     query.ownerId = userId;
      //   }
      // } else if (roleType === "organization" && roleName === "Admin") {
      //   query.tenantId = tenantId;
      // }

      let data;
      switch (model.toLowerCase()) {
        // API Route Handler Code
        case "mockinterview":
          const {
            search: mockSearch,
            page: mockPage = 0,
            limit: mockLimit,
            filters = {}, // Extract filters object
            currentRole,
            interviewer: mockInterviewer = [],
          } = req.query;

          // console.log("req.query", req.query);

          // Extract filters from the filters object
          const {
            status: mockStatus = [],
            duration: mockDuration = {},
            createdDate: mockCreatedDate = "",
          } = filters;

          console.log("Extracted filters:", {
            mockStatus,
            mockDuration,
            mockCreatedDate,
          });

          // -------------------------------
          // BASE QUERY FOR MOCKINTERVIEW
          // -------------------------------
          let mockQuery = { ...query };

          // Full text search
          if (mockSearch) {
            mockQuery.$or = [
              { mockInterviewCode: { $regex: mockSearch, $options: "i" } },
              { currentRole: { $regex: mockSearch, $options: "i" } },
              { candidateName: { $regex: mockSearch, $options: "i" } },
            ];
          }

          // Technology filter (currentRole)
          if (currentRole) {
            mockQuery.currentRole = currentRole;
          }

          // Created Date filter
          if (mockCreatedDate) {
            const now = new Date();
            let startDate = new Date();

            switch (mockCreatedDate) {
              case "last7":
                startDate.setDate(now.getDate() - 7);
                break;
              case "last30":
                startDate.setDate(now.getDate() - 30);
                break;
              case "last90":
                startDate.setDate(now.getDate() - 90);
                break;
              default:
                startDate = null;
            }

            if (startDate) {
              mockQuery.createdAt = { $gte: startDate };
            }
          }

          // ------------------------------------------------------------------
          // ⭐ ROUND FILTERS (status + duration) – FROM MockInterviewRound
          // ------------------------------------------------------------------
          let roundFilteredInterviewIds = null;
          const roundFilters = {};

          // STATUS filter (from MockInterviewRound)
          if (mockStatus && mockStatus.length > 0) {
            // Map frontend status values to backend schema values
            const mappedStatus = mockStatus.map((s) => {
              switch (s) {
                case "Requests Sent":
                  return "RequestSent";
                case "In Progress":
                  return "InProgress";
                case "Not Completed":
                  return "InCompleted"; // Based on your schema
                case "InCompleted":
                  return "InCompleted";
                case "No Show":
                  return "NoShow";
                default:
                  return s;
              }
            });

            roundFilters.status = { $in: mappedStatus };

            // console.log("Status filter applied:", {
            //   original: mockStatus,
            //   mapped: mappedStatus,
            //   roundFilters: roundFilters.status,
            // });
          }

          // DURATION filter (from MockInterviewRound)
          if (mockDuration && (mockDuration.min || mockDuration.max)) {
            roundFilters.duration = {};
            if (mockDuration.min && mockDuration.min !== "")
              roundFilters.duration.$gte = parseInt(mockDuration.min);
            if (mockDuration.max && mockDuration.max !== "")
              roundFilters.duration.$lte = parseInt(mockDuration.max);
          }

          // If any round filters exist → fetch matching mockInterviewIds
          if (Object.keys(roundFilters).length > 0) {
            // console.log(
            //   "Applying round filters to MockInterviewRound:",
            //   roundFilters
            // );

            const roundDocs = await MockInterviewRound.find(roundFilters)
              .select("mockInterviewId")
              .lean();

            roundFilteredInterviewIds = roundDocs.map((r) =>
              r.mockInterviewId.toString()
            );

            // console.log(
            //   "Found interview IDs from round filters:",
            //   roundFilteredInterviewIds.length
            // );

            // No interview matches → return empty response
            if (roundFilteredInterviewIds.length === 0) {
              return {
                data: [],
                totalCount: 0,
                totalPages: 0,
                filteredCount: 0,
                currentPage: 1,
                limit: mockLimit,
              };
            }
          }

          // Apply ROUND FILTER to main query
          if (roundFilteredInterviewIds) {
            mockQuery._id = { $in: roundFilteredInterviewIds };
          }

          // ---------------------------------------------------------------
          // PAGINATION VALUES
          // ---------------------------------------------------------------
          const pageNum = Math.max(1, parseInt(mockPage));
          let limitNum = mockLimit;

          // Convert Infinity (string or number) → 0 because MongoDB uses 0 = unlimited
          if (
            mockLimit === "Infinity" ||
            mockLimit === Infinity ||
            isNaN(limitNum)
          ) {
            limitNum = 0;
          }

          // Then use pageNum in your query
          const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

          // Count BEFORE pagination
          const totalCount = await MockInterview.countDocuments(mockQuery);
          const totalPages =
            limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1;

          // ---------------------------------------------------------------
          // FETCH MOCK INTERVIEWS
          // ---------------------------------------------------------------
          const mockInterviews = await MockInterview.find(mockQuery)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();



          const interviewIds = mockInterviews.map((i) => i._id);

          const roleNames = mockInterviews
            .map((i) => i.currentRole)
            .filter(Boolean);

          let roleDocs = [];

          if (roleNames.length > 0) {
            roleDocs = await RoleMaster.find({
              roleName: { $in: roleNames },
            }).lean();
          }

          const roleMaps = {};

          roleDocs.forEach((r) => {
            roleMaps[r.roleName] = r;
          });

          // ---------------------------------------------------------------
          // FETCH ROUNDS (JOIN)
          // ---------------------------------------------------------------
          const mockRounds = await MockInterviewRound.find({
            mockInterviewId: { $in: interviewIds },
          })
            .populate({
              path: "interviewers",
              model: "Contacts",
              select: "firstName lastName email",
            })
            .lean();

          // Combine interviews with rounds and role details
          let combinedData = mockInterviews.map((interview) => {
            const rounds = mockRounds.filter(
              (r) => r.mockInterviewId.toString() === interview._id.toString()
            );

            const roleInfo = roleMaps[interview.currentRole] || null;

            return {
              ...interview,
              rounds,
              roleDetails: roleInfo
                ? {
                  roleName: roleInfo.roleName,
                  roleLabel: roleInfo.roleLabel,
                  roleCategory: roleInfo.roleCategory,
                }
                : null,
            };
          });

          // ---------------------------------------------------------------
          // INTERVIEWER FILTER AFTER JOIN
          // ---------------------------------------------------------------
          if (mockInterviewer && mockInterviewer.length > 0) {
            combinedData = combinedData.filter((interview) => {
              const interviewers =
                interview.rounds?.flatMap((r) => r.interviewers) || [];

              return interviewers.some((int) => {
                if (!int) return false;
                const fullName = `${int.firstName || ""} ${int.lastName || ""
                  }`.trim();
                return mockInterviewer.includes(fullName);
              });
            });
          }

          // ---------------------------------------------------------------
          // FINAL RESPONSE
          // ---------------------------------------------------------------
          data = {
            data: combinedData,
            totalCount,
            filteredCount: combinedData.length,
            currentPage: pageNum,
            totalPages,
            limit: limitNum,
          };

          break;
        // case "mockinterview":
        //   const {
        //     search: mockSearch,
        //     page: mockPage = 1,
        //     limit: mockLimit,
        //     status: mockStatus = [],
        //     currentRole: currentRole,
        //     duration: mockDuration = {},
        //     createdDate: mockCreatedDate = "",
        //     interviewer: mockInterviewer = [],
        //   } = req.query;

        //   console.log("req.query", req.query);

        //   // -------------------------------
        //   // BASE QUERY FOR MOCKINTERVIEW
        //   // -------------------------------
        //   let mockQuery = { ...query };

        //   // Full text search
        //   if (mockSearch) {
        //     mockQuery.$or = [
        //       { mockInterviewCode: { $regex: mockSearch, $options: "i" } },
        //       { currentRole: { $regex: mockSearch, $options: "i" } },
        //       { candidateName: { $regex: mockSearch, $options: "i" } },
        //       { Role: { $regex: mockSearch, $options: "i" } },
        //     ];
        //   }

        //   // Technology filter
        //   if (currentRole) {
        //     mockQuery.currentRole = { $in: currentRole };
        //   }

        //   // Created Date filter
        //   if (mockCreatedDate) {
        //     const now = new Date();
        //     let startDate = new Date();

        //     switch (mockCreatedDate) {
        //       case "last7":
        //         startDate.setDate(now.getDate() - 7);
        //         break;
        //       case "last30":
        //         startDate.setDate(now.getDate() - 30);
        //         break;
        //       case "last90":
        //         startDate.setDate(now.getDate() - 90);
        //         break;
        //       default:
        //         startDate = null;
        //     }

        //     if (startDate) {
        //       mockQuery.createdAt = { $gte: startDate };
        //     }
        //   }

        //   // ------------------------------------------------------------------
        //   // ⭐ ROUND FILTERS (status + duration) – FROM MockInterviewRound
        //   // ------------------------------------------------------------------
        //   let roundFilteredInterviewIds = null;
        //   const roundFilters = {};

        //   // STATUS filter (from MockInterviewRound)
        //   if (mockStatus.length > 0) {
        //     roundFilters.status = {
        //       $in: mockStatus.map((s) =>
        //         s === "Requests Sent" ? "RequestSent" : s
        //       ),
        //     };
        //   }

        //   // DURATION filter (from MockInterviewRound)
        //   if (mockDuration.min || mockDuration.max) {
        //     roundFilters.duration = {};
        //     if (mockDuration.min)
        //       roundFilters.duration.$gte = parseInt(mockDuration.min);
        //     if (mockDuration.max)
        //       roundFilters.duration.$lte = parseInt(mockDuration.max);
        //   }

        //   // If any round filters exist → fetch matching mockInterviewIds
        //   if (Object.keys(roundFilters).length > 0) {
        //     const roundDocs = await MockInterviewRound.find(roundFilters)
        //       .select("mockInterviewId")
        //       .lean();

        //     roundFilteredInterviewIds = roundDocs.map((r) =>
        //       r.mockInterviewId.toString()
        //     );

        //     // No interview matches → return empty response
        //     if (roundFilteredInterviewIds.length === 0) {
        //       return {
        //         data: [],
        //         totalCount: 0,
        //         totalPages: 0,
        //         filteredCount: 0,
        //         currentPage: 1,
        //         limit: mockLimit,
        //       };
        //     }
        //   }

        //   // Apply ROUND FILTER to main query
        //   if (roundFilteredInterviewIds) {
        //     mockQuery._id = { $in: roundFilteredInterviewIds };
        //   }

        //   // ---------------------------------------------------------------
        //   // PAGINATION VALUES
        //   // ---------------------------------------------------------------
        //   const pageNum = Math.max(1, parseInt(mockPage));
        //   // const limitNum =
        //   //   mockLimit === Infinity
        //   //     ? Infinity
        //   //     : Math.max(1, parseInt(mockLimit));
        //   // const skip = (pageNum - 1) * limitNum;

        //   let limitNum = mockLimit;

        //   // Convert Infinity (string or number) → 0 because MongoDB uses 0 = unlimited
        //   if (
        //     mockLimit === "Infinity" ||
        //     mockLimit === Infinity ||
        //     isNaN(limitNum)
        //   ) {
        //     limitNum = 0;
        //   }

        //   // Count BEFORE pagination
        //   const totalCount = await MockInterview.countDocuments(mockQuery);
        //   const totalPages =
        //     totalCount > 0 ? Math.ceil(totalCount / limitNum) : 0;

        //   // ---------------------------------------------------------------
        //   // FETCH MOCK INTERVIEWS
        //   // ---------------------------------------------------------------
        //   const mockInterviews = await MockInterview.find(mockQuery)
        //     .sort({ _id: -1 })
        //     // .skip(skip)
        //     .limit(limitNum)
        //     .lean();

        //   const interviewIds = mockInterviews.map((i) => i._id);

        //   const roleNames = mockInterviews
        //     .map((i) => i.currentRole)
        //     .filter(Boolean);

        //   let roleDocs = [];

        //   if (roleNames.length > 0) {
        //     roleDocs = await RoleMaster.find({
        //       roleName: { $in: roleNames },
        //     }).lean();
        //   }

        //   const roleMaps = {};

        //   roleDocs.forEach((r) => {
        //     roleMaps[r.roleName] = r;
        //   });

        //   // ---------------------------------------------------------------
        //   // FETCH ROUNDS (JOIN)
        //   // ---------------------------------------------------------------
        //   const mockRounds = await MockInterviewRound.find({
        //     mockInterviewId: { $in: interviewIds },
        //   })
        //     .populate({
        //       path: "interviewers",
        //       model: "Contacts",
        //       select: "firstName lastName email",
        //     })
        //     .lean();

        //   // const roleLabels = mockInterviews.map((i) => i.Role).filter(Boolean);

        //   // let roleDocs = [];
        //   // if (roleLabels.length > 0) {
        //   //   roleDocs = await RoleMaster.find({
        //   //     roleName: { $in: roleLabels },
        //   //   }).lean();
        //   // }

        //   // // Convert to quick lookup
        //   // const roleMap = {};
        //   // roleDocs.forEach((r) => {
        //   //   roleMap[r.roleLabel] = r;
        //   // });
        //   // console.log("roleMap", roleMap);

        //   // let combinedData = mockInterviews.map((interview) => {
        //   //   const rounds = mockRounds.filter(
        //   //     (r) => r.mockInterviewId.toString() === interview._id.toString()
        //   //   );

        //   //   const roleInfo = roleMap[interview.Role] || null;

        //   //   return {
        //   //     ...interview,

        //   //     rounds,
        //   //     roleDetails: roleInfo
        //   //       ? {
        //   //           roleName: roleInfo.roleName,
        //   //           roleLabel: roleInfo.roleLabel,
        //   //           roleCategory: roleInfo.roleCategory,
        //   //         }
        //   //       : null,
        //   //   };
        //   // });

        //   // MERGE INTERVIEWS + ROUNDS
        //   // let combinedData = mockInterviews.map((interview) => ({
        //   //   ...interview,
        //   //     roleDetails: roleInfo,
        //   //   rounds: mockRounds.filter(
        //   //     (r) => r.mockInterviewId.toString() === interview._id.toString()
        //   //   ),
        //   // }));

        //   let combinedData = mockInterviews.map((interview) => {
        //     const rounds = mockRounds.filter(
        //       (r) => r.mockInterviewId.toString() === interview._id.toString()
        //     );

        //     const roleInfo = roleMaps[interview.currentRole] || null;

        //     return {
        //       ...interview,
        //       rounds,
        //       roleDetails: roleInfo
        //         ? {
        //             roleName: roleInfo.roleName,
        //             roleLabel: roleInfo.roleLabel,
        //             roleCategory: roleInfo.roleCategory,
        //           }
        //         : null,
        //     };
        //   });

        //   // ---------------------------------------------------------------
        //   // INTERVIEWER FILTER AFTER JOIN
        //   // ---------------------------------------------------------------
        //   if (mockInterviewer.length > 0) {
        //     combinedData = combinedData.filter((interview) => {
        //       const interviewers =
        //         interview.rounds?.flatMap((r) => r.interviewers) || [];

        //       return interviewers.some((int) => {
        //         const fullName = `${int.firstName || ""} ${
        //           int.lastName || ""
        //         }`.trim();
        //         return mockInterviewer.includes(fullName);
        //       });
        //     });
        //   }

        //   // ---------------------------------------------------------------
        //   // FINAL RESPONSE
        //   // ---------------------------------------------------------------
        //   data = {
        //     data: combinedData,
        //     totalCount,
        //     filteredCount: combinedData.length,
        //     currentPage: pageNum,
        //     totalPages,
        //     limit: limitNum,
        //   };

        //   break;

        case "tenantquestions":
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
              .populate({
                path: "suggestedQuestionId",
                model: "InterviewQuestions",
              })
              .populate({
                path: "tenantListId",
                model: "TenantQuestionsListNames",
                select: "label name ownerId type tenantId",
              })
              .lean(),
            TenantAssessmentQuestions.find({
              ...query,
              tenantListId: { $in: listIds },
            })
              .populate({
                path: "suggestedQuestionId",
                model: "AssessmentQuestions",
              })
              .populate({
                path: "tenantListId",
                model: "TenantQuestionsListNames",
                select: "label name ownerId type tenantId",
              })
              .lean(),
          ]);

          const questions = [...interviewQs, ...assessmentQs];

          // console.log('[24] Found', questions.length, 'questions matching lists');

          const groupedQuestions = lists.reduce((acc, list) => {
            acc[list.label] = [];
            return acc;
          }, {});

          questions.forEach((question) => {
            const questionData = question.isCustom
              ? question
              : question.suggestedQuestionId;
            (question.tenantListId || []).forEach((list) => {
              //--------v1.0.8----->
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

        case "interview":
          const toArray = (p) =>
            p ? (Array.isArray(p) ? p : p.split(",").map((s) => s.trim())) : [];

          const interviewQueryParams = {
            searchQuery: req.query.searchQuery,
            status: toArray(req.query.status),
            tech: toArray(req.query.tech),
            experienceMin: req.query.experienceMin,
            experienceMax: req.query.experienceMax,
            interviewType: toArray(req.query.interviewType),
            interviewMode: toArray(req.query.interviewMode),
            position: toArray(req.query.position),
            company: toArray(req.query.company),
            roundStatus: toArray(req.query.roundStatus),
            interviewer: toArray(req.query.interviewer), // names
            createdDate: req.query.createdDate,
            interviewDateFrom: req.query.interviewDateFrom,
            interviewDateTo: req.query.interviewDateTo,
            page: parseInt(req.query.page) || 1,
            limit: req.query.limit,
            upcomingOnly: req.query.upcomingOnly,
          };

          // Optional: filter by specific candidate when candidateId is provided
          if (req.query.candidateId) {
            query.candidateId = req.query.candidateId;
          }

          const filterQuery = {
            ...query,
            upcomingOnly: req.query.upcomingOnly,
          };

          if (req?.query?.type !== "analytics") {
            data = await handleInterviewFiltering({
              query,
              DataModel,
              ...interviewQueryParams,
            });
          } else {
            data = await getInterviewDashboardStats({
              filterQuery,
              DataModel,
            });
          }
          break;

        case "interviewtemplate": {
          const {
            page: reqPage = 1,
            limit: reqLimit,
            search = "",
            status: statusParam,
            format: formatParam,
            roundsMin,
            roundsMax,
            createdDate: createdDateParam,
            type, // Don't set default here, check if it exists
          } = req.query;

          if (req?.query?.type !== "interviewtemplates") {
            const pageNum = Math.max(1, parseInt(reqPage) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(reqLimit)));
            const skip = (pageNum - 1) * limitNum;

            // Base query - CRITICAL: Standard templates should NOT have tenant or owner filtering
            let baseQuery = {};
            if (type === "standard") {
              // Standard templates: Only filter by type, NO tenant/owner filtering
              baseQuery = { type: "standard" };
              // console.log('Building STANDARD template query (no tenant/owner filter)');
            } else {
              // Custom templates (default): Filter by type, tenantId, and ownerId (if provided)
              baseQuery = { type: "custom" };
              baseQuery = query;
            }

            let finalQuery = { ...baseQuery };

            // Search filter - works for both types
            if (search && search.trim()) {
              const searchRegex = new RegExp(search.trim(), "i");
              finalQuery.$and = finalQuery.$and || [];
              finalQuery.$and.push({
                $or: [
                  { title: searchRegex },
                  { interviewTemplateCode: searchRegex },
                  { description: searchRegex },
                  { bestFor: searchRegex },
                ],
              });
            }

            // Status filter
            if (statusParam) {
              const statuses = Array.isArray(statusParam)
                ? statusParam
                : statusParam.split(",");
              finalQuery.status = {
                $in: statuses.map((s) => s.toLowerCase()),
              };
            }

            // Format filter
            if (formatParam) {
              const formats = Array.isArray(formatParam)
                ? formatParam
                : formatParam.split(",");
              finalQuery.format = { $in: formats };
            }

            // Rounds range filter
            if (roundsMin !== undefined || roundsMax !== undefined) {
              const min = roundsMin ? parseInt(roundsMin) : 0;
              const max = roundsMax ? parseInt(roundsMax) : 100;
              if (!isNaN(min) && !isNaN(max)) {
                finalQuery.$and = finalQuery.$and || [];
                finalQuery.$and.push({
                  $expr: {
                    $and: [
                      { $gte: [{ $size: { $ifNull: ["$rounds", []] } }, min] },
                      { $lte: [{ $size: { $ifNull: ["$rounds", []] } }, max] },
                    ],
                  },
                });
              }
            }

            // Created Date filter
            if (createdDateParam) {
              const now = new Date();
              let dateFrom;
              switch (createdDateParam) {
                case "last7":
                  dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  break;
                case "last30":
                  dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  break;
                case "last90":
                  dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                  break;
                default:
                  dateFrom = null;
              }
              if (dateFrom) {
                finalQuery.createdAt = { $gte: dateFrom };
              }
            }

            try {
              // Get total count for the filtered query
              const total = await DataModel.countDocuments(finalQuery);

              // Fetch templates with pagination
              const templates = await DataModel.find(finalQuery)
                .populate({
                  path: "rounds.interviewers",
                  model: "Contacts",
                  select: "firstName lastName email",
                })
                .populate({
                  path: "rounds.selectedInterviewers",
                  model: "Contacts",
                  select: "firstName lastName email",
                })
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean();

              // Get separate counts for custom and standard (ignores filters except type)
              const standardCount = await DataModel.countDocuments({
                type: "standard",
              });
              const customCount = await DataModel.countDocuments({
                type: "custom",
                ...query,
              });

              // console.log(`Fetched ${templates.length} ${type || 'custom'} templates for page ${pageNum}`);

              data = {
                data: templates,
                standardCount,
                customCount,
                total,
                totalItems: total,
                page: pageNum,
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                limit: limitNum,
                itemsPerPage: limitNum,
                type: type || "custom", // Include type in response for verification
              };
            } catch (err) {
              console.error("InterviewTemplate query error:", err);
              return res.status(500).json({
                error: "Failed to fetch templates",
                details: err.message,
              });
            }
          } else {
            // Special union mode for template selectors: return BOTH standard templates
            // and custom templates for this tenant. Support optional pagination using
            // page/limit similar to the main branch above.

            const pageNum = Math.max(1, parseInt(reqPage) || 1);
            const limitNum = reqLimit
              ? Math.max(1, Math.min(100, parseInt(reqLimit)))
              : 0;

            const baseQuery = {
              $or: [
                { type: "standard" }, // fetch ALL standard
                {
                  // fetch custom of tenant
                  type: "custom",
                  ...query,
                },
              ],
            };

            // Apply the same search filter as the main branch so that
            // template dropdowns can use server-side search while still
            // returning the union of standard + tenant-custom templates.
            let finalQuery = { ...baseQuery };
            if (search && search.trim()) {
              const searchRegex = new RegExp(search.trim(), "i");
              finalQuery.$and = finalQuery.$and || [];
              finalQuery.$and.push({
                $or: [
                  { title: searchRegex },
                  { interviewTemplateCode: searchRegex },
                  { description: searchRegex },
                  { bestFor: searchRegex },
                ],
              });
            }

            if (limitNum > 0) {
              const skip = (pageNum - 1) * limitNum;

              // Total across both standard + tenant custom templates,
              // AFTER applying any search filters.
              const total = await DataModel.countDocuments(finalQuery);

              const templates = await DataModel.find(finalQuery)
                .populate({
                  path: "rounds.interviewers",
                  model: "Contacts",
                  select: "firstName lastName email",
                })
                .populate({
                  path: "rounds.selectedInterviewers",
                  model: "Contacts",
                  select: "firstName lastName email",
                })
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean();

              const standardCount = await DataModel.countDocuments({
                type: "standard",
              });
              const customCount = await DataModel.countDocuments({
                type: "custom",
                ...query,
              });

              data = {
                data: templates,
                standardCount,
                customCount,
                total,
                totalItems: total,
                page: pageNum,
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                limit: limitNum,
                itemsPerPage: limitNum,
                type: "interviewtemplates",
              };
            } else {
              // Fallback: preserve previous behaviour when no limit is provided
              // (used by older callers that expect the full unpaginated list).
              Templatesdata = await DataModel.find(finalQuery).lean();
              data = {
                data: Templatesdata,
              };
            }
          }

          break;
        }

        // ------------------------------ v1.0.9 END
        // <------------------------------- v1.0.3
        //   case 'interviewtemplate':
        //   const {
        //   page = 1,
        //   limit = 10,
        //   search = '',
        //   status,
        //   format,
        //   roundsMin,
        //   roundsMax,
        //   createdDate,
        //   sortBy = 'createdAt',
        //   sortOrder = 'desc'
        // } = req.query;

        //       // Parse page and limit
        // const pageNum = parseInt(page);
        // const limitNum = parseInt(limit);
        // const skip = (pageNum - 1) * limitNum;

        //   // Use the existing query (which has tenantId and ownerId filters) and add standard templates

        //     query = {
        //       $or: [
        //         { type: 'standard' }, // Standard templates are accessible to all
        //         {
        //           $and: [
        //             { type: 'custom' },
        //             query, // Reuse the base query with tenantId and ownerId filters
        //           ],
        //         },
        //       ],
        //     };

        //     data = await DataModel.find(query)
        //       .populate({
        //         path: 'rounds.interviewers',
        //         model: 'Contacts',
        //         select: 'firstName lastName email',
        //       })
        //       .lean();

        //     break;
        // ------------------------------ v1.0.4 >

        // assessment templates api
        case "assessment": //assessment templates
          try {
            const {
              search = "",
              difficultyLevel = [],
              duration = [],
              position = [],
              sections = { min: "", max: "" },
              questions = { min: "", max: "" },
              totalScore = { min: "", max: "" },
              createdDate = "",
              page = 0,
              limit = 10,
              type, // ← NO DEFAULT!
              selectedOptionId = null,
            } = req.query;

            // const ownerId = userId;
            const assessmentType = type;

            let Basequery = {};

            // === TYPE FILTERING (CRITICAL) ===
            if (assessmentType === "standard") {
              // Explicit standard tab: show only global standard templates
              Basequery.type = "standard";
            } else if (assessmentType === "custom") {
              // Explicit custom tab: show only scoped custom templates
              Basequery = {
                type: "custom",

                ...query,
              };
            } else {
              // No type provided: include both global standard and scoped custom templates
              Basequery = {
                $or: [
                  { type: "standard" },
                  {
                    type: "custom",

                    ...query,
                  },
                ],
              };
            }

            // === SEARCH ===
            if (search && search.trim()) {
              const regex = { $regex: search.trim(), $options: "i" };
              Basequery.$or = [
                { AssessmentTitle: regex },
                { AssessmentCode: regex },
                { Position: regex },
                { DifficultyLevel: regex },
                { Duration: regex },
              ];
            }

            // === FILTERS ===
            if (difficultyLevel.length > 0)
              Basequery.DifficultyLevel = { $in: difficultyLevel };
            if (duration.length > 0) Basequery.Duration = { $in: duration };
            if (position.length > 0) Basequery.Position = { $in: position };
            if (selectedOptionId)
              Basequery.assessmentTemplateList = selectedOptionId;

            // === RANGE FILTERS ===
            if (sections.min)
              Basequery.NumberOfSections = {
                ...Basequery.NumberOfSections,
                $gte: +sections.min,
              };
            if (sections.max)
              Basequery.NumberOfSections = {
                ...Basequery.NumberOfSections,
                $lte: +sections.max,
              };
            if (questions.min)
              Basequery.NumberOfQuestions = {
                ...Basequery.NumberOfQuestions,
                $gte: +questions.min,
              };
            if (questions.max)
              Basequery.NumberOfQuestions = {
                ...Basequery.NumberOfQuestions,
                $lte: +questions.max,
              };
            if (totalScore.min)
              Basequery.totalScore = {
                ...Basequery.totalScore,
                $gte: +totalScore.min,
              };
            if (totalScore.max)
              Basequery.totalScore = {
                ...Basequery.totalScore,
                $lte: +totalScore.max,
              };

            // === DATE FILTER ===
            if (createdDate) {
              const days =
                createdDate === "last7"
                  ? 7
                  : createdDate === "last30"
                    ? 30
                    : 90;
              const date = new Date();
              date.setDate(date.getDate() - days);
              Basequery.createdAt = { $gte: date };
            }

            const skip = +page * +limit;

            const [dataSection, totalCount, customCount, standardCount] =
              await Promise.all([
                Assessment.find(Basequery)
                  .populate("Position", "title")
                  .populate("assessmentTemplateList", "name")
                  .sort({ _id: -1 })
                  .skip(skip)
                  .limit(+limit)
                  .lean(),

                Assessment.countDocuments(Basequery),

                // Custom assessments count (ONLY tenant and owner filter - NO search/filters)
                Assessment.countDocuments({
                  type: "custom",

                  ...query,
                }),

                // Standard assessments count (ONLY type filter - NO search/filters)
                Assessment.countDocuments({
                  type: "standard",
                }),
              ]);

            data = {
              data: dataSection,
              customCount,
              standardCount,
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              currentPage: +page,
            };

            // Optional: Add sections count
            // const dataWithSections = await Promise.all(
            //   dataSection.map(async (item) => {
            //     const sectionCount = await Section.countDocuments({
            //       assessmentTemplateId: item._id,
            //     });
            //     return { ...item, sectionsCount: sectionCount };
            //   })
            // );

            // res.json({
            //   data: dataWithSections,
            //   totalCount,
            //   totalPages: Math.ceil(totalCount / limit),
            //   currentPage: +page,
            // });
          } catch (error) {
            console.error("Assessment filter error:", error);
            res.status(500).json({ message: "Server error" });
          }

          // query = {
          //   $or: [
          //     { type: "standard" }, // Standard templates are accessible to all
          //     {
          //       $and: [
          //         { type: "custom" },
          //         query, // Reuse the base query with tenantId and ownerId filters
          //       ],
          //     },
          //   ],
          // };
          // console.log('[36] Processing Assessment model');
          // data = await DataModel.find(query).lean();
          // console.log('[37] Found', data.length, 'Assessment records');
          break;

        // assessment scheduled for candidate api
        case "scheduleassessment": {
          console.log("req?.query?.type", req?.query);

          if (req?.query?.type !== "analytics") {
            const {
              assessmentId,
              page,
              limit,
              searchQuery,
              status,
              assessmentIds,
              orderMin,
              orderMax,
              expiryPreset,
              createdPreset,
              type,
            } = req.query;

            // Base filter: tenant + ownership (already built in `query`)
            const scheduledFilter = {
              ...query, // includes tenantId, ownerId (or $in for inherited roles)
              // isActive: true,
            };

            // Only add assessmentId filter if it's provided AND valid
            if (assessmentId) {
              if (!mongoose.isValidObjectId(assessmentId)) {
                return res.status(400).json({
                  success: false,
                  message: "Invalid assessmentId format",
                });
              }
              scheduledFilter.assessmentId = assessmentId;
            }

            // Additional template filter (comma-separated assessmentIds)
            if (assessmentIds) {
              const ids = String(assessmentIds)
                .split(",")
                .map((id) => id.trim())
                .filter((id) => mongoose.isValidObjectId(id));
              if (ids.length) {
                scheduledFilter.assessmentId = { $in: ids };
              }
            }

            // Order range filter
            const orderCond = {};
            if (orderMin !== undefined && orderMin !== "") {
              const minVal = Number(orderMin);
              if (!Number.isNaN(minVal)) orderCond.$gte = minVal;
            }
            if (orderMax !== undefined && orderMax !== "") {
              const maxVal = Number(orderMax);
              if (!Number.isNaN(maxVal)) orderCond.$lte = maxVal;
            }
            if (Object.keys(orderCond).length) {
              scheduledFilter.order = orderCond;
            }

            // Expiry date presets: expired | next7 | next30
            if (expiryPreset) {
              const now = new Date();
              const expiryCond = {};
              if (expiryPreset === "expired") {
                expiryCond.$lt = now;
              } else if (expiryPreset === "next7") {
                const future = new Date(now);
                future.setDate(future.getDate() + 7);
                expiryCond.$gte = now;
                expiryCond.$lte = future;
              } else if (expiryPreset === "next30") {
                const future = new Date(now);
                future.setDate(future.getDate() + 30);
                expiryCond.$gte = now;
                expiryCond.$lte = future;
              }
              if (Object.keys(expiryCond).length) {
                scheduledFilter.expiryAt = expiryCond;
              }
            }

            // Created date presets: last7 | last30 | last90
            if (createdPreset) {
              const now = new Date();
              const createdCond = {};
              const daysMap = { last7: 7, last30: 30, last90: 90 };
              const days = daysMap[createdPreset];
              if (days) {
                const past = new Date(now);
                past.setDate(past.getDate() - days);
                createdCond.$gte = past;
              }
              if (Object.keys(createdCond).length) {
                scheduledFilter.createdAt = createdCond;
              }
            }

            // Status filter (comma-separated, case-insensitive match)
            if (status) {
              const rawStatuses = String(status)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              if (rawStatuses.length) {
                // Store as-is; DB likely has title-case statuses (Scheduled, Completed, ...)
                scheduledFilter.status = { $in: rawStatuses };
              }
            }

            // Determine if advanced (paginated) mode should be used
            const hasAdvancedParams =
              page !== undefined ||
              limit !== undefined ||
              (typeof searchQuery === "string" && searchQuery.trim() !== "") ||
              status !== undefined ||
              assessmentIds !== undefined ||
              orderMin !== undefined ||
              orderMax !== undefined ||
              expiryPreset !== undefined ||
              createdPreset !== undefined;

            // Legacy behavior: no advanced params -> return full list array (backwards compatible)
            if (!hasAdvancedParams) {
              const scheduledAssessments = await ScheduledAssessmentSchema.find(
                scheduledFilter
              )
                .select(
                  "_id scheduledAssessmentCode order expiryAt status createdAt assessmentId"
                )
                .lean();

              if (!scheduledAssessments.length) {
                data = [];
                break;
              }

              const scheduledIds = scheduledAssessments.map((sa) => sa._id);

              const candidateAssessments = await CandidateAssessment.find({
                scheduledAssessmentId: { $in: scheduledIds },
              })
                .populate("candidateId")
                .lean();

              // <-------------------------------v1.0.9
              // Fetch Resume data for candidates (skills, experience moved from Candidate)
              const candidateIds = candidateAssessments
                .filter((ca) => ca.candidateId?._id)
                .map((ca) => ca.candidateId._id);

              if (candidateIds.length > 0) {
                const resumes = await Resume.find({
                  candidateId: { $in: candidateIds },
                  isActive: true,
                })
                  .select(
                    "candidateId skills CurrentExperience HigherQualification ImageData"
                  )
                  .lean();

                const resumeMap = {};
                resumes.forEach((r) => {
                  resumeMap[String(r.candidateId)] = r;
                });

                // Merge Resume data into candidate assessments
                candidateAssessments.forEach((ca) => {
                  if (ca.candidateId?._id) {
                    const resume = resumeMap[String(ca.candidateId._id)];
                    if (resume) {
                      ca.candidateId = {
                        ...ca.candidateId,
                        skills: resume.skills,
                        CurrentExperience: resume.CurrentExperience,
                        HigherQualification: resume.HigherQualification,
                        ImageData: resume.ImageData,
                      };
                    }
                  }
                });
              }
              // ------------------------------v1.0.9 >

              const schedulesWithCandidates = scheduledAssessments.map(
                (schedule) => {
                  const candidates = candidateAssessments.filter(
                    (ca) =>
                      ca.scheduledAssessmentId.toString() ===
                      schedule._id.toString()
                  );
                  return {
                    _id: schedule._id,
                    assessmentId: schedule.assessmentId,
                    scheduledAssessmentCode: schedule.scheduledAssessmentCode,
                    order: schedule.order,
                    expiryAt: schedule.expiryAt,
                    status: schedule.status,
                    createdAt: schedule.createdAt,
                    candidates,
                  };
                }
              );

              data = schedulesWithCandidates;

              break;
            }

            // Paginated behavior when advanced params are present
            const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
            const limitNumber =
              parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
            const skip = (pageNumber - 1) * limitNumber;

            // Text search over a few key fields
            const textSearch =
              typeof searchQuery === "string" ? searchQuery.trim() : "";
            const searchFilter = {};
            if (textSearch) {
              const searchRegex = new RegExp(
                textSearch.replace(/\s+/g, " "),
                "i"
              );
              searchFilter.$or = [
                { scheduledAssessmentCode: searchRegex },
                { status: searchRegex },
                {
                  order: isNaN(Number(textSearch))
                    ? undefined
                    : Number(textSearch),
                },
              ].filter((cond) => cond && Object.keys(cond).length > 0);
            }

            const finalMatch = Object.keys(searchFilter).length
              ? { $and: [scheduledFilter, searchFilter] }
              : scheduledFilter;

            const [scheduledAssessments, totalItems] = await Promise.all([
              ScheduledAssessmentSchema.find(finalMatch)
                .select(
                  "_id scheduledAssessmentCode order expiryAt status createdAt assessmentId"
                )
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
              ScheduledAssessmentSchema.countDocuments(finalMatch),
            ]);

            if (!scheduledAssessments.length) {
              data = {
                data: [],
                total: 0,
                page: pageNumber,
                totalPages: 0,
                itemsPerPage: limitNumber,
              };
              break;
            }

            const scheduledIds = scheduledAssessments.map((sa) => sa._id);

            const candidateAssessments = await CandidateAssessment.find({
              scheduledAssessmentId: { $in: scheduledIds },
            })
              .populate("candidateId")
              .lean();

            // <-------------------------------v1.0.9
            // Fetch Resume data for candidates (skills, experience moved from Candidate)
            const candidateIds = candidateAssessments
              .filter((ca) => ca.candidateId?._id)
              .map((ca) => ca.candidateId._id);

            if (candidateIds.length > 0) {
              const resumes = await Resume.find({
                candidateId: { $in: candidateIds },
                isActive: true,
              })
                .select(
                  "candidateId skills CurrentExperience HigherQualification ImageData"
                )
                .lean();

              const resumeMap = {};
              resumes.forEach((r) => {
                resumeMap[String(r.candidateId)] = r;
              });

              // Merge Resume data into candidate assessments
              candidateAssessments.forEach((ca) => {
                if (ca.candidateId?._id) {
                  const resume = resumeMap[String(ca.candidateId._id)];
                  if (resume) {
                    ca.candidateId = {
                      ...ca.candidateId,
                      skills: resume.skills,
                      CurrentExperience: resume.CurrentExperience,
                      HigherQualification: resume.HigherQualification,
                      ImageData: resume.ImageData,
                    };
                  }
                }
              });
            }
            // ------------------------------v1.0.9 >

            const schedulesWithCandidates = scheduledAssessments.map(
              (schedule) => {
                const candidates = candidateAssessments.filter(
                  (ca) =>
                    ca.scheduledAssessmentId.toString() ===
                    schedule._id.toString()
                );
                return {
                  _id: schedule._id,
                  assessmentId: schedule.assessmentId,
                  scheduledAssessmentCode: schedule.scheduledAssessmentCode,
                  order: schedule.order,
                  expiryAt: schedule.expiryAt,
                  status: schedule.status,
                  createdAt: schedule.createdAt,
                  candidates,
                };
              }
            );

            const totalPages = Math.max(
              1,
              Math.ceil((totalItems || 0) / (limitNumber || 10))
            );

            data = {
              data: schedulesWithCandidates,
              total: totalItems,
              page: pageNumber,
              totalPages,
              itemsPerPage: limitNumber,
            };
          } else if (req?.query?.type === "scheduled") {
            console.log("In scheduleassessment scheduled type", req?.query);
            // const assessmentId = req?.query?.assessmentId;
            const { assessmentId } = req.query;

            const baseQuery = {
              ...query,
              assessmentId: assessmentId,
            };

            if (!assessmentId) {
              return sendErrorResponse(
                res,
                "assessmentId is required for scheduled type"
              );
            }

            // if (!mongoose.isValidObjectId(assessmentId)) {
            //   console.log("Invalid assessmentId format");
            //   return res.status(400).json({
            //     success: false,
            //     message: "Invalid assessmentId format",
            //   });
            // }

            // Set ONLY the assessmentId filter
            // scheduledFilter.assessmentId = assessmentId;

            // Fetch ALL data for this assessmentId (no pagination, no limits)
            const [scheduledAssessments] = await Promise.all([
              ScheduledAssessmentSchema.find(baseQuery)
                .select(
                  "_id scheduledAssessmentCode order expiryAt status createdAt assessmentId"
                )
                .sort({ _id: -1 })
                .lean(),
              ScheduledAssessmentSchema.countDocuments(finalMatch),
            ]);

            if (!scheduledAssessments.length) {
              data = [];
              break;
            }

            const scheduledIds = scheduledAssessments.map((sa) => sa._id);

            const candidateAssessments = await CandidateAssessment.find({
              scheduledAssessmentId: { $in: scheduledIds },
            })
              .populate("candidateId")
              .lean();

            // <-------------------------------v1.0.9
            // Fetch Resume data for candidates (skills, experience moved from Candidate)
            const candidateIds = candidateAssessments
              .filter((ca) => ca.candidateId?._id)
              .map((ca) => ca.candidateId._id);

            if (candidateIds.length > 0) {
              const resumes = await Resume.find({
                candidateId: { $in: candidateIds },
                isActive: true,
              })
                .select(
                  "candidateId skills CurrentExperience HigherQualification ImageData"
                )
                .lean();

              const resumeMap = {};
              resumes.forEach((r) => {
                resumeMap[String(r.candidateId)] = r;
              });

              // Merge Resume data into candidate assessments
              candidateAssessments.forEach((ca) => {
                if (ca.candidateId?._id) {
                  const resume = resumeMap[String(ca.candidateId._id)];
                  if (resume) {
                    ca.candidateId = {
                      ...ca.candidateId,
                      skills: resume.skills,
                      CurrentExperience: resume.CurrentExperience,
                      HigherQualification: resume.HigherQualification,
                      ImageData: resume.ImageData,
                    };
                  }
                }
              });
            }
            // ------------------------------v1.0.9 >

            const schedulesWithCandidates = scheduledAssessments.map(
              (schedule) => {
                const candidates = candidateAssessments.filter(
                  (ca) =>
                    ca.scheduledAssessmentId.toString() ===
                    schedule._id.toString()
                );
                return {
                  _id: schedule._id,
                  assessmentId: schedule.assessmentId,
                  scheduledAssessmentCode: schedule.scheduledAssessmentCode,
                  order: schedule.order,
                  expiryAt: schedule.expiryAt,
                  status: schedule.status,
                  createdAt: schedule.createdAt,
                  candidates,
                };
              }
            );

            data = {
              data: schedulesWithCandidates,
            };
          } else {
            // ANALYTICS: Calculate Assessments Completed metrics using aggregation
            try {
              const now = new Date();
              const currentMonthStart = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );
              const lastMonthStart = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
              );
              const lastMonthEnd = new Date(
                now.getFullYear(),
                now.getMonth(),
                0
              );

              const analyticsAggregation =
                await ScheduledAssessmentSchema.aggregate([
                  {
                    $match: {
                      ...query,
                      status: "completed",
                      isActive: true,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      totalCompleted: { $sum: 1 },
                      currentMonthCount: {
                        $sum: {
                          $cond: [
                            { $gte: ["$createdAt", currentMonthStart] },
                            1,
                            0,
                          ],
                        },
                      },
                      lastMonthCount: {
                        $sum: {
                          $cond: [
                            {
                              $and: [
                                { $gte: ["$createdAt", lastMonthStart] },
                                { $lte: ["$createdAt", lastMonthEnd] },
                              ],
                            },
                            1,
                            0,
                          ],
                        },
                      },
                    },
                  },
                ]);

              const result = analyticsAggregation[0] || {
                totalCompleted: 0,
                currentMonthCount: 0,
                lastMonthCount: 0,
              };

              // Calculate trend
              let trend = "up";
              let trendValue = "+0% vs last month";

              if (result.lastMonthCount === 0) {
                trend = "up";
                trendValue = "+100% vs last month";
              } else {
                const percentageChange =
                  ((result?.currentMonthCount - result?.lastMonthCount) /
                    result?.lastMonthCount) *
                  100;
                trend = percentageChange >= 0 ? "up" : "down";
                trendValue = `${Math.abs(percentageChange).toFixed(
                  1
                )}% vs last month`;
              }

              data = {
                assessmentsCompleted: {
                  value: result?.currentMonthCount,
                  lastMonth: result?.lastMonthCount,
                  trend: trend,
                  trendValue: trendValue,
                  totalCompleted: result?.totalCompleted,
                },
                metadata: {
                  calculationDate: now,
                  dateRanges: {
                    currentMonth: { start: currentMonthStart, end: now },
                    lastMonth: { start: lastMonthStart, end: lastMonthEnd },
                  },
                },
              };
            } catch (error) {
              console.error(
                "Error in scheduleassessment analytics aggregation:",
                error
              );
              data = {
                assessmentsCompleted: {
                  value: 0,
                  lastMonth: 0,
                  trend: "up",
                  trendValue: "+100% vs last month",
                  totalCompleted: 0,
                },
                metadata: {
                  calculationDate: new Date(),
                  error: "Failed to calculate assessment metrics",
                },
              };
            }
          }
          break;
        }
        // ------------------------------ v1.0.4 >
        case "assessmentlist":
          query = {
            $or: [
              { type: "standard" }, // Standard templates are accessible to all
              {
                $and: [
                  { type: "custom" },
                  query, // Reuse the base query with tenantId and ownerId filters
                ],
              },
            ],
          };
          data = await DataModel.find(query);
          break;

        case "position":
          // query search params based on that will get the data
          // query search params based on that will get the data
          const {
            page,
            limit,
            searchQuery,
            location,
            tech,
            company,
            experienceMin,
            experienceMax,
            salaryMin,
            salaryMax,
            createdDate,
          } = req.query;

          const parsedPositionPage = parseInt(page) || 1;
          const parsedPositionLimit = parseInt(limit) || 10;
          const positionSkip = (parsedPositionPage - 1) * parsedPositionLimit;

          // Apply search
          if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i");
            // Search for matching company IDs by name (since companyname is an ObjectId reference)
            const matchingCompanies = await TenantCompany.find({ name: searchRegex }).select('_id').lean();
            const matchingCompanyIds = matchingCompanies.map(c => c._id);

            query.$or = [
              { title: searchRegex },
              { Location: searchRegex },
              { positionCode: searchRegex },
            ];

            // Include company name search if any matching companies found
            if (matchingCompanyIds.length > 0) {
              query.$or.push({ companyname: { $in: matchingCompanyIds } });
            }
          }

          // Apply location filter
          if (location) {
            const locations = Array.isArray(location) ? location : [location];
            query.Location = { $in: locations };
          }

          // Apply tech/skills filter
          if (tech) {
            const techs = Array.isArray(tech) ? tech : [tech];
            query["skills.skill"] = { $in: techs };
          }

          // Apply company filter - lookup company ObjectIds by name
          if (company) {
            const companies = Array.isArray(company) ? company : [company];
            // Check if the values are already ObjectIds or company names
            const isObjectId = (val) => mongoose.Types.ObjectId.isValid(val) && String(new mongoose.Types.ObjectId(val)) === val;
            if (companies.every(isObjectId)) {
              // If all values are valid ObjectIds, use them directly
              query.companyname = { $in: companies.map(id => new mongoose.Types.ObjectId(id)) };
            } else {
              // Otherwise, lookup company ObjectIds by name
              const companyDocs = await TenantCompany.find({ name: { $in: companies } }).select('_id').lean();
              const companyIds = companyDocs.map(c => c._id);
              if (companyIds.length > 0) {
                query.companyname = { $in: companyIds };
              } else {
                // No matching companies found, set an impossible condition
                query.companyname = { $in: [] };
              }
            }
          }

          // Apply experience filter
          const positionExpMin = parseInt(experienceMin) || 0;
          const positionExpMax = parseInt(experienceMax) || Infinity;
          if (positionExpMin > 0 || positionExpMax < Infinity) {
            query.$and = query.$and || [];
            if (positionExpMin > 0)
              query.$and.push({ minexperience: { $gte: positionExpMin } });
            if (positionExpMax < Infinity)
              query.$and.push({ maxexperience: { $lte: positionExpMax } });
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
                  { minSalary: { $gte: positionSalMin } },
                ],
              });
            }
            if (positionSalMax < Infinity) {
              query.$and.push({
                $or: [
                  { minSalary: { $lte: positionSalMax } },
                  { maxSalary: { $lte: positionSalMax } },
                ],
              });
            }
          }

          // Apply created date filter
          if (createdDate === "last7") {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            query.createdAt = { $gte: date };
          } else if (createdDate === "last30") {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            query.createdAt = { $gte: date };
          }

          // Fetch paginated data with sort
          // Use aggregation to handle legacy data where companyname might be a string instead of ObjectId

          // Convert string IDs to ObjectIds for aggregation (aggregation doesn't auto-cast like find())
          const positionAggQuery = { ...query };
          if (positionAggQuery.tenantId && typeof positionAggQuery.tenantId === 'string') {
            positionAggQuery.tenantId = new mongoose.Types.ObjectId(positionAggQuery.tenantId);
          }
          if (positionAggQuery.ownerId && typeof positionAggQuery.ownerId === 'string') {
            positionAggQuery.ownerId = new mongoose.Types.ObjectId(positionAggQuery.ownerId);
          }

          const positionData = await DataModel.aggregate([
            { $match: positionAggQuery },
            { $sort: { _id: -1 } },
            { $skip: positionSkip },
            { $limit: parsedPositionLimit },
            // Lookup company only if companyname is a valid ObjectId
            {
              $lookup: {
                from: "tenantcompanies",
                localField: "companyname",
                foreignField: "_id",
                as: "companyInfo"
              }
            }
            ,
            // Also handle the case where companyname is a string (legacy data)
            {
              $addFields: {
                companyname: {
                  $cond: {
                    if: { $gt: [{ $size: "$companyInfo" }, 0] },
                    then: { $arrayElemAt: ["$companyInfo", 0] },
                    else: {
                      $cond: {
                        if: { $eq: [{ $type: "$companyname" }, "string"] },
                        then: { name: "$companyname", _id: null },
                        else: null
                      }
                    }
                  }
                }
              }
            }
            ,
            { $unset: "companyInfo" },
            // Lookup interviewers for rounds
            {
              $lookup: {
                from: "contacts",
                localField: "rounds.interviewers",
                foreignField: "_id",
                as: "interviewerDetails"
              }
            }
          ]);

          // Get total count
          total = await DataModel.countDocuments(query);

          dataObj = {
            positions: positionData,
            total,
            page: parsedPositionPage,
            totalPages: Math.ceil(total / parsedPositionLimit),
          };

          data = dataObj;
          break;

        // In your feedback route handler
        case "feedback":
          const {
            page: feedbackPage = 1,
            limit: feedbackLimit,
            search = "",
            status,
            positions,
            modes,
            interviewers,
            recommendations,
            ratingMin,
            ratingMax,
            interviewDate,
            type,
          } = req.query;

          if (type === "feedback") {
            const feedbackPageNum = parseInt(feedbackPage);
            const feedbackLimitNum = parseInt(feedbackLimit);
            // const skip = (feedbackPageNum - 1) * feedbackLimitNum;

            // -------------------------------------------------------
            // 1️⃣ GET ALL INTERVIEWS BASED ON TENANT/OWNER (NEEDED)
            // -------------------------------------------------------
            let feedbackInterviews = await Interview.find(query)
              .populate(
                "candidateId",
                "FirstName LastName Email Phone"
              )
              .populate(
                "positionId",
                "title companyname jobDescription Location"
              )
              .lean();

            // Fetch Resume data for candidates (skills, experience moved from Candidate)
            const fbInterviewCandidateIds = feedbackInterviews
              .filter((i) => i.candidateId?._id)
              .map((i) => i.candidateId._id);

            if (fbInterviewCandidateIds.length > 0) {
              const fbInterviewResumes = await Resume.find({
                candidateId: { $in: fbInterviewCandidateIds },
                isActive: true,
              }).select("candidateId skills CurrentExperience CurrentRole ImageData").lean();

              const fbInterviewResumeMap = {};
              fbInterviewResumes.forEach((r) => {
                fbInterviewResumeMap[String(r.candidateId)] = r;
              });

              // Merge Resume data into interviews
              feedbackInterviews = feedbackInterviews.map((i) => {
                if (i.candidateId?._id) {
                  const resume = fbInterviewResumeMap[String(i.candidateId._id)];
                  if (resume) {
                    i.candidateId = {
                      ...i.candidateId,
                      skills: resume.skills,
                      CurrentExperience: resume.CurrentExperience,
                      CurrentRole: resume.CurrentRole,
                      ImageData: resume.ImageData,
                    };
                  }
                }
                return i;
              });
            }

            const feedbackInterviewIds = feedbackInterviews.map((i) => i._id);

            // -------------------------------------------------------
            // 2️⃣ GET ALL INTERVIEW ROUNDS FOR THOSE INTERVIEWS
            // -------------------------------------------------------
            const feedbackInterviewRounds = await InterviewRounds.find({
              interviewId: { $in: feedbackInterviewIds },
            }).lean();

            const feedbackRoundIds = feedbackInterviewRounds.map((r) => r._id);

            // -------------------------------------------------------
            // 3️⃣ BUILD PROPER BASE QUERY
            // -------------------------------------------------------
            let baseQuery = {
              $or: [
                { interviewRoundId: { $in: feedbackRoundIds } },
                { ...query },
              ],
            };

            // EXTRA rule for non-admin users → own feedback only
            if (
              roleType === "individual" ||
              (roleType === "organization" && roleName !== "Admin")
            ) {
              baseQuery.$or.push({ ownerId: userId });
            }

            // -------------------------------------------------------
            // 4️⃣ SEARCH FILTER
            // -------------------------------------------------------
            if (search) {
              const regex = new RegExp(search, "i");
              baseQuery.$and = baseQuery.$and || [];
              baseQuery.$and.push({
                $or: [
                  { feedbackCode: regex },
                  { "candidateId.FirstName": regex },
                  { "candidateId.LastName": regex },
                  { "candidateId.Email": regex },
                  { "positionId.title": regex },
                  { "positionId.companyname": regex },
                ],
              });
            }

            // -------------------------------------------------------
            // 5️⃣ STATUS FILTER
            // -------------------------------------------------------
            if (status) {
              const arr = Array.isArray(status) ? status : [status];
              baseQuery.status = { $in: arr };
            }

            // -------------------------------------------------------
            // 6️⃣ POSITION FILTER
            // -------------------------------------------------------
            if (positions) {
              const arr = Array.isArray(positions) ? positions : [positions];
              baseQuery.positionId = { $in: arr };
            }

            // -------------------------------------------------------
            // 7️⃣ MODE FILTER
            // -------------------------------------------------------
            if (modes) {
              const arr = Array.isArray(modes) ? modes : [modes];
              baseQuery["interviewRoundId.interviewMode"] = { $in: arr };
            }

            // -------------------------------------------------------
            // 8️⃣ INTERVIEWER FILTER
            // -------------------------------------------------------
            if (interviewers) {
              const arr = Array.isArray(interviewers)
                ? interviewers
                : [interviewers];
              baseQuery.interviewerId = { $in: arr };
            }

            // -------------------------------------------------------
            // 9️⃣ RECOMMENDATION FILTER
            // -------------------------------------------------------
            if (recommendations) {
              const arr = Array.isArray(recommendations)
                ? recommendations
                : [recommendations];

              baseQuery["overallImpression.recommendation"] = { $in: arr };
            }

            // -------------------------------------------------------
            // 🔟 RATING RANGE FILTER
            // -------------------------------------------------------
            if (ratingMin || ratingMax) {
              baseQuery["overallImpression.overallRating"] = {};
              if (ratingMin)
                baseQuery["overallImpression.overallRating"].$gte =
                  parseFloat(ratingMin);
              if (ratingMax)
                baseQuery["overallImpression.overallRating"].$lte =
                  parseFloat(ratingMax);
            }

            // -------------------------------------------------------
            // 1️⃣1️⃣ INTERVIEW DATE FILTER
            // -------------------------------------------------------
            if (interviewDate) {
              const now = new Date();
              let start = new Date();

              switch (interviewDate) {
                case "last7":
                  start.setDate(now.getDate() - 7);
                  break;
                case "last30":
                  start.setDate(now.getDate() - 30);
                  break;
                case "last90":
                  start.setDate(now.getDate() - 90);
                  break;
                default:
                  start = null;
              }

              if (start) {
                baseQuery["interviewRoundId.dateTime"] = {
                  $gte: start,
                  $lte: now,
                };
              }
            }

            // -------------------------------------------------------
            // 1️⃣2️⃣ PAGINATION TOTAL COUNT
            // -------------------------------------------------------
            const feedbackTotalCount = await FeedbackModel.countDocuments(
              baseQuery
            );

            // -------------------------------------------------------
            // 1️⃣3️⃣ FETCH FEEDBACK WITH POPULATION
            // -------------------------------------------------------
            let feedbacks = await FeedbackModel.find(baseQuery)
              .populate(
                "candidateId",
                "FirstName LastName Email Phone"
              )
              .populate(
                "positionId",
                "title companyname jobDescription Location"
              )
              .populate(
                "interviewRoundId",
                "roundTitle interviewMode interviewType interviewerType duration instructions dateTime status"
              )
              .populate("interviewerId", "firstName lastName email")
              .populate("ownerId", "firstName lastName email")
              .sort({ _id: -1 })
              // .skip(skip)
              .limit(feedbackLimitNum)
              .lean();

            // Fetch Resume data for candidates (skills, experience, etc. moved from Candidate)
            const feedbackCandidateIds = feedbacks
              .filter((f) => f.candidateId?._id)
              .map((f) => f.candidateId._id);

            if (feedbackCandidateIds.length > 0) {
              const feedbackResumes = await Resume.find({
                candidateId: { $in: feedbackCandidateIds },
                isActive: true,
              }).select("candidateId skills CurrentExperience CurrentRole ImageData").lean();

              const feedbackResumeMap = {};
              feedbackResumes.forEach((r) => {
                feedbackResumeMap[String(r.candidateId)] = r;
              });

              // Merge Resume data into feedbacks
              feedbacks = feedbacks.map((f) => {
                if (f.candidateId?._id) {
                  const resume = feedbackResumeMap[String(f.candidateId._id)];
                  if (resume) {
                    f.candidateId = {
                      ...f.candidateId,
                      skills: resume.skills,
                      CurrentExperience: resume.CurrentExperience,
                      CurrentRole: resume.CurrentRole,
                      ImageData: resume.ImageData,
                    };
                  }
                }
                return f;
              });
            }

            // -------------------------------------------------------
            // 1️⃣4️⃣ GET INTERVIEW QUESTIONS FOR EACH FEEDBACK
            // -------------------------------------------------------
            const feedbackWithQuestions = await Promise.all(
              feedbacks.map(async (f) => {
                const preSelectedQuestions = await InterviewQuestions.find({
                  roundId: f.interviewRoundId?._id,
                }).lean();

                return {
                  ...f,
                  preSelectedQuestions,
                  canEdit: f.status === "draft",
                  canView: true,
                };
              })
            );

            // -------------------------------------------------------
            // 1️⃣5️⃣ FINAL RESPONSE
            // -------------------------------------------------------
            data = {
              feedbacks: feedbackWithQuestions,
              pagination: {
                currentPage: feedbackPageNum,
                totalPages: Math.ceil(feedbackTotalCount / feedbackLimitNum),
                totalItems: feedbackTotalCount,
                itemsPerPage: feedbackLimitNum,
              },
            };
          } else {
            let baseQuery = {
              ...query,
              status: "draft", // 👈 ONLY DRAFT STATUS
            };

            const feedbackTotalCount = await FeedbackModel.countDocuments(
              baseQuery
            );
            data = {
              data: feedbackTotalCount,
            };
          }

          break;

        case "candidate":
          const {
            page: candidatePage = 1,
            limit: candidateLimit,
            search: candidateSearch,
            status: candidateStatus,
            tech: candidateTech,
            experienceMin: candidateExperienceMin,
            experienceMax: candidateExperienceMax,
            relevantExperienceMin: candidateRelevantExperienceMin,
            relevantExperienceMax: candidateRelevantExperienceMax,
            roles: candidateRoles,
            universities: candidateUniversities,
            createdDate: candidateCreatedDate,
          } = req.query;

          const parsedCandidatePage = parseInt(candidatePage) || 1;

          // Parse candidateLimit - handle "infinity" or other non-numeric values
          let parsedCandidateLimit;
          if (
            candidateLimit === "infinity" ||
            candidateLimit === "Infinity" ||
            candidateLimit === "INFINITY"
          ) {
            parsedCandidateLimit = 0; // 0 means no limit in MongoDB
          } else {
            parsedCandidateLimit = parseInt(candidateLimit) || 10;
          }

          const candidateSkip =
            (parsedCandidatePage - 1) * (parsedCandidateLimit || 0);

          // Convert tenantId to ObjectId for aggregation (aggregate doesn't auto-cast like find)
          const aggregationQuery = { ...query };
          if (aggregationQuery.tenantId && typeof aggregationQuery.tenantId === 'string') {
            aggregationQuery.tenantId = new mongoose.Types.ObjectId(aggregationQuery.tenantId);
          }
          if (aggregationQuery.ownerId && typeof aggregationQuery.ownerId === 'string') {
            aggregationQuery.ownerId = new mongoose.Types.ObjectId(aggregationQuery.ownerId);
          }

          // Build aggregation pipeline for candidate with Resume join
          const candidatePipeline = [
            { $match: aggregationQuery },
            // Lookup active resume for each candidate
            {
              $lookup: {
                from: "resume",
                localField: "_id",
                foreignField: "candidateId",
                as: "activeResume"
              }
            }
            ,
            // Unwind resume (preserveNullAndEmptyArrays for candidates without resume)
            {
              $addFields: {
                activeResume: {
                  $filter: {
                    input: "$activeResume",
                    as: "r",
                    cond: { $eq: ["$$r.isActive", true] }
                  }
                }
              }
            },
            {
              $addFields: {
                activeResume: { $arrayElemAt: ["$activeResume", 0] }
              }
            },
            // Add computed fields with fallback to legacy data
            {
              $addFields: {
                skills: { $ifNull: ["$activeResume.skills", "$skills"] },
                CurrentExperience: { $ifNull: ["$activeResume.CurrentExperience", "$CurrentExperience"] },
                HigherQualification: { $ifNull: ["$activeResume.HigherQualification", "$HigherQualification"] },
                RelevantExperience: { $ifNull: ["$activeResume.RelevantExperience", "$RelevantExperience"] },
                CurrentRole: { $ifNull: ["$activeResume.CurrentRole", "$CurrentRole"] },
                UniversityCollege: { $ifNull: ["$activeResume.UniversityCollege", "$UniversityCollege"] },
                ImageData: { $ifNull: ["$activeResume.ImageData", "$ImageData"] },
              }
            }
          ];

          // Apply search filter
          if (candidateSearch) {
            const searchRegex = new RegExp(candidateSearch, "i");
            candidatePipeline[0].$match.$or = [
              { FirstName: searchRegex },
              { LastName: searchRegex },
              { Email: searchRegex },
              { Phone: searchRegex },
            ];
          }

          // Apply filters on Resume fields (after lookup)
          const postLookupFilters = {};

          if (candidateStatus) {
            const statuses = Array.isArray(candidateStatus) ? candidateStatus : [candidateStatus];
            postLookupFilters.HigherQualification = { $in: statuses };
          }

          if (candidateTech) {
            const techs = Array.isArray(candidateTech) ? candidateTech : [candidateTech];
            postLookupFilters["skills.skill"] = { $in: techs };
          }

          const candidateExpMin = parseInt(candidateExperienceMin) || 0;
          const candidateExpMax = parseInt(candidateExperienceMax) || Infinity;
          if (candidateExpMin > 0 || candidateExpMax < Infinity) {
            postLookupFilters.CurrentExperience = {};
            if (candidateExpMin > 0) postLookupFilters.CurrentExperience.$gte = candidateExpMin;
            if (candidateExpMax < Infinity) postLookupFilters.CurrentExperience.$lte = candidateExpMax;
          }

          const candidateRelExpMin = parseInt(candidateRelevantExperienceMin) || 0;
          const candidateRelExpMax = parseInt(candidateRelevantExperienceMax) || Infinity;
          if (candidateRelExpMin > 0 || candidateRelExpMax < Infinity) {
            postLookupFilters.RelevantExperience = {};
            if (candidateRelExpMin > 0) postLookupFilters.RelevantExperience.$gte = candidateRelExpMin;
            if (candidateRelExpMax < Infinity) postLookupFilters.RelevantExperience.$lte = candidateRelExpMax;
          }

          if (candidateRoles) {
            const roleList = Array.isArray(candidateRoles) ? candidateRoles : [candidateRoles];
            postLookupFilters.CurrentRole = { $in: roleList };
          }

          if (candidateUniversities) {
            const uniList = Array.isArray(candidateUniversities) ? candidateUniversities : [candidateUniversities];
            postLookupFilters.UniversityCollege = { $in: uniList };
          }

          if (candidateCreatedDate === "last7") {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            postLookupFilters.createdAt = { $gte: date };
          } else if (candidateCreatedDate === "last30") {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            postLookupFilters.createdAt = { $gte: date };
          }

          // Add post-lookup filters if any
          if (Object.keys(postLookupFilters).length > 0) {
            candidatePipeline.push({ $match: postLookupFilters });
          }

          // Debug logging
          console.log('[Candidate API] Aggregation query:', JSON.stringify(aggregationQuery));
          console.log('[Candidate API] Post-lookup filters:', JSON.stringify(postLookupFilters));
          console.log('[Candidate API] Pipeline length:', candidatePipeline.length);

          // Get total count before pagination
          const countPipeline = [...candidatePipeline, { $count: "total" }];
          const countResult = await Candidate.aggregate(countPipeline);
          total = countResult[0]?.total || 0;

          console.log('[Candidate API] Total count:', total);

          // Add sorting and pagination
          candidatePipeline.push(
            { $sort: { _id: -1 } },
            { $skip: candidateSkip }
          );
          if (parsedCandidateLimit > 0) {
            candidatePipeline.push({ $limit: parsedCandidateLimit });
          }

          // Execute aggregation
          const candidateData = await Candidate.aggregate(candidatePipeline);

          // Fetch role labels
          const allRoles = await RoleMaster.find({}, { roleName: 1, roleLabel: 1 }).lean();
          const roleMap = {};
          allRoles.forEach((r) => {
            roleMap[r.roleName] = r.roleLabel;
          });

          // Attach labels to each candidate
          candidateData.forEach((c) => {
            c.currentRoleLabel = roleMap[c.CurrentRole] || null;
            c.technologyLabel = roleMap[c.Technology] || null;
          });

          dataObj = {
            candidate: candidateData,
            total,
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
      console.error("[37] Error in request processing:", {
        error: error.message,
        stack: error.stack,
        model: req.params.model,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
        requestId: req.id, // If you have request ID tracking
      });
    }
    // console.log('--- REQUEST PROCESSING COMPLETE ---');
  }
);

// Helper function for interview filtering
async function handleInterviewFiltering(options) {
  const {
    query = {},
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
    limit,
  } = options;

  // === Normalize inputs ===
  const toLower = (v) =>
    String(v || "")
      .toLowerCase()
      .trim();
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = limit === Infinity ? Infinity : Math.max(1, Number(limit));

  try {
    // ==========================================================
    // STEP 1: Fetch interviews with full population
    // ==========================================================
    let baseQuery = { ...query };

    if (createdDate) {
      const date = new Date();
      switch (createdDate) {
        case "last7":
          date.setDate(date.getDate() - 7);
          break;
        case "last30":
          date.setDate(date.getDate() - 30);
          break;
        case "last90":
          date.setDate(date.getDate() - 90);
          break;
        default:
          if (/^\d{4}-\d{2}-\d{2}/.test(String(createdDate))) {
            date = new Date(createdDate);
          } else date = null;
      }
      if (date) baseQuery.createdAt = { $gte: date };
    }

    let interviews = await DataModel.find(baseQuery)
      .sort({ _id: -1 })
      .populate({
        path: "candidateId",
        select:
          "FirstName LastName Email",
        model: "Candidate",
      })
      .populate({
        path: "positionId",
        select: "title companyname Location skills minexperience maxexperience",
        model: "Position",
      })
      .populate({ path: "templateId", model: "InterviewTemplate" })
      .lean();

    // ==========================================================
    // STEP 1.5: Manual Safe Population for CompanyName
    // (Handles mixed ObjectId/String data that crashes mongoose populate)
    // ==========================================================
    const companyIds = new Set();
    interviews.forEach((i) => {
      const pos = i.positionId;
      if (
        pos &&
        pos.companyname &&
        mongoose.isValidObjectId(pos.companyname)
      ) {
        companyIds.add(String(pos.companyname));
      }
    });

    if (companyIds.size > 0) {
      const companies = await TenantCompany.find({
        _id: { $in: [...companyIds] },
      })
        .select("name")
        .lean();
      const companyMap = {};
      companies.forEach((c) => {
        companyMap[String(c._id)] = c;
      });

      interviews.forEach((i) => {
        if (i.positionId && i.positionId.companyname) {
          const rawVal = i.positionId.companyname;
          if (mongoose.isValidObjectId(rawVal)) {
            const comp = companyMap[String(rawVal)];
            i.positionId.companyname = comp || { name: "Unknown Company" };
          } else if (typeof rawVal === "string") {
            i.positionId.companyname = { name: rawVal };
          }
        }
      });
    } else {
      interviews.forEach((i) => {
        if (
          i.positionId &&
          i.positionId.companyname &&
          typeof i.positionId.companyname === "string"
        ) {
          i.positionId.companyname = { name: i.positionId.companyname };
        }
      });
    }

    // ==========================================================
    // STEP 1.5: Fetch Resume data for each candidate (skills, experience, etc.)
    // ==========================================================
    const candidateIds = interviews
      .filter((i) => i.candidateId?._id)
      .map((i) => i.candidateId._id);

    if (candidateIds.length > 0) {
      const resumes = await Resume.find({
        candidateId: { $in: candidateIds },
        isActive: true,
      })
        .select("candidateId skills CurrentExperience CurrentRole ImageData")
        .lean();

      const resumeMap = {};
      resumes.forEach((r) => {
        resumeMap[String(r.candidateId)] = r;
      });

      // Merge resume data into candidateId
      interviews = interviews.map((i) => {
        if (i.candidateId?._id) {
          const resume = resumeMap[String(i.candidateId._id)];
          if (resume) {
            i.candidateId = {
              ...i.candidateId,
              skills: resume.skills,
              CurrentExperience: resume.CurrentExperience,
              CurrentRole: resume.CurrentRole,
              ImageData: resume.ImageData,
            };
          }
        }
        return i;
      });
    }

    // console.log(`Fetched ${interviews.length} interviews`);

    // ==========================================================
    // STEP 2: Global Search
    // ==========================================================
    if (searchQuery && searchQuery.trim()) {
      const q = toLower(searchQuery.trim());
      interviews = interviews.filter((i) => {
        const c = i.candidateId || {};
        const p = i.positionId || {};
        const fullName1 = `${toLower(c.FirstName)} ${toLower(
          c.LastName
        )}`.trim();
        const fullName2 = `${toLower(c.LastName)} ${toLower(
          c.FirstName
        )}`.trim();

        return (
          [
            c.FirstName,
            c.LastName,
            c.Email,
            c.CurrentRole,
            p.title,
            p.companyname?.name || p.companyname,
            i.interviewCode,
            i.interviewTitle,
            i.interviewType,
            i.status,
          ].some((field) => field && toLower(field).includes(q)) ||
          fullName1.includes(q) ||
          fullName2.includes(q)
        );
      });
    }

    // ==========================================================
    // STEP 3: Basic Filters (on populated data)
    // ==========================================================

    // Status
    if (Array.isArray(status) && status.length) {
      const set = new Set(status.map(toLower));
      interviews = interviews.filter((i) => set.has(toLower(i.status)));
    }

    // Position (by title)
    if (Array.isArray(position) && position.length) {
      const set = new Set(position.map(toLower));
      interviews = interviews.filter((i) => {
        const title = toLower(i.positionId?.title);
        return title && set.has(title);
      });
    }

    // Company
    if (Array.isArray(company) && company.length) {
      const set = new Set(company.map(toLower));
      interviews = interviews.filter((i) => {
        const comp = toLower(i.positionId?.companyname?.name || i.positionId?.companyname);
        return comp && set.has(comp);
      });
    }

    // Tech Skills
    if (Array.isArray(tech) && tech.length) {
      const techSet = new Set(tech.map(toLower));
      interviews = interviews.filter((i) => {
        const skills = Array.isArray(i.candidateId?.skills)
          ? i.candidateId.skills
          : [];
        return skills.some((s) => techSet.has(toLower(s.skill || s.SkillName)));
      });
    }

    // Experience
    if (experienceMin || experienceMax) {
      const min = experienceMin ? Number(experienceMin) : null;
      const max = experienceMax ? Number(experienceMax) : null;
      interviews = interviews.filter((i) => {
        const exp = Number(i.candidateId?.CurrentExperience);
        if (isNaN(exp)) return false;
        if (min !== null && exp < min) return false;
        if (max !== null && exp > max) return false;
        return true;
      });
    }

    // console.log(`After basic filters: ${interviews.length}`);

    // ==========================================================
    // STEP 4: Round-based Filters (interviewType, mode, status, interviewer, date)
    // ==========================================================
    const hasRoundFilters =
      interviewType?.length ||
      interviewMode?.length ||
      roundStatus?.length ||
      interviewer?.length ||
      interviewDateFrom ||
      interviewDateTo;

    if (hasRoundFilters) {
      const roundQuery = {};
      if (interviewType?.length)
        roundQuery.interviewType = { $in: interviewType };
      if (interviewMode?.length)
        roundQuery.interviewMode = { $in: interviewMode };
      if (roundStatus?.length) roundQuery.status = { $in: roundStatus };

      // Resolve interviewer names → _id
      if (Array.isArray(interviewer) && interviewer.length) {
        const orConditions = interviewer.map((name) => ({
          $expr: {
            $eq: [
              {
                $trim: { input: { $concat: ["$firstName", " ", "$lastName"] } },
              },
              name.trim(),
            ],
          },
        }));
        const contacts = await Contacts.find({ $or: orConditions })
          .select("_id")
          .lean();
        const ids = contacts.map((c) => c._id);
        if (ids.length === 0) {
          return {
            data: [],
            total: 0,
            page: 1,
            totalPages: 0,
            hasMore: false,
            from: 0,
            to: 0,
          };
        }
        roundQuery.interviewers = { $in: ids };
      }

      // Limit to current interview IDs
      roundQuery.interviewId = { $in: interviews.map((i) => i._id) };

      let rounds = await InterviewRounds.find(roundQuery)
        .select("interviewId dateTime")
        .lean();

      // Date range
      if (interviewDateFrom || interviewDateTo) {
        const from = interviewDateFrom ? String(interviewDateFrom) : null;
        const to = interviewDateTo ? String(interviewDateTo) : null;
        rounds = rounds.filter((r) => {
          const dateStr = String(r.dateTime || "").split(" - ")[0];
          if (!dateStr) return false;
          if (from && dateStr < from) return false;
          if (to && dateStr > to) return false;
          return true;
        });
      }

      const validIds = new Set(rounds.map((r) => String(r.interviewId)));
      interviews = interviews.filter((i) => validIds.has(String(i._id)));
    }

    // console.log(`After round filters: ${interviews.length}`);

    // ==========================================================
    // STEP 5: Pagination
    // ==========================================================
    const total = interviews.length;

    const totalPages = total > 0 ? Math.ceil(total / limitNum) : 0;
    const currentPage = Math.min(pageNum, totalPages || 1);

    const startIndex = (currentPage - 1) * limitNum;
    // const endIndex = Math.min(startIndex + limitNum, total);
    const endIndex =
      limitNum === Infinity ? total : Math.min(startIndex + limitNum, total);

    const paginated = interviews.slice(startIndex, endIndex);

    // console.log(`Pagination: total=${total}, page=${currentPage}/${totalPages}, returned=${paginated.length}`);

    if (paginated.length === 0) {
      return {
        data: [],
        total,
        page: currentPage,
        totalPages,
        hasMore: false,
        from: 0,
        to: 0,
      };
    }

    // ==========================================================
    // STEP 6: Fetch rounds + questions for paginated interviews only
    // ==========================================================
    const interviewIds = paginated.map((i) => i._id);

    const rounds = await InterviewRounds.find({
      interviewId: { $in: interviewIds },
    })
      .populate({
        path: "interviewers",
        select: "firstName lastName email",
        model: "Contacts",
      })
      .lean();

    const roundIds = rounds.map((r) => r._id);
    const questions = roundIds.length
      ? await InterviewQuestions.find({ roundId: { $in: roundIds } })
        .select("roundId snapshot")
        .lean()
      : [];

    const questionsMap = questions.reduce((acc, q) => {
      const key = String(q.roundId);
      acc[key] = acc[key] || [];
      acc[key].push(q);
      return acc;
    }, {});

    const roundsWithQuestions = rounds.map((r) => ({
      ...r,
      questions: questionsMap[String(r._id)] || [],
    }));

    // ==========================================================
    // STEP 7: Final Response
    // ==========================================================
    const finalData = paginated.map((i) => ({
      ...i,
      rounds: roundsWithQuestions.filter(
        (r) => String(r.interviewId) === String(i._id)
      ),
    }));

    return {
      data: finalData,
      total,
      page: currentPage,
      totalPages,
      hasMore: currentPage < totalPages,
      from: startIndex + 1,
      to: startIndex + finalData.length,
    };
  } catch (err) {
    console.error("Interview Filtering Failed:", err);
    throw err;
  }
}

// Enhanced dashboard stats function with proper date handling
async function getInterviewDashboardStats({ filterQuery, DataModel }) {
  if (!DataModel) throw new Error("DataModel missing");

  // Convert tenantId & ownerId to ObjectId
  const tenantId = new mongoose.Types.ObjectId(filterQuery.tenantId);
  const ownerId = filterQuery.ownerId
    ? new mongoose.Types.ObjectId(filterQuery.ownerId)
    : null;

  const matchInterview = {
    "interview.tenantId": tenantId,
    ...(ownerId ? { "interview.ownerId": ownerId } : {}),
  };

  // If upcomingOnly is true, we'll only return upcoming interviews
  // const isUpcomingRequest =
  //   filterQuery?.upcomingOnly === true || options.type === "upcoming";

  const now = new Date();

  // Date ranges for calculations
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Sunday

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(currentWeekEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const next7DaysEnd = new Date();
  next7DaysEnd.setDate(now.getDate() + 7);

  // --------------------------------------------------------------------
  // TOTAL INTERVIEWS (All time count)
  // --------------------------------------------------------------------
  const totalInterviews = await DataModel.countDocuments({
    tenantId,
    ...(ownerId ? { ownerId } : {}),
  });

  // --------------------------------------------------------------------
  // CURRENT MONTH & LAST MONTH INTERVIEWS (Based on rounds)
  // --------------------------------------------------------------------
  const monthlyRoundsAgg = await InterviewRounds.aggregate([
    {
      $lookup: {
        from: "interviews",
        localField: "interviewId",
        foreignField: "_id",
        as: "interview",
      },
    },
    { $unwind: "$interview" },
    { $match: matchInterview },
    {
      $project: {
        createdAt: 1,
        // Use createdAt as fallback for date calculations
        effectiveDate: {
          $cond: {
            if: {
              $and: [
                { $ne: ["$dateTime", ""] },
                { $ne: ["$dateTime", null] },
                { $ne: ["$dateTime", undefined] },
              ],
            },
            then: {
              $cond: {
                if: { $eq: [{ $type: "$dateTime" }, "string"] },
                then: {
                  $dateFromString: {
                    dateString: "$dateTime",
                    onError: "$createdAt", // Fallback to createdAt if parsing fails
                  },
                },
                else: "$dateTime",
              },
            },
            else: "$createdAt", // Default to createdAt if dateTime is empty/invalid
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        currentMonthCount: {
          $sum: {
            $cond: [{ $gte: ["$effectiveDate", currentMonthStart] }, 1, 0],
          },
        },
        lastMonthCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$effectiveDate", lastMonthStart] },
                  { $lte: ["$effectiveDate", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalRounds: { $sum: 1 },
      },
    },
  ]);

  const monthlyData = monthlyRoundsAgg[0] || {
    currentMonthCount: 0,
    lastMonthCount: 0,
    totalRounds: 0,
  };

  // Calculate trend for total interviews
  const totalTrend =
    monthlyData.lastMonthCount === 0
      ? "up"
      : monthlyData.currentMonthCount >= monthlyData.lastMonthCount
        ? "up"
        : "down";

  const totalTrendValue =
    monthlyData.lastMonthCount === 0
      ? "+100% vs last month"
      : `${(
        ((monthlyData.currentMonthCount - monthlyData.lastMonthCount) /
          monthlyData.lastMonthCount) *
        100
      ).toFixed(1)}% vs last month`;

  // --------------------------------------------------------------------
  // OUTSOURCED INTERVIEWS
  // --------------------------------------------------------------------
  const outsourcedAgg = await InterviewRounds.aggregate([
    {
      $match: {
        interviewerType: "External",
        ...(matchInterview["interview.tenantId"] ? {} : {}),
      },
    },
    {
      $lookup: {
        from: "interviews",
        localField: "interviewId",
        foreignField: "_id",
        as: "interview",
      },
    },
    { $unwind: "$interview" },
    { $match: matchInterview },
    {
      $group: {
        _id: null,
        currentMonthCount: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", currentMonthStart] }, 1, 0],
          },
        },
        lastMonthCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$createdAt", lastMonthStart] },
                  { $lte: ["$createdAt", lastMonthEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const outsourcedData = outsourcedAgg[0] || {
    currentMonthCount: 0,
    lastMonthCount: 0,
    totalCount: 0,
  };

  // Calculate trend for outsourced interviews
  const outsourcedTrend =
    outsourcedData.lastMonthCount === 0
      ? "up"
      : outsourcedData.currentMonthCount >= outsourcedData.lastMonthCount
        ? "up"
        : "down";

  const outsourcedTrendValue =
    outsourcedData.lastMonthCount === 0
      ? "+100% vs last month"
      : `${(
        ((outsourcedData.currentMonthCount - outsourcedData.lastMonthCount) /
          outsourcedData.lastMonthCount) *
        100
      ).toFixed(1)}% vs last month`;

  // --------------------------------------------------------------------
  // UPCOMING INTERVIEWS (with safe date parsing)
  // --------------------------------------------------------------------
  const upcomingAgg = await InterviewRounds.aggregate([
    {
      $match: {
        $and: [
          { dateTime: { $ne: null, $exists: true } },
          { dateTime: { $ne: "" } }, // Exclude empty strings
          { dateTime: { $type: "string" } }, // Only consider string dates
        ],
        status: { $in: ["Draft", "RequestSent", "Scheduled"] },
      },
    },
    {
      $lookup: {
        from: "interviews",
        localField: "interviewId",
        foreignField: "_id",
        as: "interview",
      },
    },
    { $unwind: "$interview" },
    { $match: matchInterview },
    {
      $project: {
        dateTime: 1,
        // Safe date parsing with validation
        parsedDateTime: {
          $cond: {
            if: {
              $and: [
                { $ne: ["$dateTime", ""] },
                { $ne: ["$dateTime", null] },
                {
                  $regexMatch: {
                    input: "$dateTime",
                    regex: /^\d{4}-\d{2}-\d{2}/,
                  },
                }, // Basic date format validation
              ],
            },
            then: {
              $dateFromString: {
                dateString: "$dateTime",
                onError: null, // Return null if parsing fails
                onNull: null,
              },
            },
            else: null,
          },
        },
      },
    },
    {
      $match: {
        parsedDateTime: { $ne: null }, // Only include documents with valid dates
      },
    },
    {
      $group: {
        _id: null,
        upcoming7Days: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$parsedDateTime", now] },
                  { $lte: ["$parsedDateTime", next7DaysEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        currentWeekCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$parsedDateTime", currentWeekStart] },
                  { $lte: ["$parsedDateTime", currentWeekEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
        lastWeekCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$parsedDateTime", lastWeekStart] },
                  { $lte: ["$parsedDateTime", lastWeekEnd] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const upcomingData = upcomingAgg[0] || {
    upcoming7Days: 0,
    currentWeekCount: 0,
    lastWeekCount: 0,
  };

  // Calculate trend for upcoming interviews
  const upcomingTrend =
    upcomingData.lastWeekCount === 0
      ? "up"
      : upcomingData.currentWeekCount >= upcomingData.lastWeekCount
        ? "up"
        : "down";

  const upcomingTrendValue =
    upcomingData.lastWeekCount === 0
      ? "+100% vs last week"
      : `${(
        ((upcomingData.currentWeekCount - upcomingData.lastWeekCount) /
          upcomingData.lastWeekCount) *
        100
      ).toFixed(1)}% vs last week`;
  console.log("upcomingData", {
    matchInterview,
    now,
    limit: 5, // Limit for dashboard display
  });

  // Get upcoming rounds for dashboard (without filters)
  const upcomingRoundsData = await getUpcomingRoundsOnly({
    matchInterview,
    now,
    limit: 5, // Limit for dashboard display
  });

  // --------------------------------------------------------------------
  // RETURN COMPLETE DASHBOARD DATA
  // --------------------------------------------------------------------
  return {
    // Total Interviews Card Data
    upcomingRoundsData: upcomingRoundsData,
    totalInterviews: {
      value: monthlyData.currentMonthCount,
      lastMonth: monthlyData.lastMonthCount,
      trend: totalTrend,
      trendValue: totalTrendValue,
      totalRounds: monthlyData.totalRounds,
    },

    // Outsourced Interviews Card Data
    outsourcedInterviews: {
      value: outsourcedData.currentMonthCount,
      lastMonth: outsourcedData.lastMonthCount,
      trend: outsourcedTrend,
      trendValue: outsourcedTrendValue,
      totalCount: outsourcedData.totalCount,
    },

    // Upcoming Interviews Card Data
    upcomingInterviews: {
      value: upcomingData.upcoming7Days,
      lastWeek: upcomingData.lastWeekCount,
      trend: upcomingTrend,
      trendValue: upcomingTrendValue,
      currentWeekCount: upcomingData.currentWeekCount,
    },

    // Additional metadata
    metadata: {
      totalInterviewsCount: totalInterviews,
      calculationDate: now,
      dateRanges: {
        currentMonth: { start: currentMonthStart, end: now },
        lastMonth: { start: lastMonthStart, end: lastMonthEnd },
        currentWeek: { start: currentWeekStart, end: currentWeekEnd },
        lastWeek: { start: lastWeekStart, end: lastWeekEnd },
        next7Days: { start: now, end: next7DaysEnd },
      },
    },
  };
}

// ==========================================================
// SIMPLIFIED FUNCTION FOR UPCOMING ROUNDS WITHOUT FILTERS
// ==========================================================

async function getUpcomingRoundsOnly({ matchInterview, now, limit = 5 }) {
  // First, get all rounds with the proper status
  let allRounds = await InterviewRounds.find({
    dateTime: { $exists: true, $ne: "" },
    status: { $in: ["Draft", "RequestSent", "Scheduled"] },
  })
    .populate({
      path: "interviewId",
      match: {
        tenantId: matchInterview["interview.tenantId"],
        ...(matchInterview["interview.ownerId"]
          ? { ownerId: matchInterview["interview.ownerId"] }
          : {}),
      },
      populate: [
        {
          path: "candidateId",
          select: "FirstName LastName Email",
        },
        {
          path: "positionId",
          select:
            "title companyname Location skills minexperience maxexperience",
        },
      ],
    })
    .lean();

  // Filter out rounds where interview is null (due to tenant/owner mismatch)
  const filteredRounds = allRounds.filter((round) => round.interviewId);

  // Fetch Resume data for all candidates
  const candidateIds = filteredRounds
    .filter((r) => r.interviewId?.candidateId?._id)
    .map((r) => r.interviewId.candidateId._id);

  let resumeMap = {};
  if (candidateIds.length > 0) {
    const resumes = await Resume.find({
      candidateId: { $in: candidateIds },
      isActive: true,
    }).select("candidateId skills CurrentExperience CurrentRole ImageData").lean();

    resumes.forEach((r) => {
      resumeMap[String(r.candidateId)] = r;
    });
  }

  // Merge Resume data into candidates
  filteredRounds.forEach((round) => {
    if (round.interviewId?.candidateId?._id) {
      const resume = resumeMap[String(round.interviewId.candidateId._id)];
      if (resume) {
        round.interviewId.candidateId = {
          ...round.interviewId.candidateId,
          skills: resume.skills,
          CurrentExperience: resume.CurrentExperience,
          CurrentRole: resume.CurrentRole,
          ImageData: resume.ImageData,
        };
      }
    }
  });

  // Parse dates and filter upcoming
  const upcomingRounds = [];

  for (const round of filteredRounds) {
    if (!round.dateTime) continue;

    try {
      // Parse the date from "dd-MM-yyyy hh:mm a" format
      const [datePart, timePart, ampm] = round.dateTime.split(" ");
      if (!datePart || !timePart || !ampm) continue;

      const [day, month, year] = datePart.split("-").map(Number);
      let [hour, minute] = timePart.split(":").map(Number);

      // Convert to 24-hour format
      if (ampm === "PM" && hour < 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      const roundDate = new Date(year, month - 1, day, hour, minute);

      // Check if it's in the future
      if (roundDate >= now) {
        upcomingRounds.push({
          ...round,
          interview: round.interviewId,
          candidate: round.interviewId.candidateId,
          position: round.interviewId.positionId,
          parsedDateTime: roundDate,
        });
      }
    } catch (error) {
      console.error("Error parsing date:", round.dateTime, error);
      continue;
    }
  }

  // Sort by date
  upcomingRounds.sort((a, b) => a.parsedDateTime - b.parsedDateTime);

  // Take only the limit
  const result = upcomingRounds.slice(0, limit);

  // console.log("Upcoming rounds found:", result.length);

  return result.map((round) => ({
    _id: round._id,
    meetPlatform: round.meetPlatform,
    interviewMode: round.interviewMode,
    roundTitle: round.roundTitle,
    interviewerType: round.interviewerType,
    status: round.status,
    dateTime: round.dateTime,
    interviewId: round.interviewId._id,
    interviewCode: round.interviewId.interviewCode,
    interview: round.interview,
    candidate: round.candidate,
    position: round.position,
    interviewers: round.interviewers || [],
    parsedDateTime: round.parsedDateTime,
  }));
}
module.exports = router;
