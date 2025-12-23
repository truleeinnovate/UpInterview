const express = require("express");
const router = express.Router();
const {
  createInterviewTemplate,
  getAllTemplates,
  getTemplatesByTenantId,
  // getTemplateById,
  updateTemplate,
  deleteTemplate,
  deleteRound,
  getTemplateById,
} = require("../controllers/interviewTemplateController");

const loggingService = require("../middleware/loggingService");

// Create and get all templates
router
  .route("/")
  .post(
    loggingService.internalLoggingMiddleware,
    createInterviewTemplate
  );

// Get, update and delete template by ID
router
  .route("/:id")
  // .get(getTemplateById)
  .patch(loggingService.internalLoggingMiddleware, updateTemplate)
  .delete(deleteTemplate);

router.get("/template/:id", getTemplateById);

router.delete("/delete-round/:roundId", deleteRound);

// want to get the data of interview templates by matching tenantId
// router.route('/tenant/:tenantId').get(getTemplatesByTenantId)

module.exports = router;
