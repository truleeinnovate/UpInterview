const Feeds = require('../models/Feeds.js');
// Create new feed
exports.createFeed = async (feedDetails) => { 
    try {
        console.log('Creating new feed with details:', feedDetails);
        
        // Validate required fields
        const requiredFields = ['tenantId', 'feedType', 'action', 'ownerId', 'parentId', 'parentObject'];
        const missingFields = requiredFields.filter(field => !feedDetails[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const feed = new Feeds(feedDetails); 
        console.log('Feed model created:', feed);
        
        const savedFeed = await feed.save();
        console.log('Feed saved successfully:', savedFeed);
        
        return savedFeed;
    } catch (error) { 
        console.error('Error in createFeed:', error);
        console.error('Stack trace:', error.stack);
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

// Get feeds by parentId
exports.getFeedsByParentId = async (req, res) => {
  try {
    const { parentId } = req.query;

    if (!parentId) {
      return res.status(400).json({ message: 'parentId is required' });
    }

    const feeds = await Feeds.find({ parentId });
    console.log('Fetched feeds by parentId:', feeds);

    res.status(200).json({ data: feeds });
  } catch (error) {
    console.error('Error in getFeedsByParentId:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}