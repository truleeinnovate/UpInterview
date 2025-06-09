const express = require("express");
const PaymentsRouter = express.Router();

const {
  getPaymentsSummary,
  getPaymentById,
} = require("../controllers/paymentsController");

PaymentsRouter.get("/:id", getPaymentById);

// SUPER ADMIN added by Ashok
PaymentsRouter.get("/", getPaymentsSummary);

module.exports = PaymentsRouter;
