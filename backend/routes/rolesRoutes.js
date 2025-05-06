const { saveRole, getRolesByOrganization, updateRole } = require('../controllers/rolesController');

const router = require('express').Router();

router.post('/rolesdata', saveRole);
router.get('/rolesdata', getRolesByOrganization); 
router.patch('/rolesdata/:id', updateRole);

module.exports = router;


