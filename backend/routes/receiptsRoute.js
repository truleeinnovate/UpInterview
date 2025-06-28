const express = require("express");
const ReceiptRouter = express.Router();

const {
  getReceiptsSummary,
  getReceiptById,
} = require("../controllers/receiptsController");

// SUPER ADMIN added by Ashok
ReceiptRouter.get("/:id", getReceiptById);
ReceiptRouter.get("/", getReceiptsSummary);

module.exports = ReceiptRouter;
