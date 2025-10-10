/**
 * Test script for bandwidth usage tracking
 * Run this file to test the bandwidth usage functionality
 * Usage: node test/testBandwidthUsage.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Usage = require('../models/Usage');
const { 
  updateBandwidthUsage, 
  checkBandwidthUsageLimit,
  getBandwidthUsageStats 
} = require('../services/bandwidthUsageService');

// Test data
const TEST_TENANT_ID = '65a1234567890abcdef12345'; // Replace with actual tenant ID
const TEST_OWNER_ID = '65a1234567890abcdef12346'; // Replace with actual owner ID

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/upinterview', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testBandwidthUsage() {
  console.log('\n🚀 Starting Bandwidth Usage Tests...\n');
  
  try {
    // Test 1: Check current bandwidth usage
    console.log('📊 Test 1: Checking current bandwidth usage...');
    const stats = await getBandwidthUsageStats(TEST_TENANT_ID, TEST_OWNER_ID);
    console.log('Current bandwidth stats:', JSON.stringify(stats, null, 2));
    
    // Test 2: Check if can use bandwidth (for a 100MB file)
    console.log('\n📊 Test 2: Checking if can upload 100MB file...');
    const fileSize = 100 * 1024 * 1024; // 100MB in bytes
    const canUse = await checkBandwidthUsageLimit(TEST_TENANT_ID, TEST_OWNER_ID, fileSize);
    console.log('Can upload 100MB file:', JSON.stringify(canUse, null, 2));
    
    // Test 3: Track bandwidth usage for upload
    if (canUse.canUse) {
      console.log('\n📊 Test 3: Tracking 100MB upload...');
      const uploadResult = await updateBandwidthUsage(TEST_TENANT_ID, TEST_OWNER_ID, fileSize, 'upload');
      console.log('Upload tracking result:', JSON.stringify(uploadResult, null, 2));
    } else {
      console.log('\n⚠️ Skipping upload test - insufficient bandwidth');
    }
    
    // Test 4: Track bandwidth usage for download (50MB)
    console.log('\n📊 Test 4: Tracking 50MB download...');
    const downloadSize = 50 * 1024 * 1024; // 50MB in bytes
    const downloadResult = await updateBandwidthUsage(TEST_TENANT_ID, TEST_OWNER_ID, downloadSize, 'download');
    console.log('Download tracking result:', JSON.stringify(downloadResult, null, 2));
    
    // Test 5: Check final usage stats
    console.log('\n📊 Test 5: Final bandwidth usage stats...');
    const finalStats = await getBandwidthUsageStats(TEST_TENANT_ID, TEST_OWNER_ID);
    console.log('Final bandwidth stats:', JSON.stringify(finalStats, null, 2));
    
    // Test 6: Direct database check
    console.log('\n📊 Test 6: Checking Usage document in database...');
    const usage = await Usage.findOne({ tenantId: TEST_TENANT_ID }).lean();
    if (usage) {
      const bandwidthAttr = usage.usageAttributes.find(a => a.type === 'User Bandwidth');
      if (bandwidthAttr) {
        console.log('Database bandwidth attribute:', {
          type: bandwidthAttr.type,
          entitled: bandwidthAttr.entitled,
          utilized: bandwidthAttr.utilized,
          remaining: bandwidthAttr.remaining
        });
      } else {
        console.log('⚠️ No User Bandwidth attribute found in Usage document');
      }
    } else {
      console.log('⚠️ No Usage document found for tenant');
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

async function cleanup() {
  await mongoose.connection.close();
  console.log('\n👋 Disconnected from MongoDB');
}

// Run tests
(async () => {
  await connectDB();
  await testBandwidthUsage();
  await cleanup();
  process.exit(0);
})();
