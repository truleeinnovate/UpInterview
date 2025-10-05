const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const SubscriptionPlan = require('../models/Subscriptionmodels');
const Usage = require('../models/Usage');
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
 * Check if a usage period needs to be renewed/reset
 * Only creates ONE usage document per billing period (monthly/yearly)
 */
const checkAndResetUsagePeriod = async (subscription) => {
    try {
        const now = new Date();
        const tenantId = subscription.tenantId;
        const ownerId = subscription.ownerId;

        // Get current usage document
        let currentUsage = await Usage.findOne({ 
            tenantId, 
            ownerId 
        });

        // Helper function to check if we're in the same period
        const isInSamePeriod = (usageFromDate, usageToDate, billingCycle) => {
            if (!usageFromDate || !usageToDate) return false;
            
            const nowMoment = moment(now);
            const fromMoment = moment(usageFromDate);
            const toMoment = moment(usageToDate);
            
            // Check if current date is within the existing usage period
            if (nowMoment.isBetween(fromMoment, toMoment, null, '[]')) {
                return true;
            }
            
            // For monthly: check if we're in the same month and year
            if (billingCycle === 'monthly') {
                return nowMoment.year() === fromMoment.year() && 
                       nowMoment.month() === fromMoment.month();
            }
            
            // For annual: check if we're in the same year cycle
            if (billingCycle === 'annual') {
                // Check if we're within the same annual period
                const yearsSinceStart = nowMoment.diff(fromMoment, 'years');
                const nextRenewalDate = moment(fromMoment).add(yearsSinceStart + 1, 'years');
                return nowMoment.isBefore(nextRenewalDate);
            }
            
            return false;
        };

        const billingCycle = subscription.selectedBillingCycle || 'monthly';
        
        // Only create new period if:
        // 1. No usage exists OR
        // 2. Current usage exists but we're in a new billing period
        const needsNewPeriod = !currentUsage || 
            !isInSamePeriod(currentUsage.fromDate, currentUsage.toDate, billingCycle);

        if (needsNewPeriod) {
            console.log(`[RENEWAL] New billing period detected for tenant ${tenantId}`);

            // Get subscription plan to fetch features
            const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId).lean();
            if (!plan) {
                console.error(`[RENEWAL] Plan not found: ${subscription.subscriptionPlanId}`);
                return;
            }

            // Calculate new period dates based on subscription dates
            let fromDate, toDate;
            
            if (billingCycle === 'monthly') {
                // Start from beginning of current month
                fromDate = moment().startOf('month').toDate();
                toDate = moment().endOf('month').toDate();
            } else if (billingCycle === 'annual') {
                // Use subscription start date anniversary
                if (subscription.startDate) {
                    const startMoment = moment(subscription.startDate);
                    const yearsSinceStart = moment().diff(startMoment, 'years');
                    fromDate = moment(startMoment).add(yearsSinceStart, 'years').toDate();
                    toDate = moment(fromDate).add(1, 'year').subtract(1, 'day').toDate();
                } else {
                    // Fallback to calendar year
                    fromDate = moment().startOf('year').toDate();
                    toDate = moment().endOf('year').toDate();
                }
            } else {
                // Default case
                fromDate = now;
                toDate = calculateEndDate(billingCycle, fromDate);
            }

            // Build new usage attributes with reset limits
            const features = plan.features || [];
            const usageAttributes = features
                .filter(f => ['Assessments', 'Internal Interviewers', 'Outsource Interviewers'].includes(f?.name))
                .map(f => ({
                    entitled: Number(f?.limit) || 0,
                    type: f?.name,
                    utilized: 0,
                    remaining: Number(f?.limit) || 0,
                }));

            if (currentUsage && currentUsage.fromDate && currentUsage.toDate) {
                // Archive current period before creating new one (only if not already archived)
                const periodKey = `${moment(currentUsage.fromDate).format('YYYY-MM-DD')}_${moment(currentUsage.toDate).format('YYYY-MM-DD')}`;
                const alreadyArchived = Array.isArray(currentUsage.usageHistory) && 
                    currentUsage.usageHistory.some(h => {
                        const archiveKey = `${moment(h.fromDate).format('YYYY-MM-DD')}_${moment(h.toDate).format('YYYY-MM-DD')}`;
                        return archiveKey === periodKey;
                    });

                if (!alreadyArchived && currentUsage.toDate < now) {
                    currentUsage.usageHistory = currentUsage.usageHistory || [];
                    currentUsage.usageHistory.push({
                        usageAttributes: currentUsage.usageAttributes,
                        fromDate: currentUsage.fromDate,
                        toDate: currentUsage.toDate,
                        archivedAt: new Date()
                    });
                    console.log(`[RENEWAL] Archived previous period: ${periodKey}`);
                }

                // Update with new period
                currentUsage.usageAttributes = usageAttributes;
                currentUsage.fromDate = fromDate;
                currentUsage.toDate = toDate;
                await currentUsage.save();
                console.log(`[RENEWAL] Usage period reset for ${billingCycle} subscription (${moment(fromDate).format('YYYY-MM-DD')} to ${moment(toDate).format('YYYY-MM-DD')})`);
            } else {
                // Create new usage document (first time)
                const newUsage = new Usage({
                    tenantId,
                    ownerId,
                    usageAttributes,
                    fromDate,
                    toDate,
                    usageHistory: []
                });
                await newUsage.save();
                console.log(`[RENEWAL] New usage document created for ${billingCycle} subscription (${moment(fromDate).format('YYYY-MM-DD')} to ${moment(toDate).format('YYYY-MM-DD')})`);
            }

            // Update tenant limits
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
        } else {
            console.log(`[RENEWAL] Usage already exists for current ${billingCycle} period (${moment(currentUsage.fromDate).format('YYYY-MM-DD')} to ${moment(currentUsage.toDate).format('YYYY-MM-DD')})`);
        }
    } catch (error) {
        console.error('[RENEWAL] Error in checkAndResetUsagePeriod:', error);
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

        // Reset usage limits for new period
        await checkAndResetUsagePeriod(subscription);

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

                // Always check and reset usage if needed
                await checkAndResetUsagePeriod(subscription);

            } catch (subError) {
                console.error(`[RENEWAL] Error processing subscription ${subscription._id}:`, subError);
            }
        }

        // Also check all active subscriptions for usage period resets
        const activeSubscriptions = await CustomerSubscription.find({
            status: SUBSCRIPTION_STATUSES.ACTIVE
        });

        console.log(`[RENEWAL] Checking usage periods for ${activeSubscriptions.length} active subscriptions`);

        for (const sub of activeSubscriptions) {
            await checkAndResetUsagePeriod(sub);
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

        // Get current usage
        const usage = await Usage.findOne({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId,
            fromDate: { $lte: now },
            toDate: { $gte: now }
        });

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
            lastRenewalCheck: subscription.lastRenewalCheck,
            usage: usage ? {
                period: {
                    from: usage.fromDate,
                    to: usage.toDate
                },
                attributes: usage.usageAttributes
            } : null
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
    checkAndResetUsagePeriod,
    processSubscriptionRenewal
};
