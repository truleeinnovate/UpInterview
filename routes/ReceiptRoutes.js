const express = require('express');
const { createReceiptControllers, generateReceiptControllers } = require('../controllers/ReceiptControllers.js');

const ReceiptRoutes = express.Router();

ReceiptRoutes.post('/receipts', createReceiptControllers); 

ReceiptRoutes.get("/receipts-data",generateReceiptControllers)

module.exports = ReceiptRoutes;