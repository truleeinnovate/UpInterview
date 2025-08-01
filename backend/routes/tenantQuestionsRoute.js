const express = require('express');
const router = express.Router();
const {
    newQuestion,
    updateQuestion,
    updateByOwner,
    getQuestionBySuggestedId
} = require("../controllers/tenantQuestionsController.js");
const loggingService = require('../middleware/loggingService.js');

router.post("/newquestion",loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, newQuestion);
router.patch(
    "/newquestion/:id",
    loggingService.internalLoggingMiddleware,
    loggingService.FeedsMiddleware,
    updateQuestion
  );

//router.patch('/addtenantids/:id',updateByOwner)

  router.get('/tenant-questions/:suggestedQuestionId',getQuestionBySuggestedId);

module.exports = router;