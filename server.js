const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const { Organization } = require('./models/Organization.js');
const { Organization, OrganizationHistory } = require('./models/Organization.js');
const { Contacts, ContactHistory } = require('./models/Contacts1.js')
const { Users, UserHistory } = require("./models/Users.js")
const { HigherQualification, HigherQualificationHistory } = require('./models/HigherQualification.js');
const { University_CollegeName, University_CollegeHistory } = require('./models/College.js')
const { Skills, SkillsHistory } = require('./models/Skills.js');

const app = express();
app.use(express.json());
app.use(cors());
 
const port = process.env.PORT || 4041;
const mongoUri = process.env.MONGO_URI;
 
console.log('Mongo URI:', mongoUri);
 
const corsOptions = {
  origin: 'https://www.app.upinterview.io',
  credentials: true,
};
 
app.use(cors(corsOptions));
 
// mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB', err));
 
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));
 
app.get('/', (req, res) => {
    res.send('Hello World!');
});
 
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});
 
app.get('/api/db-status', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB';
    res.json({ status });
});
 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
 
// app.post('/organization', async (req, res) => {
//   const { firstname } = req.body;
 
//   try {
//     const organization = new Organization({ firstname });
//     const savedOrganization = await organization.save();
//     res.status(201).json({ organization: savedOrganization });
//   } catch (error) {
//     console.error('Error saving organization:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });
 
