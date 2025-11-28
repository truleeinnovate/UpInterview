// v1.0.0  -  Ashraf  -  removed consoles
// v1.0.1  -  Ashraf  -  fixed feeds api issues.removed /api
// v1.0.2  -  Ashraf  -  fixed name assessment to assessment template
// v1.0.3  -  Ashraf  -  added health check endpoints for monitoring
// v1.0.4  -  Ashok   -  added analytics
// v1.0.5  -  Ashok   -  Added Rate Cards
// v1.0.6  -  Ashok   -  Added Master Routes
// v1.0.7  -  Ashok   -  Technology master controller as send all the fields in response
// v1.0.8  -  Ashok   -  Added Question bank manager routes
// v1.0.9  -  Ashok   -  Modified master data controllers

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const qs = require("qs");
const axios = require("axios");

// ✅ Trust Azure's proxy to detect HTTPS correctly
app.set("trust proxy", 1);

// ✅ Parse cookies
app.use(cookieParser());

const config = require("./config.js");

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  /^https:\/\/[a-z0-9-]+\.dev\.upinterview\.io$/,
  "https://dev.upinterview.io",
  "https://app.upinterview.io",
  "https://upinterview-dpdgchhbafekdhca.canadacentral-01.azurewebsites.net",
  "https://upinterview.io",
  "file://", // Allow file:// protocol for local HTML testing
  "null", // Allow null origin for local HTML testing
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.some((o) =>
    typeof o === "string" ? o === origin : o.test(origin)
  );

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Cookie, Accept, x-permissions, x-tenant-id"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "x-user-id, x-tenant-id, x-impersonation-userid, x-permissions, x-new-token"
    );
  }

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Cookie, Accept, x-permissions, x-tenant-id, X-API-Key"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "x-user-id, x-tenant-id, x-impersonation-userid, x-permissions, x-new-token"
    );
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Add OPTIONS handlers for main routes
const handleOptions = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Cookie, Accept, x-*"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
};

// Add specific OPTIONS handlers for your routes
app.options("/Organization/Login", handleOptions);
app.options("/users", handleOptions);
app.options("/contacts", handleOptions);
app.options("/outsourceInterviewers", handleOptions);
app.options("/interviewRounds", handleOptions);
app.options("/get-tickets", handleOptions);

// API Routes
const linkedinAuthRoutes = require("./routes/linkedinAuthRoute.js");
const individualLoginRoutes = require("./routes/individualLoginRoutes.js");
const SubscriptionRouter = require("./routes/SubscriptionRoutes.js");
const CustomerSubscriptionRouter = require("./routes/CustomerSubscriptionRoutes.js");
const organizationRoutes = require("./routes/organizationLoginRoutes.js");
const Cardrouter = require("./routes/Carddetailsroutes.js");
const EmailRouter = require("./routes/EmailsRoutes/emailsRoute.js");
const usersRoutes = require("./routes/usersRoutes.js");

// Add import for agoraRoomRoute
const agoraRoomRoute = require("./routes/agoraRoomRoute.js");
const feedbackRoute = require("./routes/feedbackRoute.js");
const usageRoutes = require("./routes/usageRoutes.js");
const organizationRequestRoutes = require("./routes/organizationRequestRoutes.js");
const bandwidthRoutes = require("./routes/bandwidthRoutes.js");

// Standard middleware with increased payload limit for bulk operations
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Enhanced MongoDB connection with Azure-specific configurations
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000, // 60 seconds - increased for Azure
  socketTimeoutMS: 90000, // 90 seconds - increased for Azure
  connectTimeoutMS: 60000, // 60 seconds - increased for Azure
  maxPoolSize: 20, // Increased pool size for Azure
  minPoolSize: 5, // Increased minimum pool size
  maxIdleTimeMS: 60000, // 60 seconds
  retryWrites: false, // Disabled for compatibility with older MongoDB versions
  w: 1, // Changed from 'majority' to 1 for better compatibility
  bufferCommands: false, // Disable mongoose buffering
  retryReads: true, // Connection retry settings
  heartbeatFrequencyMS: 10000, // Heartbeat settings
  writeConcern: {
    w: 1,
    j: false,
    wtimeout: 30000,
  },
};

