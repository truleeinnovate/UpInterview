// v1.0.0 - Resume Screening Routes

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
    screenResume,
    createCandidatesFromScreening,
    getScreeningStatus,
} = require("../controllers/resumeScreeningController");

// Auth is handled globally by authContextMiddleware in index.js

/**
 * @route   POST /api/resume-screening/screen
 * @desc    Screen uploaded resumes using AI or system method
 * @access  Private
 */
router.post(
    "/screen",
    upload.array("resumes", 20),
    screenResume
);

/**
 * @route   POST /api/resume-screening/create-candidates
 * @desc    Create candidates from selected screening results
 * @access  Private
 */
router.post(
    "/create-candidates",
    createCandidatesFromScreening
);

/**
 * @route   GET /api/resume-screening/status/:jobId
 * @desc    Get the status of a screening job
 * @access  Private
 */
router.get(
    "/status/:jobId",
    getScreeningStatus
);

module.exports = router;
