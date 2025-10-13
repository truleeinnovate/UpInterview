const express = require("express");
const router = express.Router();
const upload = require("../../middleware/mutler");
const { trackUploadBandwidth } = require("../../middleware/bandwidthTracking");
const {
  uploadHandler,
} = require("../../controllers/UploadController/uploadController");

// POST /upload - with bandwidth tracking
router.post("/", upload.single("file"), trackUploadBandwidth, uploadHandler);

module.exports = router;