// MongoDB connection with retry mechanism
const connectWithRetry = (retries = 5, delay = 5000) => {
  return new Promise((resolve, reject) => {
    const attemptConnect = async (attempt = 0) => {
      try {
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log("✅ MongoDB connected successfully");
        resolve(mongoose.connection);
      } catch (err) {
        console.error(
          `❌ MongoDB connection attempt ${attempt + 1} failed:`,
          err.message
        );

        if (attempt >= retries - 1) {
          console.error("❌ All MongoDB connection attempts failed");
          console.error(
            "MongoDB URI status:",
            process.env.MONGODB_URI ? "SET" : "NOT SET"
          );
          reject(
            new Error("Failed to connect to MongoDB after multiple attempts")
          );
          return;
        }

        // Wait for the specified delay before retrying
        setTimeout(() => attemptConnect(attempt + 1), delay);
      }
    };

    attemptConnect();
  });
};

// Initialize MongoDB connection
const dbConnection = connectWithRetry();

// Initialize interview status service
const {
  setupInterviewStatusCronJob,
} = require("./services/interviewStatusService");

// Set up the cron job when database is connected
dbConnection
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      setupInterviewStatusCronJob();
    }
  })
  .catch((err) => {
    console.error("Failed to set up interview status cron job:", err);
  });

// Export the MongoDB connection promise for other modules to use
app.locals.dbConnection = dbConnection;

// Handle MongoDB connection events with enhanced logging
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected - attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected successfully");
});

// Add connection monitoring
setInterval(() => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
}, 30000); // Log every 30 seconds

// Middleware to capture raw body for webhook endpoints
const rawBodyParser = require("body-parser").raw({ type: "*/*" });
// Raw body parser for webhook endpoints
app.use((req, res, next) => {
  if (
    req.originalUrl === "/payment-webhook" ||
    req.path === "/payment-webhook" ||
    req.originalUrl === "/payment/webhook" ||
    req.path === "/payment/webhook"
  ) {
    rawBodyParser(req, res, (err) => {
      if (err) return next(err);
      req.rawBody = req.body.toString();
      next();
    });
  } else {
    next();
  }
});

// Enhanced health check endpoints for monitoring

// Main health check endpoint
app.get("/health", (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  const healthCheck = {
    status: isHealthy ? "OK" : "UNHEALTHY",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    mongodb: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || "unknown",
      port: mongoose.connection.port || "unknown",
      name: mongoose.connection.name || "unknown",
    },
    memory: {
      ...process.memoryUsage(),
      heapUsed:
        Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      heapTotal:
        Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      external:
        Math.round(process.memoryUsage().external / 1024 / 1024) + " MB",
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
    },
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? "CONFIGURED" : "NOT CONFIGURED",
      NODE_ENV: process.env.NODE_ENV || "development",
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "NOT SET",
    },
  };

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// Simple health check for load balancers
app.get("/health/simple", (req, res) => {
  const isHealthy = mongoose.connection.readyState === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "UNHEALTHY",
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check with database test
app.get("/health/detailed", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let dbTest = { status: "not_connected", error: null };

    if (isConnected) {
      try {
        // Test database connection with a simple ping
        await mongoose.connection.db.admin().ping();
        dbTest = { status: "connected", ping: "success" };
      } catch (pingError) {
        dbTest = {
          status: "connected_but_ping_failed",
          error: pingError.message,
        };
      }
    }

    const detailedHealth = {
      status: isConnected && dbTest.status === "connected" ? "OK" : "UNHEALTHY",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      mongodb: {
        connection: {
          status: isConnected ? "connected" : "disconnected",
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host || "unknown",
          port: mongoose.connection.port || "unknown",
          name: mongoose.connection.name || "unknown",
        },
        test: dbTest,
      },
      memory: {
        ...process.memoryUsage(),
        heapUsed:
          Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        heapTotal:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
        external:
          Math.round(process.memoryUsage().external / 1024 / 1024) + " MB",
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
      },
    };

    const isHealthy = isConnected && dbTest.status === "connected";
    res.status(isHealthy ? 200 : 503).json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
      mongodb: {
        connection: {
          status: "error",
          readyState: mongoose.connection.readyState,
        },
      },
    });
  }
});

