const express = require("express");
const router = express.Router();
const upload = require("../../middleware/mutler");
const { trackUploadBandwidth } = require("../../middleware/bandwidthTracking");
const loggingService = require("../../middleware/loggingService");
const {
  uploadHandler,
} = require("../../controllers/UploadController/uploadController");

// POST /upload - with bandwidth tracking
router.post(
  "/",
  upload.single("file"),
  trackUploadBandwidth,
  loggingService.internalLoggingMiddleware,
  uploadHandler
);

module.exports = router;
