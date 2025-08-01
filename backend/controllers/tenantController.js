const Tenant = require('../models/Tenant');

// @desc    Get tenant by email
// @route   GET /api/tenants/email/:email
// @access  Public
exports.getTenantByEmail = async (req, res) => {
  console.log('Getting tenant by email...');
  try {
    console.log('Getting email from req.params...');
    const { email } = req.params;
    
    console.log('Checking if email is empty...');
    if (!email) {
      console.log('Email is empty, returning 400 error');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('Finding tenant by email...');
    const tenant = await Tenant.findOne({ email });

    console.log('Checking if tenant is found...');
    if (!tenant) {
      console.log('Tenant not found, returning 404 error');
      return res.status(404).json({
        success: false,
        message: 'Tenant not found with this email'
      });
    }

    console.log('Returning tenant data...');
    res.status(200).json({
      success: true,
      data: tenant
    });

  } catch (error) {
    console.error('Error fetching tenant by email:', error);
    console.log('Returning 500 error...');
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
