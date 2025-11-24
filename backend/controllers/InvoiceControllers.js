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

    // Generate unique invoice code using centralized utility
    const invoiceCode = await generateUniqueId("INVC", Invoice, "invoiceCode");

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

// SUPER ADMIN - Server-side pagination and filters
const getInvoices = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = "",
      status = "",
      type = "",
      startDate = "", // filter by createdAt lower bound
      endDate = "",
      tenantId = "",
      ownerId = "",
      minAmount = "",
      maxAmount = "",
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build query
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { invoiceCode: regex },
        { planName: regex },
        { type: regex },
        { comments: regex },
      ];
    }

    if (status) {
      query.status = { $in: status.split(",") };
    }

    if (type) {
      query.type = { $in: type.split(",") };
    }

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (ownerId) {
      query.ownerId = ownerId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        query.createdAt.$lte = d;
      }
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = Number(minAmount);
      if (maxAmount) query.totalAmount.$lte = Number(maxAmount);
    }

    const total = await Invoice.countDocuments(query);

    const invoices = await Invoice.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Aggregates calculated across the full filtered set, not only the page
    // For performance, re-run a lean aggregate on the same query
    const allAgg = await Invoice.find(query)
      .select("totalAmount amountPaid outstandingAmount")
      .lean();
    const totalInvoices = total;
    const totalAmount = allAgg.reduce(
      (sum, inv) => sum + (inv.totalAmount || 0),
      0
    );
    const totalPaid = allAgg.reduce(
      (sum, inv) => sum + (inv.amountPaid || 0),
      0
    );
    const totalOutstanding = allAgg.reduce(
      (sum, inv) => sum + (inv.outstandingAmount || 0),
      0
    );
    const collectionRate =
      totalAmount > 0
        ? Number(((totalPaid / totalAmount) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      data: invoices,
      invoices, // backward compatibility
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum) || 0,
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
        itemsPerPage: limitNum,
      },
      stats: {
        totalInvoices,
        totalAmount,
        totalPaid,
        totalOutstanding,
        collectionRate,
      },
      status: true,
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return res.status(500).json({
      error: "Server error",
      details: error.message,
      status: false,
    });
  }
};

const getInvoicesByTenantId = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice.find({ tenantId: id });
    res.status(200).json({
      invoices,
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
    });
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

const getSingleInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// --------------------------------------------------------------->

module.exports = {
  createInvoice,
  getInvoice,
  getInvoices,
  getInvoicesByTenantId,
  getSingleInvoiceById,
};
