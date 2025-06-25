const { saveRole, getRolesByOrganization, updateRole, getAllRoles } = require('../controllers/rolesController');

const router = require('express').Router();

router.post('/rolesdata', saveRole);
router.get('/rolesdata', getRolesByOrganization); 
router.patch('/rolesdata/:id', updateRole);

router.get('/getAllRoles',getAllRoles)

module.exports = router;


