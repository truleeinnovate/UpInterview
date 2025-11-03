// SUPER ADMIN added by Ashok

const Receipts = require("../models/Receiptmodels");

// const getReceiptById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const receipt = await Receipts.findById(id);
//     res.status(200).json(receipt);
//   } catch (error) {
//     console.error("Error fetching receipt by id: ", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipts.findById(id).populate({
      path: "invoiceId",
      select: "invoiceCode", // Only fetch invoiceCode
    });

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.status(200).json(receipt);
  } catch (error) {
    console.error("Error fetching receipt by id: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const getReceiptsByTenantId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const receipts = await Receipts.find({ tenantId: id });
//     res.status(200).json({ receipts });
//   } catch (error) {
//     console.error("Error fetching receipt by id: ", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const getReceiptsSummary = async (req, res) => {
//   try {
//     const receipts = await Receipts.find();

//     const totalReceipts = receipts.length;
//     const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
//     const totalDiscount = receipts.reduce(
//       (sum, r) => sum + (r.discount || 0),
//       0
//     );

//     const successfulReceipts = receipts.filter(
//       (r) => r.status === "success"
//     ).length;
//     const successRate =
//       totalReceipts > 0
//         ? Number(((successfulReceipts / totalReceipts) * 100).toFixed(2))
//         : 0;

//     res.status(200).json({
//       totalReceipts,
//       totalAmount,
//       totalDiscount,
//       successRate, // as number (e.g., 85.71)
//       receipts,
//     });
//   } catch (error) {
//     console.error("Error fetching receipt summary:", error);
//     res.status(500).json({ message: "Server error", details: error.message });
//   }
// };
const getReceiptsByTenantId = async (req, res) => {
  try {
    const { id } = req.params;

    const receipts = await Receipts.find({ tenantId: id }).populate({
      path: "invoiceId",
      select: "invoiceCode", // Only fetch invoiceCode from Invoice
    });

    res.status(200).json({ receipts });
  } catch (error) {
    console.error("Error fetching receipt by id: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getReceiptsSummary = async (req, res) => {
  try {
    const receipts = await Receipts.find().sort({ _id: -1}).populate({
      path: "invoiceId",
      select: "invoiceCode", // Only fetch invoiceCode to keep it lean
    }).lean();

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
      receipts, // Each receipt now includes invoiceId.invoiceCode
    });
  } catch (error) {
    console.error("Error fetching receipt summary:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

module.exports = { getReceiptsSummary, getReceiptById, getReceiptsByTenantId };
