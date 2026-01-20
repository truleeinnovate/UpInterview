const { TenantCompany } = require("../../models/TenantCompany/TenantCompany");

// Create Company
// const createCompany = async (req, res) => {
//   try {
//     const { name, industry, tenantId } = req.body;

//     const newCompany = new TenantCompany({
//       name,
//       industry,
//       tenantId,
//     });

//     const savedCompany = await newCompany.save();
//     res.status(201).json(savedCompany);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Error creating company", error: error.message });
//   }
// };

// const createCompany = async (req, res) => {
//   try {
//     const { name, industry, tenantId, status } = req.body;

//     if (!tenantId) {
//       return res.status(400).json({ message: "tenantId is required." });
//     }

//     const newCompany = new TenantCompany({
//       name,
//       industry,
//       tenantId,
//       status: status || "active",
//     });

//     const savedCompany = await newCompany.save();
//     res.status(201).json(savedCompany);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ message: "Error creating company", error: error.message });
//   }
// };

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
      return res
        .status(409)
        .json({
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
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required." });
    }

    const companies = await TenantCompany.find({ tenantId }).sort({ _id: -1 });
    res.status(200).json(companies);
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
