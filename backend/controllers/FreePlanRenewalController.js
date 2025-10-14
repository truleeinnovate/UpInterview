// Controller for handling Free Plan renewals
// Free plans don't involve payments, so we need a separate process to handle their periodic renewals

const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const SubscriptionPlan = require('../models/Subscriptionmodels');
const Usage = require('../models/Usage');
const Invoicemodels = require('../models/Invoicemodels');
const { calculateEndDate } = require('./CustomerSubscriptionInvoiceContollers');
const { generateUniqueInvoiceCode } = require("../utils/invoiceCodeGenerator");
const { updateTenantLimits } = require('./SubscriptionRenewalController');

let isJobRunning = false;

/**
 * Process free plan renewal for a single subscription
 */
const processFreePlanRenewal = async (subscription) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        console.log(`[FREE PLAN RENEWAL] Processing renewal for ${subscription.ownerId}`);
        
        // Get the subscription plan
        const plan = await SubscriptionPlan.findById(subscription.subscriptionPlanId).lean();
        if (!plan || plan.name !== 'Free') {
            console.log('[FREE PLAN RENEWAL] Not a free plan, skipping');
            await session.commitTransaction();
            return;
        }
        
        const now = new Date();
        const billingCycle = subscription.selectedBillingCycle;
        
        // Calculate new dates
        const newStartDate = new Date(subscription.endDate || now);
        const newEndDate = calculateEndDate(billingCycle);
        const newNextBillingDate = new Date(newEndDate);
        
        // Update subscription dates
        await CustomerSubscription.findByIdAndUpdate(
            subscription._id,
            {
                $set: {
                    startDate: newStartDate,
                    endDate: newEndDate,
                    nextBillingDate: newNextBillingDate,
                    lastPaymentDate: now, // Even though it's free, track renewal date
                    status: 'active'
                }
            },
            { session }
        );
        
        console.log(`[FREE PLAN RENEWAL] Updated subscription dates for ${subscription.ownerId}`);
        
        // Create new invoice for the renewal period
        try {
            const invoiceCode = await generateUniqueInvoiceCode();
            
            const newInvoice = await Invoicemodels.create([{
                tenantId: subscription.tenantId,
                ownerId: subscription.ownerId,
                planName: plan.name,
                planId: plan._id,
                type: 'subscription',
                totalAmount: 0,
                status: 'paid', // Free plans are always "paid"
                amountPaid: 0,
                startDate: newStartDate,
                endDate: newEndDate,
                lineItems: [{
                    description: `Free Plan - ${billingCycle} renewal`,
                    amount: 0,
                    quantity: 1,
                    tax: 0
                }],
                invoiceCode: invoiceCode,
                metadata: {
                    isFreePlanRenewal: true,
                    renewalDate: now
                }
            }], { session });
            
            console.log(`[FREE PLAN RENEWAL] Created invoice ${invoiceCode} for ${subscription.ownerId}`);
        } catch (invoiceError) {
            console.warn('[FREE PLAN RENEWAL] Invoice creation failed:', invoiceError.message);
            // Continue even if invoice creation fails
        }
        
        // Create or update Usage document for the new period
        try {
            const features = plan.features || [];
            
            const usageAttributes = features
                .filter(f => ['Assessments', 'Internal_Interviews', 'Question_Bank_Access', 'Bandwidth'].includes(f?.name))
                .map(f => ({
                    entitled: Number(f?.limit) || 0,
                    type: f?.name === 'Internal_Interviews' ? 'Internal Interviews' : 
                          f?.name === 'Question_Bank_Access' ? 'Question Bank Access' :
                          f?.name === 'Bandwidth' ? 'User Bandwidth' : f?.name,
                    utilized: 0,
                    remaining: Number(f?.limit) || 0,
                }));
            
            // Check if usage exists for the current period
            const existingUsage = await Usage.findOne({
                tenantId: subscription.tenantId,
                ownerId: subscription.ownerId
            }).lean();
            
            const isNewPeriod = !existingUsage || 
                (billingCycle === 'monthly' && !moment(existingUsage.fromDate).isSame(newStartDate, 'month')) ||
                (billingCycle === 'annual' && !moment(existingUsage.fromDate).isSame(newStartDate, 'year'));
            
            if (isNewPeriod) {
                // Create new usage document for the new period
                await Usage.findOneAndUpdate(
                    { 
                        tenantId: subscription.tenantId, 
                        ownerId: subscription.ownerId 
                    },
                    {
                        $set: {
                            tenantId: subscription.tenantId,
                            ownerId: subscription.ownerId,
                            usageAttributes: usageAttributes,
                            fromDate: newStartDate,
                            toDate: newEndDate,
                        }
                    },
                    { 
                        new: true, 
                        upsert: true, 
                        setDefaultsOnInsert: true,
                        session 
                    }
                );
                
                console.log(`[FREE PLAN RENEWAL] Created/Updated usage for new period for ${subscription.ownerId}`);
            } else {
                console.log(`[FREE PLAN RENEWAL] Usage already exists for current period for ${subscription.ownerId}`);
            }
        } catch (usageError) {
            console.error('[FREE PLAN RENEWAL] Usage creation failed:', usageError);
            // Continue even if usage creation fails
        }
        
        // Update tenant limits
        await updateTenantLimits(subscription);
        
        await session.commitTransaction();
        console.log(`[FREE PLAN RENEWAL] Successfully renewed free plan for ${subscription.ownerId}`);
        
        return true;
    } catch (error) {
        await session.abortTransaction();
        console.error('[FREE PLAN RENEWAL] Error processing renewal:', error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Check all free plans and renew those that need renewal
 */
const checkAndRenewFreePlans = async () => {
    if (isJobRunning) {
        console.log('[FREE PLAN RENEWAL] Job already running, skipping...');
        return;
    }
    
    isJobRunning = true;
    
    try {
        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('[FREE PLAN RENEWAL] Database not connected, skipping check');
            return;
        }
        
        const now = new Date();
        console.log(`[FREE PLAN RENEWAL] Starting free plan renewal check at ${now.toISOString()}`);
        
        // Find all active free plan subscriptions that need renewal
        const subscriptions = await CustomerSubscription.find({
            status: 'active',
            // Check if nextBillingDate is due or if it's missing (for legacy data)
            $or: [
                { nextBillingDate: { $lte: now } },
                { nextBillingDate: null, endDate: { $lte: now } },
                { nextBillingDate: null, endDate: null } // Legacy subscriptions without dates
            ]
        }).populate('subscriptionPlanId').lean();
        
        console.log(`[FREE PLAN RENEWAL] Found ${subscriptions.length} subscriptions to check`);
        
        let renewedCount = 0;
        let errorCount = 0;
        
        for (const subscription of subscriptions) {
            try {
                // Check if this is actually a free plan
                if (!subscription.subscriptionPlanId || subscription.subscriptionPlanId.name !== 'Free') {
                    continue;
                }
                
                // Skip if it has a Razorpay subscription (paid plan)
                if (subscription.razorpaySubscriptionId) {
                    console.log(`[FREE PLAN RENEWAL] Skipping ${subscription.ownerId} - has Razorpay subscription`);
                    continue;
                }
                
                await processFreePlanRenewal(subscription);
                renewedCount++;
            } catch (error) {
                errorCount++;
                console.error(`[FREE PLAN RENEWAL] Failed to renew subscription ${subscription._id}:`, error.message);
            }
        }
        
        console.log(`[FREE PLAN RENEWAL] Completed: ${renewedCount} renewed, ${errorCount} errors`);
    } catch (error) {
        console.error('[FREE PLAN RENEWAL] Job error:', error);
    } finally {
        isJobRunning = false;
    }
};

// Manual endpoints removed - system runs automatically only

// Automatic renewal system - no manual intervention needed
let freePlanRenewalCron = null;

const startFreePlanRenewalCron = () => {
    if (freePlanRenewalCron) {
        console.log('[FREE PLAN RENEWAL] Automatic renewal system already running');
        return;
    }
    
    // Run every hour to check for free plan renewals automatically
    // This ensures timely renewal without any manual intervention
    freePlanRenewalCron = cron.schedule('0 * * * *', async () => {
        const now = new Date();
        console.log(`[FREE PLAN RENEWAL] Automatic renewal check at ${now.toISOString()}`);
        await checkAndRenewFreePlans();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    
    console.log('[FREE PLAN RENEWAL] Automatic renewal system started - runs every hour');
    
    // Run initial check after 10 seconds to handle any pending renewals
    setTimeout(() => {
        console.log('[FREE PLAN RENEWAL] Running initial automatic renewal check');
        checkAndRenewFreePlans();
    }, 10000); // Wait for DB connection to be established
};

// Export only automatic functions (no manual endpoints)
module.exports = {
    startFreePlanRenewalCron
};
