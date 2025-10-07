const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const SubscriptionPlan = require('../models/Subscriptionmodels');
// Usage creation removed - now handled only in RazorpayController after payment verification
// // const Usage = require('../models/Usage'); // Usage creation removed - now handled only in RazorpayController after payment verification
const Tenant = require('../models/Tenant');
const Invoicemodels = require('../models/Invoicemodels');
const Payment = require('../models/Payments');
const Receipt = require('../models/Receiptmodels');
const { calculateEndDate, createInvoice } = require('./CustomerSubscriptionInvoiceContollers');
const SUBSCRIPTION_STATUSES = require('../constants/subscriptionStatuses');

// Runtime configuration
const RENEWAL_CRON_ENABLED = process.env.RENEWAL_CRON_ENABLED !== 'false';
const RENEWAL_CRON_SCHEDULE = process.env.RENEWAL_CRON_SCHEDULE || '0 */6 * * *'; // Every 6 hours
const USE_LOCKS = process.env.RENEWAL_USE_LOCKS === 'true';
const LOCK_TTL_MS = parseInt(process.env.RENEWAL_LOCK_TTL_MS || '', 10) || (55 * 60 * 1000);

console.log('[SUBSCRIPTION RENEWAL] Controller initialized at', new Date().toISOString());

/**
 * Update tenant limits on renewal (Usage creation removed - handled in RazorpayController)
 */
const updateTenantLimits = async (subscription) => {
    try {
        const tenantId = subscription.tenantId;
        console.log(`[RENEWAL] Updating tenant limits for ${tenantId}`);

        // Get subscription plan to fetch features
        const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId).lean();
        if (!plan) {
            console.error(`[RENEWAL] Plan not found: ${subscription.subscriptionPlanId}`);
            return;
        }

        // Update tenant limits only
        const features = plan.features || [];
        const tenant = await Tenant.findById(tenantId);
        if (tenant) {
            const bandwidthLimit = features.find(f => f?.name === 'Bandwidth')?.limit || tenant.usersBandWidth || 0;
            const usersLimit = features.find(f => f?.name === 'Users')?.limit || tenant.totalUsers || 0;
            
            tenant.usersBandWidth = bandwidthLimit;
            tenant.totalUsers = usersLimit;
            tenant.status = 'active';
            await tenant.save();
            console.log(`[RENEWAL] Tenant limits updated for ${tenantId}`);
        }

        // Note: Usage document will be created/updated only after payment verification in RazorpayController
        console.log(`[RENEWAL] Usage document will be handled by payment verification process`);
    } catch (error) {
        console.error('[RENEWAL] Error updating tenant limits:', error);
    }
};

/**
 * Process subscription renewal
 */
const processSubscriptionRenewal = async (subscription) => {
    try {
        console.log(`[RENEWAL] Processing renewal for subscription ${subscription._id}`);
        
        const now = new Date();
        const billingCycle = subscription.selectedBillingCycle || 'monthly';
        const newEndDate = calculateEndDate(billingCycle, now);

        // Update subscription dates
        subscription.startDate = now;
        subscription.endDate = newEndDate;
        subscription.nextBillingDate = newEndDate;
        subscription.lastRenewalCheck = now;
        subscription.status = SUBSCRIPTION_STATUSES.ACTIVE;

        // Create new invoice for the renewal period
        const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId).lean();
        if (plan) {
            const pricing = plan.pricing?.find(p => p.billingCycle === billingCycle);
            if (pricing) {
                const invoice = await createInvoice({
                    tenantId: subscription.tenantId,
                    ownerId: subscription.ownerId,
                    planName: plan.name,
                    price: pricing.price,
                    discount: pricing.discount || 0,
                    totalAmount: pricing.price - (pricing.discount || 0),
                    billingCycle: billingCycle,
                    startDate: now,
                    endDate: newEndDate,
                    status: 'pending',
                    dueDate: now,
                    metadata: {
                        autoRenewal: true,
                        renewalDate: now,
                        subscriptionId: subscription._id
                    }
                });

                subscription.invoiceId = invoice._id;
                console.log(`[RENEWAL] Created invoice ${invoice._id} for subscription ${subscription._id}`);
            }
        }

        await subscription.save();

        // Update tenant limits only (Usage will be created after payment in RazorpayController)
        await updateTenantLimits(subscription);

        console.log(`[RENEWAL] Successfully renewed subscription ${subscription._id} until ${newEndDate}`);
        return true;
    } catch (error) {
        console.error(`[RENEWAL] Error processing renewal for subscription ${subscription._id}:`, error);
        return false;
    }
};

/**
 * Main renewal job that runs periodically
 */
