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
  // console.log(
  //   "config.REACT_APP_REDIRECT_URI from backend linkedinroutes.js",
  //   config.REACT_APP_REDIRECT_URI
  // );

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
    // console.log("Backend: 1. Received user check request", {
    //   source: "Local Server",
    //   requestOrigin: req.headers.origin,
    //   requestMethod: req.method,
    //   requestPath: req.path,
    //   requestBody: req.body,
    // });
    const { code } = req.body;

    if (!code) {
      // console.log("No authorization code provided");
      return res.status(400).json({ error: "No authorization code provided" });
    }

    // Exchange code for token
    // console.log("Backend: 2. Exchanging code for token");
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
    // console.log("Backend: 3. Getting user info from LinkedIn");
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
      isEmailVerified: true,
    };

    // Check for existing user
    // console.log("Backend: 4. Checking database for existing user");
    let existingUser;
    try {
      existingUser = await Users.findOne({ email: userInfo.email });
      // console.log("Backend: 4.1. Existing user:", existingUser);
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
      console.log("Backend: 5. Creating new contact for LinkedIn user");
      console.log("Contact data to be created:", {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        linkedinUrl: userInfo.profileUrl,
        ownerId: newUser._id,
        tenantId: newTenant._id,
        createdBy: newUser._id,
        status: "new",
      });

      // Step 1: Create contact without imageData
      let newContact;
      try {
        console.log("Backend: Creating contact with data:", {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          linkedinUrl: userInfo.profileUrl,
          ownerId: newUser._id,
          tenantId: newTenant._id,
          createdBy: newUser._id,
          status: "new",
        });

        newContact = await Contacts.create({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          linkedinUrl: userInfo.profileUrl,
          ownerId: newUser._id,
          tenantId: newTenant._id,
          createdBy: newUser._id,
          status: "new",
        });

        console.log("Backend: Contact created successfully:", {
          id: newContact._id,
          email: newContact.email,
          ownerId: newContact.ownerId,
          tenantId: newContact.tenantId,
          createdBy: newContact.createdBy,
          status: newContact.status
        });
      } catch (contactError) {
        console.error("Backend: Error creating contact:", {
          error: contactError.message,
          stack: contactError.stack,
          code: contactError.code,
          name: contactError.name
        });
        return res.status(500).json({
          error: "Failed to create contact",
          details: contactError.message
        });
      }

      // Step 2: If picture exists, upload to Cloudinary using contact._id
      let imageData = null;
      if (userInfo.pictureUrl) {
        try {
          console.log("Backend: 6. Downloading LinkedIn profile image");
          const { buffer, contentType } = await downloadImageAsBuffer(
            userInfo.pictureUrl
          );

          console.log("Backend: 6.1. Uploading image to Cloudinary");
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

          console.log("Backend: 6.2. Updating contact with image data");
          // Step 3: Update the contact with imageData
          newContact.imageData = imageData;
          await newContact.save();
          console.log("Backend: 6.3. Contact updated with image successfully");
        } catch (err) {
          console.warn("Backend: 6.4. LinkedIn image upload failed:", err.message);
        }
      } else {
        console.log("Backend: 6. No profile picture URL provided by LinkedIn");
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
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

module.exports = router;
