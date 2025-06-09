const express = require("express");
const InvoiceRouter = express.Router();

const {
  getInvoiceById,
  getInvoices,
} = require("../controllers/InvoiceControllers");

InvoiceRouter.get("/:ownerId", getInvoiceById);

// SUPER ADMIN added by Ashok
InvoiceRouter.get("/", getInvoices);

module.exports = InvoiceRouter;