const runSubscriptionRenewalJob = async () => {
    // Ensure DB connection is ready
    if (mongoose.connection.readyState !== 1) {
        console.log('[RENEWAL] Skipping - DB not connected');
        return;
    }

    console.log('[RENEWAL] Starting subscription renewal check at', new Date().toISOString());

    try {
        const now = new Date();
        const checkWindow = moment(now).add(24, 'hours').toDate(); // Check 24 hours ahead

        // Find subscriptions that need renewal
        const subscriptions = await CustomerSubscription.find({
            status: { $in: [SUBSCRIPTION_STATUSES.ACTIVE, SUBSCRIPTION_STATUSES.CREATED] },
            autoRenew: true,
            $or: [
                { nextBillingDate: { $lte: checkWindow } },
                { endDate: { $lte: checkWindow } }
            ]
        }).populate('subscriptionPlanId');

        console.log(`[RENEWAL] Found ${subscriptions.length} subscriptions needing renewal check`);

        for (const subscription of subscriptions) {
            try {
                // Check if Razorpay already handled it
                const lastRenewalCheck = subscription.lastRenewalCheck || new Date(0);
                const hoursSinceLastCheck = (now - lastRenewalCheck) / (1000 * 60 * 60);
                
                if (hoursSinceLastCheck < 6) {
                    console.log(`[RENEWAL] Skipping ${subscription._id} - checked ${hoursSinceLastCheck.toFixed(1)} hours ago`);
                    continue;
                }

                // Check if subscription is actually expired
                const isExpired = subscription.endDate && subscription.endDate <= now;
                const isDue = subscription.nextBillingDate && subscription.nextBillingDate <= now;

                if (isExpired || isDue) {
                    console.log(`[RENEWAL] Subscription ${subscription._id} needs renewal (expired: ${isExpired}, due: ${isDue})`);
                    
                    // Process the renewal
                    const renewed = await processSubscriptionRenewal(subscription);
                    
                    if (!renewed) {
                        // If renewal failed, mark subscription appropriately
                        subscription.status = SUBSCRIPTION_STATUSES.EXPIRED;
                        subscription.endReason = 'renewal_failed';
                        await subscription.save();
                    }
                }

                // Update tenant limits if needed
                await updateTenantLimits(subscription);

            } catch (subError) {
                console.error(`[RENEWAL] Error processing subscription ${subscription._id}:`, subError);
            }
        }

        // Also update tenant limits for all active subscriptions
        const activeSubscriptions = await CustomerSubscription.find({
            status: SUBSCRIPTION_STATUSES.ACTIVE
        });

        console.log(`[RENEWAL] Updating tenant limits for ${activeSubscriptions.length} active subscriptions`);

        for (const sub of activeSubscriptions) {
            await updateTenantLimits(sub);
        }

        console.log('[RENEWAL] Subscription renewal check completed');

    } catch (error) {
        console.error('[RENEWAL] Error in renewal job:', error);
    }
};

/**
 * Manual trigger for testing
 */
const manualRenewalCheck = async (req, res) => {
    try {
        console.log('[RENEWAL] Manual renewal check triggered');
        await runSubscriptionRenewalJob();
        res.json({ 
            success: true, 
            message: 'Renewal check completed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[RENEWAL] Manual check error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

/**
 * Get renewal status for a subscription
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

        // Usage information removed - now managed only in RazorpayController
        // const usage = await Usage.findOne({
        //     tenantId: subscription.tenantId,
        //     ownerId: subscription.ownerId,
        //     fromDate: { $lte: now },
        //     toDate: { $gte: now }
        // });

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
            lastRenewalCheck: subscription.lastRenewalCheck
            // Usage information removed - now fetched separately from Usage endpoints
        });
    } catch (error) {
        console.error('[RENEWAL] Status check error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Schedule the cron job
let cronTask;
function scheduleRenewalCron() {
    if (cronTask || !RENEWAL_CRON_ENABLED) return;

    cronTask = cron.schedule(RENEWAL_CRON_SCHEDULE, async () => {
        try {
            await runSubscriptionRenewalJob();
        } catch (err) {
            console.error('[RENEWAL] Cron error:', err);
        }
    });

    console.log(`[RENEWAL] Cron scheduled: ${RENEWAL_CRON_SCHEDULE}`);
}

// Start cron when DB is connected
if (mongoose.connection.readyState === 1) {
    scheduleRenewalCron();
    // Run once immediately
    setTimeout(runSubscriptionRenewalJob, 5000);
} else {
    mongoose.connection.once('connected', () => {
        scheduleRenewalCron();
        setTimeout(runSubscriptionRenewalJob, 5000);
    });
}

module.exports = {
    runSubscriptionRenewalJob,
    manualRenewalCheck,
    getSubscriptionRenewalStatus,
    processSubscriptionRenewal
};
