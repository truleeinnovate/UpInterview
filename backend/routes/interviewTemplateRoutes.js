const express = require('express');
const router = express.Router();
const {
    createInterviewTemplate,
    getAllTemplates,
    
    // getTemplateById,
    updateTemplate,
    deleteTemplate,
    deleteRound
} = require('../controllers/interviewTemplateController');


// Create and get all templates
router.route('/')
    .post(createInterviewTemplate)
    // .get(getAllTemplates);

// Get, update and delete template by ID
router.route('/:id')
    // .get(getTemplateById)
    .patch(updateTemplate)
    .delete(deleteTemplate);

    router.delete('/delete-round/:roundId',deleteRound)

module.exports = router;
