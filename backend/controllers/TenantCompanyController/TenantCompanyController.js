const { TenantCompany } = require("../../models/TenantCompany/TenantCompany");

// Create Company
const createCompany = async (req, res) => {
  try {
    const { name, industry, tenantId, status } = req.body;

    const newCompany = new TenantCompany({
      name,
      industry,
      tenantId,
      status,
    });

    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating company", error: error.message });
  }
};

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    // You can also add .populate("tenantId") if you want tenant details
    const companies = await TenantCompany.find().sort({ _id: -1 });
    res.status(200).json(companies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
};

// Get company by Id
const getCompanyById = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await TenantCompany.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching company", error: error.message });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const updatedCompany = await TenantCompany.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
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
    const company = await TenantCompany.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
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
