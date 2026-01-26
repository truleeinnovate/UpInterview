// v1.0.0 - Application Routes

const express = require("express");
const router = express.Router();
const {
    getApplicationsByCandidate,
    getApplicationsByPosition,
    createApplication,
    updateApplication,
    getApplicationById,
    filterApplications,
    updateApplicationStatus,
} = require("../controllers/applicationController.js");

// Get applications by candidate
router.get("/candidate/:candidateId", getApplicationsByCandidate);

// Filter applications (Must be before /:id)
router.get("/filter", filterApplications);

// Get applications by position
router.get("/position/:positionId", getApplicationsByPosition);

// Get single application by ID
router.get("/:id", getApplicationById);

// Create new application
router.post("/", createApplication);

// Update application
router.patch("/:id", updateApplication);
router.put("/status/:id", updateApplicationStatus);

module.exports = router;
