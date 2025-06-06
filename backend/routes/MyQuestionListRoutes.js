const express = require('express');
const router = express.Router();
const {
    newQuestion,
    updateQuestion
} = require("../controllers/myQuestionsListController.js");
const loggingService = require('../middleware/loggingService.js');

router.post("/newquestion",loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, newQuestion);
router.patch(
    "/newquestion/:id",
    loggingService.internalLoggingMiddleware,
    loggingService.FeedsMiddleware,
    updateQuestion
  );

module.exports = router;