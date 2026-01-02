const express = require("express");
const router = express.Router();
const loggingService = require("../../middleware/loggingService");

const {
  getAllRegionalTaxConfigs,
  getRegionalTaxConfigById,
  createRegionalTaxConfig,
  updateRegionalTaxConfig,
  deleteRegionalTaxConfig,
} = require("../../controllers/RegionalTaxConfigController");

router.get("/", getAllRegionalTaxConfigs);
router.get("/:id", getRegionalTaxConfigById);
router.post(
  "/",
  loggingService.internalLoggingMiddleware,
  createRegionalTaxConfig
);
router.put(
  "/:id",
  loggingService.internalLoggingMiddleware,
  updateRegionalTaxConfig
);
router.delete("/:id", deleteRegionalTaxConfig);

module.exports = router;
