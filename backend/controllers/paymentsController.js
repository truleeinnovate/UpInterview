// SUPER ADMIN added by Ashok
const Payments = require("../models/Payments");
const mongoose = require("mongoose");

// SUPER ADMIN added by Ashok
const getPaymentsSummary = async (req, res) => {
  try {
    const payments = await Payments.find();

    const totalPayments = payments.length;

    const successfulPayments = payments.filter(
      (p) => p.status === "captured"
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.status === "pending" || p.status === "authorized"
    ).length;
    const failedPayments = payments.filter((p) => p.status === "failed").length;

    res.status(200).json({
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments summary:", error);
    res.status(500).json({ message: "Server error", details: error.message });
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
    console.log("SINGLE PAYMENT ID", id);

    const payment = await Payments.findById(id);
    res.status(200).json(payment);
  } catch (error) {
    console.log("Internal server error:", error.message);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { getPaymentsSummary, getPaymentsById, getSinglePaymentById };
