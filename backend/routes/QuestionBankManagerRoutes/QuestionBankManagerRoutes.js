// v1.0.0 - Ashok - Created updateQuestionById route handler

const express = require("express");
const router = express.Router();
const multer = require("multer"); // import multer
const { trackUploadBandwidth } = require("../../middleware/bandwidthTracking");
const loggingService = require("../../middleware/loggingService");
const {
  createQuestions,
  getQuestionById,
  getQuestions,
  getQuestionDeleteById,
  updateQuestionById,
} = require("../../controllers/QuestionBankManagerControllers/QuestionBankManagerController");

// Configure multer for temporary file storage
const upload = multer({ dest: "uploads/" });

// Create single/bulk or CSV upload - with bandwidth tracking
router.post(
  "/:type",
  upload.single("file"),
  trackUploadBandwidth,
  loggingService.internalLoggingMiddleware,
  createQuestions
);

// Get all
router.get("/:type", getQuestions);

// Get by id
router.get("/:type/:id", getQuestionById);

// Update by ID
router.put(
  "/:type/:id",
  loggingService.internalLoggingMiddleware,
  updateQuestionById
);

router.delete("/:type", getQuestionDeleteById);

module.exports = router;
