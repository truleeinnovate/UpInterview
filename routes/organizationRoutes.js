const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization,resetPassword,organizationUserCreation } = require('../controllers/organizationController');

router.post('/Signup', registerOrganization);
router.post('/login', loginOrganization);
router.post('/reset-password', resetPassword);
router.post('/new-user-Creation', organizationUserCreation);

module.exports = router;