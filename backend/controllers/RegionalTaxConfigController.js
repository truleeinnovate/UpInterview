// v1.0.0 - Venkatesh - Controller to expose tenant tax configuration (GST, service charge)

const { getTaxConfigForTenant } = require("../utils/taxConfigUtil");
const { RegionalTaxConfig } = require("../models/RegionalTaxConfig");

// Lightweight endpoint to expose tenant tax configuration (GST, service charge, etc.)
// for the currently authenticated tenant or an explicitly provided tenantId.
const getTenantTaxConfig = async (req, res) => {
  try {
    const auth = res.locals?.auth || {};
    const explicitTenantId =
      (req.query && req.query.tenantId) ||
      (req.body && req.body.tenantId) ||
      (req.params && req.params.tenantId);

    const tenantId = explicitTenantId || auth.actingAsTenantId || "";

    const taxConfig = await getTaxConfigForTenant({ tenantId });

    return res.status(200).json({
      success: true,
      ...taxConfig,
    });
  } catch (error) {
    console.error("[getTenantTaxConfig] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load tenant tax configuration",
      error: error.message,
    });
  }
};

// GET /regional-tax

const getAllRegionalTaxConfigs = async (req, res) => {
  try {
    const configs = await RegionalTaxConfig.find().sort({ _id: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error("[getAllRegionalTaxConfigs]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch regional tax configurations",
    });
  }
};

// GET /regional-tax/:id
const getRegionalTaxConfigById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await RegionalTaxConfig.findById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Regional tax configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("[getRegionalTaxConfigById]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch regional tax configuration",
    });
  }
};

// POST /regional-tax
const createRegionalTaxConfig = async (req, res) => {
  try {
    const payload = req.body;

    // Optional: Ensure only one default config exists
    if (payload.isDefault) {
      await RegionalTaxConfig.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const config = await RegionalTaxConfig.create(payload);

    return res.status(201).json({
      success: true,
      message: "Regional tax configuration created successfully",
      data: config,
    });
  } catch (error) {
    console.error("[createRegionalTaxConfig]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create regional tax configuration",
      error: error.message,
    });
  }
};

// PUT /regional-tax/:id
const updateRegionalTaxConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Optional: Ensure only one default config exists
    if (payload.isDefault) {
      await RegionalTaxConfig.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const updatedConfig = await RegionalTaxConfig.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    );

    if (!updatedConfig) {
      return res.status(404).json({
        success: false,
        message: "Regional tax configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Regional tax configuration updated successfully",
      data: updatedConfig,
    });
  } catch (error) {
    console.error("[updateRegionalTaxConfig]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update regional tax configuration",
      error: error.message,
    });
  }
};

// DELETE /regional-tax/:id
const deleteRegionalTaxConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedConfig = await RegionalTaxConfig.findByIdAndDelete(id);

    if (!deletedConfig) {
      return res.status(404).json({
        success: false,
        message: "Regional tax configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Regional tax configuration deleted successfully",
    });
  } catch (error) {
    console.error("[deleteRegionalTaxConfig]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete regional tax configuration",
    });
  }
};

module.exports = {
  getTenantTaxConfig,
  getAllRegionalTaxConfigs,
  getRegionalTaxConfigById,
  createRegionalTaxConfig,
  updateRegionalTaxConfig,
  deleteRegionalTaxConfig,
};
