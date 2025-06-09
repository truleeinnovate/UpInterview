const express = require("express");
const ReceiptRouter = express.Router();

const { getReceiptsSummary } = require("../controllers/receiptsController");

// SUPER ADMIN added by Ashok
ReceiptRouter.get("/", getReceiptsSummary);

module.exports = ReceiptRouter;
