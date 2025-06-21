const express = require("express");
const router = express.Router();
const upload = require("../../middleware/mutler");
const {
  uploadHandler,
} = require("../../controllers/UploadController/uploadController");

// POST /upload
router.post("/", upload.single("file"), uploadHandler);

module.exports = router;
