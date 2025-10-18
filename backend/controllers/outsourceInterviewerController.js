// controllers/outsourceInterviewerController.js
// v1.0.1  -  Venkatesh   -  Updated to save rating in both OutsourceInterviewer and Contacts collections

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

    // v1.0.1 - Validate rating if provided (0 to 10 with decimal support)
    let validatedRating = null;
    if (rating !== undefined && rating !== null && rating !== '') {
      const numRating = parseFloat(rating);
      if (isNaN(numRating) || numRating < 0 || numRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rating. Must be a number between 0 and 10'
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
            rating: validatedRating,  // v1.0.1 - Use validated rating
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
      updatedAt: new Date()
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

      console.log(`✅ Contact ${contactId} updated:`, {
        status: status || 'unchanged',
        rating: validatedRating !== null ? validatedRating : 'unchanged'
      });
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
