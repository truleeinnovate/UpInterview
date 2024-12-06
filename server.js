const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User.js');
const { Users, UserHistory } = require("./models/Users.js")
const { Organization, OrganizationHistory } = require('./models/Organization.js');
const SharingSettings = require('./models/SharingSettings');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config();

const port = process.env.PORT || 4041;
const mongoUri = process.env.MONGO_URI + '&retryWrites=false';

// Connect to MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
    res.send('Hello World! this is updated on 10:40 pm');
});

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend !' });
});

app.get('/api/db-status', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB';
    res.json({ status });
});

app.post('/api/save-user', async (req, res) => {
    const { name } = req.body;
    try {
        const user = new User({ name });
        await user.save();
        res.json({ message: 'User saved successfully' });
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error
            console.error('Duplicate key error:', err);
            res.status(400).json({ error: 'Duplicate entry' });
        } else {
            console.error('Error saving user:', err);
            res.status(500).json({ error: 'Error saving user' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.post('/organization/login', async (req, res) => {
    const { Email, password } = req.body;

    try {
        // Case-insensitive email search
        const user = await Users.findOne({ Email: new RegExp(`^${Email}$`, 'i') });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //   return res.status(400).json({ message: 'Invalid email or password' });
        // }

        // Add this line to include userId and organizationId in the response
        res.status(200).json({ message: 'Login successful', userId: user._id, organizationId: user.organizationId });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


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


app.post('/api/sharing-settings', async (req, res) => {
    const { Name, organizationId, accessBody } = req.body;

    const newSharingSettings = new SharingSettings({
        Name,
        organizationId,
        accessBody
    });

    try {
        const savedSettings = await newSharingSettings.save();
        res.status(201).json(savedSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error saving sharing settings', error: error.message });
    }
});

app.get('/api/sharing-settings', async (req, res) => {
    try {
        const sharingSettings = await SharingSettings.find();
        res.status(200).json(sharingSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sharing settings', error: error.message });
    }
});

app.put('/api/sharing-settings/:id', async (req, res) => {
    try {
        const updatedSharingSettings = await SharingSettings.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSharingSettings) {
            return res.status(404).json({ message: 'Sharing settings not found' });
        }
        res.json(updatedSharingSettings);
    } catch (error) {
        console.error('Error updating sharing settings:', error);
        res.status(500).json({ message: 'Error updating sharing settings', error: error.message });
    }
});