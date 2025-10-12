const OrganizationRequest = require('../models/OrganizationRequest');

// Get all organization requests with complete populated data
exports.getOrganizationRequests = async (req, res) => {
  try {
    const requests = await OrganizationRequest.find({})
      .populate({
        path: 'ownerId',
        model: 'Users',
        // Populate all fields from the Users model
        select: '-password -__v' // Exclude sensitive/unecessary fields
      })
      .populate({
        path: 'tenantId',
        model: 'Tenant',
        // Populate all fields from the Tenant model
        select: '-__v' // Exclude version key
      })
      .populate({
        path: 'contactId',
        model: 'Contacts', // Using the correct model name 'Contacts'
        select: '-__v' // Exclude version key
      })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for better performance
      
    res.status(200).json(requests);
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
    const { tenantId, ownerId, contactId, status = 'Requested' } = req.body;
    
    // Validate required fields
    if (!tenantId || !ownerId || !contactId) {
      return res.status(400).json({ 
        message: 'tenantId, ownerId, and contactId are required' 
      });
    }

    const newRequest = new OrganizationRequest({
      tenantId,
      ownerId,
      contactId,
      status
    });
    
    const savedRequest = await newRequest.save();
    
    // Populate the references in the response
    const populatedRequest = await OrganizationRequest.findById(savedRequest._id)
      .populate('tenantId', '-__v')
      .populate('ownerId', '-password -__v')
      .populate({
        path: 'contactId',
        model: 'Contacts',
        select: '-__v'
      });
    
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
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating organization request status:', error);
    res.status(500).json({ message: 'Error updating organization request status', error: error.message });
  }
};

// Get organization request by ID
exports.getOrganizationRequestById = async (req, res) => {
  try {
    const request = await OrganizationRequest.findById(req.params.id)
      .populate('tenantId', '-__v')
      .populate('ownerId', '-password -__v')
      .populate({
        path: 'contactId',
        model: 'Contacts',
        select: '-__v'
      });

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
