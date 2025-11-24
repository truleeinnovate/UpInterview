const mongoose = require("mongoose");
const OrganizationRequest = require("../models/OrganizationRequest");
const { Contacts } = require("../models/Contacts");
const Tenant = require("../models/Tenant");
const { Users } = require("../models/Users");
const config = require("../config");
const {
  sendApprovalEmail,
} = require("./EmailsController/signUpEmailController");

// Get all organization requests with related contact + tenant data
exports.getOrganizationRequests = async (req, res) => {
  try {
    const hasPaginationParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "status" in req.query;

    if (!hasPaginationParams) {
      // Legacy behavior: return full list with merged contact + tenant data
      const requests = await OrganizationRequest.find({}).lean();

      if (!requests.length) {
        return res.status(200).json([]);
      }

      // Extract unique ownerIds & tenantIds
      const ownerIds = [
        ...new Set(requests.map((r) => r.ownerId?.toString()).filter(Boolean)),
      ];
      const tenantIds = [
        ...new Set(requests.map((r) => r.tenantId?.toString()).filter(Boolean)),
      ];

      // Fetch all related contacts & tenants
      const [contacts, tenants] = await Promise.all([
        Contacts.find({
          ownerId: {
            $in: ownerIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        }).lean(),
        Tenant.find({
          _id: { $in: tenantIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).lean(),
      ]);

      // Create lookup maps
      const contactMap = new Map();
      contacts.forEach((contact) => {
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
      tenants.forEach((tenant) => {
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
          offices:
            tenant.offices?.map((office) => ({
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
      const result = requests.map((req) => {
        const ownerIdStr = req.ownerId?.toString();
        const tenantIdStr = req.tenantId?.toString();

        const formattedStatus =
          req.status && req.status.length > 0
            ? req.status.charAt(0).toUpperCase() +
              req.status.slice(1).toLowerCase()
            : "Pending_review";

        return {
          ...req,
          //organizationRequestCode: req.organizationRequestCode || null, // Explicitly include the code
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

      return res.status(200).json(result);
    }

    // Paginated mode using aggregation
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const statusParam = (req.query.status || "").trim();

    const statusValues = statusParam
      ? statusParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const pipeline = [
      {
        $lookup: {
          from: "contacts",
          localField: "ownerId",
          foreignField: "ownerId",
          as: "contact",
        },
      },
      { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "tenants",
          localField: "tenantId",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: { path: "$tenant", preserveNullAndEmptyArrays: true } },
    ];

    const match = {};
    if (statusValues.length > 0) {
      match.status = { $in: statusValues };
    }
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [
        { organizationRequestCode: { $regex: regex } },
        { status: { $regex: regex } },
        { "contact.firstName": { $regex: regex } },
        { "contact.lastName": { $regex: regex } },
        { "contact.email": { $regex: regex } },
        { "contact.phone": { $regex: regex } },
        { "tenant.company": { $regex: regex } },
      ];
    }
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $sort: { _id: -1 } });

    pipeline.push({
      $facet: {
        data: [{ $skip: page * limit }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    });

    const result = await OrganizationRequest.aggregate(pipeline);
    const agg = result?.[0] || { data: [], totalCount: [], statusCounts: [] };
    const totalItems = agg.totalCount?.[0]?.count || 0;
    const data = agg.data || [];

    // Map status counts
    const statsMap = (agg.statusCounts || []).reduce((acc, cur) => {
      if (cur && cur._id) acc[cur._id] = cur.count || 0;
      return acc;
    }, {});
    const stats = {
      pending_review: statsMap.pending_review || 0,
      in_contact: statsMap.in_contact || 0,
      under_verification: statsMap.under_verification || 0,
      approved: statsMap.approved || 0,
      rejected: statsMap.rejected || 0,
    };

    return res.status(200).json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
      stats,
      status: true,
    });
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
    const { tenantId, ownerId, status = "pending_review" } = req.body;

    // Validate required fields
    if (!tenantId || !ownerId) {
      return res.status(400).json({
        message: "tenantId and ownerId are required",
      });
    }

    // const MAX_RETRIES = 10; // Prevent infinite loops
    // let attempts = 0;
    // let organizationRequestCode

    //   while (attempts < MAX_RETRIES) {
    //     attempts++;

    //     // Find the last organization request by ID to get the highest organization request code number
    //     const lastOrganizationRequestCode = await OrganizationRequest.findOne({})
    //       .sort({ _id: -1 })
    //       .select("organizationRequestCode")

    //     let nextNumber = 1; // Start from 00001
    //     if (lastOrganizationRequestCode?.organizationRequestCode) {
    //       // Extract number from ORG-00001 format
    //       const match = lastOrganizationRequestCode.organizationRequestCode.match(/ORG-(\d+)/);
    //       if (match) {
    //         nextNumber = parseInt(match[1], 10) + 1;
    //       }
    //     }

    //     organizationRequestCode = `ORG-${String(nextNumber).padStart(5, '0')}`;

    //     // Double-check that this organization request code doesn't already exist
    //     // This handles race conditions where multiple requests generate codes simultaneously
    //     const existingOrganizationRequestCode = await OrganizationRequest.findOne({ organizationRequestCode }).lean();

    //     if (!existingOrganizationRequestCode) {
    //       // Code is unique, return it
    //       return organizationRequestCode;
    //     }

    //     // If code exists, log warning and try again
    //      console.warn(`Organization request code ${organizationRequestCode} already exists, generating new one...`);
    //   }

    const newRequest = new OrganizationRequest({
      //organizationRequestCode,
      tenantId,
      ownerId,
      status,
    });

    const savedRequest = await newRequest.save();

    // Populate the references in the response
    const populatedRequest = await OrganizationRequest.findById(
      savedRequest._id
    )
      .populate("tenantId", "-__v")
      .populate("ownerId", "-password -__v");

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Error creating organization request:", error);
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        message:
          "A request already exists for this tenant and owner combination",
      });
    }
    res.status(500).json({
      message: "Error creating organization request",
      error: error.message,
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
      .populate("tenantId", "-__v")
      .populate("ownerId", "-password -__v");

    if (!request) {
      return res
        .status(404)
        .json({ message: "Organization request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching organization request:", error);
    res.status(500).json({
      message: "Error fetching organization request",
      error: error.message,
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
      return res
        .status(404)
        .json({ message: "Organization request not found" });
    }

    // If status is 'approved', send approval email
    if (status === "approved") {
      // Fetch the user associated with the organization request
      const user = await Users.findById(updatedRequest.ownerId);
      if (!user || !user.email) {
        console.warn(
          `No user or email found for ownerId: ${updatedRequest.ownerId}`
        );
      } else {
        // Create action link (e.g., login page)
        const actionLink = `${config.REACT_APP_API_URL_FRONTEND}/organization-login`;

        // Send approval email
        const emailResult = await sendApprovalEmail({
          to: user.email,
          data: {
            email: user.email,
            userId: user._id,
            tenantId: user.tenantId,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            actionLink,
          },
        });

        if (!emailResult.success) {
          console.error("Failed to send approval email:", emailResult.message);
          // Optionally, you can decide whether to return an error response or continue
        }
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating status:", error);
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

exports.getAllReqForPaymentPendingPage = async (req, res) => {
  try {
    const requests = await OrganizationRequest.find({});
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error getting organization requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
