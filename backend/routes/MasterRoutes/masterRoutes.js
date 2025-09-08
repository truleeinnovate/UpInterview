// routes/masterRoutes.js
const express = require("express");
const router = express.Router();
const {
  createMaster,
  getMasters,
  getMasterById,
  updateMaster,
  deleteMaster,
} = require("../../controllers/MasterControllers/masterControllers");

const loggingService = require('../../middleware/loggingService.js');


router.post("/:type",loggingService.FeedsMiddleware, createMaster);
router.get("/:type", getMasters);
router.get("/:type/:id", getMasterById);
router.put("/:type/:id", updateMaster);
router.delete("/:type/:id", deleteMaster);

module.exports = router;
