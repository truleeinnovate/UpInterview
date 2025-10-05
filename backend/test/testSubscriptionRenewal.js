const mongoose = require('mongoose');
const moment = require('moment');
const CustomerSubscription = require('../models/CustomerSubscriptionmodels');
const SubscriptionPlan = require('../models/Subscriptionmodels');
const Usage = require('../models/Usage');
const Tenant = require('../models/Tenant');
const { processSubscriptionRenewal, checkAndResetUsagePeriod } = require('../controllers/SubscriptionRenewalController');

// Test configuration
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/upinterview';

async function connectDB() {
    try {
        await mongoose.connect(TEST_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function testMonthlyRenewal() {
    console.log('\n=== Testing Monthly Subscription Renewal ===');
    
    try {
        // Find a test subscription or use existing one
        const subscription = await CustomerSubscription.findOne({
            selectedBillingCycle: 'monthly',
            status: { $in: ['active', 'created'] }
        }).populate('subscriptionPlanId');
        
        if (!subscription) {
            console.log('❌ No monthly subscription found for testing');
            return;
        }
        
        console.log(`📋 Testing subscription: ${subscription._id}`);
        console.log(`   Owner: ${subscription.ownerId}`);
        console.log(`   Current end date: ${subscription.endDate}`);
        console.log(`   Auto-renew: ${subscription.autoRenew}`);
        
        // Get current usage
        const currentUsage = await Usage.findOne({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        
        if (currentUsage) {
            console.log(`📊 Current usage period: ${currentUsage.fromDate} to ${currentUsage.toDate}`);
            console.log('   Current limits:');
            currentUsage.usageAttributes.forEach(attr => {
                console.log(`     - ${attr.type}: ${attr.utilized}/${attr.entitled} used`);
            });
        }
        
        // Simulate renewal by setting end date to past
        const originalEndDate = subscription.endDate;
        subscription.endDate = moment().subtract(1, 'day').toDate();
        subscription.nextBillingDate = subscription.endDate;
        await subscription.save();
        
        console.log('⏰ Simulating expired subscription...');
        
        // Process renewal
        const success = await processSubscriptionRenewal(subscription);
        
        if (success) {
            console.log('✅ Renewal processed successfully');
            
            // Reload subscription
            const renewed = await CustomerSubscription.findById(subscription._id);
            console.log(`   New end date: ${renewed.endDate}`);
            console.log(`   Next billing: ${renewed.nextBillingDate}`);
            
            // Check new usage period
            const newUsage = await Usage.findOne({
                tenantId: subscription.tenantId,
                ownerId: subscription.ownerId
            });
            
            if (newUsage) {
                console.log(`📊 New usage period: ${newUsage.fromDate} to ${newUsage.toDate}`);
                console.log('   Reset limits:');
                newUsage.usageAttributes.forEach(attr => {
                    console.log(`     - ${attr.type}: ${attr.utilized}/${attr.entitled} (should be 0/${attr.entitled})`);
                });
                
                // Check if old period was archived
                if (newUsage.usageHistory && newUsage.usageHistory.length > 0) {
                    console.log(`📦 Archived ${newUsage.usageHistory.length} previous period(s)`);
                }
            }
        } else {
            console.log('❌ Renewal failed');
            
            // Restore original date for cleanup
            subscription.endDate = originalEndDate;
            await subscription.save();
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

async function testYearlyRenewal() {
    console.log('\n=== Testing Yearly Subscription Renewal ===');
    
    try {
        const subscription = await CustomerSubscription.findOne({
            selectedBillingCycle: 'annual',
            status: { $in: ['active', 'created'] }
        }).populate('subscriptionPlanId');
        
        if (!subscription) {
            console.log('❌ No annual subscription found for testing');
            return;
        }
        
        console.log(`📋 Testing subscription: ${subscription._id}`);
        console.log(`   Current end date: ${subscription.endDate}`);
        
        // Similar test as monthly but for annual
        const originalEndDate = subscription.endDate;
        subscription.endDate = moment().subtract(1, 'day').toDate();
        subscription.nextBillingDate = subscription.endDate;
        await subscription.save();
        
        const success = await processSubscriptionRenewal(subscription);
        
        if (success) {
            const renewed = await CustomerSubscription.findById(subscription._id);
            const expectedEnd = moment().add(1, 'year').toDate();
            
            console.log('✅ Annual renewal processed');
            console.log(`   New end date: ${renewed.endDate}`);
            console.log(`   Expected approximately: ${expectedEnd}`);
            
            // Check that it's roughly 1 year from now
            const daysDiff = moment(renewed.endDate).diff(moment(), 'days');
            console.log(`   Days until next renewal: ${daysDiff} (should be ~365)`);
        } else {
            console.log('❌ Annual renewal failed');
            subscription.endDate = originalEndDate;
            await subscription.save();
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

async function testUsageLimitReset() {
    console.log('\n=== Testing Usage Limit Reset (Idempotency Check) ===');
    
    try {
        const subscription = await CustomerSubscription.findOne({
            status: 'active',
            autoRenew: true
        }).populate('subscriptionPlanId');
        
        if (!subscription) {
            console.log('❌ No active subscription found');
            return;
        }
        
        console.log(`📋 Testing usage reset for: ${subscription._id}`);
        console.log(`   Billing Cycle: ${subscription.selectedBillingCycle}`);
        
        // Get or create usage
        let usage = await Usage.findOne({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        
        if (!usage) {
            console.log('⚠️ No usage document found, will create one');
        } else {
            console.log(`📊 Current usage period: ${moment(usage.fromDate).format('YYYY-MM-DD')} to ${moment(usage.toDate).format('YYYY-MM-DD')}`);
            
            // Simulate some usage
            console.log('   Simulating usage...');
            usage.usageAttributes.forEach(attr => {
                if (attr.type === 'Assessments' && attr.entitled > 0) {
                    attr.utilized = Math.min(2, attr.entitled);
                    attr.remaining = attr.entitled - attr.utilized;
                    console.log(`   - Used 2 ${attr.type}`);
                }
            });
            await usage.save();
        }
        
        // Test 1: Run reset multiple times - should only create ONE document per period
        console.log('\n🔄 Test 1: Running checkAndResetUsagePeriod 3 times...');
        for (let i = 1; i <= 3; i++) {
            console.log(`   Attempt ${i}...`);
            await checkAndResetUsagePeriod(subscription);
        }
        
        // Count usage documents - should still be only ONE
        const usageCount = await Usage.countDocuments({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        console.log(`   ✅ Usage documents count: ${usageCount} (should be 1)`);
        
        // Test 2: Force new period by setting past date
        console.log('\n🔄 Test 2: Forcing new period by expiring current usage...');
        usage = await Usage.findOne({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        
        if (usage) {
            const originalToDate = usage.toDate;
            
            // Set to last month for monthly or last year for annual
            if (subscription.selectedBillingCycle === 'monthly') {
                usage.toDate = moment().subtract(1, 'month').endOf('month').toDate();
                usage.fromDate = moment().subtract(1, 'month').startOf('month').toDate();
            } else {
                usage.toDate = moment().subtract(1, 'year').toDate();
                usage.fromDate = moment().subtract(2, 'years').toDate();
            }
            await usage.save();
            console.log(`   Changed period to: ${moment(usage.fromDate).format('YYYY-MM-DD')} to ${moment(usage.toDate).format('YYYY-MM-DD')}`);
        }
        
        // Run reset - should create new period
        await checkAndResetUsagePeriod(subscription);
        
        // Check results
        const resetUsage = await Usage.findOne({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        
        if (resetUsage) {
            console.log('\n✅ New period created:');
            console.log(`   Period: ${moment(resetUsage.fromDate).format('YYYY-MM-DD')} to ${moment(resetUsage.toDate).format('YYYY-MM-DD')}`);
            console.log('   Limits after reset:');
            
            let allReset = true;
            resetUsage.usageAttributes.forEach(attr => {
                console.log(`     - ${attr.type}: ${attr.utilized}/${attr.entitled}`);
                if (attr.utilized !== 0) {
                    allReset = false;
                }
            });
            
            if (allReset) {
                console.log('   ✅ All usage counters reset to 0');
            } else {
                console.log('   ⚠️ Some counters not reset');
            }
            
            if (resetUsage.usageHistory && resetUsage.usageHistory.length > 0) {
                console.log(`   📦 History preserved: ${resetUsage.usageHistory.length} period(s)`);
                resetUsage.usageHistory.forEach((h, idx) => {
                    console.log(`      Period ${idx + 1}: ${moment(h.fromDate).format('YYYY-MM-DD')} to ${moment(h.toDate).format('YYYY-MM-DD')}`);
                });
            }
        }
        
        // Test 3: Run again - should NOT create another document for same period
        console.log('\n🔄 Test 3: Running again - should not create duplicate for same period...');
        await checkAndResetUsagePeriod(subscription);
        
        const finalCount = await Usage.countDocuments({
            tenantId: subscription.tenantId,
            ownerId: subscription.ownerId
        });
        console.log(`   ✅ Final usage documents count: ${finalCount} (should still be 1)`);
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

async function listActiveSubscriptions() {
    console.log('\n=== Active Subscriptions Summary ===');
    
    try {
        const subscriptions = await CustomerSubscription.find({
            status: { $in: ['active', 'created'] },
            autoRenew: true
        }).populate('subscriptionPlanId');
        
        console.log(`Found ${subscriptions.length} active auto-renew subscriptions:\n`);
        
        for (const sub of subscriptions) {
            const daysUntilRenewal = sub.endDate ? 
                moment(sub.endDate).diff(moment(), 'days') : 'N/A';
            
            const usage = await Usage.findOne({
                tenantId: sub.tenantId,
                ownerId: sub.ownerId
            });
            
            console.log(`📋 Subscription ${sub._id}`);
            console.log(`   Plan: ${sub.subscriptionPlanId?.name || 'Unknown'}`);
            console.log(`   Cycle: ${sub.selectedBillingCycle}`);
            console.log(`   Status: ${sub.status}`);
            console.log(`   End Date: ${sub.endDate}`);
            console.log(`   Days until renewal: ${daysUntilRenewal}`);
            console.log(`   Auto-renew: ${sub.autoRenew}`);
            
            if (usage) {
                console.log(`   Usage Period: ${moment(usage.fromDate).format('YYYY-MM-DD')} to ${moment(usage.toDate).format('YYYY-MM-DD')}`);
                usage.usageAttributes.forEach(attr => {
                    console.log(`     - ${attr.type}: ${attr.utilized}/${attr.entitled} used`);
                });
            } else {
                console.log('   ⚠️ No usage document found');
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error listing subscriptions:', error);
    }
}

async function runTests() {
    console.log('🚀 Starting Subscription Renewal Tests');
    console.log('=====================================\n');
    
    await connectDB();
    
    // List current state
    await listActiveSubscriptions();
    
    // Run tests
    await testMonthlyRenewal();
    await testYearlyRenewal();
    await testUsageLimitReset();
    
    console.log('\n=====================================');
    console.log('✅ Tests completed');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

// Run tests
runTests().catch(console.error);
