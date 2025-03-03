const express = require('express');
const router = express.Router();
const historyFeedsController = require('../controllers/feedsController');

// Get all feeds with pagination and search
router.get('/', historyFeedsController.getAllFeeds);

// Get feed by ID
// router.get('/:id', historyFeedsController.getFeedById);

// Create new feed
router.post('/', historyFeedsController.createFeed);

// Get unique values for filters
// router.get('/unique/:field', historyFeedsController.getUniqueValues);

module.exports = router;
