const express = require('express');
const router = express.Router();
const historyFeedsController = require('../controllers/feedsController');

// Get feeds either by parentId or paginated
router.get('/', (req, res) => {
  if (req.query.parentId) {
    return historyFeedsController.getFeedsByParentId(req, res);
  }
  return historyFeedsController.getAllFeeds(req, res);
});

// Create new feed
router.post('/', historyFeedsController.createFeed);

module.exports = router;
