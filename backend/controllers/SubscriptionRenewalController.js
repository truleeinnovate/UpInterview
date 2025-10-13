// This file now only contains utility functions for updating tenant limits
// All subscription renewal is handled by Razorpay webhook in RazorpayController.js
// DO NOT USE ANY CRON JOBS OR MANUAL RENEWAL PROCESSES

const mongoose = require('mongoose');
const moment = require('moment');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const SubscriptionPlan = require('../models/Subscriptionmodels');
const Tenant = require('../models/Tenant');
const { calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers');
const SUBSCRIPTION_STATUSES = require('../constants/subscriptionStatuses');

// console.log('[SUBSCRIPTION RENEWAL] Utility functions loaded - All renewal handled by Razorpay webhooks');

/**
 * Update tenant limits on renewal (Usage creation removed - handled in RazorpayController)
 */
const updateTenantLimits = async (subscription) => {
    try {
        const tenantId = subscription.tenantId;
        // console.log(`[RENEWAL] Updating tenant limits for ${tenantId}`);

        // Get subscription plan to fetch features
        const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId).lean();
        if (!plan) {
            // console.error(`[RENEWAL] Plan not found: ${subscription.subscriptionPlanId}`);
            return;
        }

        // Update tenant limits only
        const features = plan.features || [];
        const tenant = await Tenant.findById(tenantId);
        if (tenant) {
            // Get bandwidth limit - handle "unlimited" string
            const bandwidthFeature = features.find(f => f?.name === 'Bandwidth');
            let bandwidthLimit = bandwidthFeature?.limit || tenant.usersBandWidth || 0;
            if (bandwidthLimit === "unlimited" || bandwidthLimit === "Unlimited") {
                bandwidthLimit = 999999999; // Set to a very large number for unlimited
            }
            bandwidthLimit = Number(bandwidthLimit) || 0; // Ensure it's a number
            
            // Get users limit - handle "unlimited" string
            const usersFeature = features.find(f => f?.name === 'Users');
            let usersLimit = usersFeature?.limit || tenant.totalUsers || 0;
            if (usersLimit === "unlimited" || usersLimit === "Unlimited") {
                usersLimit = 999999; // Set to a very large number for unlimited users
            }
            usersLimit = Number(usersLimit) || 0; // Ensure it's a number
            
            tenant.usersBandWidth = bandwidthLimit;
            tenant.totalUsers = usersLimit;
            tenant.status = 'active';
            await tenant.save();
            // console.log(`[RENEWAL] Tenant limits updated for ${tenantId}`);
        }

        // Note: Usage document will be created/updated only after payment verification in RazorpayController
        // console.log(`[RENEWAL] Usage document will be handled by payment verification process`);
    } catch (error) {
        console.error('[RENEWAL] Error updating tenant limits:', error);
    }
};

// REMOVED: processSubscriptionRenewal function 
// All subscription renewal is now handled exclusively by Razorpay webhook
// in RazorpayController.handleSubscriptionCharged()
// DO NOT create any manual renewal processes

// REMOVED: runSubscriptionRenewalJob function
// No cron jobs needed - Razorpay handles all renewals automatically

// REMOVED: manualRenewalCheck function
// No manual renewal checks needed - Razorpay handles everything

/**
 * Get renewal status for a subscription
 * This is a read-only endpoint to check subscription status
 * Actual renewal is handled by Razorpay webhook
 */
const getSubscriptionRenewalStatus = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        
        const subscription = await CustomerSubscription.findById(subscriptionId)
            .populate('subscriptionPlanId');
        
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const now = new Date();
        const daysUntilRenewal = subscription.nextBillingDate ? 
            Math.ceil((subscription.nextBillingDate - now) / (1000 * 60 * 60 * 24)) : null;

        res.json({
            subscriptionId: subscription._id,
            status: subscription.status,
            autoRenew: subscription.autoRenew,
            currentPeriod: {
                start: subscription.startDate,
                end: subscription.endDate
            },
            nextBillingDate: subscription.nextBillingDate,
            daysUntilRenewal,
            lastPaymentDate: subscription.lastPaymentDate,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
            message: 'Subscription renewal is handled automatically by Razorpay'
        });
    } catch (error) {
        console.error('[SUBSCRIPTION] Status check error:', error);
        res.status(500).json({ error: error.message });
    }
};

// NO CRON JOBS - ALL RENEWAL HANDLED BY RAZORPAY WEBHOOKS

module.exports = {
    updateTenantLimits,
    getSubscriptionRenewalStatus,
    calculateEndDate
};
