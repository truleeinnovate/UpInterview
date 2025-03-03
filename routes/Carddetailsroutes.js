// routes/paymentRoutes.js
const express = require('express');
const Cardrouter = express.Router();
const { submitPaymentDetails,getallPaymentDetails } = require('../controllers/Carddetailscontrollers.js');

Cardrouter.post('/payment/submit', submitPaymentDetails);

Cardrouter.post('/get-card-details',getallPaymentDetails)

module.exports = Cardrouter;
