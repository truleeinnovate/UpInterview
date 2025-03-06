const express = require("express");
const router = express.Router();
const { individualLogin } = require("../controllers/individualLoginController");

router.post("/", individualLogin);

module.exports = router;
