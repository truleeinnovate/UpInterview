// SUPER ADMIN added by Ashok
const Payments = require("../models/Payments");
const mongoose = require("mongoose");

// SUPER ADMIN - Server-side pagination and filters
const getPaymentsSummary = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = "",
      status = "",
      method = "", // paymentMethod
      gateway = "", // paymentGateway
      startDate = "",
      endDate = "",
      tenantId = "",
      ownerId = "",
      minAmount = "",
      maxAmount = "",
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);
    const limitNum = parseInt(limit);

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { paymentCode: regex },
        { status: regex },
        { paymentMethod: regex },
        { paymentGateway: regex },
        { transactionId: regex },
        { razorpayPaymentId: regex },
        { razorpayOrderId: regex },
      ];
    }

    if (status) query.status = { $in: status.split(",") };
    if (method) query.paymentMethod = { $in: method.split(",") };
    if (gateway) query.paymentGateway = { $in: gateway.split(",") };
    if (tenantId) query.tenantId = tenantId;
    if (ownerId) query.ownerId = ownerId;

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
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    const total = await Payments.countDocuments(query);

    const payments = await Payments.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Stats over filtered set
    const allAgg = await Payments.find(query).select("status").lean();
    const totalPayments = total;
    const successfulPayments = allAgg.filter(
      (p) => p.status === "captured"
    ).length;
    const pendingPayments = allAgg.filter(
      (p) => p.status === "pending" || p.status === "authorized"
    ).length;
    const failedPayments = allAgg.filter((p) => p.status === "failed").length;

    return res.status(200).json({
      data: payments,
      payments, // backward compatibility
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum) || 0,
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
        itemsPerPage: limitNum,
      },
      stats: {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
      },
      status: true,
    });
  } catch (error) {
    console.error("Error fetching payments summary:", error);
    return res
      .status(500)
      .json({ message: "Server error", details: error.message, status: false });
  }
};

const getPaymentsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ownerId format" });
    }

    const payments = await Payments.find({ tenantId: id });

    res.status(200).json({ payments });
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
const getSinglePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payments.findById(id);
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { getPaymentsSummary, getPaymentsById, getSinglePaymentById };
