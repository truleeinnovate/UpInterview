const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://smb:smb123@candidatetable.wewzvjo.mongodb.net/testdb?retryWrites=true&w=majority&appName=CandidateTable');
        console.log(`MongoDB connected`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = connectDB;