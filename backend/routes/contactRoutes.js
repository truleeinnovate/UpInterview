const express = require('express');
const { getAllContacts, fetchContacts, createContact, updateContact,updateContactsDetails, getUniqueContactsByOwnerId, getContactsByOwnerId } = require('../controllers/contactController');

const router = express.Router();

router.get('/contacts', getAllContacts);
// router.get('/contacts', fetchContacts);
router.post('/contacts', createContact);
router.patch('/contacts/:id', updateContact);
router.patch('/contact-detail/:id', updateContactsDetails);
router.get('/uniqe-contacts/owner/:ownerId', getUniqueContactsByOwnerId);

router.get('/contacts/owner/:ownerId', getContactsByOwnerId);

module.exports = router;