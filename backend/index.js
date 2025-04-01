const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Enhanced CORS handling - applied before routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('CORS headers set for:', req.method, req.url);
  next();
});

const port = process.env.PORT;
console.log('port:', port);
const mongoUri = process.env.MONGODB_URI;
console.log('mongoUri:', mongoUri);

const corsOptions = {
  origin: ['https://www.app.upinterview.io', 'https://frontend-001-c7hzake8ghdbfeeh.canadacentral-01.azurewebsites.net', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
console.log('corsOptions:', corsOptions);

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
 
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// <--------------------------------master data----------------------------------
// skills master data
const { Skills } = require('./models/MasterSchemas/skills.js');
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// locations master data
const { LocationMaster } = require('./models/MasterSchemas/LocationMaster.js');
app.get('/locations', async (req, res) => {
  try {
    const LocationNames = await LocationMaster.find({}, 'LocationName');
    res.json(LocationNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Industry data
const { Industry } = require('./models/MasterSchemas/industries.js');
app.get('/industries', async (req, res) => {
  try {
    const IndustryNames = await Industry.find({}, 'IndustryName');
    res.json(IndustryNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//role master
const { RoleMaster } = require('./models/MasterSchemas/RoleMaster.js');
app.get('/roles', async (req, res) => {
  try {
    const roles = await RoleMaster.find({}, 'RoleName');
    res.json(roles);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// technology master
const { TechnologyMaster} = require('./models/MasterSchemas/TechnologyMaster.js');
app.get('/technology', async (req, res) => {
  try {
    const technology = await TechnologyMaster.find({}, 'TechnologyMasterName');
    res.json(technology);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// -------------------------------------------------------------------------->

// <------------------------------api's-------------------------------------->
// app.use('/linkedin', require('./routes/linkedinAuthRoute.js'));
const linkedinAuthRoutes = require('./routes/linkedinAuthRoute.js');
app.use('/linkedin', linkedinAuthRoutes);

const individualLoginRoutes = require("./routes/individualLoginRoutes.js");
app.use("/Individual", individualLoginRoutes);

const SubscriptionRouter = require("./routes/SubscriptionRoutes.js");
app.use('/',SubscriptionRouter);

const CustomerSubscriptionRouter = require("./routes/CustomerSubscriptionRoutes.js");
app.use('/',CustomerSubscriptionRouter)

const organizationRoutes = require('./routes/organizationRoutes.js');
app.use('/Organization', organizationRoutes);

const emailCommonRouter = require('./routes/emailCommonRoutes.js')
app.use('/emailCommon',emailCommonRouter)


const Cardrouter = require("./routes/Carddetailsroutes.js");
app.use('/',Cardrouter)
