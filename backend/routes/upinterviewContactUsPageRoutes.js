const express = require("express");
const router = express.Router();
const { 
  createContactUsSubmission, 
  getAllContactUsSubmissions 
} = require("../controllers/upinterviewContactUsPageController");

// POST: Save contact form
router.post("/", createContactUsSubmission);

// GET: Fetch all contact form submissions
router.get("/", getAllContactUsSubmissions);

module.exports = router;
