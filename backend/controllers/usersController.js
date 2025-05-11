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

module.exports = { getUsers };