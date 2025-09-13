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
      usage = await Usage.findOne(filter).sort({ _id: -1 }).lean();
    }

    if (!usage) {
      return res.status(404).json({ message: 'No active usage period' });
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

//<------v1.1.0-----Venkatesh----write controller for getUsageHistory
// GET /usage/history/:tenantId?ownerId=...&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=10
// Returns paginated history entries from embedded usageHistory arrays
const getUsageHistory = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { ownerId, from, to, page = 1, limit = 10 } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const filter = { tenantId };
    if (ownerId) filter.ownerId = ownerId;

    const usageDocs = await Usage.find(filter).lean();

    if (!usageDocs || usageDocs.length === 0) {
      return res.status(404).json({ message: 'No usage documents found' });
    }

    let entries = [];
    for (const doc of usageDocs) {
      const history = Array.isArray(doc.usageHistory) ? doc.usageHistory : [];
      const mapped = history.map((h) => ({
        tenantId: doc.tenantId,
        ownerId: doc.ownerId,
        fromDate: h.fromDate,
        toDate: h.toDate,
        usageAttributes: h.usageAttributes,
        archivedAt: h.archivedAt || null,
      }));
      entries.push(...mapped);
    }

    // Optional date range filtering (overlap semantics)
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate) {
      entries = entries.filter((e) => new Date(e.toDate) >= fromDate);
    }
    if (toDate) {
      entries = entries.filter((e) => new Date(e.fromDate) <= toDate);
    }

    // Sort by toDate desc
    entries.sort((a, b) => new Date(b.toDate) - new Date(a.toDate));

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const total = entries.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const start = (pageNum - 1) * pageSize;
    const data = entries.slice(start, start + pageSize);

    return res.json({
      tenantId,
      ownerId: ownerId || null,
      pagination: { page: pageNum, limit: pageSize, total, totalPages },
      data,
    });
  } catch (error) {
    console.error('getUsageHistory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUsageByTenant, getUsageHistory };
//-------v1.1.0------->