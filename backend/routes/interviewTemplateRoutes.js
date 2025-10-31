const express = require('express');
const router = express.Router();
const {
    createInterviewTemplate,
    getAllTemplates,
    getTemplatesByTenantId,
    // getTemplateById,
    updateTemplate,
    deleteTemplate,
    deleteRound
} = require('../controllers/interviewTemplateController');


// Create and get all templates
router.route('/')
    .post(createInterviewTemplate)


// Get, update and delete template by ID
router.route('/:id')
    // .get(getTemplateById)
    .patch(updateTemplate)
    .delete(deleteTemplate);

router.delete('/delete-round/:roundId', deleteRound)

// want to get the data of interview templates by matching tenantId
// router.route('/tenant/:tenantId').get(getTemplatesByTenantId)

module.exports = router;
