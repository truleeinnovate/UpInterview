// controllers/interviewerController.js - CRUD operations for Interviewers
const Interviewer = require("../models/Interviewer");

// Get all interviewers with pagination and filters
const getAllInterviewers = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const {
      page = 0,
      limit = 10,
      search = "",
      tag = "",
      type = "",
      status = "",
      team = "",
      sortBy = "-createdAt",
    } = req.query;

    // Build filter query
    const filter = { tenantId };

    // Search by name or email
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by tag
    if (tag && tag !== "all") {
      filter.tag_ids = tag;
    }

    // Filter by type (internal/external)
    if (type && type !== "all") {
      filter.interviewer_type = type;
    }

    // Filter by status (active/inactive)
    if (status && status !== "all") {
      filter.is_active = status === "active";
    }

    // Filter by team
    if (team && team !== "all") {
      filter.team_id = team;
    }

    const skip = Number(page) * Number(limit);
    const limitNum = Number(limit);

    // Get total count
    const totalItems = await Interviewer.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get interviewers with populated references
    const interviewers = await Interviewer.find(filter)
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .populate(
        "contactId",
        "firstName lastName email currentRole imageData rating",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      data: interviewers,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
        hasNext: Number(page) < totalPages - 1,
        hasPrev: Number(page) > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    res
      .status(500)
      .json({ message: "Error fetching interviewers", error: error.message });
  }
};

// Get all interviewers without pagination (for dropdowns)
const getAllInterviewersData = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const { active_only = "false" } = req.query;
    const filter = { tenantId };

    if (active_only === "true") {
      filter.is_active = true;
    }

    const interviewers = await Interviewer.find(filter)
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .populate(
        "contactId",
        "firstName lastName email currentRole imageData rating",
      )
      .sort({ createdAt: -1 })
      .lean();
    console.log("interviewers---------------->", interviewers);

    res.status(200).json(interviewers);
  } catch (error) {
    console.error("Error fetching all interviewers:", error);
    res
      .status(500)
      .json({ message: "Error fetching interviewers", error: error.message });
  }
};

// Get single interviewer by ID
const getInterviewerById = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const { id } = req.params;

    const interviewer = await Interviewer.findOne({ _id: id, tenantId })
      .populate("tag_ids", "name color category description")
      .populate("team_id", "name color description department")
      .populate(
        "contactId",
        "firstName lastName email currentRole imageData rating",
      )
      .lean();

    if (!interviewer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    res.status(200).json(interviewer);
  } catch (error) {
    console.error("Error fetching interviewer:", error);
    res
      .status(500)
      .json({ message: "Error fetching interviewer", error: error.message });
  }
};

// Create new interviewer
const createInterviewer = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;

    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const {
      contactId,
      interviewer_type,
      tag_ids,
      team_id,
      is_active,
      specializations,
      max_interviews_per_week,
      // External interviewer fields (for future use)
      external_company,
      hourly_rate,
      contract_end_date,
    } = req.body;

    // Validate required fields - contactId is required
    if (!contactId) {
      return res
        .status(400)
        .json({ message: "Contact ID is required to create an interviewer" });
    }

    // Check if interviewer already exists for this contactId and tenant
    const existingInterviewer = await Interviewer.findOne({
      contactId,
      tenantId,
    });
    if (existingInterviewer) {
      return res
        .status(400)
        .json({ message: "An interviewer already exists for this contact" });
    }

    // Prepare interviewer data - name/email/title/department/avatar come from user_id (Contact)
    const interviewerData = {
      contactId,
      interviewer_type: interviewer_type || "internal",
      tag_ids: tag_ids || [],
      team_id: team_id || null,
      is_active: is_active !== undefined ? is_active : true,
      specializations: specializations || [],
      max_interviews_per_week: max_interviews_per_week || 5,
      tenantId,
    };

    // Add external interviewer fields (for future use)
    if (interviewer_type === "external") {
      interviewerData.external_company = external_company;
      interviewerData.hourly_rate = hourly_rate;
      interviewerData.contract_end_date = contract_end_date;
    }

    const newInterviewer = new Interviewer(interviewerData);
    await newInterviewer.save();

    // Populate references for response
    const populatedInterviewer = await Interviewer.findById(newInterviewer._id)
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .populate(
        "contactId",
        "firstName lastName email currentRole imageData rating",
      )
      .lean();

    res.status(201).json({
      message: "Interviewer created successfully",
      data: populatedInterviewer,
    });
  } catch (error) {
    console.error("Error creating interviewer:", error);
    res
      .status(500)
      .json({ message: "Error creating interviewer", error: error.message });
  }
};

// Update interviewer
const updateInterviewer = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.tenantId;
    delete updateData.ownerId;
    delete updateData._id;

    // Check if interviewer exists
    const existingInterviewer = await Interviewer.findOne({
      _id: id,
      tenantId,
    });
    if (!existingInterviewer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    // If email is being changed, check for duplicates
    if (updateData.email && updateData.email !== existingInterviewer.email) {
      const emailExists = await Interviewer.findOne({
        email: updateData.email,
        tenantId,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "An interviewer with this email already exists" });
      }
    }

    // Handle type-specific field cleanup
    if (updateData.interviewer_type === "internal") {
      updateData.external_company = null;
      updateData.hourly_rate = null;
      updateData.contract_end_date = null;
    } else if (updateData.interviewer_type === "external") {
      updateData.contactId = null;
    }

    const updatedInterviewer = await Interviewer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .lean();

    res.status(200).json({
      message: "Interviewer updated successfully",
      data: updatedInterviewer,
    });
  } catch (error) {
    console.error("Error updating interviewer:", error);
    res
      .status(500)
      .json({ message: "Error updating interviewer", error: error.message });
  }
};

// Delete interviewer
const deleteInterviewer = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const { id } = req.params;

    const interviewer = await Interviewer.findOneAndDelete({
      _id: id,
      tenantId,
    });
    if (!interviewer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    res.status(200).json({ message: "Interviewer deleted successfully" });
  } catch (error) {
    console.error("Error deleting interviewer:", error);
    res
      .status(500)
      .json({ message: "Error deleting interviewer", error: error.message });
  }
};

// Toggle interviewer active status
const toggleInterviewerActive = async (req, res) => {
  try {
    const tenantId = res.locals.auth?.actingAsTenantId;
    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: No tenant ID" });
    }

    const { id } = req.params;
    const { is_active } = req.body;

    const updatedInterviewer = await Interviewer.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { is_active } },
      { new: true },
    )
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .lean();

    if (!updatedInterviewer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    res.status(200).json({
      message: `Interviewer ${is_active ? "activated" : "deactivated"} successfully`,
      data: updatedInterviewer,
    });
  } catch (error) {
    console.error("Error toggling interviewer status:", error);
    res
      .status(500)
      .json({
        message: "Error toggling interviewer status",
        error: error.message,
      });
  }
};

module.exports = {
  getAllInterviewers,
  getAllInterviewersData,
  getInterviewerById,
  createInterviewer,
  updateInterviewer,
  deleteInterviewer,
  toggleInterviewerActive,
};
