// v1.0.0 - Ashraf - Added subject field
//<----v1.0.1----Venkatesh----add validation

const SupportUser = require("../models/SupportUser");
//<----v1.0.1----
const mongoose = require("mongoose");
const {
  validateCreateSupportTicket,
  validateUpdateSupportTicket,
  validateStatusUpdate,
} = require("../validations/supportUserValidation");
//----v1.0.1---->

const { hasPermission } = require("../middleware/permissionMiddleware");


exports.createTicket = async (req, res) => {
  try {
    console.log("Received ticket creation request body:", req.body);
    const {
      issueType,
      description,
// v1.0.0 <----------------------------------------------------
      
      subject,
// v1.0.0 --------------------------------------------->

      status,
      contact,
      priority,
      ownerId,
      tenantId,
      organization,
      createdByUserId,
    } = req.body;
    //<----v1.0.1----
    // Joi validation (mirrors frontend rules)
    const { errors, isValid } = validateCreateSupportTicket(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
      //----v1.0.1---->
    }
    
    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
    await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Create') ||
    await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Create')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Create permission' });
    }
    //-----v1.0.1--->


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
      // v1.0.0 <----------------------------------------------------
      subject,
      // v1.0.0 --------------------------------------------->

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
    return res.status(500).json({
      message: "Failed to create ticket",
      errors: { general: error.message },
    });
  }
};

exports.getTicket = async (req, res) => {
  try {

    res.locals.loggedByController = true;
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
    await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
    await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.View permission' });
    }
    //-----v1.0.1--->

    const tickets = await SupportUser.find().sort({ _id: -1 }).lean();
    return res.status(200).send({
      success: true,
      message: "Tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.log("Error retrieving tickets:", error);
    return res.status(500).json({
      message: "Failed to retrieve tickets",
      errors: { general: error.message },
    });
  }
};

exports.getTicketBasedonId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
     //<----v1.0.1----
      return res
        .status(400)
        .json({ message: "Validation failed", errors: { id: "Ticket id is required" } });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: { id: "Invalid ticket id" } });
    }

    res.locals.loggedByController = true;
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
    await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
    await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.View permission' });
    }
    //-----v1.0.1--->

    const ticket = await SupportUser.findById(id);
    if (!ticket) {
      return res.status(404).send({ message: "Ticket not found" });
    }
    //----v1.0.1---->
    return res.status(200).send({
      message: "Ticket retrieved successfully",
      ticket,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get ticket based on id",
      errors: { general: error.message },
    });
  }
};

exports.updateTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    // v1.0.0 <----------------------------------------------------
    const { issueType, description, subject, assignedTo, assignedToId } = req.body;
    // v1.0.0 --------------------------------------------->
   //<----v1.0.1----
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: { id: "Invalid ticket id" } });
    }
    const { errors, isValid } = validateUpdateSupportTicket(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    //----v1.0.1---->

    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
      await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Edit') ||
      await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Edit')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Edit permission' });
    }
    //-----v1.0.1--->

    const ticket = await SupportUser.findByIdAndUpdate(
      id,
      {
        issueType,
        description,
        // v1.0.0 <----------------------------------------------------
        subject,
        // v1.0.0 --------------------------------------------->
        assignedTo,
        assignedToId,
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).send({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update ticket",
      errors: { general: error.message },
    });
  }
};

// Update ticket status
exports.updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, userComment, user, updatedByUserId, notifyUser } = req.body;
    
    //<----v1.0.1----
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: { id: "Invalid ticket id" } });
    }
    const { errors, isValid } = validateStatusUpdate(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    //----v1.0.1---->

    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
      await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Edit') ||
     await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Edit')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Edit permission' });
    }
    //-----v1.0.1--->

    const ticket = await SupportUser.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
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
    return res.status(500).json({
      message: "Failed to update ticket",
      errors: { general: error.message },
    });
  }
};

// <------ SUPER ADMIN added by Ashok ------------------------>
exports.getAllTickets = async (req, res) => {
  try {
    res.locals.loggedByController = true;
    //console.log("effectivePermissions",res.locals?.effectivePermissions)
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    const canCreate =
      await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
      await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
    if (!canCreate) {
      return res.status(403).json({ message: 'Forbidden: missing SupportDesk.ViewTab permission' });
    }
    //-----v1.0.1--->


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
      errors: { general: error.message },
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
      errors: { general: error.message },
    });
  }
};
// ------------------------------------------------------------>
