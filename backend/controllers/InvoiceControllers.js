const Invoice = require("../models/Invoicemodels.js");
const mongoose = require("mongoose");
// GET: Fetch invoices by ownerId
// router.get('/get-invoice-by-owner/:ownerId',

const getInvoiceById = async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: "Invalid ownerId format" });
    }

    const invoices = await Invoice.find({ ownerId })
      .populate("planId")
      .populate("ownerId");

    if (!invoices || invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "No invoices found for this owner." });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

// SUPER ADMIN added by Ashok
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    // Calculate aggregates
    const totalInvoices = invoices.length;

    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0
    );
    const totalPaid = invoices.reduce(
      (sum, invoice) => sum + (invoice.amountPaid || 0),
      0
    );
    const totalOutstanding = invoices.reduce(
      (sum, invoice) => sum + (invoice.outstandingAmount || 0),
      0
    );

    // Avoid division by zero
    const collectionRate =
      totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(2) : "0.00";

    res.status(200).json({
      totalInvoices,
      totalAmount,
      totalOutstanding,
      collectionRate: `${collectionRate}%`,
      invoices,
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

module.exports = { getInvoiceById, getInvoices };
