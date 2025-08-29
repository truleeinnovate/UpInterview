// v1.0.0 - Ashok - changed field from object to Array to take multiple technologies
const mongoose = require("mongoose");
const rateCardSchema = new mongoose.Schema(
  {
    category: {
      type: String, // e.g., "Software Development", "Data & AI"
      required: true,
      index: true,
    },
    // v1.0.0 <-----------------------------------------------------------------
    // technology: {
    //   type: String, // e.g., "Full-Stack Developer", "Python AI/ML"
    //   required: true,
    //   index: true,
    // },
    technology: [
      {
        type: String, // e.g., "Full-Stack Developer", "Python AI/ML"
        required: true,
      },
    ],
    // v1.0.0 ----------------------------------------------------------------->
    levels: [
      {
        level: {
          type: String,
          enum: ["Junior", "Mid-Level", "Senior"],
          required: true,
        },
        rateRange: {
          inr: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
          },
          usd: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
          },
        },
      },
    ],
    defaultCurrency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const RateCard = mongoose.model("RateCard", rateCardSchema);
module.exports = RateCard;
