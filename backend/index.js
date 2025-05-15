// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const app = express();

// // Parse cookies
// app.use(cookieParser());
// app.use(bodyParser.json());

// const port = process.env.PORT;
// const mongoUri = process.env.MONGODB_URI;

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests from localhost for development
//     if (!origin || origin === 'http://localhost:3000' || origin === 'https://www.app.upinterview.io') {
//       callback(null, true);
//     } else {
//       // For production, allow requests from any subdomain of upinterview.io
//       const allowedDomains = ['upinterview.io', 'app.upinterview.io'];
//       const originDomain = origin.split('//')[1].split(':')[0];
//       const isAllowedDomain = allowedDomains.some(domain => originDomain.endsWith(domain));
      
//       if (isAllowedDomain) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Accept'],
//   exposedHeaders: ['Set-Cookie'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
// };

// mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Enhanced CORS handling - applied before routes
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   // Handle preflight OPTIONS requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
  
//   // console.log('CORS headers set for:', req.method, req.url);
//   next();
// });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin:', origin); // Debug log to verify the origin
    if (
      !origin || // Allow non-origin requests (e.g., Postman)
      origin.startsWith('http://localhost:3000') || // Allow local development
      origin.includes('upinterview.io') // Allow any subdomain of upinterview.io
    ) {
      console.log('11')
      callback(null, true);
    } else {
      console.log('22')
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Accept'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests (for redundancy)
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

// app.get('/api/validate-domain', (req, res) => {
//   const token = req.cookies.token;
//   const origin = req.headers.origin || req.headers.host;

//   console.log('Received domain validation request from:', origin);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const subdomain = origin.split('.')[0];

//     if (subdomain === decoded.organization.subdomain) {
//       return res.json({ isValid: true });
//     } else {
//       return res.status(403).json({ isValid: false, error: 'Subdomain mismatch' });
//     }
//   } catch (err) {
//     console.error('JWT validation failed:', err.message);
//     return res.status(401).json({ isValid: false });
//   }
// });


// backend route (e.g. validate-domain.js or inside index.js)
// app.get('/api/validate-domain', (req, res) => {
//   const token = req.cookies.token;
//   const origin = req.headers.origin || req.headers.host;

//   console.log('Received domain validation request from:', origin);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded JWT:', decoded);

//     const subdomain = origin.split('.')[0];
//     console.log('Extracted subdomain:', subdomain);

//     if (subdomain === decoded.organization.subdomain) {
//       console.log('Subdomain matches. Validation successful.');
//       return res.json({ isValid: true });
//     } else {
//       console.log('Subdomain mismatch. Validation failed.');
//       return res.status(403).json({ isValid: false, error: 'Subdomain mismatch' });
//     }
//   } catch (err) {
//     console.error('JWT validation failed:', err.message);
//     return res.status(401).json({ isValid: false });
//   }
// });


// API Routes
const linkedinAuthRoutes = require('./routes/linkedinAuthRoute.js');
const individualLoginRoutes = require("./routes/individualLoginRoutes.js");
const SubscriptionRouter = require("./routes/SubscriptionRoutes.js");
const CustomerSubscriptionRouter = require("./routes/CustomerSubscriptionRoutes.js");
const organizationRoutes = require('./routes/organizationLoginRoutes.js');
const Cardrouter = require("./routes/Carddetailsroutes.js");
const EmailRouter = require('./routes/EmailsRoutes/emailsRoute.js')
// Register all routes
app.use('/linkedin', linkedinAuthRoutes);
app.use("/Individual", individualLoginRoutes);
app.use('/',SubscriptionRouter);
app.use('/',CustomerSubscriptionRouter)
app.use('/Organization', organizationRoutes);
app.use('/',Cardrouter)
app.use('/emails', EmailRouter)

// Master Data Routes
const { Skills } = require('./models/MasterSchemas/skills.js');
const { LocationMaster } = require('./models/MasterSchemas/LocationMaster.js');
const { Industry } = require('./models/MasterSchemas/industries.js');
const { RoleMaster } = require('./models/MasterSchemas/RoleMaster.js');
const { TechnologyMaster } = require('./models/MasterSchemas/TechnologyMaster.js');
const { HigherQualification } = require('./models/higherqualification.js');
const { University_CollegeName } = require('./models/college.js')
const { Company } = require('./models/company.js');
// Master Data Endpoints
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/locations', async (req, res) => {
  try {
    const LocationNames = await LocationMaster.find({}, 'LocationName');
    res.json(LocationNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/industries', async (req, res) => {
  try {
    const IndustryNames = await Industry.find({}, 'IndustryName');
    res.json(IndustryNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/roles', async (req, res) => {
  try {
    const roles = await RoleMaster.find({}, 'RoleName');
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/technology', async (req, res) => {
  try {
    const technology = await TechnologyMaster.find({}, 'TechnologyMasterName');
    res.json(technology);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/qualification', async (req, res) => {
  try {
    const higherqualifications = await HigherQualification.find({}, 'QualificationName');
    res.json(higherqualifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/universitycollege', async (req, res) => {
  try {
    const universityCollegeNames = await University_CollegeName.find({}, 'University_CollegeName');
    res.json(universityCollegeNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/company', async (req, res) => {
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
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



// this is common code for datautils
const { Candidate } = require('./models/candidate.js');
const { Position } = require('./models/position.js');
const TeamMember = require('./models/TeamMembers.js');
const Assessment = require('./models/assessment.js');
const { Interview } = require('./models/Interview.js');
const { MockInterview } = require('./models/mockinterview.js');
const { Users } = require("./models/Users.js")
const Role = require('./models/RolesData.js');
const Profile = require('./models/Profile.js');
const { TenantQuestions } = require('./models/myQuestionList.js');
const SharingRule = require('./models/SharingRules.js');

app.post('/api/sharing-rules', async (req, res) => {
  const { label, name, objectName, ruleType, recordsOwnedBy, recordsOwnedById, shareWith, shareWithId, access, description, orgId } = req.body;

  const newSharingRule = new SharingRule({
    label,
    name,
    objectName,
    ruleType,
    recordsOwnedBy,
    recordsOwnedById,
    shareWith,
    shareWithId,
    access,
    description,
    orgId
  });

  try {
    const savedRule = await newSharingRule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    console.error('Error saving sharing rule:', error); // Log the error
    res.status(500).json({ message: 'Error saving sharing rule', error: error.message });
  }
});



app.get('/api/from/sharing-rules', async (req, res) => {
  const { orgId } = req.query; // Get the organization ID from query parameters

  try {
    // Query the database for sharing rules with the specified organization ID
    const sharingRules = await SharingRule.find({ orgId });

    // Return the sharing rules as a JSON response
    res.status(200).json(sharingRules);
  } catch (error) {
    console.error('Error fetching sharing rules:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
// this sharing rule fetch used in datautils function
app.get('/api/sharing-rules', async (req, res) => {
  const { orgId, objectName, shareWithId } = req.query;

  // Ensure shareWithId is an array
  const shareWithIdArray = Array.isArray(shareWithId) ? shareWithId : [shareWithId];

  try {
    // Validate required parameters
    if (!objectName || !shareWithIdArray.length) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    // Query the database for sharing rules
    const sharingRules = await SharingRule.find({
      orgId,
      objectName,
      shareWithId: { $in: shareWithIdArray }
    });

    res.status(200).json(sharingRules);
  } catch (error) {
    console.error('Error fetching sharing rules:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// this is common code for datautils
const modelMapping = {
  'candidate': Candidate,
  'position': Position,
  'team': TeamMember,
  'assessment': Assessment,
  'interview': Interview,
  'mockinterview': MockInterview,
  'users': Users,
  'rolesdata': Role,
  'profiles': Profile,
  'tenentquestions': TenantQuestions
};

const { InterviewRounds } = require('./models/InterviewRounds.js');

app.get('/api/:model', async (req, res) => {
  const { model } = req.params;
  const { tenantId, ownerId } = req.query;

  // Get the correct model based on the endpoint
  const DataModel = modelMapping[model.toLowerCase()];

  if (!DataModel) {
    return res.status(400).json({ message: 'Invalid model' });
  }

  if (!ownerId) {
    return res.status(200).json([]);
  }

  try {
    let query = DataModel.find(tenantId ? { tenantId } : { ownerId });

    // Handle specific models with additional population
    switch (model.toLowerCase()) {
      case 'team':
        query = query
          .populate('contactId')
          .populate({
            path: 'contactId',
            populate: {
              path: 'availability',
              model: 'Interviewavailability',
            },
          });
        break;

      case 'tenentquestions':
        const questions = await TenantQuestions.find()
          .populate({
            path: 'suggestedQuestionId',
            model: 'suggestedQuestions',
          })
          .populate({
            path: 'tenantListId',
            model: 'TenantQuestionsListNames',
            select: 'label name ownerId tenantId',
          })
          .exec();

        // Group questions by label
        const groupedQuestions = questions.reduce((acc, question) => {
          const questionData = question.isCustom
            ? question // Use the question data directly if custom
            : question.suggestedQuestionId;

          if (!questionData) return acc;

          question.tenantListId.forEach((list) => {
            const label = list.label;
            if (!acc[label]) {
              acc[label] = [];
            }
            acc[label].push({
              ...questionData._doc,
              label,
              listId: list._id,
            });
          });

          return acc;
        }, {});

        return res.status(200).json(groupedQuestions);

      // case 'assessment':
      // query = query
      //   .populate({
      //     path: 'Sections.Questions',
      //     model: 'assessmentQuestions',
      //   });
      // break;

      case 'position':
        query = query
          .populate({
            path: 'rounds.interviewers',
            model: 'Contacts',
            select: 'name email',
          })

        // .populate({
        //   path: 'rounds.questions.questionId',
        //   model: 'Questions',
        // });

        break;

      case 'interview':
        query = query
          .populate({
            path: 'candidateId',
            model: 'Candidate',
          })
          .populate({
            path: 'positionId',
            model: 'Position',
          })
          .populate({
            path: 'templateId',
            model: 'InterviewTemplate', 
          });

        const interviews = await query.exec();
        const interviewIds = interviews.map(interview => interview._id);

        // Fetch rounds separately
        const roundsData = await InterviewRounds.find({ interviewId: { $in: interviewIds } })
          .populate({
            path: "interviewers",
            model: "Contacts",
            select: "name email",
          })
        // .populate({ 
        //   path: "assessmentId",
        //   model: "assessment",
        //   select: "Sections",
        //   populate: {
        //     path: "Sections.Questions",
        //     model: "assessmentQuestions",
        //     select: "snapshot",
        //   },
        // });

        // Fetch interview questions separately using interviewId and roundId
        const interviewQuestionData = await interviewQuestions.find({
          interviewId: { $in: interviewIds }
        }).select("roundId snapshot");

        // Map rounds and attach matching questions
        // Map rounds and attach all matching questions
        const roundsWithQuestions = roundsData.map(round => {
          const matchingQuestions = interviewQuestionData.filter(q => q.roundId.equals(round._id));

          return {
            ...round._doc,
            questions: matchingQuestions, // Attach all question data instead of selecting fields
          };
        });

        // Merge rounds into the interviews
        const interviewsWithRounds = interviews.map(interview => {
          const interviewRounds = roundsWithQuestions.filter(round => round.interviewId.equals(interview._id));
          return {
            ...interview._doc,
            rounds: interviewRounds,
          };
        });

        return res.status(200).json(interviewsWithRounds);
    }

    const data = await query.exec();
    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching data for ${model}:`, error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

app.get('/getUsersByRoleId', async (req, res) => {
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
    console.error('Error fetching users by organization and role:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// this is realted to data utils i think
app.get('/rolesdata/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
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

app.get('/api/rolesdata/:organizationId', async (req, res) => {
console.log('triggered');
  const { organizationId } = req.params;
  try {
    const roles = await Role.find({ organizationId }).populate('reportsToRoleId');
    if (!roles || roles.length === 0) {
      return res.status(404).json({ message: 'No roles found for this organization' });
    }
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

// tabs 
const candidateRoutes = require('./routes/candidateRoutes.js');
app.use('/candidate', candidateRoutes);

const positionRoutes = require('./routes/positionRoutes');
app.use('/position', positionRoutes);

const pushNotificationRoutes = require('./routes/pushNotificationRoutes');
app.use('/', pushNotificationRoutes);

const suggestedQuestionRouter = require('./routes/suggestedQuestionRoute.js')
const interviewQuestions = require('./models/interviewQuestions.js');
app.use('/suggested-questions', suggestedQuestionRouter)

const interviewQuestionsRoute = require('./routes/interviewQuestionsRoutes.js')
app.use('/interview-questions', interviewQuestionsRoute)

const TenentQuestionsListNamesRoute = require('./routes/TenentQuestionsListNames.js')
app.use('/tenant-list', TenentQuestionsListNamesRoute);

const interviewTemplateRoutes = require('./routes/interviewTemplateRoutes');
app.use('/interviewTemplates', interviewTemplateRoutes);

// in contextfetch for fetchUserProfile
app.get('/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/users/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const imagePath = user.ImageData?.path;
    user.ImageData = undefined;
    await user.save();

    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    res.status(200).send('Image deleted successfully.');
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).send('Server error');
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, isFreelancer, ImageData, ModifiedBy } = req.body;

  try {
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, isFreelancer, ImageData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// mock interview
const mockInterviewRoutes = require('./routes/mockinterviewRoutes.js');
app.use('/', mockInterviewRoutes);

const groupsRoutes = require('./routes/interviewerGroupRoutes');
app.use('/groups', groupsRoutes);

app.get('/org-users', async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: 'tenantId is required' });
    }

    const users = await Users.find({ tenantId });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

const usersRoutes = require('./routes/usersRoutes.js');
app.use('/users', usersRoutes);

// Email TemplateRouter
const EmailTemplateRouter = require("./routes/EmailTemplateRoutes.js");
app.use('/emailTemplate', EmailTemplateRouter);

const rolesRoutes = require('./routes/rolesRoutes');
const rolesPermissionRoutes = require('./routes/rolesPermissionRoutes');

app.use('/permissions', rolesPermissionRoutes);
app.use('/',  rolesRoutes);

// <------------------------Assessment Templates
const candidateAssessmentRouter = require('./routes/candidateAssessmentRoutes.js');
app.use('/candidate-assessment', candidateAssessmentRouter);

const AssessmentRouter = require('./routes/assessmentRoute.js');
app.use('/assessments', AssessmentRouter);

const assessmentQuestionsRoutes = require('./routes/assessmentQuestionsRoutes.js');
app.use('/assessment-questions', assessmentQuestionsRoutes);

const scheduledAssessmentRouter = require("./routes/scheduledAssessmentRoute.js");
app.use('/schedule-assessment', scheduledAssessmentRouter);

// ----------------------------------------------------->

// this codes need to change in to routers and controllers,this will use in login pages and user creation page
// app.get('/check-email', async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }
//     const user = await Users.findOne({  email });
//     res.json({ exists: !!user });
//   } catch (error) {
//     res.status(500).json({ message: "Error checking email", error: error.message });
//   }
// });

// app.get('/check-profileId', async (req, res) => {
//   try {
//     const { profileId } = req.query;
//     if (!profileId) {
//       return res.status(400).json({ message: "Username is required" });
//     }
//     const user = await Users.findOne({ profileId });
//     res.json({ exists: !!user });
//   } catch (error) {
//     res.status(500).json({ message: "Error checking username", error: error.message });
//   }
// });

// app.get('/check-profileId', async (req, res) => {
//   const { profileId } = req.query;
  
//   try {
//     const user = await Users.findOne({ profileId });
//     res.json({ exists: !!user });
//   } catch (error) {
//     res.status(500).json({ error: 'Error checking profileId' });
//   }
// });