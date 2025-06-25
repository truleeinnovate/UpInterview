const Invoice = require("../models/Invoicemodels.js");
const mongoose = require("mongoose");

// GET: Fetch invoices by ownerId or tenantId based on isOrganization query param
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOrganization } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const queryField = isOrganization === "true" ? "tenantId" : "ownerId";
    const invoices = await Invoice.find({ [queryField]: id })
      .populate("planId")
      .populate("ownerId");

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({
        message: `No invoices found for this ${
          queryField === "tenantId" ? "tenant" : "owner"
        }.`,
      });
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

const createInvoice = async (req, res) => {
  try {
    const {
      tenantId,
      ownerId,
      planId,
      planName,
      type,
      price,
      discount = 0,
      totalAmount,
      amountPaid = 0,
      relatedObjectId,
      metadata,
      dueDate,
      startDate,
      endDate,
      lineItems,
      comments,
    } = req.body;

    // Basic required field validation
    if (
      !ownerId ||
      !type ||
      !totalAmount ||
      !lineItems ||
      !Array.isArray(lineItems)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate next invoiceCode like INVC-00001
    const lastInvoice = await Invoice.findOne({})
      .sort({ _id: -1 })
      .select("invoiceCode")
      .lean();

    let nextNumber = 1;
    if (lastInvoice?.invoiceCode) {
      const match = lastInvoice.invoiceCode.match(/INV-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceCode = `INVC-${String(nextNumber).padStart(5, "0")}`;

    // Calculate outstandingAmount if not given
    const calculatedOutstanding = totalAmount - amountPaid;

    // Create invoice document
    const newInvoice = new Invoice({
      tenantId,
      ownerId,
      planId,
      planName,
      type,
      price,
      discount,
      totalAmount,
      amountPaid,
      outstandingAmount: calculatedOutstanding,
      relatedObjectId,
      metadata,
      dueDate,
      startDate,
      endDate,
      lineItems,
      invoiceCode,
      comments,
      status:
        amountPaid >= totalAmount
          ? "paid"
          : amountPaid > 0
          ? "partially_paid"
          : "pending",
    });

    await newInvoice.save();

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res.status(500).json({ error: "Failed to create invoice" });
  }
};

module.exports = { createInvoice, getInvoice };
