const express = require('express');
const { InvoiceController ,Get_Invoice_Controllers, getInvoiceBasedonId }  = require("../controllers/InvoiceControllers.js");

const InvoiceRouter = express.Router();


// Invoice routes
InvoiceRouter.post("/invoices", InvoiceController);

InvoiceRouter.get('/all-invoices',Get_Invoice_Controllers);

InvoiceRouter.get('/get-invoice-id/:ownerId', getInvoiceBasedonId);

module.exports = InvoiceRouter;