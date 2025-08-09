// v1.0.0  -  Ashraf  -  removed consoles
// v1.0.1  -  Ashraf  -  fixed feeds api issues.removed /api
// v1.0.2  -  Ashraf  -  fixed name assessment to assessment template
// this is new
// v1.0.3  -  Ashraf  -  added health check endpoints for monitoring
// v1.0.4  -  Ashok   -  added analytics
require('dotenv').config();

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

// console.log('config.REACT_APP_CLIENT_ID', config.REACT_APP_CLIENT_ID);
// console.log('config.REACT_APP_CLIENT_SECRET', config.REACT_APP_CLIENT_SECRET);
// console.log('config.REACT_APP_REDIRECT_URI', config.REACT_APP_REDIRECT_URI);
// console.log('config.REACT_APP_API_URL_FRONTEND', config.REACT_APP_API_URL_FRONTEND);

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
// <---------------------- v1.0.3


// Enhanced MongoDB connection with Azure-specific configurations
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // 60 seconds - increased for Azure
  socketTimeoutMS: 90000, // 90 seconds - increased for Azure
  connectTimeoutMS: 60000, // 60 seconds - increased for Azure
  maxPoolSize: 20, // Increased pool size for Azure
  minPoolSize: 5, // Increased minimum pool size
  maxIdleTimeMS: 60000, // 60 seconds
  retryWrites: false, // Disabled for compatibility with older MongoDB versions
  w: 1, // Changed from 'majority' to 1 for better compatibility
  // Azure-specific optimizations
  bufferCommands: false, // Disable mongoose buffering
  // Connection retry settings
  retryReads: true,
  // Heartbeat settings
  heartbeatFrequencyMS: 10000,
  // Write concern settings
  writeConcern: {
    w: 1, // Changed from 'majority' to 1
    j: false, // Changed to false for better compatibility
    wtimeout: 30000
  }
};

// MongoDB connection with retry mechanism
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // console.log(`🔄 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
      await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
      console.log('✅ MongoDB connected successfully');
      // console.log('MongoDB URI:', process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT CONFIGURED');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) {
        console.error('❌ All MongoDB connection attempts failed');
        console.error('MongoDB URI status:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
        process.exit(1);
      }
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initialize MongoDB connection
connectWithRetry();

// Handle MongoDB connection events with enhanced logging
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  // console.log('Connection state:', mongoose.connection.readyState);
  
  // Start the schedule assessment cron job after database connection is established
  try {
    const { startScheduleAssessmentCronJob, runInitialScheduleAssessmentCheck } = require('./controllers/candidateAssessmentController');
    startScheduleAssessmentCronJob();
    runInitialScheduleAssessmentCheck();
  } catch (error) {
    console.error('Error starting schedule assessment cron job:', error);
  }

  // Start the task reminder cron job after database connection is established
  try {
    const { startTaskReminderCronJob, runInitialTaskReminderCheck } = require('./controllers/PushNotificationControllers/pushNotificationTaskController');
    startTaskReminderCronJob();
    runInitialTaskReminderCheck();
  } catch (error) {
    console.error('Error starting task reminder cron job:', error);
  }
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB connecting...');
});

// Add connection monitoring
setInterval(() => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  // console.log(`📊 MongoDB connection state: ${states[state]} (${state})`);
}, 30000); // Log every 30 seconds

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

// Enhanced health check endpoints for monitoring

// Main health check endpoint
app.get('/health', (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  const healthCheck = {
    status: isHealthy ? 'OK' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      name: mongoose.connection.name || 'unknown'
    },
    memory: {
      ...process.memoryUsage(),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    },
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT CONFIGURED',
      NODE_ENV: process.env.NODE_ENV || 'development',
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'NOT SET'
    }
  };

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// Simple health check for load balancers
app.get('/health/simple', (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'UNHEALTHY',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check with database test
app.get('/health/detailed', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let dbTest = { status: 'not_connected', error: null };

    if (isConnected) {
      try {
        // Test database connection with a simple ping
        await mongoose.connection.db.admin().ping();
        dbTest = { status: 'connected', ping: 'success' };
      } catch (pingError) {
        dbTest = { status: 'connected_but_ping_failed', error: pingError.message };
      }
    }

    const detailedHealth = {
      status: isConnected && dbTest.status === 'connected' ? 'OK' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: {
        connection: {
          status: isConnected ? 'connected' : 'disconnected',
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host || 'unknown',
          port: mongoose.connection.port || 'unknown',
          name: mongoose.connection.name || 'unknown'
        },
        test: dbTest
      },
      memory: {
        ...process.memoryUsage(),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        cpuUsage: process.cpuUsage()
      }
    };

    const isHealthy = isConnected && dbTest.status === 'connected';
    res.status(isHealthy ? 200 : 503).json(detailedHealth);

  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      mongodb: {
        connection: {
          status: 'error',
          readyState: mongoose.connection.readyState
        }
      }
    });
  }
});

// Readiness probe for Kubernetes/Azure
app.get('/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState
    }
  });
});

