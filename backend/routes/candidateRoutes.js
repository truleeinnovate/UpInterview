const express = require("express");
const {
  getCandidates,
  addCandidatePostCall,
  updateCandidatePatchCall,
  getCandidateById,
  getCandidatePositionById,
  deleteCandidate,
  searchCandidates,
  getCandidatesData,
  checkEmailExists,
  checkPhoneExists,
  checkLinkedInExists,
  getCandidateResumes,
  setResumeActive,
  getCandidateStats
} = require("../controllers/candidateController.js");

const router = express.Router();
const loggingService = require("../middleware/loggingService.js");

router.post(
  "/",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  addCandidatePostCall,
);

router.patch(
  "/:id",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  updateCandidatePatchCall,
);
// router.get('/',getCandidates);
router.get("/details/:id", getCandidateById);

//router.get('/details/positions/:id',getCandidatePositionById);

router.delete("/delete-candidate/:id", deleteCandidate);

router.get("/", getCandidatesData);

router.post("/search", searchCandidates);

// New Validation Endpoints
router.get("/check-email", checkEmailExists);
router.get("/check-phone", checkPhoneExists);
router.get("/check-linkedin", checkLinkedInExists);

// Resume Versioning Routes
router.get("/:id/resumes", getCandidateResumes);
router.put("/resume/active", setResumeActive);

// Candidate Stats Route
router.get("/:id/stats", getCandidateStats);

module.exports = router;
