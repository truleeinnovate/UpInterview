// controllers/outsourceInterviewerController.js
// v1.0.1  -  Venkatesh   -  Updated to save rating in both OutsourceInterviewer and Contacts collections

const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { Contacts } = require("../models/Contacts.js");

exports.getAllInterviewers = async (req, res) => {
  try {
    const hasPaginationParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "status" in req.query;

    if (!hasPaginationParams) {
      const interviewers = await OutsourceInterviewer.find().populate({
        path: "contactId",
        populate: {
          path: "availability",
          model: "InterviewAvailability",
        },
      });
      return res.status(200).json(interviewers);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();

    const statusValues = statusParam
      ? statusParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const pipeline = [
      {
        $lookup: {
          from: "contacts",
          localField: "contactId",
          foreignField: "_id",
          as: "contact",
        },
      },
      { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
    ];

    const match = {};
    if (statusValues.length > 0) {
      match.status = { $in: statusValues };
    }
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { outsourceRequestCode: { $regex: regex } },
        { "contact.firstName": { $regex: regex } },
        { "contact.lastName": { $regex: regex } },
        { "contact.email": { $regex: regex } },
        { "contact.phone": { $regex: regex } },
        { "contact.skills": { $regex: regex } },
      ];
    }
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { _id: -1 } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: page * limit },
          { $limit: limit },
          { $addFields: { contactId: "$contact" } },
          { $project: { contact: 0 } },
        ],
        totalCount: [{ $count: "count" }],
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    });

    const result = await OutsourceInterviewer.aggregate(pipeline);
    const agg = result?.[0] || { data: [], totalCount: [], statusCounts: [] };
    const totalItems = agg.totalCount?.[0]?.count || 0;
    const data = agg.data || [];
    const statsMap = (agg.statusCounts || []).reduce((acc, cur) => {
      if (cur && cur._id) acc[cur._id] = cur.count || 0;
      return acc;
    }, {});
    const stats = {
      new: statsMap.new || 0,
      underReview: statsMap.underReview || 0,
      approved: statsMap.approved || 0,
      rejected: statsMap.rejected || 0,
      suspended: statsMap.suspended || 0,
    };

    return res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
      stats,
      status: true,
    });
  } catch (error) {
    console.error("❌ Detailed error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: "Error fetching outsource interviewers",
      error: error.message,
    });
  }
};

exports.updateInterviewerFeedback = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Outsource Interviewer Feedback";

  try {
    const { contactId, givenBy, status, rating, comments } = req.body;

    if (!contactId) {
      return res
        .status(400)
        .json({ success: false, message: "Contact ID is required" });
    }

    // Validate status value if provided
    if (status) {
      const validStatuses = [
        "new",
        "underReview",
        "approved",
        "rejected",
        "suspended",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }
    }

    // v1.0.1 - Validate rating if provided (0 to 10 with decimal support)
    let validatedRating = null;
    if (rating !== undefined && rating !== null && rating !== "") {
      const numRating = parseFloat(rating);
      if (isNaN(numRating) || numRating < 0 || numRating > 10) {
        return res.status(400).json({
          success: false,
          message: "Invalid rating. Must be a number between 0 and 10",
        });
      }
      // Round to 1 decimal place
      validatedRating = Math.round(numRating * 10) / 10;
    }

    // Find and update the interviewer based on contactId
    const updatedInterviewer = await OutsourceInterviewer.findOneAndUpdate(
      { contactId: contactId },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
          feedback: {
            givenBy: givenBy || null,
            rating: validatedRating, // v1.0.1 - Use validated rating
            comments: comments || null,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedInterviewer) {
      return res
        .status(404)
        .json({ success: false, message: "Interviewer not found" });
    }

    // v1.0.1 - Update both status AND rating in Contact
    const contactUpdateFields = {
      updatedAt: new Date(),
    };

    if (status) {
      contactUpdateFields.status = status;
    }

    if (validatedRating !== null) {
      contactUpdateFields.rating = validatedRating;
    }

    // Update Contact only if there's something to update
    if (status || validatedRating !== null) {
      const updatedContact = await Contacts.findByIdAndUpdate(
        contactId,
        { $set: contactUpdateFields },
        { new: true }
      );
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: updatedInterviewer.ownerId?.toString() || req.body?.ownerId || "",
      processName: "Update Outsource Interviewer Feedback",
      requestBody: req.body,
      status: "success",
      message: "Outsource interviewer feedback updated successfully",
      responseBody: updatedInterviewer,
    };

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedInterviewer,
    });
  } catch (error) {
    console.error("❌ Error updating interviewer feedback:", error);

    res.locals.logData = {
      tenantId: "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Outsource Interviewer Feedback",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: "Server error while updating feedback",
      error: error.message,
    });
  }
};

// SUPER ADMIN added by Ashok -------------------------------------------->
exports.getAllOutsourceInterviewers = async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Count total
    const totalInterviewers = await OutsourceInterviewer.countDocuments();

    // Count added this month
    const thisMonth = await OutsourceInterviewer.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });

    // Count added last month
    const lastMonth = await OutsourceInterviewer.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    // Calculate trend
    let trend = "neutral";
    let trendValue = "0%";

    if (lastMonth > 0) {
      const change = ((thisMonth - lastMonth) / lastMonth) * 100;
      trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (thisMonth > 0) {
      trend = "up";
      trendValue = "+100%";
    }

    return res.status(200).json({
      metric: {
        title: "Outsource Interviewers",
        value: totalInterviewers.toLocaleString(),
        description: "Active freelance interviews",
        trend,
        trendValue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// exports.getSingleOutsourceInterviewer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const interviewer = await OutsourceInterviewer.findById(id);
//     return res.status(200).json(interviewer);
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// ----------------------------------------------------------------------->

//in individual home to show status of outsource request

exports.getOutsourceStatus = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required",
      });
    }

    // Find the document by ownerId
    const interviewer = await OutsourceInterviewer.findOne({ ownerId })
      .select("status")
      .lean();

    if (!interviewer) {
      return res.json({ status: null });
    }

    const dbStatus = interviewer.status?.toLowerCase();

    // Map DB enum → frontend expected value
    const statusMap = {
      new: null, // No active request
      underreview: "underReview",
      approved: "approved",
      rejected: "rejected",
      suspended: "suspended",
    };

    const normalizedStatus = statusMap[dbStatus] ?? null;

    res.json({ status: normalizedStatus });
  } catch (error) {
    console.error("Error in getOutsourceStatus:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
