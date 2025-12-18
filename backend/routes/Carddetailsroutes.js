// routes/paymentRoutes.js;
const express = require('express');
const Cardrouter = express.Router();
const { submitPaymentDetails,getallPaymentDetails } = require('../controllers/Carddetailscontrollers.js');
const loggingService = require('../middleware/loggingService.js');

Cardrouter.post(
  '/payment/submit',
  loggingService.internalLoggingMiddleware,
  submitPaymentDetails
);

Cardrouter.post('/get-card-details',getallPaymentDetails);

module.exports = Cardrouter;