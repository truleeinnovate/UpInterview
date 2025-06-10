const express = require("express");
const PaymentsRouter = express.Router();

const {
  getPaymentsSummary,
  getPaymentById,
  getSinglePaymentById,
} = require("../controllers/paymentsController");

PaymentsRouter.get("/:id", getPaymentById);

// SUPER ADMIN added by Ashok
PaymentsRouter.get("/:id", getSinglePaymentById);

PaymentsRouter.get("/", getPaymentsSummary);

module.exports = PaymentsRouter;
