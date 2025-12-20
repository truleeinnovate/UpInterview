const express = require("express");
const {
  getAllContacts,
  fetchContacts,
  createContact,
  updateContact,
  updateContactsDetails,
  getUniqueContactsByOwnerId,
  getContactsByOwnerId,
  getContactsByOrganizationId, // SUPER ADMIN added by ashok
  updateContactStatus,
} = require("../controllers/contactController");
const loggingService = require('../middleware/loggingService.js');
const router = express.Router();

router.get("/contacts", getAllContacts);
// router.get('/contacts', fetchContacts);
router.post(
  "/contacts",
  loggingService.internalLoggingMiddleware,
  createContact
);
router.patch(
  "/contacts/:id",
  loggingService.internalLoggingMiddleware,
  updateContact
);
router.patch("/contact-detail/:id",loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware, updateContactsDetails);
router.get("/uniqe-contacts/owner/:ownerId", getUniqueContactsByOwnerId);

router.get("/contacts/owner/:ownerId", getContactsByOwnerId);

// -----------------------------------------------
// SUPER ADMIN added by Ashok
router.get(
  "/contacts/organization/:organizationId",
  getContactsByOrganizationId
);
// -----------------------------------------------
// Add route to update contact status
router.patch(
  '/contacts/status/:id',
  loggingService.internalLoggingMiddleware,
  updateContactStatus
);

module.exports = router;
