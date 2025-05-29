const InterviewTemplate = require('../models/InterviewTemplate');


// Create a new interview template
exports.createInterviewTemplate = async (req, res) => {
    try {
        const template = new InterviewTemplate({
            ...req.body,
            // For now, we'll use a default user ID since auth is not implemented
            createdBy: req.body.tenantId,
            tenantId: req.body.tenantId 
        });
        
        const savedTemplate = await template.save();
        res.status(201).json({
            status: 'success',
            data: savedTemplate
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

// Get all interview templates for a tenant
// Get all interview templates based on organization or owner
exports.getAllTemplates = async (req, res) => {
    try {
        const { tenantId, ownerId, organization } = req.query;

        let filter = {};

        if (organization === 'true') {
            if (!tenantId) {
                return res.status(400).json({ success: false, message: 'tenantId is required for organization' });
            }
            filter.tenantId = tenantId;
        } else {
            if (!ownerId) {
                return res.status(400).json({ success: false, message: 'ownerId is required for individual user' });
            }
            filter.ownerId = ownerId;
        }

        const templates = await InterviewTemplate.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Get template by ID
exports.getTemplateById = async (req, res) => {
    try {
        // For now, we'll use a default tenant ID since auth is not implemented
        // const tenantId = "670286b86ebcb318dab2f676";
        const tenantId = req.query.tenantId;
        const template = await InterviewTemplate.findOne({
            _id: req.params.id,
            tenantId
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            data: template
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


exports.updateTemplate = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.tenantId ) {
            return res.status(400).json({
                status: false,
                message: 'Tenant ID is required'
            });
        }

        if (!req.body) {
            return res.status(400).json({
                status: false,
                message: 'Template data is required'
            });
        }

      
        // Prepare update data
        const updateData = {
            updatedAt: Date.now()
        };

        // Handle template data updates
        if (req.body.templateData) {
            Object.assign(updateData, req.body.templateData);
        }

        // Validate and process rounds if present
        if (req.body.rounds) {
            // Validate rounds is an array
            if (!Array.isArray(req.body.rounds)) {
                return res.status(400).json({
                    status: false,
                    message: 'Rounds must be an array'
                });
            }

            // Process each round
            const processedRounds = req.body.rounds.map((round, index) => {
                // Ensure sequence is set - use provided or default to position
                const sequence = typeof round.sequence === 'number' 
                    ? round.sequence 
                    : index + 1;

                // Return the processed round with required fields
                return {
                    roundTitle: round.roundTitle || `Round ${index + 1}`,
                    sequence,
                    interviewDuration: round.interviewDuration || 60,
                    instructions: round.instructions || '',
                    interviewMode: round.interviewMode || 'virtual',
                    interviewerType: round.interviewerType || 'internal',
                    selectedInterviewersType: round.selectedInterviewersType || 'Individual',
                    selectedInterviewerIds: round.selectedInterviewerIds || [],
                    interviewQuestionsList: round.interviewQuestionsList || [],
                    assessmentId: round.assessmentId || null,
                    interviewerGroupId: round.interviewerGroupId || null,
                    interviewers: round.interviewers || [],
                    minimumInterviewers: round.minimumInterviewers || '1',
                    // Include any other fields from the original round
                    ...round
                };
            });

            // Replace the rounds in the request body with processed rounds
            updateData.rounds = processedRounds;
        }

        // console.log("req", req.body);
        

        // Update the template
        const template = await InterviewTemplate.findOneAndUpdate(
            {
                _id: req.params.id,
                tenantId: req.body.tenantId
            },
            
                updateData,
            
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!template) {
            return res.status(404).json({
                status: false,
                message: 'Template not found'
            });
        }
// console.log("template", template);

        res.status(200).json({
            status: 'success',
            data: template
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(400).json({
            status: false,
            message: error.message || 'Failed to update template'
        });
    }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
    try {
        // For now, we'll use a default tenant ID since auth is not implemented
        // const tenantId = "670286b86ebcb318dab2f676";
        const template = await InterviewTemplate.findOneAndDelete({
            _id: req.params.id,
            tenantId
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
