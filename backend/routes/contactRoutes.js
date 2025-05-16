const express = require('express');
const { fetchContacts, createContact, updateContact,updateContactsDetails } = require('../controllers/contactController');
const router = express.Router();

router.get('/contacts', fetchContacts);
router.post('/contacts', createContact);
router.patch('/contacts/:id', updateContact);
router.patch('/contact-detail/:id', updateContactsDetails);

module.exports = router;