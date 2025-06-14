const express = require("express");
const {
  fetchContacts,
  createContact,
  updateContact,
  updateContactsDetails,
  getContactsByOwnerId,
  getContactsByOrganizationId, // SUPER ADMIN
} = require("../controllers/contactController");
const router = express.Router();

router.get("/contacts", fetchContacts);
router.post("/contacts", createContact);
router.patch("/contacts/:id", updateContact);
router.patch("/contact-detail/:id", updateContactsDetails);

// SUPER ADMIN added by Ashok
router.get(
  "/contacts/organization/:organizationId",
  getContactsByOrganizationId
);

router.get("/contacts/owner/:ownerId", getContactsByOwnerId);

module.exports = router;
