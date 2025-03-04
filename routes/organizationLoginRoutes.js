const express = require('express');
const router = express.Router();
const { 
    // registerOrganization, 
    loginOrganization } = require('../controllers/organizationLoginController');

// router.post('/Signup', registerOrganization);
router.post('/Login', loginOrganization);

module.exports = router;