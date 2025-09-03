const express = require("express");
const router = express.Router();
const multer = require("multer"); // import multer
const {
  createQuestions,
  getQuestionById,
  getQuestions,
} = require("../../controllers/QuestionBankManagerControllers/QuestionBankManagerController");

// Configure multer for temporary file storage
const upload = multer({ dest: "uploads/" });

// Create single/bulk or CSV upload
router.post("/:type", upload.single("file"), createQuestions);

// Get all
router.get("/:type", getQuestions);

// Get by id
router.get("/:type/:id", getQuestionById);

module.exports = router;
