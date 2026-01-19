const Team = require("../models/MyTeams");

// Get all teams for a tenant (legacy, returns full list)
const getAllTeams = async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    const teams = await Team.find({ tenantId })
      .populate({
        path: "member_ids",
        model: "Contacts",
        select: "firstName lastName _id",
      })
      .populate({
        path: "lead_id",
        model: "Contacts",
        select: "firstName lastName _id",
      });

    const formattedTeams = teams.map((team) => ({
      _id: team._id,
      name: team.name,
      description: team.description,
      department: team.department,
      lead_id: team.lead_id?._id,
      leadName: team.lead_id
        ? `${team.lead_id.firstName || ""} ${team.lead_id.lastName || ""}`.trim()
        : null,
      numberOfUsers: team.numberOfUsers,
      tenantId: team.tenantId,
      is_active: team.is_active,
      color: team.color,
      // Backward compatibility
      status: team.is_active ? "active" : "inactive",
      usersNames: team.member_ids?.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ) || [],
      userIds: team.member_ids?.map((user) => user._id) || [],
      member_ids: team.member_ids?.map((user) => user._id) || [],
    }));

    res.status(200).json(formattedTeams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Paginated & filterable list for teams (used by /groups)
const getPaginatedTeams = async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);

    const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;
    const limit = Number.isNaN(rawLimit) || rawLimit <= 0 ? 9 : rawLimit;

    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();

    const baseFilter = { tenantId };

    // Handle status filter - convert to is_active boolean
    if (statusParam) {
      const statusArray = statusParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (statusArray.length > 0) {
        // Convert 'active'/'inactive' to boolean values
        const activeFilter = [];
        if (statusArray.includes("active")) activeFilter.push(true);
        if (statusArray.includes("inactive")) activeFilter.push(false);

        if (activeFilter.length > 0) {
          baseFilter.is_active = { $in: activeFilter };
        }
      }
    }

    let query = { ...baseFilter };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        ...baseFilter,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { department: searchRegex }
        ],
      };
    }

    const totalItems = await Team.countDocuments(query);

    const teams = await Team.find(query)
      .populate({
        path: "member_ids",
        model: "Contacts",
        select: "firstName lastName _id",
      })
      .populate({
        path: "lead_id",
        model: "Contacts",
        select: "firstName lastName _id",
      })
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit);

    const formattedTeams = teams.map((team) => ({
      _id: team._id,
      name: team.name,
      description: team.description,
      department: team.department,
      lead_id: team.lead_id?._id,
      leadName: team.lead_id
        ? `${team.lead_id.firstName || ""} ${team.lead_id.lastName || ""}`.trim()
        : null,
      numberOfUsers: team.numberOfUsers,
      tenantId: team.tenantId,
      is_active: team.is_active,
      color: team.color,
      // Backward compatibility
      status: team.is_active ? "active" : "inactive",
      usersNames: team.member_ids?.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ) || [],
      userIds: team.member_ids?.map((user) => user._id) || [],
      member_ids: team.member_ids?.map((user) => user._id) || [],
    }));

    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems,
      hasNext: page + 1 < totalPages,
      hasPrev: page > 0,
      itemsPerPage: limit,
    };

    res.status(200).json({
      data: formattedTeams,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTeam = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Team";

  try {
    const {
      name,
      description,
      department,
      lead_id,
      member_ids,
      users, // Backward compatibility
      is_active,
      status, // Backward compatibility
      color,
      tenantId
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    // Handle backward compatibility: use member_ids if provided, otherwise use users
    const memberList = member_ids || users || [];

    // Handle backward compatibility: convert status to is_active
    let activeStatus = is_active;
    if (activeStatus === undefined && status !== undefined) {
      activeStatus = status === "active";
    }
    if (activeStatus === undefined) {
      activeStatus = true; // Default to active
    }

    const team = new Team({
      name,
      description,
      department,
      lead_id,
      member_ids: memberList,
      is_active: activeStatus,
      color: color || "Teal",
      tenantId,
    });

    const savedTeam = await team.save();

    res.locals.logData = {
      tenantId: savedTeam.tenantId?.toString() || tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Team",
      requestBody: req.body,
      status: "success",
      message: "Team created successfully",
      responseBody: savedTeam,
    };

    res.status(201).json("Team Created Successfully!");
  } catch (error) {
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Team",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({ error: error.message });
  }
};

// Update team
const updateTeam = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Team";

  try {
    const { id } = req.params;
    const {
      name,
      description,
      department,
      lead_id,
      member_ids,
      users, // Backward compatibility
      is_active,
      status, // Backward compatibility
      color
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Handle backward compatibility: use member_ids if provided, otherwise use users
    const memberList = member_ids || users;

    // Handle backward compatibility: convert status to is_active
    let activeStatus = is_active;
    if (activeStatus === undefined && status !== undefined) {
      activeStatus = status === "active";
    }

    const updateData = {
      name,
      description,
      department,
      lead_id,
      color,
    };

    // Only update if provided
    if (memberList !== undefined) {
      updateData.member_ids = memberList;
      updateData.numberOfUsers = memberList.length;
    }
    if (activeStatus !== undefined) {
      updateData.is_active = activeStatus;
    }

    // Find and update the team
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.locals.logData = {
      tenantId: updatedTeam.tenantId?.toString() || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Team",
      requestBody: req.body,
      status: "success",
      message: "Team updated successfully",
      responseBody: updatedTeam,
    };

    res.status(200).json("Team Updated Successfully!");
  } catch (error) {
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Team",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({ error: error.message });
  }
};

// Get single team by ID
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: "member_ids",
        model: "Contacts",
        select: "firstName lastName _id",
      })
      .populate({
        path: "lead_id",
        model: "Contacts",
        select: "firstName lastName _id",
      });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: "Team not found",
      });
    }

    // Format response with backward compatibility
    const formattedTeam = {
      _id: team._id,
      name: team.name,
      description: team.description,
      department: team.department,
      lead_id: team.lead_id?._id,
      leadName: team.lead_id
        ? `${team.lead_id.firstName || ""} ${team.lead_id.lastName || ""}`.trim()
        : null,
      leadDetails: team.lead_id,
      member_ids: team.member_ids?.map((user) => user._id) || [],
      members: team.member_ids || [],
      numberOfUsers: team.numberOfUsers,
      tenantId: team.tenantId,
      is_active: team.is_active,
      color: team.color,
      // Backward compatibility
      status: team.is_active ? "active" : "inactive",
      users: team.member_ids || [],
      usersNames: team.member_ids?.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ) || [],
      userIds: team.member_ids?.map((user) => user._id) || [],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: formattedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Export with both old and new names for backward compatibility
module.exports = {
  // New names
  createTeam,
  getAllTeams,
  getPaginatedTeams,
  getTeamById,
  updateTeam,
  // Old names (backward compatibility)
  createGroup: createTeam,
  getAllGroups: getAllTeams,
  getPaginatedGroups: getPaginatedTeams,
  getGroupById: getTeamById,
  updateGroup: updateTeam,
};
