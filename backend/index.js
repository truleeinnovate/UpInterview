// this is new
require('dotenv').config();

// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('COOKIE_DOMAIN:', process.env.COOKIE_DOMAIN);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('=== END ENVIRONMENT VARIABLES DEBUG ===');

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// ✅ Trust Azure's proxy to detect HTTPS correctly
app.set('trust proxy', 1);

// ✅ Parse cookies
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    const allowedOrigins = [
      'https://app.upinterview.io',
      /^https:\/\/[a-z0-9-]+\.app\.upinterview\.io$/,
      'http://localhost:3000',
      'http://localhost:5000'
    ];

    if (!origin) return callback(null, true);

    // Check if the origin is allowed
    if (allowedOrigins.some((allowed) =>
      typeof allowed === 'string'
        ? allowed === origin
        : allowed.test(origin)
    )) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    }

    console.warn('CORS: Origin not allowed:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Important: Allow credentials (cookies, authorization headers)
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cookie',
    'Accept',
    'x-user-id',
    'x-tenant-id',
    'x-impersonation-userid',
    'x-permissions',
    'x-forwarded-proto',
    'x-forwarded-host',
    'x-forwarded-port'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  exposedHeaders: [
    'x-user-id',
    'x-tenant-id',
    'x-impersonation-userid',
    'x-permissions',
    'set-cookie',
    'x-new-token'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Add cookie debugging middleware AFTER CORS
app.use((req, res, next) => {
  console.log('[Cookie Debug] Request URL:', req.url);
  console.log('[Cookie Debug] Request cookies:', req.cookies);
  console.log('[Cookie Debug] Raw cookie header:', req.headers.cookie);
  console.log('[Cookie Debug] Origin:', req.headers.origin);
  console.log('[Cookie Debug] Referer:', req.headers.referer);
  next();
});

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware to capture raw body for webhook endpoints
const rawBodyParser = require('body-parser').raw({ type: '*/*' });
app.use((req, res, next) => {
  if (req.originalUrl === '/payment/webhook' || req.path === '/payment/webhook') {
    rawBodyParser(req, res, (err) => {
      if (err) return next(err);
      req.rawBody = req.body.toString();
      next();
    });
  } else {
    next();
  }
});

// Standard middleware
app.use(bodyParser.json());

// Apply permission middleware to all routes except authentication routes
const { permissionMiddleware } = require('./middleware/permissionMiddleware');

// Create a middleware that skips permission check for auth routes
const conditionalPermissionMiddleware = (req, res, next) => {
  // Skip permission middleware for authentication routes
  const authRoutes = [
    '/Organization/Login',
    '/Organization/Signup',
    '/Organization/reset-password',
    '/Organization/verify-email',
    '/Organization/verify-user-email',
    '/Individual/Login',
    '/Individual/Signup',
    '/linkedin/auth',
    '/linkedin/callback',
    '/users/permissions', // Add permissions endpoint to excluded routes
    '/test-login',
    '/test-permission-cookies',
    '/test-cookies',
    '/set-test-cookie',
    '/debug-cookies',
    '/test-cookie-flow'
  ];

  const isAuthRoute = authRoutes.some(route => req.path.includes(route));
  
  if (isAuthRoute) {
    console.log(`[Permission Middleware] Skipping permission check for auth route: ${req.path}`);
    return next();
  }

  // Apply permission middleware for non-auth routes
  return permissionMiddleware(req, res, next);
};

app.use(conditionalPermissionMiddleware);

// API Routes
const apiRoutes = require('./routes/apiRoutes');
const linkedinAuthRoutes = require('./routes/linkedinAuthRoute.js');
const individualLoginRoutes = require('./routes/individualLoginRoutes.js');
const SubscriptionRouter = require('./routes/SubscriptionRoutes.js');
const CustomerSubscriptionRouter = require('./routes/CustomerSubscriptionRoutes.js');
const organizationRoutes = require('./routes/organizationLoginRoutes.js');
const Cardrouter = require('./routes/Carddetailsroutes.js');
const EmailRouter = require('./routes/EmailsRoutes/emailsRoute.js');
const usersRoutes = require('./routes/usersRoutes.js');

// Simple login test endpoint
app.post('/test-login', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  console.log('[Test Login] Login attempt received');
  console.log('[Test Login] Request body:', req.body);

  // Set authentication cookies
  res.cookie('authToken', 'test-auth-token-123', getAuthCookieOptions());
  res.cookie('impersonationToken', 'test-impersonation-token-456', getAuthCookieOptions());

  console.log('[Test Login] Setting cookies with options:', getAuthCookieOptions());

  res.json({
    success: true,
    message: 'Test login successful',
    cookiesSet: ['authToken', 'impersonationToken'],
    cookieOptions: getAuthCookieOptions()
  });
});

// Test permission middleware with cookies
app.get('/test-permission-cookies', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  console.log('[Test Permission Cookies] === PERMISSION MIDDLEWARE TEST ===');
  console.log('[Test Permission Cookies] Request URL:', req.url);
  console.log('[Test Permission Cookies] Request cookies:', req.cookies);
  console.log('[Test Permission Cookies] Raw cookie header:', req.headers.cookie);
  console.log('[Test Permission Cookies] Origin:', req.headers.origin);

  // Check if we have the expected cookies
  const hasAuthToken = !!req.cookies.authToken;
  const hasImpersonationToken = !!req.cookies.impersonationToken;

  console.log('[Test Permission Cookies] Has authToken:', hasAuthToken);
  console.log('[Test Permission Cookies] Has impersonationToken:', hasImpersonationToken);

  // Set test cookies if they don't exist
  if (!hasAuthToken) {
    res.cookie('authToken', 'test-auth-token-for-permission', getAuthCookieOptions());
    console.log('[Test Permission Cookies] Set authToken cookie');
  }

  if (!hasImpersonationToken) {
    res.cookie('impersonationToken', 'test-impersonation-token-for-permission', getAuthCookieOptions());
    console.log('[Test Permission Cookies] Set impersonationToken cookie');
  }

  // Check res.locals (set by permission middleware)
  console.log('[Test Permission Cookies] res.locals:', res.locals);

  res.json({
    success: true,
    message: 'Permission middleware test',
    requestInfo: {
      cookies: req.cookies,
      rawCookieHeader: req.headers.cookie,
      origin: req.headers.origin,
      hasAuthToken,
      hasImpersonationToken
    },
    permissionMiddlewareData: {
      userId: res.locals.userId,
      tenantId: res.locals.tenantId,
      effectivePermissions: res.locals.effectivePermissions,
      isImpersonating: res.locals.isImpersonating,
      effectivePermissions_RoleName: res.locals.effectivePermissions_RoleName
    },
    cookieOptions: getAuthCookieOptions()
  });
});

