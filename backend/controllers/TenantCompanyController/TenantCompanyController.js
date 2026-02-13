const { TenantCompany } = require("../../models/TenantCompany/TenantCompany");



const createCompany = async (req, res) => {
  try {
    // 1. Destructure all fields from the schema
    const {
      name,
      industry,
      tenantId,
      status,
      website,
      primaryContactName,
      primaryContactEmail,
      description,
      address,
    } = req.body;

    // 2. Validation
    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    if (!name) {
      return res.status(400).json({ message: "Company name is required." });
    }

    // 3. Optional: Check for existing company with same name under this tenant
    const existingCompany = await TenantCompany.findOne({ name, tenantId });
    if (existingCompany) {
      return res.status(409).json({
        message: "A company with this name already exists for your account.",
      });
    }

    // 4. Create new instance with all schema fields
    const newCompany = new TenantCompany({
      name,
      industry,
      tenantId,
      status: status || "active",
      website,
      primaryContactName,
      primaryContactEmail,
      description,
      address,
    });

    const savedCompany = await newCompany.save();

    // 5. Success response
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({
      message: "Error creating company",
      error: error.message,
    });
  }
};

// Get all companies
// const getAllCompanies = async (req, res) => {
//   try {
//     // You can also add .populate("tenantId") if you want tenant details
//     const companies = await TenantCompany.find().sort({ _id: -1 });
//     res.status(200).json(companies);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching companies", error: error.message });
//   }
// };
const getAllCompanies = async (req, res) => {
  try {
    const {
      tenantId,
      page = 1,
      limit = 10,
      search,
      status,
      industry,
    } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    const query = { tenantId };

    // Search filter (Name or Industry)
    if (search) {
      // Split search into words for "AND" logic across fields
      const searchWords = search.trim().split(/\s+/).filter(Boolean);

      if (searchWords.length > 0) {
        const searchConditions = searchWords.map((word) => {
          const sanitizedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const wordRegex = new RegExp(sanitizedWord, "i");
          return {
            $or: [
              { name: wordRegex },
              { industry: wordRegex },
              { primaryContactEmail: wordRegex },
            ],
          };
        });

        // Each word must match at least one field (AND logic)
        query.$and = searchConditions;
      }
    }

    // Status filter
    if (status) {
      const statuses = Array.isArray(status) ? status : status.split(",");
      if (statuses.length > 0) {
        query.status = { $in: statuses };
      }
    }

    // Industry filter
    if (industry) {
      const industries = Array.isArray(industry) ? industry : industry.split(",");
      if (industries.length > 0) {
        query.industry = { $in: industries };
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [companies, totalCount] = await Promise.all([
      TenantCompany.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TenantCompany.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      data: companies,
      totalCount,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
};

// Get company by Id
// const getCompanyById = async (req, res) => {
//   try {
//     const company = await TenantCompany.findById(req.params.id);

//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     res.status(200).json(company);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching company", error: error.message });
//   }
// };

const getCompanyById = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { id } = req.params;

    const company = await TenantCompany.findOne({ _id: id, tenantId });

    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found for this tenant." });
    }

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching company", error: error.message });
  }
};

// Update company
// const updateCompany = async (req, res) => {
//   try {
//     const updatedCompany = await TenantCompany.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedCompany) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     res.status(200).json(updatedCompany);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Error updating company", error: error.message });
//   }
// };

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, ...updateData } = req.body;

    if (!tenantId) {
      return res
        .status(400)
        .json({ message: "tenantId is required for updates." });
    }

    const updatedCompany = await TenantCompany.findOneAndUpdate(
      { _id: id, tenantId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .json({ message: "Company not found or unauthorized." });
    }

    res.status(200).json(updatedCompany);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating company", error: error.message });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res
        .status(400)
        .json({ message: "tenantId is required for deletion." });
    }

    const company = await TenantCompany.findOneAndDelete({ _id: id, tenantId });

    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found or unauthorized." });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting company", error: error.message });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
