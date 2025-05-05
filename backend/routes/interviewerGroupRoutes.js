const express = require('express');
const router = express.Router();
const {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup
} = require('../controllers/interviewerGroupController');

// Create a new group
router.post('/', createGroup);

// Get all groups
router.get('/data', getAllGroups);

// update api call for Groups


router.patch('/update/:id', updateGroup);

// Get single group by ID
router.get('/:id', getGroupById);



module.exports = router;
