const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization,resetPassword,organizationUserCreation,getUsersByTenant,getRolesByTenant } = require('../controllers/organizationLoginController');

router.post('/Signup', registerOrganization);
router.post('/Login', loginOrganization);
router.post('/reset-password', resetPassword);
router.post('/new-user-Creation', organizationUserCreation);
//users in user creation in users tab
router.get('/:tenantId', getUsersByTenant);
router.get('/roles/:tenantId', getRolesByTenant);


module.exports = router;
