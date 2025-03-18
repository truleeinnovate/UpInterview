// const connectDB = require('./db.js');
// connectDB();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(cors());
 
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

const corsOptions = {
  origin: ['https://www.app.upinterview.io', 'https://purple-sand-0e5d43e00.4.azurestaticapps.net'],
  credentials: true,
};

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
// ---------------------------------------------------------------------------->




// organization Login
const organizationRoutes = require('./routes/organizationRoutes.js');
app.use('/Organization', organizationRoutes);

// sending email common code for all
const emailCommonRouter = require('./routes/emailCommonRoutes.js')
app.use('/emailCommon',emailCommonRouter)

// individual login
const individualLoginRoutes = require("./routes/individualLoginRoutes");
app.use("/Individual", individualLoginRoutes);

// subscription after individual login
const SubscriptionRouter = require("./routes/SubscriptionRoutes.js");
app.use('/',SubscriptionRouter);
const CustomerSubscriptionRouter = require("./routes/CustomerSubscriptionRoutes.js");
app.use('/',CustomerSubscriptionRouter)

// payment for subscription plans
const Cardrouter = require("./routes/Carddetailsroutes.js");
app.use('/',Cardrouter)



const linkedinAuthRoutes = require('./routes/linkedinAuthRoute.js');
app.use('/linkedin', linkedinAuthRoutes);

// Add this after your routes
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found for linked in' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error for linked in' });
});