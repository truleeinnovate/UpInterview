const Tenant = require("../models/Tenant");

// @desc    Get tenant by email
// @route   GET /api/tenants/email/:email
// @access  Public
exports.getTenantByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const tenant = await Tenant.findOne({ email });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found with this email",
      });
    }

    res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant by email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
