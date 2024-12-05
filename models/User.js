const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name is required
    trim: true // Trim whitespace
  },
  email: {
    type: String,
    required: true, // Email is required
    unique: true, // Ensure email is unique
    trim: true, // Trim whitespace
    lowercase: true // Convert email to lowercase
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
