// controllers/outsourceInterviewerController.js

const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { Contacts } = require("../models/Contacts.js");

exports.getAllInterviewers = async (req, res) => {
  try {
    const interviewers = await OutsourceInterviewer.find().populate({
      path: "contactId",
      populate: {
        path: "availability",
        model: "InterviewAvailability",
      },
    });

    res.status(200).json(interviewers);
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
  try {
    const { contactId, givenBy, status, rating, comments } = req.body;

    if (!contactId) {
      return res
        .status(400)
        .json({ success: false, message: "Contact ID is required" });
    }

    // Validate status value if provided
    if (status) {
      const validStatuses = ["new",
        "underReview",
        "approved",
        "rejected",
        "suspended",];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
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
            rating: rating || null,
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

    // If status was updated, also update the Contact status
    if (status) {
      const updatedContact = await Contacts.findByIdAndUpdate(
        contactId,
        {
          $set: {
            status: status,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      console.log(`✅ Status synced for Contact ${contactId}: ${status}`);
    }

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedInterviewer,
    });
  } catch (error) {
    console.error("❌ Error updating interviewer feedback:", error);
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
    console.log("Error in get outsource interviews:", error.message);
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
//     console.log("Error in get outsource interviews:", error.message);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// ----------------------------------------------------------------------->
