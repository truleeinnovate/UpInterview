// controllers/interviewerController.js - CRUD operations for Interviewers
const Interviewer = require("../models/Interviewer");
const { Users } = require("../models/Users");

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

    const filter = { tenantId };

    // Search
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (tag && tag !== "all") filter.tag_ids = tag;
    if (type && type !== "all") filter.interviewer_type = type;
    if (status && status !== "all") filter.is_active = status === "active";
    if (team && team !== "all") filter.team_id = team;

    const skip = Number(page) * Number(limit);
    const limitNum = Number(limit);

    const totalItems = await Interviewer.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    // Get interviewer users with pagination
    const users = await Users.find({ tenantId })
      .select(
        "_id firstName lastName email profileId status roleId isFreelancer isAddedTeam createdAt",
      )
      .populate("roleId", "roleName label")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (users.length === 0) {
      return res.status(200).json({
        data: [],
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: totalUsers,
          itemsPerPage: limitNum,
          hasNext: Number(page) < totalPages - 1,
          hasPrev: Number(page) > 0,
        },
      });
    }

    const contacts = await Interviewer.find(filter)
      .populate("tag_ids", "name color category")
      .populate("team_id", "name color")
      .populate({
        path: "contactId",
        select:
          "firstName lastName email currentRole imageData rating skills availability",
        populate: {
          path: "availability",
          model: "InterviewAvailability",
        },
      })
      // .populate(
      //   "contactId",
      //   "_id firstName lastName email currentRole imageData rating skills",
      // )
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Merge contact and user data (reversed loop - contacts first)
    const interviewers = contacts.map((contact) => {
      // Find corresponding user
      const user = users.find(
        (u) =>
          u._id.toString() === contact?.contactId?.ownerId?.toString() ||
          u.profileId === contact.profileId,
      );

      return {
        user: user
          ? {
              _id: user?._id,
              //   firstName: user?.firstName,
              //   lastName: user?.lastName,
              //   email: user?.email,
              status: user?.status,
              role: user?.roleId,
              profileId: user?.profileId,
              isFreelancer: user?.isFreelancer,
              isAddedTeam: user?.isAddedTeam,
              createdAt: user?.createdAt,
            }
          : null,
        contactDetails: {
          _id: contact?.contactId?._id,
          firstName: contact?.contactId?.firstName,
          lastName: contact?.contactId?.lastName,
          email: contact?.contactId?.email,
          //   phone: contact?.contactId?.phone,
          currentRole: contact?.contactId?.currentRole,
          imageData: contact?.contactId?.imageData,
          rating: contact?.contactId?.rating,
          availability: contact.contactId?.availability || [],
          //   status: contact?.contactId?.status,
          //   skills: contact?.contactId?.skills || [],
          //   timeZone: contact?.contactId?.timeZone,
          //   location: contact?.contactId?.location,
          //   rates: contact?.contactId?.rates,
          //   lead_rate: contact?.contactId?.lead_rate,
          //   professionalTitle: contact?.contactId?.professionalTitle,
          //   bio: contact?.contactId?.bio,
          //   yearsOfExperience: contact?.contactId?.yearsOfExperience,
          //   language: contact?.contactId?.language,
          //   interviewFormatWeOffer:
          //     contact?.contactId?.InterviewFormatWeOffer || [],
          //   mock_interview_discount: contact?.contactId?.mock_interview_discount,
          //   isMockInterviewSelected: contact?.contactId?.isMockInterviewSelected,
          //   completionStatus: contact?.contactId?.completionStatus,
          //   createdAt: contact?.contactId?.createdAt,
          //   updatedAt: contact?.contactId?.updatedAt,
        },
        interviwer: {
          //   contact,
          _id: contact?._id,
          interviewer_type: contact?.interviewer_type,
          is_active: contact?.is_active,
          interviews_conducted: contact?.interviews_conducted,
          specializations: contact?.specializations,
          max_interviews_per_week: contact?.max_interviews_per_week,
          external_company: contact?.external_company,
          hourly_rate: contact?.hourly_rate,
          contract_end_date: contact?.contract_end_date,
          overall_rating: contact?.overall_rating,
          rating_breakdown: contact?.rating_breakdown,
          tenantId: contact?.tenantId,
          tags: contact.tag_ids || [],
          team: contact.team_id || null,
        },
        // interviewerActive: contact?.is_active,
        // availability: contact.availability || [],
        // tags: contact.tag_ids || [],
        // team: contact.team_id || null,
      };
    });

    // If contact status filter is applied, filter out results without contact details
    let finalInterviewers = interviewers;
    // if (contactStatus && contactStatus !== "all") {
    //   finalInterviewers = interviewers.filter(
    //     (item) => item.contactDetails !== null,
    //   );
    // }

    // console.log("finalInterviewers", finalInterviewers);

    return res.status(200).json({
      data: finalInterviewers,
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
    return res.status(500).json({
      message: "Error fetching interviewers",
      error: error.message,
    });
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
      .populate({
        path: "contactId",
        select:
          "firstName lastName email location industry company currentRole imageData rating skills availability",
        populate: {
          path: "availability",
          model: "InterviewAvailability",
        },
      })
      // .populate(
      //   "contactId",
      //   "firstName lastName email currentRole imageData rating skills",
      // )
      .sort({ createdAt: -1 })
      .lean();

    console.log("interviewers", interviewers);

    return res.status(200).json(interviewers);
  } catch (error) {
    console.error("Error fetching all interviewers:", error);
    return res.status(500).json({
      message: "Error fetching interviewers",
      error: error.message,
    });
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
    res.status(500).json({
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
