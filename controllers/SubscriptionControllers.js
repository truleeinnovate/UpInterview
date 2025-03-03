const SubscriptionPlan = require('../models/Subscriptionmodels.js');
const { validateSubscriptionPlan } = require('../utils/subscriptionPlanValidation.js');

// Create a new subscription plan
const createSubscriptionPlan = async (req, res) => {
    try {
        const { error } = validateSubscriptionPlan(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const subscriptionPlan = new SubscriptionPlan(req.body);
         await subscriptionPlan.save();
        res.status(201).send("Created Plan Successfully.");
    } catch (err) {
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


module.exports = {createSubscriptionPlan,getSubscriptionPlan}