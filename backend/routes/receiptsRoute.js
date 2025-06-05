const express = require("express");
const ReceiptRouter = express.Router();

const { getReceiptsSummary } = require("../controllers/receiptsController");

// SUPER ADMIN
ReceiptRouter.get("/", getReceiptsSummary);

module.exports = ReceiptRouter;
