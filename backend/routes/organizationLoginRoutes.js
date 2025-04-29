const express = require('express');
const router = express.Router();
const { registerOrganization, loginOrganization,resetPassword,organizationUserCreation,getUsersByTenant,getRolesByTenant,getBasedIdOrganizations,  checkSubdomainAvailability,
  updateSubdomain,
  getOrganizationSubdomain,
  activateSubdomain,
  deactivateSubdomain } = require('../controllers/organizationLoginController');

router.post('/Signup', registerOrganization);
router.post('/Login', loginOrganization);
router.post('/reset-password', resetPassword);
router.post('/new-user-Creation', organizationUserCreation);
//users in user creation in users tab
router.get('/:tenantId', getUsersByTenant);
router.get('/roles/:tenantId', getRolesByTenant);

router.get('/organization-details/:id', getBasedIdOrganizations);


// Subdomain management routes
router.post('/check-subdomain', checkSubdomainAvailability);
router.post('/update-subdomain', updateSubdomain);
router.get('/subdomain/:organizationId', getOrganizationSubdomain);
router.post('/activate-subdomain', activateSubdomain);
router.post('/deactivate-subdomain', deactivateSubdomain);
module.exports = router;