// organization schema code
// const saltRounds = 10;
app.post('/organization', async (req, res) => {
  const { firstName, lastName, Email, Phone, username, jobTitle, company, employees, country, password, Role, Profile, ProfileId, RoleId } = req.body;
 
  try {
    // Check if email already exists
    const existingOrganization = await Organization.findOne({ Email });
    if (existingOrganization) {
      return res.status(400).json({ message: 'Email already registered' });
    }
 
    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
      const hashedPassword = 'abcd';
     
    // Create a new organization
    const organization = new Organization({
      firstName,
      lastName,
      Email,
      Phone,
      username,
      jobTitle,
      company,
      employees,
      country,
      password: hashedPassword,
    });
 
    const savedOrganization = await organization.save();
 
    // Create a new user
    const newUser = new Users({
      Name: `${firstName} ${lastName}`,
      Firstname: firstName,
      Email,
      UserId: username,
      Phone,
      organizationId: savedOrganization._id,
      // sub: 'dfbd',
      RoleId,
      ProfileId,
      password: hashedPassword,
    });
 
    const savedUser = await newUser.save();
 
    // newUser.sub = savedUser._id;
    // await newUser.save();
 
    // Create a new contact
    const contact = new Contacts({
      Name: `${firstName} ${lastName}`,
      Firstname: firstName,
      Email,
      Phone,
      UserId: username,
      CurrentRole: jobTitle,
      company,
      employees,
      CountryCode: country,
      user: savedUser._id,
    });
 
    const savedContact = await contact.save();
 
      res.status(201).json({
          organization: savedOrganization,
          user: savedUser,
          contact: savedContact
      });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
 
 
// Users schema code
 
app.get('/users', async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});
 
app.post('/users', async (req, res) => {
  const { Email, UserId, LinkedinUrl, TimeZone, Language, ...otherData } = req.body;
  try {
    const existingUser = await Users.findOne({ $or: [{ Email }, { UserId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Email or UserId already exists' });
    }
 
    const newUser = new Users({ Email, UserId, LinkedinUrl, TimeZone, Language, ...otherData });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    const users = await Users.find();
    broadcastData('user', users);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: err.message });
  }
});
 
app.get('/getUsersByRoleId', async (req, res) => {
  const { organizationId, roleId } = req.query; // Extract organizationId and roleId from query parameters
 
  try {
    // Build the query object
    const query = { organizationId };
    if (roleId) {
      query.RoleId = { $in: Array.isArray(roleId) ? roleId : [roleId] }; // Ensure roleId is an array
    }
 
    // Fetch users based on the query
    const users = await Users.find(query);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by organization and role:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
 
app.put('/updateuser', async (req, res) => {
  const { _id, UserId, ...newUserData } = req.body;
 
  try {
    const existingUser = await Users.findOne({ $or: [{ _id }, { UserId }] });
 
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    const userHistory = new UserHistory({
      user: existingUser._id,
      Name: existingUser.Name,
      Firstname: existingUser.Firstname,
      CountryCode: existingUser.CountryCode,
      UserId: existingUser.UserId,
      Email: existingUser.Email,
      Phone: existingUser.Phone,
      LinkedinUrl: existingUser.LinkedinUrl,
      Gender: existingUser.Gender,
      ImageData: existingUser.ImageData,
      CreatedDate: existingUser.CreatedDate,
      OwnerId: existingUser.OwnerId,
      ModifiedDate: existingUser.ModifiedDate,
      ModifiedBy: existingUser.ModifiedBy,
      updatedAt: new Date()
    });
 
    await userHistory.save();
 
    const updatedUser = await Users.findByIdAndUpdate(
      existingUser._id,
      { ...newUserData, ModifiedDate: new Date() },
      { new: true }
    );
 
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 
 
// Contact schema code
 
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contacts.find().populate('availability');
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});
 
app.post('/contacts', async (req, res) => {
  const contact = new Contacts(req.body);
  try {
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error saving contact:', error);
    res.status(400).send('Error saving contact: ' + error.message);
  }
});
 
app.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, ImageData, CurrentRole, industry, Experience, location, Introduction, Technology, Skill, experienceYears, previousExperience, expertiseLevel, ModifiedBy } = req.body;
 
  try {
    const updatedContact = await Contacts.findByIdAndUpdate(
      id,
      { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, ImageData, CurrentRole, industry, Experience, location, Introduction, Technology, Skill, experienceYears, previousExperience, expertiseLevel },
      { new: true }
    );
 
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
 
    // Create a history record
    const contactHistory = new ContactHistory({
      contactId: updatedContact._id,
      Name,
      Firstname,
      CountryCode,
      UserId,
      Email,
      Phone,
      LinkedinUrl,
      Gender,
      ImageData,
      CurrentRole,
      industry,
      Experience,
      location,
      Introduction,
      Technology,
      Skill,
      experienceYears,
      previousExperience,
      expertiseLevel,
      ModifiedBy,
    });
 
    await contactHistory.save();
 
    res.status(200).json(updatedContact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// higher qualification
 
app.get('/qualification', async (req, res) => {
  try {
    const higherqualifications = await HigherQualification.find({}, 'QualificationName');
    res.json(higherqualifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// Insert qualifications into the database if not already present
const qualificationList = [
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BSc)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Engineering (BE/BTech)",
  "Bachelor of Technology (B.Tech)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Computer Applications (BCA)",
  "Bachelor of Architecture (BArch)",
  "Master of Arts (MA)",
  "Master of Science (MSc)",
  "Master of Commerce (MCom)",
  "Master of Engineering (ME/MTech)",
  "Master of Technology (M.Tech)",
  "Master of Business Administration (MBA)",
  "Master of Computer Applications (MCA)",
  "Diploma in Engineering",
  "Diploma in Computer Applications (DCA)",
  "Diploma in Business Administration"
];
 
 
const insertQualificationsIfNeeded = async () => {
  try {
    const existingData = await HigherQualification.find();
    if (existingData.length === 0) {
      await HigherQualification.insertMany(
        qualificationList.map(name => ({ QualificationName: name }))
      );
      console.log('Qualifications pushed successfully.');
    } else {
      console.log('Qualifications already exist in the database.');
    }
  } catch (error) {
    console.error('Error pushing qualifications:', error.message);
  }
};
// Run qualification insert logic on startup
insertQualificationsIfNeeded();
 
// colleges
 
app.get('/universitycollege', async (req, res) => {
  try {
    const universityCollegeNames = await University_CollegeName.find({}, 'University_CollegeName');
    res.json(universityCollegeNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
const collegeList = [
  "Indian Institutes of Technology (IITs)",
  "National Institutes of Technology (NITs)",
  "Delhi University (University of Delhi)",
  "Jawaharlal Nehru University (JNU)",
  "Indian Institute of Science (IISc)",
  "Banaras Hindu University (BHU)",
  "Jadavpur University",
  "University of Mumbai",
  "University of Calcutta",
  "Osmania University (OU)",
  "Jawaharlal Nehru Technological University (JNTU)",
  "Indian Statistical Institute (ISI)",
  "Indian Institute of Management Ahmedabad (IIMA)",
  "Indian Institute of Management Bangalore (IIMB)",
  "Indian Institute of Management Calcutta (IIMC)",
  "Indian Institute of Management Lucknow (IIML)",
  "Indian Institute of Technology Bombay (IIT Bombay)",
  "Indian Institute of Technology Delhi (IIT Delhi)",
  "Indian Institute of Technology Madras (IIT Madras)",
  "Andhra University",
  "Sri Venkateswara University",
  "Acharya Nagarjuna University",
  "Sri Krishnadevaraya University",
  "Dr. B.R. Ambedkar University",
  "Yogi Vemana University",
  "Rayalaseema University",
  "Vikrama Simhapuri University",
  "Chennai Institute of Technology",
  "Indian Institute of Technology Tirupati",
  "Loyola College"
];
 
const insertCollegesIfNeeded = async () => {
  try {
    const existingData = await University_CollegeName.find();
    if (existingData.length === 0) {
      await University_CollegeName.insertMany(
        collegeList.map(name => ({ University_CollegeName: name }))
      );
      console.log('Colleges pushed successfully.');
    } else {
      console.log('Colleges already exist in the database.');
    }
  } catch (error) {
    console.error('Error pushing colleges:', error.message);
  }
};
 
// Run college insert logic on startup
insertCollegesIfNeeded();
 
// Skills
 
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
const skillsList = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Go",
  "Rust",
  "Swift",
  "HTML",
  "CSS",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Next.js",
  "Tailwind CSS",
  "SQL",
  "NoSQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Firebase",
  "Redis",
  "Cassandra",
  "AWS",
  "Azure",
  "Google Cloud Platform (GCP)",
  "Kubernetes",
  "Docker",
  "Terraform",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Scikit-learn",
  "TensorFlow",
  "PyTorch",
  "Tableau",
  "Power BI"
];
 
const insertSkillsIfNeeded = async () => {
  try {
    const existingData = await Skills.find();
    if (existingData.length === 0) {
      await Skills.insertMany(
        skillsList.map(name => ({ SkillName: name }))
      );
      console.log('Skills pushed successfully.');
    } else {
      console.log('Skills already exist in the database.');
    }
  } catch (error) {
    console.error('Error pushing skills:', error.message);
  }
};
 
// Run skills insert logic on startup
insertSkillsIfNeeded();