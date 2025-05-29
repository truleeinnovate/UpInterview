const express = require('express');
const { fetchContacts, createContact, updateContact,updateContactsDetails, getContactsByOwnerId } = require('../controllers/contactController');
const router = express.Router();

router.get('/contacts', fetchContacts);
router.post('/contacts', createContact);
router.patch('/contacts/:id', updateContact);
router.patch('/contact-detail/:id', updateContactsDetails);

router.get('/contacts/owner/:ownerId', getContactsByOwnerId);

module.exports = router;