const mongoose = require('mongoose');
require('dotenv').config(); // Load from current directory since we run from backend root

async function dropIndex() {
    try {
        console.log('Connecting to MongoDB...');
        // Use the URI from .env, handling potential quotes
        const uri = process.env.MONGODB_URI.replace(/"/g, '');
        await mongoose.connect(uri);
        console.log('Connected.');

        const collection = mongoose.connection.collection('interviews');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        if (indexes.find(i => i.name === 'interviewCode_1')) {
            console.log('Found interviewCode_1 index. Dropping...');
            await collection.dropIndex('interviewCode_1');
            console.log('Successfully dropped interviewCode_1 index.');
        } else {
            console.log('Index interviewCode_1 not found. Nothing to do.');
        }
    } catch (e) {
        console.error('Error dropping index:', e);
    } finally {
        await mongoose.disconnect();
    }
}

dropIndex();
