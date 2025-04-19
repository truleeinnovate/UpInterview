const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization,resetPassword,organizationUserCreation,getUsersByTenant } = require('../controllers/organizationLoginController');

router.post('/Signup', registerOrganization);
router.post('/Login', loginOrganization);
router.post('/reset-password', resetPassword);
router.post('/new-user-Creation', organizationUserCreation);

router.get('/:tenantId', getUsersByTenant);



module.exports = router;
