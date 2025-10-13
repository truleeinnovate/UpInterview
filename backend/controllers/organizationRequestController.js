const mongoose = require("mongoose");
const OrganizationRequest = require("../models/OrganizationRequest");
const { Contacts } = require("../models/Contacts");
const Tenant = require("../models/Tenant");
const { Users } = require("../models/Users");
const config = require("../config");
const { sendApprovalEmail } = require("./EmailsController/signUpEmailController");


// Get all organization requests with related contact + tenant data
exports.getOrganizationRequests = async (req, res) => {
  try {
    // Fetch all organization requests
    const requests = await OrganizationRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!requests.length) {
      return res.status(200).json([]);
    }

    // Extract unique ownerIds & tenantIds
    const ownerIds = [
      ...new Set(requests.map(r => r.ownerId?.toString()).filter(Boolean)),
    ];
    const tenantIds = [
      ...new Set(requests.map(r => r.tenantId?.toString()).filter(Boolean)),
    ];

    // Fetch all related contacts & tenants
    const [contacts, tenants] = await Promise.all([
      Contacts.find({
        ownerId: { $in: ownerIds.map(id => new mongoose.Types.ObjectId(id)) },
      }).lean(),
      Tenant.find({
        _id: { $in: tenantIds.map(id => new mongoose.Types.ObjectId(id)) },
      }).lean(),
    ]);

    // Create lookup maps
    const contactMap = new Map();
    contacts.forEach(contact => {
      if (contact.ownerId) {
        contactMap.set(contact.ownerId.toString(), {
          firstName: contact.firstName || "",
          lastName: contact.lastName || "",
          email: contact.email || "",
          phone: contact.phone || "",
          countryCode: contact.countryCode || "",
        });
      }
    });

    const tenantMap = new Map();
    tenants.forEach(tenant => {
      tenantMap.set(tenant._id.toString(), {
        _id: tenant._id,
        firstName: tenant.firstName || "",
        lastName: tenant.lastName || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        jobTitle: tenant.jobTitle || "",
        company: tenant.company || "",
        employees: tenant.employees || "",
        country: tenant.country || "",
        type: tenant.type || "",
        ownerId: tenant.ownerId || null,
        website: tenant.website || "",
        status: tenant.status || "",
        industry: tenant.industry || "",
        description: tenant.description || "",
        location: tenant.location || "",
        socialMedia: {
          linkedin: tenant.socialMedia?.linkedin || "",
          twitter: tenant.socialMedia?.twitter || "",
          facebook: tenant.socialMedia?.facebook || "",
        },
        branding: {
          filename: tenant.branding?.filename || "",
          path: tenant.branding?.path || "",
          contentType: tenant.branding?.contentType || "",
          publicId: tenant.branding?.publicId || "",
          fileSize: tenant.branding?.fileSize || "",
          uploadDate: tenant.branding?.uploadDate || "",
        },
        offices: tenant.offices?.map(office => ({
          id: office.id,
          type: office.type,
          address: office.address,
          city: office.city,
          state: office.state,
          country: office.country,
          zip: office.zip,
          phone: office.phone,
        })) || [],
        subdomain: tenant.subdomain || "",
        fullDomain: tenant.fullDomain || "",
        subdomainStatus: tenant.subdomainStatus || "",
        subdomainAddedDate: tenant.subdomainAddedDate || "",
        subdomainLastVerified: tenant.subdomainLastVerified || "",
        usersBandWidth: tenant.usersBandWidth || 0,
        totalUsers: tenant.totalUsers || 0,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      });
    });

    // Merge requests with tenant + contact info
    const result = requests.map(req => {
      const ownerIdStr = req.ownerId?.toString();
      const tenantIdStr = req.tenantId?.toString();

      const formattedStatus =
        req.status && req.status.length > 0
          ? req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()
          : "Pending_review";

      return {
        ...req,
        status: formattedStatus,
        contact: contactMap.get(ownerIdStr) || {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          countryCode: "",
        },
        tenant: tenantMap.get(tenantIdStr) || {},
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching organization requests:", error);
    res.status(500).json({
      message: "Error fetching organization requests",
      error: error.message,
    });
  }
};

// Create a new organization request
exports.createOrganizationRequest = async (req, res) => {
    try {
        const { tenantId, ownerId, status = 'pending_review' } = req.body;

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
// exports.updateOrganizationRequestStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         const updatedRequest = await OrganizationRequest.findByIdAndUpdate(
//             id,
//             { status },
//             { new: true }
//         );

//         if (!updatedRequest) {
//             return res.status(404).json({ message: 'Organization request not found' });
//         }

//         // Populate the references in the response
//         const populatedRequest = await OrganizationRequest.findById(updatedRequest._id)
//             .populate('tenantId', '-__v')
//             .populate('ownerId', '-password -__v');

//         res.status(200).json(populatedRequest);
//     } catch (error) {
//         console.error('Error updating organization request status:', error);
//         res.status(500).json({
//             message: 'Error updating organization request status',
//             error: error.message
//         });
//     }
// };

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

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    // Update the organization request
    const updatedRequest = await OrganizationRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          comments,
          updatedAt: new Date(),
        },
        $push: {
          statusHistory: {
            status,
            comments,
            changedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Organization request not found' });
    }

    // If status is 'approved', send approval email
    if (status === 'approved') {
      // Fetch the user associated with the organization request
      const user = await Users.findById(updatedRequest.ownerId);
      if (!user || !user.email) {
        console.warn(`No user or email found for ownerId: ${updatedRequest.ownerId}`);
      } else {
        // Create action link (e.g., login page)
        const actionLink = `${config.REACT_APP_API_URL_FRONTEND}/organization-login`;

        // Send approval email
        const emailResult = await sendApprovalEmail({
          to: user.email,
          data: {
            email: user.email,
            userId: user._id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            actionLink,
          },
        });

        if (!emailResult.success) {
          console.error('Failed to send approval email:', emailResult.message);
          // Optionally, you can decide whether to return an error response or continue
        }
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};
