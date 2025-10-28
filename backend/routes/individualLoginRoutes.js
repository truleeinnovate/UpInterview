const express = require("express");
const router = express.Router();
const { individualLogin } = require("../controllers/individualLoginController.js");
const loggingService = require('../middleware/loggingService.js');

router.post("/Signup", loggingService.internalLoggingMiddleware, individualLogin);

module.exports = router;