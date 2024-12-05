const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String
    }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;