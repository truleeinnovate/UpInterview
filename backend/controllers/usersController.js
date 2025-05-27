const { Users } = require('../models/Users');

// Controller to fetch all users with populated tenantId
const getUsers = async (req, res) => {
    try {
        const users = await Users.find().populate('tenantId'); // Populate tenantId with Organization data
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


// PATCH /api/users/:id/status
const UpdateUser  = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { status, modifiedBy: req.body.modifiedBy || 'system' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


module.exports = { getUsers,UpdateUser };