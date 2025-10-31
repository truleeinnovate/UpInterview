const express = require("express");
const router = express.Router();
const { 
  createEnterpriseContact, 
  getAllEnterpriseContacts 
} = require("../controllers/upinterviewEnterpriseContactController");

// POST: Save enterprise contact form
router.post("/", createEnterpriseContact);

// GET: Fetch all enterprise contact form submissions
router.get("/", getAllEnterpriseContacts);

module.exports = router;