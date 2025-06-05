const express = require("express");
const PaymentsRouter = express.Router();

const { getPaymentsSummary } = require("../controllers/paymentsController");

// SUPER ADMIN
PaymentsRouter.get("/", getPaymentsSummary);

module.exports = PaymentsRouter;
