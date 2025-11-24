/**
 * Test script for bandwidth usage tracking
 * Run this file to test the bandwidth usage functionality
 * Usage: node test/testBandwidthUsage.js
 */

const mongoose = require("mongoose");
require("dotenv").config();
const Usage = require("../models/Usage");
const {
  updateBandwidthUsage,
  checkBandwidthUsageLimit,
  getBandwidthUsageStats,
} = require("../services/bandwidthUsageService");

// Test data
const TEST_TENANT_ID = "65a1234567890abcdef12345"; // Replace with actual tenant ID
const TEST_OWNER_ID = "65a1234567890abcdef12346"; // Replace with actual owner ID

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/upinterview",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function testBandwidthUsage() {
  try {
    // Test 1: Check current bandwidth usage
    const stats = await getBandwidthUsageStats(TEST_TENANT_ID, TEST_OWNER_ID);

    // Test 2: Check if can use bandwidth (for a 100MB file)
    const fileSize = 100 * 1024 * 1024; // 100MB in bytes
    const canUse = await checkBandwidthUsageLimit(
      TEST_TENANT_ID,
      TEST_OWNER_ID,
      fileSize
    );

    // Test 3: Track bandwidth usage for upload
    if (canUse.canUse) {
      const uploadResult = await updateBandwidthUsage(
        TEST_TENANT_ID,
        TEST_OWNER_ID,
        fileSize,
        "upload"
      );
    } else {
    }

    // Test 4: Track bandwidth usage for download (50MB)
    const downloadSize = 50 * 1024 * 1024; // 50MB in bytes
    const downloadResult = await updateBandwidthUsage(
      TEST_TENANT_ID,
      TEST_OWNER_ID,
      downloadSize,
      "download"
    );

    // Test 5: Check final usage stats
    const finalStats = await getBandwidthUsageStats(
      TEST_TENANT_ID,
      TEST_OWNER_ID
    );

    // Test 6: Direct database check
    const usage = await Usage.findOne({ tenantId: TEST_TENANT_ID }).lean();
    if (usage) {
      const bandwidthAttr = usage.usageAttributes.find(
        (a) => a.type === "User Bandwidth"
      );
      if (bandwidthAttr) {
      } else {
      }
    } else {
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

async function cleanup() {
  await mongoose.connection.close();
}

// Run tests
(async () => {
  await connectDB();
  await testBandwidthUsage();
  await cleanup();
  process.exit(0);
})();
