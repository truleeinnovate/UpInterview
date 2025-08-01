const express = require("express");
const ReceiptRouter = express.Router();

const {
  getReceiptsSummary,
  getReceiptById,
  getReceiptsByTenantId,
} = require("../controllers/receiptsController");

// SUPER ADMIN added by Ashok
ReceiptRouter.get("/receipt/:id", getReceiptById);
ReceiptRouter.get("/:id", getReceiptsByTenantId);
ReceiptRouter.get("/", getReceiptsSummary);

module.exports = ReceiptRouter;
