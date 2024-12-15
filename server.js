const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const { Organization } = require('./models/Organization.js');
const { Organization, OrganizationHistory } = require('./models/Organization.js');


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


const saltRounds = 10;
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
      sub: 'dfbd',
      RoleId,
      ProfileId,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    newUser.sub = savedUser._id;
    await newUser.save();

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

    res.status(201).json({ organization: savedOrganization, contact: savedContact, user: savedUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});