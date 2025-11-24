const Group = require("../models/InterviewerGroup");

const getAllGroups = async (req, res) => {
  try {
    const tenantId = req.query.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }
    const groups = await Group.find({ tenantId }).populate({
      // path: 'Contacts',
      path: "users", // This is the field in your schema
      model: "Contacts", // Optional: explicitly tells Mongoose the model to use
      select: "firstName lastName _id",
      // select: 'UserName _id'  // Added _id to get user IDs
    });

    // Format the response for frontend
    const formattedGroups = groups.map((group) => ({
      _id: group._id, // Include group ID
      name: group.name,
      numberOfUsers: group.numberOfUsers,
      tenantId: group.tenantId,
      description: group.description,
      status: group.status,
      usersNames: group.users.map((user) =>
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      ), // ✅ Combined full name
      // usersNames: group.users.map(user => user.UserName), // Array of usernames
      userIds: group.users.map((user) => user._id), // Add user IDs
    }));

    res.status(200).json(formattedGroups);
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
  getGroupById,
  updateGroup,
};
