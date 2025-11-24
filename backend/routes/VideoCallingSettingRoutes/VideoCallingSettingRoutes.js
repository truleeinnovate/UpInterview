// ✅ Use CommonJS require
const express = require("express");

const {
  VideoCallTestConnection,
  VideoCallTestCredentials,
  getVideoCallingSettings,
  updateVideoCallingSettings,
} = require("../../controllers/VideoCallingSettingControllers/VideoCallingSettingController.js");

const videoRouter = express.Router();

// ✅ Define routes with logging
videoRouter.post("/test-connection", (req, res, next) => {
  VideoCallTestConnection(req, res, next);
});

videoRouter.post("/credentials", (req, res, next) => {
  VideoCallTestCredentials(req, res, next);
});

videoRouter.get("/get-settings", (req, res, next) => {
  getVideoCallingSettings(req, res, next);
});

// PATCH route to update video settings
videoRouter.patch("/update-settings", updateVideoCallingSettings);

// ✅ Export using CommonJS
module.exports = videoRouter;
