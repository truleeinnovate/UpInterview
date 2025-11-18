// v1.0.0 - Ashraf - Added subject field
//<----v1.0.1----Venkatesh----add validation
const supportNotif = require('./PushNotificationControllers/pushNotificationSupportUserController');
const SupportUser = require("../models/SupportUser");
const { generateUniqueId } = require('../services/uniqueIdGeneratorService');
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
  res.locals.loggedByController = true;
  res.locals.processName = "Create Ticket";
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
    // const canCreate =
    // await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Create') ||
    // await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Create')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Create permission' });
    // }
    //-----v1.0.1--->


    // Generate ticket code using centralized service
    const ticketCode = await generateUniqueId('SPT', SupportUser, 'ticketCode');
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

    await supportNotif.notifyOnTicketCreated(ticket);

    // Feed and log data
    res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: "info",
      action: {
        name: "ticket_created",
        description: `Ticket was created`,
      },
      ownerId: req.body.ownerId,
      parentId: ticket._id,
      parentObject: "Ticket",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      message: `Ticket was created successfully`,
    };

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Ticket",
      requestBody: req.body,
      status: "success",
      message: "Ticket created successfully",
      responseBody: ticket,
    };



    return res.status(201).send({
      message: "Ticket created successfully",
      status: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Ticket Position",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };


    return res.status(500).json({
      message: "Failed to create ticket",
      errors: { general: error.message },
    });
  }
};

// exports.getTicket = async (req, res) => {
//   try {



//     // res.locals.loggedByController = true;
//     // //<-----v1.0.1---
//     // // Permission: Tasks.Create (or super admin override)
//     // const canCreate =
//     // await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
//     // await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
//     // if (!canCreate) {
//     //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.View permission' });
//     // }
//     //-----v1.0.1--->

//     const tickets = await SupportUser.find().sort({ _id: -1 }).lean();
//     return res.status(200).send({
//       success: true,
//       message: "Tickets retrieved successfully",
//       tickets,
//     });
//   } catch (error) {
//     console.log("Error retrieving tickets:", error);
//     return res.status(500).json({
//       message: "Failed to retrieve tickets",
//       errors: { general: error.message },
//     });
//   }
// };


// Backend API should accept these query parameters:
// - search: string (search in ticketCode, contact, subject)
// - status: string[] (multiple status values)
// - issueType: string[] (multiple issue type values)
// - priority: string[] (multiple priority values)
// - createdDate: string ('last7', 'last30')
// - page: number
// - limit: number
// - tenantId: string
// - userId: string
// - organization: string



