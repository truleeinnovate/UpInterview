const express = require("express");
const router = express.Router();
const multer = require("multer"); // import multer
const { trackUploadBandwidth } = require("../../middleware/bandwidthTracking");
const {
  createQuestions,
  getQuestionById,
  getQuestions,
  getQuestionDeleteById,
} = require("../../controllers/QuestionBankManagerControllers/QuestionBankManagerController");

// Configure multer for temporary file storage
const upload = multer({ dest: "uploads/" });

// Create single/bulk or CSV upload - with bandwidth tracking
router.post("/:type", upload.single("file"), trackUploadBandwidth, createQuestions);

// Get all
router.get("/:type", getQuestions);

// Get by id
router.get("/:type/:id", getQuestionById);

router.delete("/:type", getQuestionDeleteById);

module.exports = router;
