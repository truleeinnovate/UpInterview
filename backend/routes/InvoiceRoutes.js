const express = require('express');
const { getInvoice } = require('../controllers/InvoiceControllers');
const InvoiceRouter = express.Router();

// Single route for fetching invoices by ownerId or tenantId
InvoiceRouter.get('/get-invoice/:id', getInvoice);

module.exports = InvoiceRouter;