// SUPER ADMIN added by Ashok

const Receipts = require("../models/Receiptmodels");

const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await Receipts.findById(id);
    res.status(200).json(receipt);
  } catch (error) {
    console.error("Error fetching receipt by id: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getReceiptsSummary = async (req, res) => {
  try {
    const receipts = await Receipts.find();

    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalDiscount = receipts.reduce(
      (sum, r) => sum + (r.discount || 0),
      0
    );

    const successfulReceipts = receipts.filter(
      (r) => r.status === "success"
    ).length;
    const successRate =
      totalReceipts > 0
        ? Number(((successfulReceipts / totalReceipts) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      totalReceipts,
      totalAmount,
      totalDiscount,
      successRate, // as number (e.g., 85.71)
      receipts,
    });
  } catch (error) {
    console.error("Error fetching receipt summary:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

module.exports = { getReceiptsSummary, getReceiptById };
