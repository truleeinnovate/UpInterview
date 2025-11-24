const express = require("express");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");

const router = express.Router();

// Health check endpoint for debugging
router.get("/health", (req, res) => {
  const healthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "SET"
        : "NOT SET",
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "NOT SET",
      REACT_APP_API_URL_FRONTEND: config.REACT_APP_API_URL_FRONTEND,
    },
    configuration: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
    },
  };

  res.json(healthStatus);
});

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("ERROR: GOOGLE_CLIENT_ID is not set!");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("ERROR: GOOGLE_CLIENT_SECRET is not set!");
}

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    `${config.REACT_APP_API_URL_FRONTEND}/oauth2callback`
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// 👉 Step 1: Login redirect
router.get("/google", (req, res) => {
  // Check if required environment variables are set
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing required Google OAuth environment variables");
    return res
      .status(500)
      .json({ error: "Google OAuth configuration is missing" });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  res.redirect(url);
});

// 👉 Step 2: Handle redirect and return tokens
router.post("/exchange_token", async (req, res) => {
  const { code } = req.body;

  // Check if required environment variables are set
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing required Google OAuth environment variables");
    return res
      .status(500)
      .json({ error: "Google OAuth configuration is missing" });
  }

  if (!code) {
    console.error("No authorization code provided");
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.json(tokens); // includes refresh_token
  } catch (err) {
    console.error("=== Token Exchange Error ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err);
    console.error("============================");
    res.status(400).json({ error: err.message });
  }
});

// 👉 Step 3: Create Google Meet
router.post("/create_event", async (req, res) => {
  const {
    refreshToken,
    summary,
    description,
    startDateTime,
    endDateTime,
    timeZone,
    attendees,
  } = req.body;
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: { dateTime: startDateTime, timeZone },
        end: { dateTime: endDateTime, timeZone },
        conferenceData: { createRequest: { requestId: uuidv4() } },
        attendees: attendees || [],
      },
    });

    res.json({
      eventLink: response.data.htmlLink,
      meetLink: response.data.hangoutLink,
    });
  } catch (err) {
    console.error("Failed to create Google Meet event:", err);
    res
      .status(500)
      .json({ error: "Failed to create event", details: err.message });
  }
});

module.exports = router;
