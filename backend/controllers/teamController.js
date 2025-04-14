const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMembers.js');
// const Contacts = require('../models/Contacts1');

const createTeamMember = async (req, res) => {
    const { team_member, contactId, tenantId, ownerId } = req.body;
    console.log('Request Body:', req.body);
  
    try {
  
      // Create a new team member
      const newTeamMember = new TeamMember({
        _id: new mongoose.Types.ObjectId(),
        team_member,
        contactId,
        tenantId,
        ownerId,
        created_at: new Date(),
        updated_at: new Date(),
      });
  
      console.log('New Team Member:', newTeamMember);
  
      // Save the new team member
      await newTeamMember.save();
      res.status(201).json(newTeamMember);
    } catch (error) {
      console.error('Error in createTeamMember:', error.message);
      res.status(500).json({ error: 'Error creating team member.' });
    }
  };
  

module.exports = {
  createTeamMember,
};
