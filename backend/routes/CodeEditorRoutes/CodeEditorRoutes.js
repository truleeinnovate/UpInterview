const express = require("express");
const router = express.Router();

const {
  executeCode,
} = require("../../controllers/CodeEditorController/codeEditorController");

router.post("/", executeCode);

module.exports = router;
