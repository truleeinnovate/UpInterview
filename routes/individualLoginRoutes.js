const express = require("express");
const router = express.Router();
const { individualLogin } = require("../controllers/individualLoginController");

router.post("/Signup", individualLogin);

module.exports = router;