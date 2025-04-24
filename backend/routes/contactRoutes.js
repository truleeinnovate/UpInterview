const express = require('express');
const { fetchContacts, createContact, updateContact } = require('../controllers/contactController');
const router = express.Router();

router.get('/contacts', fetchContacts);
router.post('/contacts', createContact);
router.patch('/contacts/:id', updateContact);

module.exports = router;