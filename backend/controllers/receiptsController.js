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
    const {
      page = 0,
      limit = 10,
      search = "",
      status = "",
      method = "", // paymentMethod
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
        { receiptCode: regex },
        { paymentMethod: regex },
        { status: regex },
        { transactionId: regex },
      ];
    }

    if (status) query.status = { $in: status.split(",") };
    if (method) query.paymentMethod = { $in: method.split(",") };
    if (tenantId) query.tenantId = tenantId;
    if (ownerId) query.ownerId = ownerId;

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = d;
      }
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    const total = await Receipts.countDocuments(query);

    const receipts = await Receipts.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({ path: "invoiceId", select: "invoiceCode" })
      .lean();

    // Stats over filtered set
    const allAgg = await Receipts.find(query).select("amount discount status").lean();
    const totalReceipts = total;
    const totalAmount = allAgg.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalDiscount = allAgg.reduce((sum, r) => sum + (r.discount || 0), 0);
    const successfulReceipts = allAgg.filter((r) => r.status === "success").length;
    const successRate = totalReceipts > 0 ? Number(((successfulReceipts / totalReceipts) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      data: receipts,
      receipts, // backward compatibility
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum) || 0,
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
        itemsPerPage: limitNum,
      },
      stats: {
        totalReceipts,
        totalAmount,
        totalDiscount,
        successRate,
      },
      status: true,
    });
  } catch (error) {
    console.error("Error fetching receipt summary:", error);
    return res.status(500).json({ message: "Server error", details: error.message, status: false });
  }
};

module.exports = { getReceiptsSummary, getReceiptById, getReceiptsByTenantId };
