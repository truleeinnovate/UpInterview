const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User.js');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4041;
const mongoUri = process.env.MONGO_URI + '&retryWrites=false';

console.log('Mongo URI:', process.env.MONGO_URI);

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
    const { name } = req.body; // Ensure this matches the data being sent
    try {
        const user = new User({ name }); // Create a new user with the provided data
        await user.save(); // Save the user to the database
        res.json({ message: 'User saved successfully' });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ error: 'Error saving user' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});