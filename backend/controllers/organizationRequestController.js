const mongoose = require('mongoose');
const OrganizationRequest = require('../models/OrganizationRequest');
const { Contacts } = require('../models/Contacts');

// Get all organization requests with related contact data
exports.getOrganizationRequests = async (req, res) => {
    try {
        // First, get all organization requests
        const requests = await OrganizationRequest.find({})
            .sort({ createdAt: -1 })
            .lean();

        // Log the incoming requests for debugging
        console.log('Organization requests raw data:', JSON.stringify(requests, null, 2));

        // Get all unique user IDs from the requests
        const userIds = [...new Set(requests
            .map(r => {
                console.log(`Request ${r._id} has ownerId:`, r.ownerId);
                return r.ownerId?.toString();
            })
            .filter(Boolean)
        )];

        console.log('User IDs to fetch contacts for:', userIds);

        // Fetch all related contacts in one query
        const contacts = await Contacts.find({
            ownerId: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).lean();

        console.log('Fetched contacts:', JSON.stringify(contacts, null, 2));

        // Create a map of ownerId -> contact for quick lookup
        const contactMap = new Map();
        contacts.forEach(contact => {
            if (contact.ownerId) {
                const ownerIdStr = contact.ownerId.toString();
                console.log(`Mapping contact for ownerId ${ownerIdStr}:`, {
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email
                });
                contactMap.set(ownerIdStr, {
                    firstName: contact.firstName || '',
                    lastName: contact.lastName || '',
                    email: contact.email || '',
                    phone: contact.phone || '',
                    countryCode: contact.countryCode || ''
                });
            }
        });

        // Combine the data and format the status
        const result = requests.map(request => {
            const ownerIdStr = request.ownerId?.toString();
            const contactData = ownerIdStr ? contactMap.get(ownerIdStr) : null;

            console.log(`Processing request ${request._id} with ownerId ${ownerIdStr}`, {
                hasContactData: !!contactData,
                contactData
            });

            // Format status to capitalize first letter
            const formattedStatus = request.status && request.status.length > 0
                ? request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()
                : 'Requested'; // Default status if not set

            const response = {
                ...request,
                status: formattedStatus,
                contact: contactData || {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    countryCode: ''
                },
                _debug: {
                    ownerId: ownerIdStr,
                    hasContact: !!contactData
                }
            };

            console.log(`Response for request ${request._id}:`, JSON.stringify(response, null, 2));
            return response;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching organization requests:', error);
        res.status(500).json({
            message: 'Error fetching organization requests',
            error: error.message
        });
    }
};

// Create a new organization request
exports.createOrganizationRequest = async (req, res) => {
    try {
        const { tenantId, ownerId, status = 'Requested' } = req.body;

        // Validate required fields
        if (!tenantId || !ownerId) {
            return res.status(400).json({
                message: 'tenantId and ownerId are required'
            });
        }

        const newRequest = new OrganizationRequest({
            tenantId,
            ownerId,
            status
        });

        const savedRequest = await newRequest.save();

        // Populate the references in the response
        const populatedRequest = await OrganizationRequest.findById(savedRequest._id)
            .populate('tenantId', '-__v')
            .populate('ownerId', '-password -__v');

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating organization request:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({
                message: 'A request already exists for this tenant and owner combination'
            });
        }
        res.status(500).json({
            message: 'Error creating organization request',
            error: error.message
        });
    }
};

// Update organization request status
exports.updateOrganizationRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedRequest = await OrganizationRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Organization request not found' });
        }

        // Populate the references in the response
        const populatedRequest = await OrganizationRequest.findById(updatedRequest._id)
            .populate('tenantId', '-__v')
            .populate('ownerId', '-password -__v');

        res.status(200).json(populatedRequest);
    } catch (error) {
        console.error('Error updating organization request status:', error);
        res.status(500).json({
            message: 'Error updating organization request status',
            error: error.message
        });
    }
};

// Get organization request by ID
exports.getOrganizationRequestById = async (req, res) => {
    try {
        const request = await OrganizationRequest.findById(req.params.id)
            .populate('tenantId', '-__v')
            .populate('ownerId', '-password -__v');

        if (!request) {
            return res.status(404).json({ message: 'Organization request not found' });
        }

        res.status(200).json(request);
    } catch (error) {
        console.error('Error fetching organization request:', error);
        res.status(500).json({
            message: 'Error fetching organization request',
            error: error.message
        });
    }
};
