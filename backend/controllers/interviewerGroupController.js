const Group = require("../models/InterviewerGroup");

// Get all groups for a tenant (legacy, returns full list)
const getAllGroups = async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    const groups = await Group.find({ tenantId }).populate({
      path: "users",
      model: "Contacts",
      select: "firstName lastName _id",
    });

    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      numberOfUsers: group.numberOfUsers,
      tenantId: group.tenantId,
      description: group.description,
      status: group.status,
      usersNames: group.users.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ),
      userIds: group.users.map((user) => user._id),
    }));

    res.status(200).json(formattedGroups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Paginated & filterable list for interviewer groups (used by /groups)
const getPaginatedGroups = async (req, res) => {
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

    if (statusParam) {
      const statusArray = statusParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (statusArray.length > 0) {
        baseFilter.status = { $in: statusArray };
      }
    }

    let query = { ...baseFilter };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        ...baseFilter,
        $or: [{ name: searchRegex }, { description: searchRegex }],
      };
    }

    const totalItems = await Group.countDocuments(query);

    const groups = await Group.find(query)
      .populate({
        path: "users",
        model: "Contacts",
        select: "firstName lastName _id",
      })
      .sort({ _id: -1 })
      .skip(page * limit)
      .limit(limit);

    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      numberOfUsers: group.numberOfUsers,
      tenantId: group.tenantId,
      description: group.description,
      status: group.status,
      usersNames: group.users.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ),
      userIds: group.users.map((user) => user._id),
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
      data: formattedGroups,
      pagination,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, users, description, status, tenantId } = req.body;
    // name, users, description, status, tenantId

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }
    const group = new Group({
      // name, users
      name,
      users,
      description,
      status,
      tenantId,
    });
    await group.save();

    // Populate the users data after saving
    // const populatedGroup = await Group.findById(group._id)
    //     .populate({
    //         path: 'Contacts',
    //         select: 'firstName lastName _id'
    //         // select: 'UserName _id'  // Added _id to get user IDs
    //     });

    // Format response to match frontend expectations
    // const formattedGroup = {
    //     _id: populatedGroup._id, // Include group ID
    //     name: populatedGroup.name,
    //     numberOfUsers: populatedGroup.numberOfUsers,
    //     usersNames: group.users.map(user => `${user.firstName || ''} ${user.lastName || ''}`.trim()), // ✅ Combined full name
    //     // usersNames: populatedGroup.users.map(user => user.UserName), // Array of usernames
    //     userIds: populatedGroup.users.map(user => user._id)// Add user IDs
    // };

    res.status(201).json("Group Created Successfully!");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update group api call

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, users, description, status } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Find and update the group
    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      {
        name,
        users,
        description,
        status,
        numberOfUsers: users ? users.length : undefined, // Update count if users changed
      },
      { new: true } // Return the updated document
    );

    if (!updatedGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json("Group Updated Successfully!");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get single group by ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate({
      // path: 'Contacts',
      path: "users", // This is the field in your schema
      model: "Contacts", // Optional: explicitly tells Mongoose the model to use
      select: "firstName lastName _id",
      // select: 'UserName _id'  // Added _id to get user IDs
    });
    // .populate('users', 'name email');
    // const groups = await Group.find({ tenantId })
    //         .populate({
    //             path: 'Contacts',
    //              select: 'firstName lastName _id'
    //             // select: 'UserName _id'  // Added _id to get user IDs
    //         });

    if (!group) {
      return res.status(404).json({
        success: false,
        error: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getPaginatedGroups,
  getGroupById,
  updateGroup,
};