// Readiness probe for Kubernetes/Azure
app.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString(),
    mongodb: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState,
    },
  });
});

// Liveness probe for Kubernetes/Azure
app.get("/live", (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Database connection check middleware
const dbConnectionMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error(
      "❌ Database not connected. ReadyState:",
      mongoose.connection.readyState
    );
    return res.status(503).json({
      error: "Database connection unavailable",
      message: "Service temporarily unavailable. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  }
  next();
};
// ------------------------------v1.0.3 >
// Apply permission middleware to all routes except authentication routes
const { authContextMiddleware } = require("./middleware/authContext.js");
// const { permissionMiddleware } = require("./middleware/permissionMiddleware");

// // Create a middleware that skips permission check for auth routes
// const conditionalPermissionMiddleware = (req, res, next) => {
//     // Skip permission middleware for authentication routes
//     const authRoutes = [
//         "/Organization/Login",
//         "/Organization/Signup",
//         "/Organization/reset-password",
//         "/Organization/verify-email",
//         "/Organization/verify-user-email",
//         "/Individual/Login",
//         "/Individual/Signup",
//         "/linkedin/auth",
//         "/linkedin/callback",
//         // Remove /users/permissions from excluded routes - it needs permission middleware
//     ];

//     const isAuthRoute = authRoutes.some((route) => req.path.includes(route));

//     if (isAuthRoute) {
//         return next();
//     }

//     // Apply permission middleware for non-auth routes
//     return permissionMiddleware(req, res, next);
// };

app.use(authContextMiddleware);
// app.use(conditionalPermissionMiddleware);

app.use("/api/agora", agoraRoomRoute);
// ------------------------------v1.0.3 >
// Apply database connection middleware to all API routes except health check
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);
app.use("/linkedin", linkedinAuthRoutes);
app.use("/Individual", individualLoginRoutes);
// ------------------------------v1.0.3 >
app.use("/", SubscriptionRouter);
app.use("/", CustomerSubscriptionRouter);
app.use("/Organization", organizationRoutes);
app.use("/", Cardrouter);
app.use("/emails", EmailRouter);
app.use("/users", usersRoutes);
app.use("/feedback", feedbackRoute);
app.use("/usage", usageRoutes);
app.use("/organization-requests", organizationRequestRoutes);
app.use("/bandwidth", bandwidthRoutes);

const port = process.env.PORT || 5000;

// Start the server only after MongoDB is connected
const startServer = async () => {
  try {
    // Wait for MongoDB connection
    await dbConnection;
    console.log("MongoDB connected successfully");

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);

      // Initialize the daily exchange rate update
      if (process.env.NODE_ENV !== "test") {
        const ExchangeRateService = require("./services/exchangeRateService");
        ExchangeRateService.scheduleDailyRateUpdate();
      }
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
const serverPromise = startServer();

// Handle server shutdown
const shutdown = async () => {
  try {
    const server = await serverPromise;
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });

    // Force close the server after 10 seconds
    setTimeout(() => {
      console.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Master Data Routes
// const { Skills } = require("./models/MasterSchemas/skills.js");
// const { LocationMaster } = require("./models/MasterSchemas/LocationMaster.js");
// const { Industry } = require("./models/MasterSchemas/industries.js");
// const { RoleMaster } = require("./models/MasterSchemas/RoleMaster.js");
// const {
//   TechnologyMaster,
// } = require("./models/MasterSchemas/TechnologyMaster.js");
// const {
//   HigherQualification,
// } = require("./models/MasterSchemas/higherqualification.js");
// const { University_CollegeName } = require("./models/MasterSchemas/college.js");
// const { Company } = require("./models/MasterSchemas/company.js");
// const {
//   CategoryQuestionsMaster,
// } = require("./models/MasterSchemas/CategoryQuestionsMaster.js");

// Master Data Endpoints
// v1.0.9 <------------------------------------------------------------------------
// app.get("/skills", async (req, res) => {
//   try {
//     const skills = await Skills.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(skills);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/locations", async (req, res) => {
//   try {
//     const LocationNames = await LocationMaster.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(LocationNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/industries", async (req, res) => {
//   try {
//     const IndustryNames = await Industry.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(IndustryNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/roles", async (req, res) => {
//   try {
//     const roles = await RoleMaster.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(roles);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // // v1.0.9 ------------------------------------------------------------------------>

// // // v1.0.7 <----------------------------------------------------------------------------------
// app.get("/technology", async (req, res) => {
//   try {
//     const technology = await TechnologyMaster.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(technology);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // // v1.0.7 ---------------------------------------------------------------------------------->

// // // v1.0.9 <-----------------------------------------------------------------------------
// app.get("/qualification", async (req, res) => {
//   try {
//     const higherqualifications = await HigherQualification.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(higherqualifications);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/universitycollege", async (req, res) => {
//   try {
//     const universityCollegeNames = await University_CollegeName.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(universityCollegeNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/company", async (req, res) => {
//   try {
//     const CompanyNames = await Company.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(CompanyNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get("/category", async (req, res) => {
//   try {
//     const CategoryNames = await CategoryQuestionsMaster.find({})
//       .populate("ownerId", "firstName lastName email -password")
//       .populate("createdBy", "firstName lastName email -password")
//       .populate("updatedBy", "firstName lastName email -password")
//       .lean();
//     res.json(CategoryNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// v1.0.9 ----------------------------------------------------------------------------->

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// this is common code for datautils
const { Candidate } = require("./models/candidate.js");
const { Position } = require("./models/Position/position.js");
const TeamMember = require("./models/TeamMembers.js");
// <-------------------------------v1.0.2
const Assessment = require("./models/Assessment/assessmentTemplates.js");
// ------------------------------v1.0.2 >
const { Interview } = require("./models/Interview/Interview.js");
// const { MockInterview } = require("./models/Mockinterview/mockinterview.js");
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

// ✅ Import video router AFTER logging middleware
const videoRouter = require("./routes/VideoCallingSettingRoutes/VideoCallingSettingRoutes.js");

// ✅ Mount the router
app.use("/video-details", videoRouter);

// tabs
const candidateRoutes = require("./routes/candidateRoutes.js");
app.use("/candidate", candidateRoutes);

const positionRoutes = require("./routes/positionRoutes");
app.use("/position", positionRoutes);

const pushNotificationRoutes = require("./routes/pushNotificationRoutes");
app.use("/", pushNotificationRoutes);

const suggestedQuestionRouter = require("./routes/suggestedQuestionRoute.js");
const interviewQuestions = require("./models/QuestionBank/interviewQuestions.js");
app.use("/suggested-questions", suggestedQuestionRouter);

const interviewQuestionsRoute = require("./routes/interviewQuestionsRoutes.js");
app.use("/interview-questions", interviewQuestionsRoute);

const TenentQuestionsListNamesRoute = require("./routes/TenentQuestionsListNamesRoute.js");
app.use("/tenant-list", TenentQuestionsListNamesRoute);

const interviewTemplateRoutes = require("./routes/interviewTemplateRoutes");
app.use("/interviewTemplates", interviewTemplateRoutes);

// Import and use auth routes
// const authRoutes = require("./routes/authRoutes");
// app.use("/api/auth", authRoutes);

// Start background cron jobs (Task due reminders)
// Ensures pushNotificationTaskController registers its cron schedule on server start
require("./controllers/PushNotificationControllers/pushNotificationTaskController");

// Start Interview notification system and cron jobs
require("./controllers/PushNotificationControllers/pushNotificationInterviewController");

// Start Assessment notification system and cron jobs
require("./controllers/PushNotificationControllers/pushNotificationAssessmentController");

// Start Subscription Renewal system and cron jobs
require("./controllers/SubscriptionRenewalController");

// Start Automatic Free Plan Renewal System
// This runs automatically every hour to renew expired free plans
// No manual intervention needed - completely automatic
const {
  startFreePlanRenewalCron,
} = require("./controllers/FreePlanRenewalController");
dbConnection
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      startFreePlanRenewalCron();
    }
  })
  .catch((err) => {
    //   console.error('[FREE PLAN RENEWAL] Failed to initialize automatic renewal system:', err);
  });

// in contextfetch for fetchUserProfile
// app.get("/auth/users/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await Users.findById(id).lean();
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const contact = await Contacts.findOne({ ownerId: id }, "_id").lean();
//         // user.contactId = contact._id;

//         // res.json(user);
//         res.json({
//             ...user, // convert mongoose doc to plain object
//             contactId: contact ? contact._id : null, // attach contactId
//         });
//     } catch (error) {
//         console.error("Error fetching user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

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

// Integration Routes
const integrationRoutes = require("./routes/integrationRoutes");
app.use("/integrations", integrationRoutes);

// API Key Routes
const apiKeyRoutes = require("./routes/apiKeyRoutes");
app.use("/apikeys", apiKeyRoutes);

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

app.get("/check-profileId", async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }
    const user = await Users.findOne({ profileId });
    res.json({ exists: !!user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking username", error: error.message });
  }
});

const MasterRoutes = require("./routes/MasterRoutes/masterRoutes.js");
app.use("/master-data", MasterRoutes);

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

// Notification test routes (only for development/testing)
if (process.env.NODE_ENV !== "production") {
  const notificationTestRoutes = require("./routes/pushNotificationTestRoutes");
  app.use("/notifications", notificationTestRoutes);
}

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

// Free plan renewal runs automatically via cron job - no manual routes needed

// Subscription renewal routes
const subscriptionRenewalRoutes = require("./routes/subscriptionRenewalRoutes.js");
app.use("/subscription-renewal", subscriptionRenewalRoutes);

// const interviewRoundsRoutes = require("./routes/interviewRoundsRoutes.js");
// app.use("/interviewRounds", interviewRoundsRoutes);

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
    res.status(500).json({
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

// const feedbackRoutes = require("./routes/feedbackRoute");
const exchangeRateRoutes = require("./routes/exchangeRateRoutes");

// Exchange rate routes
app.use("/exchange", exchangeRateRoutes);

// app.use("/feedback", feedbackRoutes);

// <================ getting the availability by contact id to show in the account settings user profile ==============>
const interviewAvailabilityRoutes = require("./routes/interviewAvailabilityRoutes");
app.use("/interview-availability", interviewAvailabilityRoutes);

// Google Meet routes
const googlemeetRoutes = require("./routes/googlemeetRoutes");
app.use("/googlemeet", googlemeetRoutes);

// v1.0.0 ---------------------->

// v1.0.5 <--------------------------------SUPER ADMIN--------------------------------
const RateCardRoutes = require("./routes/RateCardsRoutes/RateCardsRoutes.js");
app.use("/rate-cards", RateCardRoutes);
// v1.0.5 --------------------------------------------------------------------------->

// v1.0.6 <---------------------------------------------------------------------------

// v1.0.6 --------------------------------------------------------------------------->
// v1.0.7 <---------------------------------------------------------------------------
const QuestionBankManager = require("./routes/QuestionBankManagerRoutes/QuestionBankManagerRoutes.js");
app.use("/questions-manager", QuestionBankManager);
// v1.0.7 --------------------------------------------------------------------------->

//  v1.0.4 <------------------------------------------------------------------------------
const filterRoutes = require("./routes/AnalyticsRoutes/filterRoutes.js");
const columnRoutes = require("./routes/AnalyticsRoutes/columnRoutes");
const reportRoutes = require("./routes/AnalyticsRoutes/reportRoutes");
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
  getTopExternalInterviewers,
} = require("./data/mockData.js");
const { Contacts } = require("./models/Contacts.js");

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Interview SaaS Backend is running" });
});
// Dashboard endpoints
// Filter routes
app.use("/api/filters", filterRoutes);

