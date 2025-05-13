const InterviewTemplate = require('../models/InterviewTemplate');

// Create a new interview template
exports.createInterviewTemplate = async (req, res) => {
    try {
        const template = new InterviewTemplate({
            ...req.body,
            // For now, we'll use a default user ID since auth is not implemented
            createdBy: req.body.tenantId || "670286b86ebcb318dab2f676",
            tenantId: req.body.tenantId || "670286b86ebcb318dab2f676"
        });
        
        const savedTemplate = await template.save();
        res.status(201).json({
            success: true,
            data: savedTemplate
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all interview templates for a tenant
exports.getAllTemplates = async (req, res) => {
    try {
        // For now, we'll use a default tenant ID since auth is not implemented
        const tenantId = "670286b86ebcb318dab2f676";
        const templates = await InterviewTemplate.find({ tenantId })
            .sort({ createdAt: -1 });
            
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
        const tenantId = "670286b86ebcb318dab2f676";
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

// Update template
exports.updateTemplate = async (req, res) => {
    try {
        // For now, we'll use a default tenant ID since auth is not implemented
        const tenantId = "670286b86ebcb318dab2f676";
        const template = await InterviewTemplate.findOneAndUpdate(
            {
                _id: req.params.id,
                tenantId
            },
            {
                ...req.body,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

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

// Delete template
exports.deleteTemplate = async (req, res) => {
    try {
        // For now, we'll use a default tenant ID since auth is not implemented
        const tenantId = "670286b86ebcb318dab2f676";
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
