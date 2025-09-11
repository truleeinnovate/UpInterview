// v1.0.0 - Ashok - removed getMasters

const express = require("express");
const router = express.Router();
const {
  createMaster,
  getMasterById,
  updateMaster,
  deleteMaster,
} = require("../../controllers/MasterControllers/masterControllers");

const loggingService = require('../../middleware/loggingService.js');


router.post("/:type",loggingService.FeedsMiddleware, createMaster);
router.get("/:type/:id", getMasterById);
router.put("/:type/:id", updateMaster);
router.delete("/:type/:id", deleteMaster);

module.exports = router;