// Column management routes
app.use("/api/columns", columnRoutes);

// Report management routes
app.use("/api/reports", reportRoutes);

app.get("/api/kpis", (req, res) => {
  try {
    const kpis = getKPIData();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch KPI data" });
  }
});

app.get("/api/charts", (req, res) => {
  try {
    const data = getChartData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

// Data endpoints
app.get("/api/interviews", (req, res) => {
  try {
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interviews data" });
  }
});

app.get("/api/interviews/:id", (req, res) => {
  try {
    const interview = interviews.find((i) => i.id === req.params.id);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interview data" });
  }
});

app.get("/api/interviewers", (req, res) => {
  try {
    res.json(interviewers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interviewers data" });
  }
});

app.get("/api/interviewers/:id", (req, res) => {
  try {
    const interviewer = interviewers.find((i) => i.id === req.params.id);
    if (!interviewer) {
      return res.status(404).json({ error: "Interviewer not found" });
    }
    res.json(interviewer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interviewer data" });
  }
});

app.get("/api/assessments", (req, res) => {
  try {
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assessments data" });
  }
});

app.get("/api/candidates", (req, res) => {
  try {
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candidates data" });
  }
});

app.get("/api/organizations", (req, res) => {
  try {
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch organizations data" });
  }
});

app.get("/api/report-templates", (req, res) => {
  try {
    res.json(reportTemplates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report templates data" });
  }
});

// Trends endpoints
app.get("/api/trends/skills", (req, res) => {
  try {
    const data = getTopSkills();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top skills data" });
  }
});

app.get("/api/trends/external-interviewers", (req, res) => {
  try {
    const data = getTopExternalInterviewers();
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch top external interviewers data" });
  }
});

// Export endpoints (placeholders)
app.post("/api/export/csv", (req, res) => {
  try {
    // Placeholder for CSV export functionality
    res.json({
      message: "CSV export functionality would be implemented here",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

app.post("/api/export/pdf", (req, res) => {
  try {
    // Placeholder for PDF export functionality
    res.json({
      message: "PDF export functionality would be implemented here",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to export PDF" });
  }
});

let cachedToken = null;
let tokenExpiresAt = 0;

// Get Zoom S2S token
async function getS2SToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) return cachedToken;

  const tokenUrl = "https://zoom.us/oauth/token";
  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const data = qs.stringify({
    grant_type: "account_credentials",
    account_id: process.env.ZOOM_ACCOUNT_ID,
  });

  const r = await axios.post(tokenUrl, data, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  cachedToken = r.data.access_token;
  tokenExpiresAt = Date.now() + r.data.expires_in * 1000;
  return cachedToken;
}

// Create meeting endpoint Zoom meet Links
app.post("/api/create-meeting", async (req, res) => {
  try {
    const { topic, start_time, duration, timezone, userId, settings } =
      req.body;
    const token = await getS2SToken();

    // Validate start_time
    if (start_time) {
      const startDate = new Date(start_time);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          error:
            "Invalid start_time format. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss",
        });
      }
      if (startDate <= new Date()) {
        return res
          .status(400)
          .json({ error: "start_time must be in the future" });
      }
    }

    const hostUser = userId || process.env.ZOOM_HOST_EMAIL;
    const type = start_time ? 2 : 1;

    const body = {
      topic: topic || "Interview Meeting",
      type,
      ...(start_time && { start_time }),
      duration: duration || 60,
      timezone: timezone || "Asia/Kolkata",
      settings: settings || {
        join_before_host: true,
        host_video: false,
        participant_video: false,
      },
    };


    const create = await axios.post(
      `https://api.zoom.us/v2/users/${encodeURIComponent(hostUser)}/meetings`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Return only what frontend needs
    return res.json({
      meetingId: create.data.id,
      password: create.data.password,
      hostId: create.data.host_id,
      hostEmail: create.data.host_email,
      start_url: create.data.start_url, // host link
      join_url: create.data.join_url, // attendee link
    });
  } catch (err) {
    console.error("Zoom API Error:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      error: err.response?.data?.message || err.message,
    });
  }
});

// upinterview contact us page routes
const upinterviewContactUsPageRoutes = require("./routes/upinterviewContactUsPageRoutes");
app.use("/upinterviewcontactuspage", upinterviewContactUsPageRoutes);

// upinterview enterprise contact routes
const upinterviewEnterpriseContactRoutes = require("./routes/upinterviewEnterpriseContactRoutes");
app.use("/upinterviewEnterpriseContact", upinterviewEnterpriseContactRoutes);

// for external api routes
const externalRoutes = require("./routes/external.routes");
app.use("/external", externalRoutes);

// Create meeting endpoint
// app.post('/api/create-meeting', async (req, res) => {
//   try {
//     const { topic, start_time, duration, timezone, userId, settings } = req.body;
//     const token = await getS2SToken();

//     // Validate start_time if provided
//     if (start_time) {
//       const startDate = new Date(start_time);
//       if (isNaN(startDate.getTime())) {
//         return res.status(400).json({
//           error: 'Invalid start_time format. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ss'
//         });
//       }

//       // Ensure start_time is in the future for scheduled meetings
//       if (startDate <= new Date()) {
//         return res.status(400).json({
//           error: 'start_time must be in the future'
//         });
//       }
//     }

//     const hostUser = userId || process.env.ZOOM_HOST_EMAIL;
//     const type = start_time ? 2 : 1; // 2 for scheduled, 1 for instant

//     const body = {
//       topic: topic || 'Interview Meeting',
//       type,
//       ...(start_time && { start_time }),
//       duration: duration || 60,
//       timezone: timezone || 'Asia/Kolkata',
//       settings: settings || {
//         join_before_host: true,
//         host_video: false,
//         participant_video: false
//       }
//     };


//     const create = await axios.post(
//       `https://api.zoom.us/v2/users/${encodeURIComponent(hostUser)}/meetings`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     // {
//     //   join_url: create.data.join_url,
//     //   start_url: create.data.start_url,
//     //   id: create.data.id,
//     //   password: create.data.password
//     // }

//     return res.json(create.data);
//   } catch (err) {
//     console.error("Zoom API Error:", err.response?.data || err.message);
//     return res.status(err.response?.status || 500).json({
//       error: err.response?.data?.message || err.message
//     });
//   }
// });

// Create meeting endpoint
// app.post('/api/create-meeting', async (req, res) => {
//   try {
//     const { topic, start_time, duration, timezone, userId, settings } = req.body;
//     const token = await getS2SToken();

//     const hostUser = userId || process.env.ZOOM_HOST_EMAIL;
//     const type = start_time ? 2 : 1;

//     const body = {
//       topic: topic || 'Meeting from API',
//       type,
//       ...(start_time ? { start_time } : {}),
//       duration: duration || 60,
//       timezone: timezone || 'Asia/Kolkata',
//       settings: settings || { join_before_host: true, host_video: false, participant_video: false }
//     };

//     const create = await axios.post(
//       `https://api.zoom.us/v2/users/${encodeURIComponent(hostUser)}/meetings`,
//       body,
//       { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
//     );


//     return res.json({
//       join_url: create.data.join_url,
//       start_url: create.data.start_url,
//       id: create.data.id,
//       password: create.data.password
//     });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
//   }
// });

// Catch-all for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

//  v1.0.4 ------------------------------------------------------------------------------>
