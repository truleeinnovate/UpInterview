
// SUPER ADMIN added by Ashok
const express = require("express");
const PaymentsRouter = express.Router();

const {
  getPaymentsSummary,
  getPaymentsById,
  getSinglePaymentById,
} = require("../controllers/paymentsController");

PaymentsRouter.get("/:id", getPaymentsById);

PaymentsRouter.get("/:paymentId", getSinglePaymentById);

PaymentsRouter.get("/", getPaymentsSummary);

module.exports = PaymentsRouter;
