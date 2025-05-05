const Feeds = require('../models/Feeds.js');

// Create new feed
exports.createFeed = async (feedDetails) => { 
    try {
        // console.log('Creating new feed with details:', feedDetails);
        
        // Validate required fields
        const requiredFields = ['tenantId', 'feedType', 'action', 'ownerId', 'parentId', 'parentObject'];
        const missingFields = requiredFields.filter(field => !feedDetails[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const feed = new Feeds(feedDetails); 
        // console.log('Feed model created:', feed);
        
        const savedFeed = await feed.save();
        // console.log('Feed saved successfully:', savedFeed);
        
        return savedFeed;
    } catch (error) { 
        // console.error('Error in createFeed:', error);
        // console.error('Stack trace:', error.stack);
        throw error;
    }  
}; 
exports.getAllFeeds = async (req, res) => {
    try {
        const feeds = await Feeds.find({});
        res.json(feeds);
    } catch (err) {
        console.error('Error fetching feeds:', err); // Log the error
        res.status(400).json({ message: 'Invalid model', error: err.message }); // Return more details
    }
};

