const express = require('express');
const { login, validate } = require('../controllers/authController.js');

const router = express.Router();

router.post('/login', login);
router.get('/validate', validate);

module.exports = router;