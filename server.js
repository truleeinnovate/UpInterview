const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User.js');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4041;
const mongoUri = process.env.MONGO_URI;

console.log('Mongo URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ error: 'Name already exists' });
        }
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