// Test endpoint for cookie debugging
app.get('/test-cookies', (req, res) => {
  console.log('[Test Cookies] Request received');
  console.log('[Test Cookies] All cookies:', req.cookies);
  console.log('[Test Cookies] Auth token:', req.cookies.authToken ? 'EXISTS' : 'MISSING');
  console.log('[Test Cookies] Impersonation token:', req.cookies.impersonationToken ? 'EXISTS' : 'MISSING');

  // Test setting cookies with different options
  const { getAuthCookieOptions } = require('./utils/cookieUtils');
  const cookieOptions = getAuthCookieOptions();

  console.log('[Test Cookies] Cookie options being used:', cookieOptions);

  // Set test cookies
  res.cookie('testCookie', 'test-value-123', cookieOptions);
  res.cookie('authToken', 'test-auth-token-456', cookieOptions);
  res.cookie('impersonationToken', 'test-impersonation-token-789', cookieOptions);

  res.json({
    message: 'Cookie test endpoint',
    cookies: req.cookies,
    hasAuthToken: !!req.cookies.authToken,
    hasImpersonationToken: !!req.cookies.impersonationToken,
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  });
});

// Test endpoint to set cookies
app.get('/set-test-cookie', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  // Set a test cookie
  res.cookie('testCookie', 'testValue', getAuthCookieOptions());
  res.cookie('authToken', 'testAuthToken123', getAuthCookieOptions());

  console.log('[Set Test Cookie] Setting test cookies');

  res.json({
    message: 'Test cookies set',
    cookieOptions: getAuthCookieOptions()
  });
});

