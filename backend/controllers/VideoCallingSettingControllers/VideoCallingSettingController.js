// ✅ Use CommonJS require
const mongoose = require("mongoose");
const VideoCallingDetails = require("../../models/VideoCallSettingSchema/VideoCallingSetting.js");

// ✅ GET Settings Controller
const getVideoCallingSettings = async (req, res) => {
  try {
    let { tenantId, ownerId } = req.query;

    console.log('📥 Received request with:', { tenantId, ownerId });

    // ✅ Validation
    if (!tenantId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: "Either tenantId or ownerId is required",
      });
    }

    // ✅ Build query safely with proper ObjectId validation
    const query = {};
    
    if (tenantId) {
      if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tenantId format",
        });
      }
      query.tenantId = new mongoose.Types.ObjectId(tenantId);
    }
    
    if (ownerId) {
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ownerId format",
        });
      }
      query.ownerId = new mongoose.Types.ObjectId(ownerId);
    }

    console.log('🔍 Query built:', query);

    // ✅ Find settings
    const settings = await VideoCallingDetails.findOne(query);

    console.log('📊 Settings found:', settings ? 'Yes' : 'No');

    if (!settings) {
      // ✅ Return default structure when no settings found
      return res.json({
        success: true,
        data: {
          defaultProvider: "zoom",
          credentialType: "platform",
          credentials: {
            googleMeet: {
              clientId: "",
              clientSecret: "",
              refreshToken: "",
              isConfigured: false,
            },
            zoom: {
              apiKey: "",
              apiSecret: "",
              accountId: "",
              isConfigured: false,
            },
            teams: {
              tenantId: "",
              clientId: "",
              clientSecret: "",
              isConfigured: false,
            },
          },
          testConnection: {
            status: null,
            message: "",
            lastTested: null,
          },
          uiState: {
            lastConfiguredProvider: null,
            showCredentialHelp: true,
            credentialPopupsDismissed: 0,
          },
        },
      });
    }

    // ✅ Return found settings
    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error('❌ Error in getVideoCallingSettings:', err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// ✅ Test Connection Controller
const VideoCallTestConnection = async (req, res) => {
  try {
    const { provider, credentials, tenantId: bodyTenantId, ownerId } = req.body;
    const tenantId = req.user?.tenantId || bodyTenantId;

    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        message: "Tenant ID required" 
      });
    }

    const isValid = await testVideoProviderConnection(provider, credentials);

    const updated = await VideoCallingDetails.findOneAndUpdate(
      { tenantId },
      {
        $setOnInsert: {
          tenantId,
          ownerId: ownerId || null,
          defaultProvider: provider,
          credentialType: "tenant",
        },
        [`credentials.${provider}`]: {
          ...credentials,
          isConfigured: isValid,
        },
        testConnection: {
          status: isValid ? "success" : "failed",
          message: isValid
            ? "Connection successful! Your credentials are valid."
            : "Connection failed. Please check your credentials.",
          lastTested: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: isValid,
      message: updated.testConnection.message,
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: "Error testing connection: " + error.message,
    });
  }
};

// ✅ Save Credentials Controller
const VideoCallTestCredentials = async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        message: "Tenant ID required" 
      });
    }
    
    const settings = await VideoCallingDetails.findOne({ tenantId });
    
    if (!settings) {
      return res.status(404).json({ 
        success: false,
        message: 'Settings not found' 
      });
    }
    
    // Update credentials
    if (settings.updateCredentials) {
      await settings.updateCredentials(provider, credentials);
    }
    
    res.json({ 
      success: true, 
      message: 'Credentials saved successfully',
      hasConfiguredCredentials: settings.hasConfiguredCredentials 
        ? settings.hasConfiguredCredentials(provider) 
        : false
    });
  } catch (error) {
    console.error('❌ Error saving credentials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving credentials: ' + error.message 
    });
  }
};

// ✅ Helper function to test provider connection
async function testVideoProviderConnection(provider, credentials) {
  // Implement actual connection testing logic here
  // This is a mock implementation
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Math.random() > 0.3); // 70% success rate for demo
    }, 2000);
  });
}


 const updateVideoCallingSettings = async (req, res) => {
  try {
    const { 
      defaultProvider, 
      credentialType, 
      credentials, 
      tenantId, 
      ownerId 
    } = req.body;

    // Validate required fields
    if (!tenantId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: "tenantId or ownerId is required",
      });
    }

    // Build query conditions
    const queryConditions = [];
    if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
      queryConditions.push({ tenantId: new mongoose.Types.ObjectId(tenantId) });
    }
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      queryConditions.push({ ownerId: new mongoose.Types.ObjectId(ownerId) });
    }

    if (queryConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenantId or ownerId format",
      });
    }

    // Update or create settings
    const updatedSettings = await VideoCallingDetails.findOneAndUpdate(
      { $or: queryConditions },
      {
        $set: {
          defaultProvider,
          credentialType,
          credentials,
          updatedAt: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: updatedSettings
    });

  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
};

// ✅ Create default Zoom settings


 
/**

* Create or get default Zoom video calling settings

* @param {String} tenantId - The tenant ID

* @param {String} ownerId - The owner/contact ID

* @returns {Promise<Object>} - The found or newly created settings document

*/

const CreateOrGetVideoCallingSettings = async (tenantId, ownerId) => {

  try {

    if (!tenantId || !ownerId) {

      throw new Error("tenantId and ownerId are required");

    }
 
    // ✅ Check if it already exists

    const existing = await VideoCallingDetails.findOne({ tenantId, ownerId });

    if (existing) {

      return {

        created: false,

        message: "✅ Video calling settings already exist for this tenant.",

        data: existing

      };

    }
 
    // ✅ Create default Zoom settings

    const newSettings = new VideoCallingDetails({

      tenantId,

      ownerId,

      defaultProvider: "zoom",

      credentialType: "platform",

      credentials: {

        zoom: {

          apiKey: "",

          apiSecret: "",

          accountId: "",

          isConfigured: false

        },

        googleMeet: {

          clientId: "",

          clientSecret: "",

          refreshToken: "",

          isConfigured: false

        },

        teams: {

          tenantId: "",

          clientId: "",

          clientSecret: "",

          isConfigured: false

        }

      },

      testConnection: {

        status: null,

        message: "",

        lastTested: null

      },

      uiState: {

        lastConfiguredProvider: "zoom",

        showCredentialHelp: true,

        credentialPopupsDismissed: 0

      }

    });
 
    const saved = await newSettings.save();
 
    return {

      created: true,

      message: "✅ Default Zoom video calling settings created successfully.",

      data: saved

    };

  } catch (error) {

    console.error("❌ Error in createOrGetVideoCallingSettings:", error);

    throw new Error(error.message || "Error creating or fetching video calling settings");

  }

}
 

// ✅ Export using CommonJS
module.exports = {
  getVideoCallingSettings,
  VideoCallTestConnection,
  VideoCallTestCredentials,
  updateVideoCallingSettings,
  CreateOrGetVideoCallingSettings
};