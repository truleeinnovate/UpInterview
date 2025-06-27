const express = require("express");
const {
  getInvoice,
  getInvoices, // SUPER ADMIN added by Ashok
} = require("../controllers/InvoiceControllers");
const InvoiceRouter = express.Router();

// Single route for fetching invoices by ownerId or tenantId
InvoiceRouter.get("/get-invoice/:id", getInvoice);

// SUPER ADMIN added by Ashok ---------------------------------
InvoiceRouter.get("/", getInvoices);
// ------------------------------------------------------------

module.exports = InvoiceRouter;
