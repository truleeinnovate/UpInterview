const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Add this line

const app = express();
app.use(express.json());
const port = process.env.PORT || 4041;

// MongoDB connection string
const mongoUri = process.env.MONGO_URI;

console.log('Mongo URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World! this is updated on 10:40 pm');
});

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend! now updated on 11:10 pm' });
});

app.get('/api/db-status', (req, res) => {
    const status = mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB';
    res.json({ status });
});

app.post('/api/save-user', (req, res) => {
    const { name, email } = req.body;
    // Assuming you have a User model set up with Mongoose
    const user = new User({ name, email });
    user.save()
        .then(() => res.json({ message: 'User saved successfully' }))
        .catch(err => res.status(500).json({ error: 'Error saving user' }));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});