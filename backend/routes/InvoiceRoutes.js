const express = require("express");
const InvoiceRouter = express.Router();

const {
  getInvoiceById,
  getInvoices,
  getSingleInvoice,
} = require("../controllers/InvoiceControllers");

InvoiceRouter.get("/:id", getSingleInvoice);

InvoiceRouter.get("/:ownerId", getInvoiceById);

// SUPER ADMIN added by Ashok
InvoiceRouter.get("/", getInvoices);

module.exports = InvoiceRouter;
