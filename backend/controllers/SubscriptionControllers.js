const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const { validateSubscriptionPlan } = require('../utils/subscriptionPlanValidation.js');

// Create a new subscription plan
const createSubscriptionPlan = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Create Subscription Plan";

  try {
    const body = req.body || {};
    // Sanitize payload - pick only allowed fields
    const payload = {
      planId: body.planId,
      name: body.name,
      description: body.description,
      pricing: body.pricing,
      features: body.features,
      razorpayPlanIds: body.razorpayPlanIds,
      maxUsers: body.maxUsers,
      subscriptionType: body.subscriptionType,
      trialPeriod: body.trialPeriod,
      active: body.active,
      isCustomizable: body.isCustomizable,
      // Persist owning user and audit fields
      ownerId: body.ownerId,
      createdBy: body.createdBy,
      updatedBy: body.modifiedBy || body.createdBy,
      createdAt: body.createdAt,
      updatedAt: new Date(),
    };

    const { error } = validateSubscriptionPlan(payload);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const subscriptionPlan = new SubscriptionPlan(payload);
    await subscriptionPlan.save();

    // Structured internal log for successful plan creation
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Subscription Plan",
      requestBody: req.body,
      status: "success",
      message: "Subscription plan created successfully",
      responseBody: subscriptionPlan,
    };

    res.status(201).json("Created Plan Successfully.");
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.planId) {
      return res.status(409).send({ message: 'Duplicate planId. It must be unique.' });
    }
    
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Subscription Plan",
      requestBody: req.body,
      status: "error",
      message: err.message,
    };

    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

// Fetch subscription plans (list)
const getSubscriptionPlan = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store'); // Prevent caching

    const { page, limit, search, subscriptionTypes, activeStates, createdDate } = req.query;
    const hasParams = Boolean(page || limit || search || subscriptionTypes || activeStates || createdDate);

    // Legacy: return full list when no params provided
    if (!hasParams) {
      const plan = await SubscriptionPlan.find();
      if (!plan.length) {
        return res.status(404).send({ message: 'Subscription Plan not found' });
      }
      return res.status(200).send(plan);
    }

    // Server-side pagination + filters
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const perPage = Math.max(parseInt(limit) || 10, 1);
    const skip = (currentPage - 1) * perPage;

    const match = {};

    // Search across several fields
    if (typeof search === 'string' && search.trim()) {
      const s = search.trim();
      match.$or = [
        { planId: { $regex: s, $options: 'i' } },
        { name: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { 'features.name': { $regex: s, $options: 'i' } },
        { 'features.description': { $regex: s, $options: 'i' } },
        { 'pricing.currency': { $regex: s, $options: 'i' } },
        { 'pricing.billingCycle': { $regex: s, $options: 'i' } },
      ];
    }

    // Filter: subscriptionTypes (comma-separated)
    if (subscriptionTypes) {
      const arr = String(subscriptionTypes)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      if (arr.length) match.subscriptionType = { $in: arr };
    }

    // Filter: activeStates (Active/Inactive -> boolean)
    if (activeStates) {
      const vals = String(activeStates)
        .split(',')
        .map((v) => v.trim().toLowerCase())
        .filter((v) => v === 'active' || v === 'inactive');
      const bools = Array.from(new Set(vals.map((v) => (v === 'active'))));
      if (bools.length === 1) match.active = bools[0];
      // if both provided, no filter needed
    }

    // Filter: createdDate presets: last7, last30
    if (createdDate === 'last7' || createdDate === 'last30') {
      const now = Date.now();
      const ms = createdDate === 'last7' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const threshold = new Date(now - ms);
      match.createdAt = { $gte: threshold };
    }

    const pipeline = [
      { $match: match },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: perPage },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const result = await SubscriptionPlan.aggregate(pipeline);
    const data = result?.[0]?.data || [];
    const total = result?.[0]?.meta?.[0]?.total || 0;

    return res.status(200).json({
      plans: data,
      total,
      page: currentPage,
      itemsPerPage: perPage,
    });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error', error: err.message });
  }
};

// Get a single subscription plan by ID
const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).send({ message: 'Subscription Plan not found' });
    }
    res.status(200).send(plan);
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error', error: err.message });
  }
};

// Update subscription plan by ID
const updateSubscriptionPlan = async (req, res) => {
  // Mark that logging will be handled by this controller
  res.locals.loggedByController = true;
  res.locals.processName = "Update Subscription Plan Definition";

  try {
    const { id } = req.params;
    const existing = await SubscriptionPlan.findById(id);
    if (!existing) {
      return res.status(404).send({ message: 'Subscription Plan not found' });
    }

    // Build payload only from allowed fields to avoid Joi unknown key errors like "_id is not allowed"
    const body = req.body || {};
    const payload = {
      planId: body.planId,
      name: body.name,
      description: body.description,
      pricing: body.pricing,
      features: body.features,
      razorpayPlanIds: body.razorpayPlanIds,
      maxUsers: body.maxUsers,
      subscriptionType: body.subscriptionType,
      trialPeriod: body.trialPeriod,
      active: body.active,
      isCustomizable: body.isCustomizable,
      // Keep original creator, but allow updating owner and updatedBy
      ownerId: existing.ownerId || body.ownerId,
      createdBy: existing.createdBy,
      updatedBy: body.modifiedBy || existing.updatedBy || existing.createdBy,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    // Validate payload (Joi schema does not allow unknown keys like _id)
    const { error } = validateSubscriptionPlan(payload);
    if (error) return res.status(400).send({ message: error.details?.[0]?.message || 'Invalid payload' });

    existing.set(payload);
    const updated = await existing.save();

    // Structured internal log for successful plan update
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Subscription Plan Definition",
      requestBody: req.body,
      status: "success",
      message: "Subscription plan updated successfully",
      responseBody: updated,
    };

    res.status(200).json(updated);
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.planId) {
      return res.status(409).send({ message: 'Duplicate planId. It must be unique.' });
    }
    
    // Structured internal log for error case
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Subscription Plan Definition",
      requestBody: req.body,
      status: "error",
      message: err.message,
    };

    res.status(500).send({ message: 'Internal Server Error', error: err.message });
  }
};

// Delete subscription plan by ID
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SubscriptionPlan.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send({ message: 'Subscription Plan not found' });
    }
    res.status(200).send({ message: 'Deleted Plan Successfully.' });
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error', error: err.message });
  }
};


module.exports = {createSubscriptionPlan, getSubscriptionPlan, getSubscriptionPlanById, updateSubscriptionPlan, deleteSubscriptionPlan}