const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const { validateSubscriptionPlan } = require('../utils/subscriptionPlanValidation.js');

// Create a new subscription plan
const createSubscriptionPlan = async (req, res) => {
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
          createdBy: body.createdBy,
          modifiedBy: body.modifiedBy,
          createdAt: body.createdAt,
          updatedAt: new Date(),
        };

        const { error } = validateSubscriptionPlan(payload);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const subscriptionPlan = new SubscriptionPlan(payload);
        await subscriptionPlan.save();
        res.status(201).send("Created Plan Successfully.");
    } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.planId) {
          return res.status(409).send({ message: 'Duplicate planId. It must be unique.' });
        }
        res.status(500).send({ message: 'Internal Server Error', error: err.message });
    }
};

// Fetch a subscription plan by ID
const getSubscriptionPlan = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store'); // Prevent caching

    const plan = await SubscriptionPlan.find();
    if (!plan.length) {
      return res.status(404).send({ message: 'Subscription Plan not found' });
    }

    res.status(200).send(plan);
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
      createdBy: existing.createdBy,
      modifiedBy: body.modifiedBy,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    // Validate payload (Joi schema does not allow unknown keys like _id)
    const { error } = validateSubscriptionPlan(payload);
    if (error) return res.status(400).send({ message: error.details?.[0]?.message || 'Invalid payload' });

    existing.set(payload);
    const updated = await existing.save();
    res.status(200).send(updated);
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.planId) {
      return res.status(409).send({ message: 'Duplicate planId. It must be unique.' });
    }
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