// Comprehensive cookie debugging endpoint
app.get('/debug-cookies', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  console.log('[Debug Cookies] Request received');
  console.log('[Debug Cookies] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    PORT: process.env.PORT
  });
  console.log('[Debug Cookies] Cookie options:', getAuthCookieOptions());
  // console.log('[Debug Cookies] Request headers:', req.headers);
  console.log('[Debug Cookies] Request cookies:', req.cookies);

  // Set a test cookie with current options
  res.cookie('debugCookie', 'debugValue', getAuthCookieOptions());

  res.json({
    message: 'Cookie debugging endpoint',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      PORT: process.env.PORT
    },
    cookieOptions: getAuthCookieOptions(),
    requestInfo: {
      cookies: req.cookies,
      headers: {
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      }
    }
  });
});

// Advanced cookie test endpoint
app.get('/test-cookie-flow', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  console.log('[Test Cookie Flow] Request received');
  // console.log('[Test Cookie Flow] All headers:', req.headers);
  console.log('[Test Cookie Flow] Parsed cookies:', req.cookies);
  console.log('[Test Cookie Flow] Raw cookie string:', req.headers.cookie);

  // Test different cookie settings
  const cookieOptions = getAuthCookieOptions();
  console.log('[Test Cookie Flow] Cookie options:', cookieOptions);

  // Set multiple test cookies with different options
  res.cookie('test1', 'value1', cookieOptions);
  res.cookie('test2', 'value2', { ...cookieOptions, domain: undefined });
  res.cookie('test3', 'value3', { ...cookieOptions, sameSite: 'None', secure: true });

  res.json({
    message: 'Cookie flow test',
    cookieOptions: cookieOptions,
    requestInfo: {
      cookies: req.cookies,
      rawCookieHeader: req.headers.cookie,
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    },
    testCookiesSet: ['test1', 'test2', 'test3']
  });
});

// Comprehensive cookie test endpoint
app.get('/cookie-test', (req, res) => {
  const { getAuthCookieOptions } = require('./utils/cookieUtils');

  console.log('[Cookie Test] === DETAILED COOKIE ANALYSIS ===');
  console.log('[Cookie Test] Request URL:', req.url);
  console.log('[Cookie Test] Request method:', req.method);
  console.log('[Cookie Test] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    PORT: process.env.PORT
  });
  console.log('[Cookie Test] Cookie options:', getAuthCookieOptions());
  // console.log('[Cookie Test] All request headers:', req.headers);
  console.log('[Cookie Test] Parsed cookies:', req.cookies);
  console.log('[Cookie Test] Raw cookie header:', req.headers.cookie);
  console.log('[Cookie Test] Origin:', req.headers.origin);
  console.log('[Cookie Test] Referer:', req.headers.referer);
  console.log('[Cookie Test] Host:', req.headers.host);
  console.log('[Cookie Test] User-Agent:', req.headers['user-agent']);
  console.log('[Cookie Test] === END ANALYSIS ===');

  // Set test cookies with different configurations
  const cookieOptions = getAuthCookieOptions();

  // Test 1: Default options
  res.cookie('test_default', 'value1', cookieOptions);

  // Test 2: No domain
  res.cookie('test_no_domain', 'value2', {
    ...cookieOptions,
    domain: undefined
  });

  // Test 3: Explicit sameSite and secure
  res.cookie('test_explicit', 'value3', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({
    message: 'Comprehensive cookie test',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      PORT: process.env.PORT
    },
    cookieOptions: cookieOptions,
    requestInfo: {
      cookies: req.cookies,
      rawCookieHeader: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    },
    testCookiesSet: ['test_default', 'test_no_domain', 'test_explicit']
  });
});

// Simple test to check if browser sends cookies
app.get('/check-cookies', (req, res) => {
  console.log('[Check Cookies] === COOKIE DEBUG START ===');
  console.log('[Check Cookies] URL:', req.url);
  console.log('[Check Cookies] Method:', req.method);
  // console.log('[Check Cookies] All headers:', JSON.stringify(req.headers, null, 2));
  console.log('[Check Cookies] Parsed cookies:', req.cookies);
  console.log('[Check Cookies] Raw cookie header:', req.headers.cookie);
  console.log('[Check Cookies] Origin:', req.headers.origin);
  console.log('[Check Cookies] Referer:', req.headers.referer);
  console.log('[Check Cookies] === COOKIE DEBUG END ===');

  res.json({
    success: true,
    message: 'Cookie check completed',
    receivedCookies: req.cookies,
    rawCookieHeader: req.headers.cookie,
    origin: req.headers.origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent']
  });
});

