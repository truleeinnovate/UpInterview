const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Organization } = require('./models/Organization.js');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4041;
const mongoUri = process.env.MONGO_URI;

console.log('Mongo URI:', mongoUri);

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get('/', (req, res) => {
    res.send('Hello World! this is updated on 10:40 pm');
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

app.post('/organization', async (req, res) => {
  const { firstName } = req.body;

  try {
    const organization = new Organization({
      firstName,
    });

    const savedOrganization = await organization.save();

    res.status(201).json({ organization: savedOrganization });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});