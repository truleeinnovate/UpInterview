// const express = require('express');
// const router = express.Router();
// const { 
//     // registerOrganization, 
//     loginOrganization,
//     saveEmailToDatabase
//  } = require('../controllers/organizationLoginController');

// // router.post('/Signup', registerOrganization);
// router.post('/Login', loginOrganization);
// router.post('/Login1', saveEmailToDatabase);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { saveEmailToDatabase } = require('../controllers/organizationLoginController'); // Ensure correct path

router.post('/', saveEmailToDatabase); // Ensure function exists

module.exports = router;
