const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
 
console.log('process.env.PORT for backend port:', process.env.PORT);

const PORT = process.env.PORT || 5000; // Keep 5000 unless you intentionally want 5001

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

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Received signup request:', req.body);

  try {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use. Please use a different email.',
      });
    }

    // If no duplicate, create and save the new user
    const user = new User({ name, email, password });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});