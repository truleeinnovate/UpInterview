// ✅ Use CommonJS require
const mongoose = require("mongoose");

const videoCallingSettingsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contacts",
    },
    defaultProvider: {
      type: String,
      enum: ["platform", "zoom", "google-meet", "teams"],
      default: "zoom",
    },
    credentialType: {
      type: String,
      enum: ["platform", "tenant"],
      default: "platform",
    },
    credentials: {
      zoom: {
        apiKey: { type: String, default: "" },
        apiSecret: { type: String, default: "" },
        accountId: { type: String, default: "" },
        isConfigured: { type: Boolean, default: false },
      },
      googleMeet: {
        clientId: { type: String, default: "" },
        clientSecret: { type: String, default: "" },
        refreshToken: { type: String, default: "" },
        isConfigured: { type: Boolean, default: false },
      },
      teams: {
        tenantId: { type: String, default: "" },
        clientId: { type: String, default: "" },
        clientSecret: { type: String, default: "" },
        isConfigured: { type: Boolean, default: false },
      },
    },
    testConnection: {
      status: {
        type: String,
        enum: ["testing", "success", "failed", null],
        default: null,
      },
      message: { type: String, default: "" },
      lastTested: { type: Date },
    },
    uiState: {
      lastConfiguredProvider: { type: String },
      showCredentialHelp: { type: Boolean, default: true },
      credentialPopupsDismissed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// ✅ Instance methods (optional)
videoCallingSettingsSchema.methods.updateCredentials = function (
  provider,
  credentials
) {
  this.credentials[provider] = {
    ...this.credentials[provider],
    ...credentials,
    isConfigured: true,
  };
  return this.save();
};

videoCallingSettingsSchema.methods.hasConfiguredCredentials = function (
  provider
) {
  return this.credentials[provider]?.isConfigured || false;
};

// ✅ Create model
const VideoCallingDetails = mongoose.model(
  "VideoCallingSettings",
  videoCallingSettingsSchema
);

// ✅ Export using CommonJS
module.exports = VideoCallingDetails;

// const mongoose = require("mongoose");

// const videoCallingSettingsSchema = new mongoose.Schema({
//   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
//   ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Contacts", required: true },
//   defaultProvider: { type: String, enum: ["platform", "zoom", "google-meet", "teams"], default: "platform" },
//   credentialType: { type: String, enum: ["platform", "tenant"], default: "platform" },
//   credentials: {
//     zoom: {
//       apiKey: { type: String, default: "" },
//       apiSecret: { type: String, default: "" },
//       accountId: { type: String, default: "" },
//       isConfigured: { type: Boolean, default: false } // Added by Ranjith - tracks if credentials are set
//     },
//     googleMeet: {
//       clientId: { type: String, default: "" },
//       clientSecret: { type: String, default: "" },
//       refreshToken: { type: String, default: "" },
//       isConfigured: { type: Boolean, default: false } // Added by Ranjith - tracks if credentials are set
//     },
//     teams: {
//       tenantId: { type: String, default: "" },
//       clientId: { type: String, default: "" },
//       clientSecret: { type: String, default: "" },
//       isConfigured: { type: Boolean, default: false } // Added by Ranjith - tracks if credentials are set
//     }
//   },
//   testConnection: {
//     status: { type: String, enum: ["testing", "success", "failed", null], default: null },
//     message: { type: String, default: "" },
//     lastTested: { type: Date } // Added by Ranjith - track when connection was last tested
//   },
//   // Added by Ranjith - Track popup states and user interactions
//   uiState: {
//     lastConfiguredProvider: { type: String },
//     showCredentialHelp: { type: Boolean, default: true },
//     credentialPopupsDismissed: { type: Number, default: 0 }
//   }
// }, {
//   timestamps: true
// });

// // Added by Ranjith - Method to check if provider has configured credentials
// videoCallingSettingsSchema.methods.hasConfiguredCredentials = function (provider) {
//   const providerKey = provider.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
//   return this.credentials[providerKey]?.isConfigured || false;
// };

// // Added by Ranjith - Method to update credentials and set configured flag
// videoCallingSettingsSchema.methods.updateCredentials = function (provider, newCredentials) {
//   const providerKey = provider.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

//   // Check if any credential field has value to set isConfigured
//   const hasCredentials = Object.values(newCredentials).some(val =>
//     val && val.toString().trim() !== ''
//   );

//   this.credentials[providerKey] = {
//     ...newCredentials,
//     isConfigured: hasCredentials
//   };

//   this.uiState.lastConfiguredProvider = provider;
//   return this.save();
// };

// const VideoCallingSettings = mongoose.model("VideoCallingSettings", videoCallingSettingsSchema);

// module.exports = { VideoCallingSettings };

// // backend/models/VideoCallingSettings.js
// const mongoose = require("mongoose");

// const videoCallingSettingsSchema = new mongoose.Schema({
//   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
//   defaultProvider: { type: String, enum: ["platform", "zoom", "google-meet", "teams"], default: "platform" },
//   credentialType: { type: String, enum: ["platform", "tenant"], default: "platform" },
//   credentials: {
//     zoom: {
//       apiKey: { type: String, default: "" },       // added by Ranjith
//       apiSecret: { type: String, default: "" },    // added by Ranjith
//       accountId: { type: String, default: "" }     // added by Ranjith
//     },
//     googleMeet: {
//       clientId: { type: String, default: "" },     // added by Ranjith
//       clientSecret: { type: String, default: "" }, // added by Ranjith
//       refreshToken: { type: String, default: "" }  // added by Ranjith
//     },
//     teams: {
//       tenantId: { type: String, default: "" },     // added by Ranjith
//       clientId: { type: String, default: "" },     // added by Ranjith
//       clientSecret: { type: String, default: "" }  // added by Ranjith
//     }
//   },
//   testConnection: {
//     status: { type: String, enum: ["testing", "success", "failed", null], default: null },
//     message: { type: String, default: "" }
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("VideoCallingSettings", videoCallingSettingsSchema);

// // const mongoose = require("mongoose");

// // const videoCallingSettingsSchema = new mongoose.Schema({
// //   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
// //   defaultProvider: { type: String, enum: ["platform", "zoom", "google-meet", "teams"], default: "platform" },
// //   credentialType: { type: String, enum: ["platform", "tenant"], default: "platform" },
// //   credentials: {
// //     zoom: {
// //       apiKey: String,
// //       apiSecret: String,
// //       accountId: String
// //     },
// //     googleMeet: {
// //       clientId: String,
// //       clientSecret: String,
// //       refreshToken: String
// //     },
// //     teams: {
// //       tenantId: String,
// //       clientId: String,
// //       clientSecret: String
// //     }
// //   },
// //   testConnection: {
// //     status: { type: String, enum: ["testing", "success", "failed", null], default: null },
// //     message: { type: String }
// //   }
// // }, { timestamps: true });

// // module.exports = mongoose.model("VideoCallingSettings", videoCallingSettingsSchema);
