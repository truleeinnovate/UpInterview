const Notifications = require('../models/notification.js');

const saveNotifications = async (req) => {  // Declare function first
  try {
    const { notifications } = req.body;

    if (!notifications || notifications.length === 0) {
      console.warn("No notifications to save.");
      return;
    }

    await Notifications.insertMany(notifications);
    console.log("Notifications saved successfully.");
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
};

// Get notifications 
const getNotifications = async (req, res) => {
  try {
    const { objectId, category, candidateId } = req.query; // Get objectId, category, and candidateId from query params

    // if (!category) {
    //   return res.status(400).json({ message: "Category is required" });
    // }

    let filter = {};

    if (category === "assessment" || category === "interview") {
      // if (!objectId) {
      //   return res.status(400).json({ message: "Object ID is required for this category" });
      // }
      filter = { "object.objectId": objectId };
    } else if (category === "candidate") {
      if (!candidateId) {
        return res.status(400).json({ message: "Candidate ID is required for this category" });
      }
      filter = { recipientId: candidateId };
    } else {
      return res.status(400).json({ message: "Invalid category" });
    }

    // console.log("Filter:", filter);

    const notifications = await Notifications.find(filter);
    res.json(notifications);
    console.log("Fetched notifications:", notifications);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllNotification = async (req, res) => {
  try {
    const {
      organizationId,
      tenantId,
      ownerId,
      search,
      status,
      type,
      timeRange,
      page = 1,
      limit = 20,
    } = req.query;
    console.log("Query params:", req.query);

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const isOrganization = organizationId === "true";
    let filter = {};

    if (isOrganization) {
      if (!tenantId) return res.status(400).json({ message: "tenantId required" });
      filter.tenantId = tenantId;
    } else {
      if (!ownerId) return res.status(400).json({ message: "ownerId required" });
      filter.ownerId = ownerId;
    }

    // Text search on title/body
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.notificationType = { $regex: new RegExp(`^${type}$`, "i") };
    }

    if (timeRange && timeRange !== "all") {
      const now = new Date();
      let dateFilter = {};

      switch (timeRange) {
        case "today":
          dateFilter.createdAt = {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
          };
          break;
        case "week":
          dateFilter.createdAt = {
            $gte: new Date(now.setDate(now.getDate() - 7)),
          };
          break;
        case "month":
          dateFilter.createdAt = {
            $gte: new Date(now.setMonth(now.getMonth() - 1)),
          };
          break;
      }
      filter = { ...filter, ...dateFilter };
    }

    const total = await Notifications.countDocuments(filter);
    const notifications = await Notifications.find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// const getAllNotification = async (req, res) => {
//   try {
//     const { organizationId, tenantId, ownerId } = req.query;

//     if (typeof organizationId === 'undefined') {
//       return res.status(400).json({ message: 'organizationId is required' });
//     }

//     const isOrganization = organizationId === 'true';

//     let filter = {};
//     if (isOrganization) {
//       if (!tenantId) {
//         return res.status(400).json({ message: 'tenantId is required for organization notifications' });
//       }
//       filter.tenantId = tenantId;
//     } else {
//       if (!ownerId) {
//         return res.status(400).json({ message: 'ownerId is required for individual notifications' });
//       }
//       filter.ownerId = ownerId;
//     }
//     // console.log("Filter:", filter);

//     const notifications = await Notifications.find(filter).sort({ _id: -1 });
//     // console.log("Fetched notifications:", notifications);
//     res.json(notifications);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// ✅ Properly exporting functions
module.exports = {
  saveNotifications,
  getNotifications,
  getAllNotification,
};
