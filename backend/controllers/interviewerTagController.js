// controllers/interviewerTagController.js - CRUD operations for Interviewer Tags
const InterviewerTag = require('../models/InterviewerTag');

// Get all tags with optional filters
const getAllTags = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const { category = '', active_only = 'false' } = req.query;

        const filter = { tenantId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (active_only === 'true') {
            filter.is_active = true;
        }

        const tags = await InterviewerTag.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Error fetching tags', error: error.message });
    }
};

// Get paginated tags
const getPaginatedTags = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const {
            page = 0,
            limit = 10,
            search = '',
            category = '',
            sortBy = 'name'
        } = req.query;

        const filter = { tenantId };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        const skip = Number(page) * Number(limit);
        const limitNum = Number(limit);

        const totalItems = await InterviewerTag.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limitNum);

        const tags = await InterviewerTag.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            data: tags,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems,
                itemsPerPage: limitNum,
                hasNext: Number(page) < totalPages - 1,
                hasPrev: Number(page) > 0
            }
        });
    } catch (error) {
        console.error('Error fetching paginated tags:', error);
        res.status(500).json({ message: 'Error fetching tags', error: error.message });
    }
};

// Get single tag by ID
const getTagById = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const { id } = req.params;

        const tag = await InterviewerTag.findOne({ _id: id, tenantId }).lean();
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        res.status(200).json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        res.status(500).json({ message: 'Error fetching tag', error: error.message });
    }
};

// Create new tag
const createTag = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        const ownerId = res.locals.auth?.userId;

        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const { name, description, color, category, is_active } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Tag name is required' });
        }

        // Check if tag name already exists for this tenant
        const existingTag = await InterviewerTag.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            tenantId
        });
        if (existingTag) {
            return res.status(400).json({ message: 'A tag with this name already exists' });
        }

        const newTag = new InterviewerTag({
            name,
            description,
            color: color || '#94a3b8',
            category: category || 'skill',
            is_active: is_active !== undefined ? is_active : true,
            tenantId,
            ownerId
        });

        await newTag.save();

        res.status(201).json({
            message: 'Tag created successfully',
            data: newTag
        });
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ message: 'Error creating tag', error: error.message });
    }
};

// Update tag
const updateTag = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.tenantId;
        delete updateData.ownerId;
        delete updateData._id;

        // Check if tag exists
        const existingTag = await InterviewerTag.findOne({ _id: id, tenantId });
        if (!existingTag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        // If name is being changed, check for duplicates
        if (updateData.name && updateData.name !== existingTag.name) {
            const nameExists = await InterviewerTag.findOne({
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                tenantId,
                _id: { $ne: id }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'A tag with this name already exists' });
            }
        }

        const updatedTag = await InterviewerTag.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        res.status(200).json({
            message: 'Tag updated successfully',
            data: updatedTag
        });
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).json({ message: 'Error updating tag', error: error.message });
    }
};

// Delete tag
const deleteTag = async (req, res) => {
    try {
        const tenantId = res.locals.auth?.actingAsTenantId;
        if (!tenantId) {
            return res.status(401).json({ message: 'Unauthorized: No tenant ID' });
        }

        const { id } = req.params;

        const tag = await InterviewerTag.findOneAndDelete({ _id: id, tenantId });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        // Optionally: Remove tag from all interviewers that have it
        const Interviewer = require('../models/Interviewer');
        await Interviewer.updateMany(
            { tenantId, tag_ids: id },
            { $pull: { tag_ids: id } }
        );

        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ message: 'Error deleting tag', error: error.message });
    }
};

module.exports = {
    getAllTags,
    getPaginatedTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};
