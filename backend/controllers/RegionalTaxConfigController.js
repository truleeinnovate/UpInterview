// v1.0.0 - Venkatesh - Controller to expose tenant tax configuration (GST, service charge)

const { getTaxConfigForTenant } = require("../utils/taxConfigUtil");

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

module.exports = {
  getTenantTaxConfig,
};
