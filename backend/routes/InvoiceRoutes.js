const express = require("express");
const InvoiceRouter = express.Router();

const {
  getInvoiceById,
  getInvoices,
} = require("../controllers/InvoiceControllers");

// SUPER ADMIN
InvoiceRouter.get("/", getInvoices);

InvoiceRouter.get("/:ownerId", getInvoiceById);

module.exports = InvoiceRouter;
