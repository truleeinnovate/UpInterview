require("dotenv").config();
const mongoose = require("mongoose");
const { RegionalTaxConfig } = require("../models/Pricing");

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
  });
};

const seed = async () => {
  await connect();

  // Example regional tax configs. Adjust or extend as needed.
  const pricingRecords = [
    {
      regionCode: "IN",
      country: "India",
      currency: {
        code: "INR",
        symbol: "₹",
      },
      gst: {
        enabled: true,
        percentage: 0.18, // 18% GST on service charge
      },
      serviceCharge: {
        enabled: true,
        percentage: 10, // 10% platform service charge
        fixedAmount: 0,
      },
      isDefault: true,
      status: "Active",
    },
    {
      regionCode: "US",
      country: "United States",
      currency: {
        code: "USD",
        symbol: "$",
      },
      gst: {
        enabled: false,
        percentage: 0,
      },
      serviceCharge: {
        enabled: true,
        percentage: 8,
        fixedAmount: 0,
      },
      isDefault: false,
      status: "Inactive",
    },
  ];

  for (const record of pricingRecords) {
    await RegionalTaxConfig.updateOne(
      { regionCode: record.regionCode, "currency.code": record.currency.code },
      { $set: record },
      { upsert: true }
    );
  }

  await mongoose.disconnect();
};

seed()
  .then(() => {
    console.log("Pricing records seeded successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed pricing records", err);
    process.exit(1);
  });
