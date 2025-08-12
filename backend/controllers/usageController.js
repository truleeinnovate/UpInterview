//<------v1.0.0-----Venkatesh----write controller for getUsageByTenant
const mongoose = require('mongoose');
const Usage = require('../models/Usage');
const Tenant = require('../models/Tenant');
const { Users } = require('../models/Users');

// GET /usage
// Returns usage for current period (or latest) for the tenant.
// Tenant is resolved from query (?tenantId=...) or from res.locals.tenantId (permissionMiddleware)
const getUsageByTenant = async (req, res) => {
  try {
    const {tenantId } = req.params

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Let mongoose cast tenantId to ObjectId when needed
    const filter = { tenantId };
    const now = new Date();

    // Prefer current period document
    let usage = await Usage.findOne({
      ...filter,
      fromDate: { $lte: now },
      toDate: { $gte: now }
    }).lean();

    // Fallback to latest by toDate
    if (!usage) {
      usage = await Usage.findOne(filter).sort({ toDate: -1 }).lean();
    }

    if (!usage) {
      return res.status(404).json({ message: 'No usage found for tenant' });
    }

    // Fetch tenant plan limits and current user count for this tenant
    const [tenant, userCount] = await Promise.all([
      Tenant.findById(tenantId).lean().catch(() => null),
      Users.countDocuments({ tenantId }).catch(() => 0)
    ]);

    // const tenant = await Tenant.find(tenantId)

    const usersBandWidth = tenant?.usersBandWidth ?? null;
    const totalUsersLimit = tenant?.totalUsers ?? null;

    const attributes = (usage.usageAttributes || []).map((attr) => {
      const entitled = Number(attr.entitled) || 0;
      const utilized = Number(attr.utilized) || 0;
      const remaining = Math.max(entitled - utilized, 0);
      const utilizationRate = entitled > 0 ? Math.min((utilized / entitled) * 100, 100) : 0;
      return {
        _id: attr._id,
        type: attr.type,
        entitled,
        utilized,
        remaining,
        utilizationRate
      };
    });

    return res.json({
      _id: usage._id,
      tenantId: usage.tenantId,
      period: {
        fromDate: usage.fromDate,
        toDate: usage.toDate
      },
      totalUsers: totalUsersLimit,
      usersBandWidth: usersBandWidth,
      currentUsers: userCount,
      attributes
    });
  } catch (error) {
    console.error('getUsageByTenant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUsageByTenant };

//-------v1.0.0------->