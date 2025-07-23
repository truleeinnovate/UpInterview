const SupportUser = require("../models/SupportUser");

exports.createTicket = async (req, res) => {
  try {
    console.log("Received ticket creation request body:", req.body);
    const {
      issueType,
      description,
      status,
      contact,
      priority,
      ownerId,
      tenantId,
      organization,
      createdByUserId,
    } = req.body;
    if (!issueType) {
      return res.status(400).send({ message: "Issue type is required" });
    }
    if (!description) {
      return res.status(400).send({ message: "Description is required" });
    }
    if (!contact) {
      return res.status(400).send({ message: "Contact is required" });
    }
    if (organization && !organization) {
      return res
        .status(400)
        .send({
          message: "Organization is required when organization flag is true",
        });
    }
    const lastTicket = await SupportUser.findOne({})
      .sort({ _id: -1 })
      .select("ticketCode")
      .lean();
    let nextNumber = 1;
    if (lastTicket && lastTicket.ticketCode) {
      const match = lastTicket.ticketCode.match(/SPT-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const ticketCode = `SPT-${String(nextNumber).padStart(5, "0")}`;
    const ticket = await SupportUser.create({
      issueType,
      description,
      status,
      contact,
      priority,
      ownerId,
      tenantId,
      organization,
      createdByUserId,
      ticketCode,
    });
    return res.status(201).send({
      message: "Ticket created successfully",
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).send({
      message: "Failed to create ticket",
      success: false,
      error: error.message, // Sending error.message for better debugging
    });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const tickets = await SupportUser.find();
    return res.status(200).send({
      success: true,
      message: "Tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.log("Error retrieving tickets:", error);
    return res.status(500).send({
      success: false,
      message: "Failed to retrieve tickets",
      error,
    });
  }
};

exports.getTicketBasedonId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "ticket id is required" });
    }
    const ticket = await SupportUser.findById({ _id: id });
    return res.status(200).send({
      message: "Ticket retrieved successfully",
      ticket,
      ticket,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Failed to get ticket based on id",
      success: false,
      error,
    });
  }
};

exports.updateTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { issueType, description, assignedTo, assignedToId } = req.body;
    const ticket = await SupportUser.findByIdAndUpdate(
      { _id: id },
      {
        issueType,
        description,
        assignedTo,
        assignedToId,
      }
    );

    return res.status(200).send({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Failed to updated ticket based on id",
      error,
      success: false,
    });
  }
};

// Update ticket status
exports.updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, userComment, user, updatedByUserId, notifyUser } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const ticket = await SupportUser.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Update ticket fields
    ticket.status = status;
    ticket.updatedByUserId = updatedByUserId;
    //console.log("updatedByUserId----", updatedByUserId);
    //console.log("user-----", user)

    // Add to status history
    ticket.statusHistory.unshift({
      notifyUser,
      status,
      date: new Date(),
      user: user || "Unknown",
      comment: comment || "",
      userComment: userComment || "",
    });

    const updatedTicket = await ticket.save();
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ error: error.message });
  }
};

// <------ SUPER ADMIN added by Ashok ------------------------>
exports.getAllTickets = async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Count total tickets
    const totalTickets = await SupportUser.countDocuments();

    // Count SupportUsers created this month
    const SupportUsersThisMonth = await SupportUser.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });

    // Count SupportUsers created last month
    const SupportUsersLastMonth = await SupportUser.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    // Calculate trend
    let trend = "neutral";
    let trendValue = "0%";

    if (SupportUsersLastMonth > 0) {
      const change =
        ((SupportUsersThisMonth - SupportUsersLastMonth) /
          SupportUsersLastMonth) *
        100;
      trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (SupportUsersThisMonth > 0) {
      trend = "up";
      trendValue = "+100%";
    }

    return res.status(200).json({
      metric: {
        title: "Support Tickets",
        value: totalTickets.toLocaleString(),
        description: "Unresolved tickets",
        trend,
        trendValue,
      },
    });
  } catch (error) {
    console.error("Error in get all tickets metric:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getTicketSummary = async (req, res) => {
  try {
    const tickets = await SupportUser.find();

    const allTickets = tickets.length;
    const openTickets = tickets.filter(
      (ticket) => ticket.status === "New"
    ).length;
    const inProgressTickets = tickets.filter(
      (ticket) => ticket.status === "In Progress"
    ).length;
    const pendingTickets = tickets.filter(
      (ticket) => ticket.status === "Pending"
    ).length;
    const highPriorityTickets = tickets.filter(
      (ticket) => ticket.priority === "High"
    ).length;

    res.status(200).json({
      allTickets,
      openTickets,
      inProgressTickets,
      pendingTickets,
      highPriorityTickets,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching ticket summary:", error);
    res.status(500).json({
      message: "Server error while fetching ticket summary",
      details: error.message,
    });
  }
};
// ------------------------------------------------------------>
