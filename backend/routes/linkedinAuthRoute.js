const express = require("express");
const router = express.Router();
const axios = require("axios");

const uploadToCloudinary = require("../utils/uploadToCloudinary.js");

const { Users } = require("../models/Users");
const { Contacts } = require("../models/Contacts");
const Tenant = require("../models/Tenant");
const config = require("../config.js");
const { getAuthCookieOptions } = require('../utils/cookieUtils');

router.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// To download Linkedin image as buffer added Ashok
const downloadImageAsBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return {
    buffer: Buffer.from(response.data, "binary"),
    contentType: response.headers["content-type"],
  };
};

const { generateToken } = require("../utils/jwt");

router.post("/check-user", async (req, res) => {
  console.log("=== LinkedIn Auth Debug Info ===");
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("Request origin:", req.headers.origin);
  console.log("Request method:", req.method);
  console.log("Request path:", req.path);

  console.log("Environment variables:");
  console.log("REACT_APP_CLIENT_ID:", config.REACT_APP_CLIENT_ID ? "SET" : "NOT SET");
  console.log("REACT_APP_CLIENT_SECRET:", config.REACT_APP_CLIENT_SECRET ? "SET" : "NOT SET");
  console.log("REACT_APP_REDIRECT_URI:", config.REACT_APP_REDIRECT_URI);
  console.log("=== End Debug Info ===");

  // Check if required environment variables are set
  if (!config.REACT_APP_CLIENT_ID || !config.REACT_APP_CLIENT_SECRET || !config.REACT_APP_REDIRECT_URI) {
    console.error("Missing LinkedIn OAuth configuration:", {
      CLIENT_ID: !!config.REACT_APP_CLIENT_ID,
      CLIENT_SECRET: !!config.REACT_APP_CLIENT_SECRET,
      REDIRECT_URI: !!config.REACT_APP_REDIRECT_URI
    });
    return res.status(500).json({
      error: "LinkedIn OAuth configuration is missing",
      details: "Please check your environment variables"
    });
  }

  try {
    console.log("Backend: 1. Received user check request", {
      source: "Local Server",
      requestOrigin: req.headers.origin,
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: req.body,
    });
    const { code } = req.body;

    if (!code) {
      console.log("No authorization code provided");
      return res.status(400).json({ error: "No authorization code provided" });
    }

    // Exchange code for token
    console.log("Backend: 2. Exchanging code for token");
    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        null,
        {
          params: {
            grant_type: "authorization_code",
            code,
            redirect_uri: config.REACT_APP_REDIRECT_URI,
            client_id: config.REACT_APP_CLIENT_ID,
            client_secret: config.REACT_APP_CLIENT_SECRET,
          },
          timeout: 10000,
          headers: {
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Token exchange error:",
        error.response?.data || error.message
      );
      return res.status(500).json({
        error: "Failed to exchange LinkedIn code for token",
        details: error.response?.data || error.message,
      });
    }

    const accessToken = tokenResponse.data.access_token;

    // Get user info from LinkedIn
    console.log("Backend: 3. Getting user info from LinkedIn");
    const userInfoResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    const userInfo = {
      firstName: userInfoResponse.data.given_name,
      lastName: userInfoResponse.data.family_name,
      email: userInfoResponse.data.email?.trim().toLowerCase(),
      pictureUrl: userInfoResponse.data.picture || null,
      profileUrl: `https://www.linkedin.com/in/${userInfoResponse.data.sub}`,
    };

    // Check for existing user
    console.log("Backend: 4. Checking database for existing user");
    let existingUser;
    try {
      existingUser = await Users.findOne({ email: userInfo.email });
      console.log("Backend: 4.1. Existing user:", existingUser);
    } catch (dbError) {
      console.error("Database error while checking existing user:", dbError);
      return res.status(500).json({
        error: "Database connection error",
        details: "Failed to check existing user"
      });
    }

    if (existingUser) {
      // Only send user data, not LinkedIn data
      const payload = {
        userId: existingUser._id.toString(),
        tenantId: existingUser.tenantId,
        organization: false,
        timestamp: new Date().toISOString(),
        freelancer: existingUser.isFreelancer,
      };
      const token = generateToken(payload);

      // Note: Auth token will be set by frontend using setAuthCookies()
      // Backend only returns the token in response, frontend handles cookie setting
      // res.cookie('authToken', token, getAuthCookieOptions());

      return res.json({
        existingUser: true,
        email: existingUser.email,
        token,
      });
    } else {

      // Create new Tenant
      let newTenant;
      let newUser;

      try {
        newTenant = await Tenant.create({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          type: "individual",
        });

        newUser = await Users.create({
          ...userInfo,
          tenantId: newTenant._id
        });
      } catch (creationError) {
        console.error("Error creating new user/tenant:", creationError);
        return res.status(500).json({
          error: "Failed to create new user",
          details: creationError.message
        });
      }

      newTenant.ownerId = newUser._id;
      await newTenant.save();

      // Create new Contact
      // await Contacts.create({
      //   firstName: userInfo.firstName,
      //   lastName: userInfo.lastName,
      //   email: userInfo.email,
      //   linkedinUrl: userInfo.profileUrl,
      //   imageData: {
      //     filename: String,
      //     path: userInfo.pictureUrl,
      //     contentType: String,
      //     publicId: String,
      //   },
      //   ownerId: newUser._id,
      //   tenantId: newTenant._id,
      //   createdBy: newUser._id,
      // });

      // Step 1: Create contact without imageData
      let newContact;
      try {
        newContact = await Contacts.create({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          linkedinUrl: userInfo.profileUrl,
          ownerId: newUser._id,
          tenantId: newTenant._id,
          createdBy: newUser._id,
        });
      } catch (contactError) {
        console.error("Error creating contact:", contactError);
        return res.status(500).json({
          error: "Failed to create contact",
          details: contactError.message
        });
      }

      // Step 2: If picture exists, upload to Cloudinary using contact._id
      let imageData = null;
      if (userInfo.pictureUrl) {
        try {
          const { buffer, contentType } = await downloadImageAsBuffer(
            userInfo.pictureUrl
          );

          const cloudinaryResult = await uploadToCloudinary(
            buffer,
            "linkedin_profile_image.jpg",
            `contact/${newContact._id}/image`
          );

          imageData = {
            filename: "linkedin_profile_image.jpg",
            path: cloudinaryResult.secure_url,
            contentType,
            publicId: cloudinaryResult.public_id,
          };

          // Step 3: Update the contact with imageData
          newContact.imageData = imageData;
          await newContact.save();
        } catch (err) {
          console.warn("LinkedIn image upload failed:", err.message);
        }
      }

      // Generate token
      const token = generateToken({
        userId: newUser._id.toString(),
        tenantId: newTenant._id.toString(),
        organization: false,
        timestamp: new Date().toISOString(),
        freelancer: newUser.isFreelancer,
      });

      // Note: Auth token will be set by frontend using setAuthCookies()
      // Backend only returns the token in response, frontend handles cookie setting
      // res.cookie('authToken', token, getAuthCookieOptions());

      return res.json({
        existingUser: false,
        email: newUser.email,
        token,
      });
    }

    //   let token = null;
    //   let userData = null;

    //   if (existingUser) {
    //     // Generate JWT token for existing user
    //     const payload = {
    //       userId: existingUser._id.toString(),
    //       tenantId: existingUser.tenantId,
    //       organization: false, // Assuming LinkedIn users are not organizations
    //       timestamp: new Date().toISOString(),
    //     };
    //     token = generateToken(payload);
    //     userData = {
    //       isProfileCompleted: existingUser.isProfileCompleted,
    //       roleName: existingUser.roleId ? (await Role.findById(existingUser.roleId))?.roleName : null
    //     };
    //   }

    //   console.log('Backend: 5. Sending response');

    //   const responsePayload = {
    //     existingUser: Boolean(existingUser),
    //     userInfo,
    //     token,
    //     ...userData
    //   };

    //   console.log('final response :-', responsePayload);

    //   res.json(responsePayload);
  } catch (error) {
    console.error("Error in LinkedIn authentication:", error);

    // Log more details for debugging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }
});

module.exports = router;