exports.getTicket = async (req, res) => {
  try {
    const {
      search = "",
      status = [],
      issueTypes = [],
      priorities = [],
      createdDate = "",
      page = 0,
      limit = 10,
      tenantId,
      organization,
      userId,
      userRole,
      impersonatedUser_roleName,
    } = req.query;


       /* ============================================================
       EXACT ROLE FILTER LOGIC (1:1 with your previous conditions)
    ============================================================ */
    const query = {};

    // Super Admin & Support Team → full access (no restrictions)
    if (impersonatedUser_roleName === "Super_Admin" || impersonatedUser_roleName === "Support_Team") {
      // unrestricted → no filters applied
    }

    // No user role → return empty
    else if (!userRole) {
      query._id = null;
    }

    // No organization
    else if (!organization) {
      if (userRole === "Admin" && userId) {
        query.ownerId = userId;
      }
    }

    // Organization exists
    else {
      if (userRole === "Admin" && tenantId) {
        query.tenantId = tenantId;
      }
    }

    // Individual user → always restrict to own tickets (overrides all above)
    if (userRole === "Individual" && userId) {
      query.ownerId = userId;
    }

    // console.log("query---", query)


    // const query = {};

    // /* --------------------------------------------------------------------- */
    // /*  🧠 Role-based filtering                                               */
    // /* --------------------------------------------------------------------- */
    // if (impersonatedUser_roleName === "Super_Admin" || impersonatedUser_roleName === "Support_Team") {
    //   // unrestricted
    // } else if (!userRole) {
    //   query._id = null;
    // } else if (!organization) {
    //   if (userRole === "Admin" && userId) {
    //     query.ownerId = userId;
    //   }
    // } else {
    //   if (userRole === "Admin" && tenantId) {
    //     query.tenantId = tenantId;
    //   }
    // }

    // if (userRole === "Individual" && userId) {
    //   query.ownerId = userId;
    // }

    /* --------------------------------------------------------------------- */
    /*  🔍 Search filter (combined, additive)                                 */
    /* --------------------------------------------------------------------- */
    const searchConditions = [];
    if (search && search.trim() !== "") {
      const trimmed = search.trim();
      searchConditions.push({
        $or: [
          { ticketCode: { $regex: trimmed, $options: "i" } },
          { contact: { $regex: trimmed, $options: "i" } },
          { subject: { $regex: trimmed, $options: "i" } },
          { issueType: { $regex: trimmed, $options: "i" } },
          { priority: { $regex: trimmed, $options: "i" } },
        ],
      });
    }

    /* --------------------------------------------------------------------- */
    /*  🧩 Other filters                                                      */
    /* --------------------------------------------------------------------- */
    if (Array.isArray(status) && status.length > 0) {
      query.status = { $in: status };
    } else if (typeof status === "string" && status) {
      query.status = { $in: status.split(",") };
    }

    if (Array.isArray(issueTypes) && issueTypes.length > 0) {
      query.issueType = { $in: issueTypes };
    } else if (typeof issueTypes === "string" && issueTypes) {
      query.issueType = { $in: issueTypes.split(",") };
    }

    if (Array.isArray(priorities) && priorities.length > 0) {
      query.priority = { $in: priorities };
    } else if (typeof priorities === "string" && priorities) {
      query.priority = { $in: priorities.split(",") };
    }

    // 📅 Date filter
    if (createdDate) {
      const days = createdDate === "last7" ? 7 : createdDate === "last30" ? 30 : null;
      if (days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        query.createdAt = { $gte: cutoff };
      }
    }

    /* --------------------------------------------------------------------- */
    /*  ✅ Merge all conditions properly                                      */
    /* --------------------------------------------------------------------- */
    let finalQuery = { ...query };
    if (searchConditions.length > 0) {
      finalQuery = { $and: [query, ...searchConditions] };
    }

   
    /* --------------------------------------------------------------------- */
    /*  🔢 Pagination + Fetch                                                */
    /* --------------------------------------------------------------------- */
    const skip = parseInt(page) * parseInt(limit);
    const tickets = await SupportUser.find(finalQuery)
      .sort({ _id : -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalCount = await SupportUser.countDocuments(finalQuery);

    return res.status(200).json({
      success: true,
      message: "Tickets retrieved successfully",
      tickets,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Error retrieving tickets:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets",
      error: err.message,
    });
  }
};



// exports.getTicket = async (req, res) => {
//   try {
//     const {
//       search,
//       status,
//       issueType,
//       priority,
//       createdDate,
//       page = 0,
//       limit = 10,
//       tenantId,
//       userId,
//       organization
//     } = req.query;

//     console.log("Received query parameters:", req.query);
//     let query = {};

//     // Tenant/organization filtering
//     if (tenantId) {
//       query.tenantId = tenantId;
//     }
//     if (organization) {
//       query.organization = organization;
//     }

//     // Search filter
//     if (search) {
//       query.$or = [
//         { ticketCode: { $regex: search, $options: 'i' } },
//         { contact: { $regex: search, $options: 'i' } },
//         { subject: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Status filter
//     if (status) {
//       const statusArray = typeof status === 'string' ? status.split(',') : Array.isArray(status) ? status : [];
//       if (statusArray.length > 0) {
//         query.status = { $in: statusArray };
//       }
//     }

//     // Same for issueType and priority
//     if (issueType) {
//       const issueTypeArray = typeof issueType === 'string' ? issueType.split(',') : Array.isArray(issueType) ? issueType : [];
//       if (issueTypeArray.length > 0) {
//         query.issueType = { $in: issueTypeArray };
//       }
//     }

//     if (priority) {
//       const priorityArray = typeof priority === 'string' ? priority.split(',') : Array.isArray(priority) ? priority : [];
//       if (priorityArray.length > 0) {
//         query.priority = { $in: priorityArray };
//       }
//     }

//     // Created Date filter
//     if (createdDate) {
//       const days = createdDate === 'last7' ? 7 : createdDate === 'last30' ? 30 : null;
//       if (days) {
//         const cutoffDate = new Date();
//         cutoffDate.setDate(cutoffDate.getDate() - days);
//         query.createdAt = { $gte: cutoffDate };
//       }
//     }

//     // Pagination
//     const skip = parseInt(page) * parseInt(limit);
//     const tickets = await SupportUser.find(query)
//       .sort({ _id: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     const totalCount = await SupportUser.countDocuments(query);

//     return res.status(200).send({
//       success: true,
//       message: "Tickets retrieved successfully",
//       tickets,
//       totalCount,
//       page: parseInt(page),
//       limit: parseInt(limit)
//     });
//   } catch (error) {
//     console.log("Error retrieving tickets:", error);
//     return res.status(500).json({
//       message: "Failed to retrieve tickets",
//       errors: { general: error.message },
//     });
//   }
// };

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

    // res.locals.loggedByController = true;
    // //<-----v1.0.1---
    // // Permission: Tasks.Create (or super admin override)
    // const canCreate =
    // await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
    // await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.View permission' });
    // }
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

// exports.updateTicketById = async (req, res) => {
//   res.locals.loggedByController = true;
//   res.locals.processName = "Update Ticket";

//   try {
//     const { id } = req.params;
//     // v1.0.0 <----------------------------------------------------
//     const { issueType, description, subject, assignedTo, assignedToId } = req.body;
//     // v1.0.0 --------------------------------------------->
//    //<----v1.0.1----

//     // id = new mongoose.Types.ObjectId(id);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res
//         .status(400)
//         .json({ message: "Validation failed", errors: { id: "Invalid ticket id" } });
//     }
//     const { errors, isValid } = validateUpdateSupportTicket(req.body);
//     if (!isValid) {
//       return res.status(400).json({ message: "Validation failed", errors });
//     }
//     //----v1.0.1---->

//     res.locals.loggedByController = true;
//     //console.log("effectivePermissions",res.locals?.effectivePermissions)
//     //<-----v1.0.1---
//     // Permission: Tasks.Create (or super admin override)
//     const canCreate =
//       await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Edit') ||
//       await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Edit')
//     if (!canCreate) {
//       return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Edit permission' });
//     }
//     //-----v1.0.1--->

//     // const ticket = await SupportUser.findByIdAndUpdate(
//     //   id,
//     //   {
//     //     issueType,
//     //     description,
//     //     // v1.0.0 <----------------------------------------------------
//     //     subject,
//     //     // v1.0.0 --------------------------------------------->
//     //     assignedTo,
//     //     assignedToId,
//     //   },
//     //   { new: true, runValidators: true }
//     // );

//     // if (!ticket) {
//     //   return res.status(404).json({ message: "Ticket not found" });
//     // }

//      // Fetch current ticket first to compare values
//      const currentTicket = await SupportUser.findById(id).lean();
//      if (!currentTicket) {
//        return res.status(404).json({ message: "Ticket not found" });
//      }

//      // Prepare update data
//      const updateData = {
//        issueType: issueType || currentTicket.issueType,
//        description: description || currentTicket.description,
//        subject: subject || currentTicket.subject,
//        assignedTo: assignedTo || currentTicket.assignedTo,
//        assignedToId: assignedToId || currentTicket.assignedToId,
//      };

//      // Compare current values with updateFields to identify changes
//      const changes = Object.entries(updateData)
//        .filter(([key, newValue]) => {
//          const oldValue = currentTicket[key];

//          // Handle different data types appropriately
//          if (Array.isArray(oldValue) && Array.isArray(newValue)) {
//            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
//          }

//          // Handle object comparison
//          if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
//            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
//          }

//          // Handle primitive values
//          return oldValue !== newValue;
//        })
//        .map(([key, newValue]) => ({
//          fieldName: key,
//          oldValue: currentTicket[key],
//          newValue,
//        }));
//        console.log("changes", changes);
//        console.log("changes length",changes.length);
//        console.log("changes length",currentTicket);


//      // Check if there are no changes
//      if (changes.length === 0) {
//        return res.status(200).json({
//          status: "no_changes",
//          message: "No changes detected, ticket details remain the same",
//          data:currentTicket
//        });
//      }

//      // Update the ticket
//      const ticket = await SupportUser.findByIdAndUpdate(
//        id,
//        updateData,
//        { new: true, runValidators: true }
//      );

//      if (!ticket) {
//        return res.status(404).json({ message: "Ticket not found" });
//      }
//      console.log("changes", changes);

//      // Prepare feed and log data with change history
//      res.locals.feedData = {
//        tenantId: currentTicket.tenantId,
//        feedType: "update",
//        action: {
//          name: "ticket_updated",
//          description: `Support ticket was updated`,
//        },
//        ownerId: currentTicket.ownerId,
//        parentId: ticket._id,
//        parentObject: "SupportTicket",
//        metadata: req.body,
//        severity: res.statusCode >= 500 ? "high" : "low",
//        fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
//          fieldName,
//          message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
//        })),
//        history: changes,
//      };

//      res.locals.logData = {
//        tenantId: currentTicket.tenantId,
//        ownerId: currentTicket.ownerId,
//        processName: "Update Ticket",
//        requestBody: req.body,
//        status: "success",
//        message: "Ticket updated successfully",
//        responseBody: ticket,
//        changes: changes, // Include changes in log data
//      };


//     return res.status(200).send({
//       status: 'Ticket updated successfully',
//       message: "Ticket updated successfully",
//       ticket,
//       changes,
//     });
//   } catch (error) {
//     console.log(error);

//     // Error logging
//       res.locals.logData = {
//         tenantId: req.body.tenantId,
//         ownerId: req.body.ownerId,
//         processName: "Update Ticket",
//         requestBody: req.body,
//         message: error.message,
//         status: "error",
//       };

//     return res.status(500).json({
//       message: "Failed to update ticket",
//       errors: { general: error.message },
//     });
//   }
// };

// Update ticket status

exports.updateTicketById = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Ticket";

  try {
    const { id } = req.params;
    const { ownerId, tenantId, issueType, description, subject, assignedTo, assignedToId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: { id: "Invalid ticket id" } });
    }

    const { errors, isValid } = validateUpdateSupportTicket(req.body);
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // console.log("logData", logo);
    console.log("ownerId", ownerId);
    console.log("tenantId", tenantId);

    // const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Edit') ||
    //   await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Edit')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Edit permission' });
    // }

    const currentTicket = await SupportUser.findById(id).lean();
    if (!currentTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const updateData = {
      issueType: issueType || currentTicket.issueType,
      description: description || currentTicket.description,
      subject: subject || currentTicket.subject,
      assignedTo: assignedTo || currentTicket.assignedTo,
      assignedToId: assignedToId || currentTicket.assignedToId,
    };

    const changes = Object.entries(updateData)
      .filter(([key, newValue]) => {
        const oldValue = currentTicket[key];

        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }

        if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }

        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentTicket[key],
        newValue,
      }));
    console.log("changes", changes);
    console.log("changes length", changes.length);


    // FIX: Return the current ticket data when no changes are made
    if (changes.length === 0) {
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected, ticket details remain the same",
        data: currentTicket, // Include the ticket data
        ticket: currentTicket // Add this line to ensure frontend has access to ticket object
      });
    }
    console.log("changes", changes);
    console.log("changes length", changes.length);


    const ticket = await SupportUser.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.locals.feedData = {
      tenantId: tenantId,
      feedType: "update",
      action: {
        name: "ticket_updated",
        description: `Support ticket was updated`,
      },
      ownerId: ownerId,
      parentId: ticket._id,
      parentObject: "SupportTicket",
      metadata: req.body,
      severity: res.statusCode >= 500 ? "high" : "low",
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };
    // console.log("feedData", r);

    res.locals.logData = {
      tenantId: tenantId,
      ownerId: ownerId,
      processName: "Update Ticket",
      requestBody: req.body,
      status: "success",
      message: "Ticket updated successfully",
      responseBody: ticket,
      changes: changes,
    };



    return res.status(200).send({
      status: 'Ticket updated successfully',
      message: "Ticket updated successfully",
      ticket, // Ensure this is always returned
      changes,
    });
  } catch (error) {
    console.log(error);

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Update Ticket",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };

    return res.status(500).json({
      message: "Failed to update ticket",
      errors: { general: error.message },
    });
  }
};


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
    // const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'Edit') ||
    //  await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'Edit')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.Edit permission' });
    // }
    //-----v1.0.1--->

    const ticket = await SupportUser.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const prevStatus = ticket.status;
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
    await supportNotif.notifyOnStatusChange({
      prevStatus,
      nextStatus: updatedTicket.status,
      ticket: updatedTicket,
    });

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
    // const canCreate =
    //   await hasPermission(res.locals?.effectivePermissions?.SupportDesk, 'View') ||
    //   await hasPermission(res.locals?.superAdminPermissions?.SupportDesk, 'View')
    // if (!canCreate) {
    //   return res.status(403).json({ message: 'Forbidden: missing SupportDesk.ViewTab permission' });
    // }
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
