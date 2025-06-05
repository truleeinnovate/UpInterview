const Payments = require("../models/Payments");

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

module.exports = { getPaymentsSummary };
