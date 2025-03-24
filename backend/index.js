const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
 
console.log('process.env.PORT for backend port:', process.env.PORT);

const PORT = process.env.PORT || 5000;

console.log('process.env.FRONTEND_URL for backend cors:', process.env.FRONTEND_URL);
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(bodyParser.json());

console.log('process.env.MONGODB_URI backend api link:', process.env.MONGODB_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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