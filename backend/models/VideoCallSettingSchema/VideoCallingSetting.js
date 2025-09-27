const mongoose = require("mongoose");

const videoCallingSettingsSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  defaultProvider: { type: String, enum: ["platform", "zoom", "google-meet", "teams"], default: "platform" },
  credentialType: { type: String, enum: ["platform", "tenant"], default: "platform" },
  credentials: {
    zoom: {
      apiKey: String,
      apiSecret: String,
      accountId: String
    },
    googleMeet: {
      clientId: String,
      clientSecret: String,
      refreshToken: String
    },
    teams: {
      tenantId: String,
      clientId: String,
      clientSecret: String
    }
  },
  testConnection: {
    status: { type: String, enum: ["testing", "success", "failed", null], default: null },
    message: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model("VideoCallingSettings", videoCallingSettingsSchema);