// Liveness probe for Kubernetes/Azure
app.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database connection check middleware
const dbConnectionMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Database not connected. ReadyState:', mongoose.connection.readyState);
    return res.status(503).json({
      error: 'Database connection unavailable',
      message: 'Service temporarily unavailable. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};
// ------------------------------v1.0.3 >
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
    // Remove /users/permissions from excluded routes - it needs permission middleware
  ];

  const isAuthRoute = authRoutes.some(route => req.path.includes(route));

  if (isAuthRoute) {
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
// Add import for agoraRoomRoute
const agoraRoomRoute = require('./routes/agoraRoomRoute.js');
const feedbackRoute = require('./routes/feedbackRoute.js');

app.use('/api/agora', agoraRoomRoute);
// ------------------------------v1.0.3 >
// Apply database connection middleware to all API routes except health check
app.use('/api', dbConnectionMiddleware, apiRoutes);
app.use('/linkedin', dbConnectionMiddleware, linkedinAuthRoutes);
app.use('/Individual', dbConnectionMiddleware, individualLoginRoutes);
// ------------------------------v1.0.3 >
app.use('/', SubscriptionRouter);
app.use('/', CustomerSubscriptionRouter);
app.use('/Organization', organizationRoutes);
app.use('/', Cardrouter);
app.use('/emails', EmailRouter);
app.use('/users', usersRoutes);
app.use('/feedback', feedbackRoute);

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




// this is common code for datautils
const { Candidate } = require("./models/candidate.js");
const { Position } = require("./models/position.js");
const TeamMember = require("./models/TeamMembers.js");
// <-------------------------------v1.0.2
const Assessment = require("./models/assessmentTemplates");
// ------------------------------v1.0.2 >
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
// <-------------------------------v1.0.1
app.use("/feeds", historyFeedsRoutes);
// ------------------------------v1.0.1 >
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

const feedbackRoutes = require('./routes/feedbackRoute')

app.use('/feedback', feedbackRoutes)

// <================ getting the availability by contact id to show in the account settings user profile ==============>
const interviewAvailabilityRoutes = require("./routes/interviewAvailabilityRoutes");
app.use("/interview-availability", interviewAvailabilityRoutes);

// Google Meet routes
const googlemeetRoutes = require("./routes/googlemeetRoutes");
app.use("/googlemeet", googlemeetRoutes);

// v1.0.0 ---------------------->

//  v1.0.4 <------------------------------------------------------------------------------
const filterRoutes = require('./routes/AnalyticsRoutes/filterRoutes.js');
const columnRoutes = require('./routes/AnalyticsRoutes/columnRoutes');
const reportRoutes = require('./routes/AnalyticsRoutes/reportRoutes');
const {
  interviews,
  interviewers,
  assessments,
  candidates,
  organizations,
  reportTemplates,
  getKPIData,
  getChartData,
  getTopSkills,
  getTopExternalInterviewers
} = require('./data/mockData.js');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Interview SaaS Backend is running' });
});
// Dashboard endpoints
// Filter routes
app.use('/api/filters', filterRoutes);

// Column management routes
app.use('/api/columns', columnRoutes);

// Report management routes
app.use('/api/reports', reportRoutes);

app.get('/api/kpis', (req, res) => {
  try {
    const kpis = getKPIData();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KPI data' });
  }
});

app.get('/api/charts', (req, res) => {
  try {
    const data = getChartData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Data endpoints
app.get('/api/interviews', (req, res) => {
  try {
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews data' });
  }
});

app.get('/api/interviews/:id', (req, res) => {
  try {
    const interview = interviews.find(i => i.id === req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview data' });
  }
});

app.get('/api/interviewers', (req, res) => {
  try {
    res.json(interviewers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviewers data' });
  }
});

app.get('/api/interviewers/:id', (req, res) => {
  try {
    const interviewer = interviewers.find(i => i.id === req.params.id);
    if (!interviewer) {
      return res.status(404).json({ error: 'Interviewer not found' });
    }
    res.json(interviewer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviewer data' });
  }
});

app.get('/api/assessments', (req, res) => {
  try {
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assessments data' });
  }
});

app.get('/api/candidates', (req, res) => {
  try {
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates data' });
  }
});

app.get('/api/organizations', (req, res) => {
  try {
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations data' });
  }
});

app.get('/api/report-templates', (req, res) => {
  try {
    res.json(reportTemplates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report templates data' });
  }
});

// Trends endpoints
app.get('/api/trends/skills', (req, res) => {
  try {
    const data = getTopSkills();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top skills data' });
  }
});

app.get('/api/trends/external-interviewers', (req, res) => {
  try {
    const data = getTopExternalInterviewers();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top external interviewers data' });
  }
});

// Export endpoints (placeholders)
app.post('/api/export/csv', (req, res) => {
  try {
    // Placeholder for CSV export functionality
    res.json({ message: 'CSV export functionality would be implemented here', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

app.post('/api/export/pdf', (req, res) => {
  try {
    // Placeholder for PDF export functionality
    res.json({ message: 'PDF export functionality would be implemented here', data: req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

//  v1.0.4 ------------------------------------------------------------------------------>
