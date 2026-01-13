const express = require("express");
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../../controllers/TenantCompanyController/TenantCompanyController.js");
const loggingService = require("../../middleware/loggingService.js");
const router = express.Router();

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post(
  "/create-company",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  createCompany
);
router.put(
  "/:id",
  loggingService.internalLoggingMiddleware,
  loggingService.FeedsMiddleware,
  updateCompany
);
router.delete("/:id", deleteCompany);

module.exports = router;
