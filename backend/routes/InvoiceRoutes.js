const express = require('express');
const { getInvoiceById } = require('../controllers/InvoiceControllers');
const InvoiceRouter = express.Router();

InvoiceRouter.get('/:ownerId',getInvoiceById);

module.exports = InvoiceRouter;