app.use('/api', apiRoutes);
app.use('/linkedin', linkedinAuthRoutes);
app.use('/Individual', individualLoginRoutes);
app.use('/', SubscriptionRouter);
app.use('/', CustomerSubscriptionRouter);
app.use('/Organization', organizationRoutes);
app.use('/', Cardrouter);
app.use('/emails', EmailRouter);
app.use('/users', usersRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Master Data Routes
const { Skills } = require("./models/MasterSchemas/skills.js");
const { LocationMaster } = require("./models/MasterSchemas/LocationMaster.js");
const { Industry } = require("./models/MasterSchemas/industries.js");
const { RoleMaster } = require("./models/MasterSchemas/RoleMaster.js");
const { TechnologyMaster } = require("./models/MasterSchemas/TechnologyMaster.js");
const { HigherQualification } = require("./models/higherqualification.js");
const { University_CollegeName } = require("./models/college.js");
const { Company } = require("./models/company.js");

// Master Data Endpoints
app.get("/skills", async (req, res) => {
  try {
    const skills = await Skills.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const LocationNames = await LocationMaster.find({}, "LocationName");
    res.json(LocationNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/industries", async (req, res) => {
  try {
    const IndustryNames = await Industry.find({}, "IndustryName");
    res.json(IndustryNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/roles", async (req, res) => {
  try {
    const roles = await RoleMaster.find({}, "RoleName");
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/technology", async (req, res) => {
  try {
    const technology = await TechnologyMaster.find({}, "TechnologyMasterName");
    res.json(technology);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/qualification", async (req, res) => {
  try {
    const higherqualifications = await HigherQualification.find(
      {},
      "QualificationName"
    );
    res.json(higherqualifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/universitycollege", async (req, res) => {
  try {
    const universityCollegeNames = await University_CollegeName.find(
      {},
      "University_CollegeName"
    );
    res.json(universityCollegeNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/company", async (req, res) => {
  try {
    const CompanyNames = await Company.find({});
    res.json(CompanyNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });


// this is common code for datautils
const { Candidate } = require("./models/candidate.js");
const { Position } = require("./models/position.js");
const TeamMember = require("./models/TeamMembers.js");
const Assessment = require("./models/assessment.js");
const { Interview } = require("./models/Interview.js");
const { MockInterview } = require("./models/mockinterview.js");
const { Users } = require("./models/Users.js");
const Role = require("./models/RolesData.js");
const Profile = require("./models/Profile.js");
const { TenantQuestions } = require("./models/tenantQuestions.js");
const SharingRule = require("./models/SharingRules.js");

// app.post("/api/sharing-rules", async (req, res) => {
//   const {
//     label,
//     name,
//     objectName,
//     ruleType,
//     recordsOwnedBy,
//     recordsOwnedById,
//     shareWith,
//     shareWithId,
//     access,
//     description,
//     orgId,
//   } = req.body;

//   const newSharingRule = new SharingRule({
//     label,
//     name,
//     objectName,
//     ruleType,
//     recordsOwnedBy,
//     recordsOwnedById,
//     shareWith,
//     shareWithId,
//     access,
//     description,
//     orgId,
//   });

//   try {
//     const savedRule = await newSharingRule.save();
//     res.status(201).json(savedRule);
//   } catch (error) {
//     console.error("Error saving sharing rule:", error); // Log the error
//     res
//       .status(500)
//       .json({ message: "Error saving sharing rule", error: error.message });
//   }
// });

// app.get("/api/from/sharing-rules", async (req, res) => {
//   const { orgId } = req.query; // Get the organization ID from query parameters

//   try {
//     // Query the database for sharing rules with the specified organization ID
//     const sharingRules = await SharingRule.find({ orgId });

//     // Return the sharing rules as a JSON response
//     res.status(200).json(sharingRules);
//   } catch (error) {
//     console.error("Error fetching sharing rules:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// });
// // this sharing rule fetch used in datautils function
// app.get("/api/sharing-rules", async (req, res) => {
//   const { orgId, objectName, shareWithId } = req.query;

//   // Ensure shareWithId is an array
//   const shareWithIdArray = Array.isArray(shareWithId)
//     ? shareWithId
//     : [shareWithId];

//   try {
//     // Validate required parameters
//     if (!objectName || !shareWithIdArray.length) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters" });
//     }

//     // Query the database for sharing rules
//     const sharingRules = await SharingRule.find({
//       orgId,
//       objectName,
//       shareWithId: { $in: shareWithIdArray },
//     });

//     res.status(200).json(sharingRules);
//   } catch (error) {
//     console.error("Error fetching sharing rules:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// });

// // this is common code for datautils
// const modelMapping = {
//   candidate: Candidate,
//   position: Position,
//   team: TeamMember,
//   assessment: Assessment,
//   interview: Interview,
//   mockinterview: MockInterview,
//   users: Users,
//   rolesdata: Role,
//   profiles: Profile,
//   tenentquestions: TenantQuestions,
// };

// const { InterviewRounds } = require("./models/InterviewRounds.js");
// const TenantQuestionsListNames = require("./models/tenantQuestionsListNames.js");

// app.get("/api/:model", async (req, res) => {
//   const { model } = req.params;
//   const { tenantId, ownerId } = req.query;

//   // Get the correct model based on the endpoint
//   const DataModel = modelMapping[model.toLowerCase()];

//   if (!DataModel) {
//     return res.status(400).json({ message: "Invalid model" });
//   }

//   if (!ownerId) {
//     return res.status(200).json([]);
//   }

//   try {
//     let query = DataModel.find(tenantId ? { tenantId } : { ownerId });

//     // Handle specific models with additional population
//     switch (model.toLowerCase()) {
//       // case 'mockinterview':
//       //   query = query
//       //     .populate({
//       //       path: 'rounds.interviewers',
//       //       model: 'Interviewavailability',
//       //     });
//       //   break;

//       case "mockinterview":
//         query = query.populate({
//           path: "rounds.interviewers",
//           model: "Interviewavailability",
//           populate: {
//             path: "contact",
//             model: "Contacts",
//             // select: 'firstName lastName email',
//           },
//         });
//         break;

//       case "tenentquestions":
//         // First fetch all list names for this tenant/owner
//         const lists = await TenantQuestionsListNames.find(
//           tenantId ? { tenantId } : { ownerId }
//         );

//         // Then fetch questions that match these list IDs
//         const questions = await TenantQuestions.find({
//           [tenantId ? "tenantId" : "ownerId"]: tenantId || ownerId,
//           tenantListId: { $in: lists.map((list) => list._id) },
//         })
//           .populate({
//             path: "suggestedQuestionId",
//             model: "suggestedQuestions",
//           })
//           .populate({
//             path: "tenantListId",
//             model: "TenantQuestionsListNames",
//             select: "label name ownerId tenantId",
//           })
//           .exec();

//         // Create structure with all lists (including empty ones)
//         const groupedQuestions = {};

//         // Initialize all lists first
//         lists.forEach((list) => {
//           groupedQuestions[list.label] = [];
//         });

//         // Add questions to their respective lists
//         questions.forEach((question) => {
//           const questionData = question.isCustom
//             ? question
//             : question.suggestedQuestionId;

//           question.tenantListId.forEach((list) => {
//             if (groupedQuestions[list.label]) {
//               groupedQuestions[list.label].push({
//                 ...questionData._doc,
//                 label: list.label,
//                 listId: list._id,
//               });
//             }
//           });
//         });

//         return res.status(200).json(groupedQuestions);

//       case "position":
//         // console.log("query",query);
//         query = query.populate({
//           path: "rounds.interviewers",
//           model: "Contacts",
//           select: "firstName lastName email",
//         });

//         break;

//       case "interview":
//         query = query
//           .populate({
//             path: "candidateId",
//             model: "Candidate",
//           })
//           .populate({
//             path: "positionId",
//             model: "Position",
//           })
//           .populate({
//             path: "templateId",
//             model: "InterviewTemplate",
//           });

//         const interviews = await query.exec();
//         const interviewIds = interviews.map((interview) => interview._id);

//         // Fetch rounds separately
//         const roundsData = await InterviewRounds.find({
//           interviewId: { $in: interviewIds },
//         }).populate({
//           path: "interviewers",
//           model: "Contacts",
//           select: "firstName lastName email",
//         });
//         // .populate({
//         //   path: "assessmentId",
//         //   model: "assessment",
//         //   select: "Sections",
//         //   populate: {
//         //     path: "Sections.Questions",
//         //     model: "assessmentQuestions",
//         //     select: "snapshot",
//         //   },
//         // });

//         // Fetch interview questions separately using interviewId and roundId
//         const interviewQuestionData = await interviewQuestions
//           .find({
//             interviewId: { $in: interviewIds },
//           })
//           .select("roundId snapshot");

//         // Map rounds and attach matching questions
//         // Map rounds and attach all matching questions
//         const roundsWithQuestions = roundsData.map((round) => {
//           const matchingQuestions = interviewQuestionData.filter((q) =>
//             q.roundId.equals(round._id)
//           );

//           return {
//             ...round._doc,
//             questions: matchingQuestions, // Attach all question data instead of selecting fields
//           };
//         });

//         // Merge rounds into the interviews
//         const interviewsWithRounds = interviews.map((interview) => {
//           const interviewRounds = roundsWithQuestions.filter((round) =>
//             round.interviewId.equals(interview._id)
//           );
//           return {
//             ...interview._doc,
//             rounds: interviewRounds,
//           };
//         });

//         return res.status(200).json(interviewsWithRounds);
//     }

//     const data = await query.exec();
//     if (!data || data.length === 0) {
//       return res.status(200).json([]);
//     }
//     res.status(200).json(data);
//   } catch (error) {
//     console.error(`Error fetching data for ${model}:`, error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });

app.get("/getUsersByRoleId", async (req, res) => {
  const { organizationId, roleId } = req.query;
  try {
    // Build the query object
    const query = { organizationId };
    if (roleId) {
      query.RoleId = { $in: Array.isArray(roleId) ? roleId : [roleId] };
    }
    // Fetch users based on the query
    const users = await Users.find(query);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by organization and role:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// this is realted to data utils i think
app.get("/rolesdata/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(200).json(role);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching role", error: error.message });
  }
});

//this is related to roles main page get
// app.get('/rolesdata', async (req, res) => {
//   const { organizationId } = req.query; // Use query parameters
//   console.log("333333333");
//   try {
//     const roles = await Role.find({ organizationId }).populate('reportsToRoleId');
//     if (!roles || roles.length === 0) {
//       return res.status(404).json({ message: 'No roles found for this organization' });
//     }
//     res.status(200).json(roles);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching roles', error: error.message });
//   }
// });

app.get("/api/rolesdata/:organizationId", async (req, res) => {
  const { organizationId } = req.params;
  try {
    const roles = await Role.find({ organizationId }).populate(
      "reportsToRoleId"
    );
    if (!roles || roles.length === 0) {
      return res
        .status(404)
        .json({ message: "No roles found for this organization" });
    }
    res.status(200).json(roles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching roles", error: error.message });
  }
});

// tabs
const candidateRoutes = require("./routes/candidateRoutes.js");
app.use("/candidate", candidateRoutes);

const positionRoutes = require("./routes/positionRoutes");
app.use("/position", positionRoutes);

const pushNotificationRoutes = require("./routes/pushNotificationRoutes");
app.use("/", pushNotificationRoutes);

const suggestedQuestionRouter = require("./routes/suggestedQuestionRoute.js");
const interviewQuestions = require("./models/interviewQuestions.js");
app.use("/suggested-questions", suggestedQuestionRouter);

const interviewQuestionsRoute = require("./routes/interviewQuestionsRoutes.js");
app.use("/interview-questions", interviewQuestionsRoute);

const TenentQuestionsListNamesRoute = require("./routes/TenentQuestionsListNamesRoute.js");
app.use("/tenant-list", TenentQuestionsListNamesRoute);

const interviewTemplateRoutes = require("./routes/interviewTemplateRoutes");
app.use("/interviewTemplates", interviewTemplateRoutes);

// Import and use auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// in contextfetch for fetchUserProfile
app.get("/auth/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.delete("/users/:id/image", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await Users.findById(id);
//     if (!user) {
//       return res.status(404).send("User not found.");
//     }

//     const imagePath = user.ImageData?.path;
//     user.ImageData = undefined;
//     await user.save();

//     if (imagePath) {
//       fs.unlink(imagePath, (err) => {
//         if (err) {
//           console.error("Error deleting image file:", err);
//         }
//       });
//     }

//     res.status(200).send("Image deleted successfully.");
//   } catch (error) {
//     console.error("Error deleting image:", error);
//     res.status(500).send("Server error");
//   }
// });

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const {
    Name,
    Firstname,
    CountryCode,
    UserId,
    Email,
    Phone,
    LinkedinUrl,
    Gender,
    isFreelancer,
    ImageData,
    ModifiedBy,
  } = req.body;

  try {
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      {
        Name,
        Firstname,
        CountryCode,
        UserId,
        Email,
        Phone,
        LinkedinUrl,
        Gender,
        isFreelancer,
        ImageData,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// mock interview
const mockInterviewRoutes = require("./routes/mockinterviewRoutes.js");
app.use("/", mockInterviewRoutes);

const groupsRoutes = require("./routes/interviewerGroupRoutes");
app.use("/groups", groupsRoutes);

app.get("/org-users", async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    const users = await Users.find({ tenantId });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

// const usersRoutes = require("./routes/usersRoutes.js");
// app.use("/users", usersRoutes);

// Email TemplateRouter
const EmailTemplateRouter = require("./routes/EmailTemplateRoutes.js");
app.use("/emailTemplate", EmailTemplateRouter);

const rolesRoutes = require("./routes/rolesRoutes");
const rolesPermissionRoutes = require("./routes/rolesPermissionRoutes");

app.use("/permissions", rolesPermissionRoutes);
app.use("/", rolesRoutes);

// <------------------------Assessment Templates
const candidateAssessmentRouter = require("./routes/candidateAssessmentRoutes.js");
app.use("/candidate-assessment", candidateAssessmentRouter);

const AssessmentRouter = require("./routes/assessmentRoute.js");
app.use("/assessments", AssessmentRouter);

const assessmentQuestionsRoutes = require("./routes/assessmentQuestionsRoutes.js");
app.use("/assessment-questions", assessmentQuestionsRoutes);

const scheduledAssessmentRouter = require("./routes/scheduledAssessmentRoute.js");
app.use("/schedule-assessment", scheduledAssessmentRouter);

// const { Contacts } = require("./models/Contacts.js");
// app.get('/contacts', async (req, res) => {
//   try {
//     const contacts = await Contacts.find().populate('availability');
//     res.status(200).json(contacts);
//   } catch (error) {
//     console.error('Error fetching contacts:', error);
//     res.status(500).json({ message: 'Error fetching contacts', error: error.message });
//   }
// });

const contactRoutes = require("./routes/contactRoutes");
app.use("/", contactRoutes);

// ----------------------------------------------------->

// support desk
const supportUserRoutes = require("./routes/supportUserRoutes");
app.use("/", supportUserRoutes);

// question bank
const MyQuestionListRoutes = require("./routes/tenantQuestionsRoute.js");
app.use("/", MyQuestionListRoutes);

const razorpayRoutes = require("./routes/RazorpayRoutes.js");
app.use("/", razorpayRoutes);

// Card details routes for payment and subscription management
const CardDetailsRouter = require("./routes/Carddetailsroutes.js");
app.use("/", CardDetailsRouter);

// Note: Subscription cancellation routes are now part of RazorpayRoutes.js

// this codes need to change in to routers and controllers,this will use in login pages and user creation page
app.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await Users.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking email", error: error.message });
  }
});

// const Emailrouter = require('./routes/emailCommonRoutes.js')
// emailCommonRoutes.js
// app.use('/', Emailrouter)

app.get('/check-profileId', async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }
    const user = await Users.findOne({ profileId });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: "Error checking username", error: error.message });
  }
});

// app.get('/check-profileId', async (req, res) => {
//   const { profileId } = req.query;

//   try {
//     const user = await Users.findOne({ profileId });
//     res.json({ exists: !!user });
//   } catch (error) {
//     res.status(500).json({ error: 'Error checking profileId' });
//   }
// });

const historyFeedsRoutes = require("./routes/feedsRoutes");
const WalletRouter = require("./routes/WalletRoutes.js");
app.use("/api/feeds", historyFeedsRoutes);
app.use("/wallet", WalletRouter);

// task
const taskRoutes = require("./routes/taskRoutes");
app.use("/tasks", taskRoutes);

//i am using this code for outsource interviewers we need to change his into contact controller
// app.get('/api/contacts/outsource', async (req, res) => {
//   try {
//     const contacts = await Contacts.find({ interviewerType: "Outsource" })
//       .populate({
//         path: 'availability',
//         model: 'Interviewavailability'
//       });

//     res.json(contacts);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching contacts', error });
//   }
// });

const outsourceInterviewRequestRoutes = require("./routes/InterviewRequestRoute.js");
app.use("/interviewrequest", outsourceInterviewRequestRoutes);

const outsourceInterviewerRoutes = require("./routes/outsourceInterviewerRoutes");
app.use("/outsourceInterviewers", outsourceInterviewerRoutes);

const InterviewRoutes = require("./routes/interviewRoutes.js");
app.use("/interview", InterviewRoutes);

const candidatePositionRoutes = require("./routes/candidatePositionRoutes.js");
app.use("/candidateposition", candidatePositionRoutes);

// Subscription update routes
const subscriptionUpdateRoutes = require("./routes/subscriptionUpdateRoutes.js");
app.use("/subscription-update", subscriptionUpdateRoutes);

const interviewRoundsRoutes = require("./routes/interviewRoundsRoutes.js");
app.use("/interviewRounds", interviewRoundsRoutes);

// internal logs
const internalLogRoutes = require("./routes/internalLogRoutes");
app.use("/internal-logs", internalLogRoutes);

// integration logs
const integrationLogRoutes = require("./routes/integrationLogRoutes");
app.use("/integration-logs", integrationLogRoutes);

// Invoice
const InvoiceRoutes = require("./routes/InvoiceRoutes.js");
app.use("/invoices", InvoiceRoutes);

const SharingRulesObject = require("./models/SharingRulesObject.js");
//sharing rule object name ftech
app.get("/sharing-rules-objects", async (req, res) => {
  try {
    const sharingRulesObjects = await SharingRulesObject.find();
    res.status(200).json(sharingRulesObjects);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching sharing rules objects",
        error: error.message,
      });
  }
});

//notifications
const notificationRoutes = require("./routes/notificationRoutes.js");
app.use("/notifications", notificationRoutes);

// upload route
const uploadRoute = require("./routes/UploadRoute/uploadRoute.js");
app.use("/upload", uploadRoute);

// Tenant routes
const tenantRoutes = require("./routes/tenantRoutes");
app.use("/tenants", tenantRoutes);



// <==================================================================================
const InvoiceRouter = require("./routes/InvoiceRoutes.js");
const PaymentsRoute = require("./routes/paymentsRoutes.js"); // SUPER ADMIN added by Ashok
const ReceiptsRoute = require("./routes/receiptsRoute.js"); // SUPER ADMIN added by Ashok


// SUPER ADMIN added by Ashok
// invoices
app.use("/invoices", InvoiceRouter);

// SUPER ADMIN added by Ashok
// payments
app.use("/payments", PaymentsRoute);

// SUPER ADMIN added by Ashok
// receipts
app.use("/receipts", ReceiptsRoute);



// integration logs Added by Ashok
// const integrationLogRoutes = require("./routes/integrationLogRoutes");
// app.use("/api/integration-logs", integrationLogRoutes); // original one
// app.use("/integration-logs", integrationLogRoutes); // added by Ashok

// ==================================================================================>




// <================ getting the availability by contact id to show in the account settings user profile ==============>
const interviewAvailabilityRoutes = require("./routes/interviewAvailabilityRoutes");
app.use("/interview-availability", interviewAvailabilityRoutes);
