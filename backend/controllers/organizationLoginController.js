// v1.0.0 - Ashok - getting tenant by id is not working on online
// v1.0.1  -  Ashraf  -  removed recent activity code
// v1.0.2  -  Ashraf  -  getting error in azure for organization get based on id
// v1.0.3  -  Ashraf  -  fixed suepr admin creation issue
// v1.0.4  -  Ashok   -  small change in get tenant by Id controller
// v1.0.5  -  Ashok   -  added returning response after user creation at organizationUserCreation controller

const bcrypt = require("bcrypt");
const Tenant = require("../models/Tenant");
const { Users } = require("../models/Users");
const { Contacts } = require("../models/Contacts");
const CustomerSubscription = require("../models/CustomerSubscriptionmodels.js");
const OrganizationRequest = require("../models/OrganizationRequest");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const {
  getAuthCookieOptions,
  clearAuthCookies,
} = require("../utils/cookieUtils");
const SubscriptionPlan = require("../models/Subscriptionmodels.js");
const SharingSettings = require("../models/SharingSettings");
const Profile = require("../models/Profile");
const Role = require("../models/RolesData.js");
const Tabs = require("../models/Tabs");
const Objects = require("../models/Objects");
const jwt = require("jsonwebtoken");
const RolesPermissionObject = require("../models/rolesPermissionObject");
const {
  generateToken,
  generateEmailVerificationToken,
  verifyEmailToken,
} = require("../utils/jwt");
const saltRounds = 10;
const mongoose = require("mongoose");
const {
  sendVerificationEmail,
} = require("../controllers/EmailsController/signUpEmailController.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");

const organizationUserCreation = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create/Update Organization User";

  try {
    const { UserData, contactData } = req.body;

    if (!UserData || !contactData) {
      return res
        .status(400)
        .json({ message: "User and Contact data are required" });
    }

    const {
      firstName,
      lastName,
      email,
      tenantId,
      roleId,
      isProfileCompleted,
      countryCode,
      status,
      editMode,
      _id,
      isEmailVerified,
      // <-------------------------------v1.0.3
      userType, // Extract type from UserData
    } = UserData;

    // Remove isProfileCompleted for super admins if present
    const isSuperAdmin = userType === "superAdmin";
    if (isSuperAdmin && "isProfileCompleted" in UserData) {
      delete UserData.isProfileCompleted;
    }
    // ------------------------------v1.0.3 >

    // Validate roleId
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: "Invalid roleId format" });
    }

    // Validate tenantId for non-super admins
    // if (!isSuperAdmin && !mongoose.Types.ObjectId.isValid(tenantId)) {
    //   return res.status(400).json({ message: "Invalid tenantId format" });
    // }

    if (editMode && _id) {
      // Update existing user
      const existingUser = await Users.findById(_id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.email = email;
      existingUser.tenantId = isSuperAdmin ? null : tenantId; // Set tenantId to null for super admins
      existingUser.roleId = new mongoose.Types.ObjectId(roleId); // Ensure ObjectId
      existingUser.countryCode = countryCode;
      // <-------------------------------v1.0.3
      if (!isSuperAdmin) {
        existingUser.isProfileCompleted = isProfileCompleted || false;
      }
      // ------------------------------v1.0.3 >
      existingUser.status = status;
      existingUser.isEmailVerified = isEmailVerified || false;

      const savedUser = await existingUser.save();

      // Update contact
      const existingContact = await Contacts.findOne({ ownerId: _id });
      if (existingContact) {
        existingContact.firstName = contactData.firstName;
        existingContact.lastName = contactData.lastName;
        existingContact.email = contactData.email;
        existingContact.phone = contactData.phone;
        existingContact.tenantId = isSuperAdmin ? null : contactData.tenantId;
        existingContact.countryCode = contactData.countryCode;
        await existingContact.save();
      } else {
      }

      res.locals.logData = {
        tenantId:
          existingUser.tenantId ||
          contactData.tenantId ||
          UserData.tenantId ||
          "",
        ownerId: savedUser._id?.toString() || "",
        processName: "Create/Update Organization User",
        requestBody: req.body,
        status: "success",
        message: "Organization user updated successfully",
        responseBody: {
          userId: savedUser._id,
          contactId: existingContact?._id,
        },
      };

      return res.status(200).json({
        message: "User updated successfully",
        userId: savedUser._id,
        contactId: existingContact?._id,
      });
    } else {
      // Create new user
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const newUser = new Users({
        firstName,
        lastName,
        email,
        tenantId: isSuperAdmin ? null : tenantId, // Set tenantId to null for super admins
        roleId: new mongoose.Types.ObjectId(roleId), // Ensure ObjectId
        countryCode,
        //   status: status || "active",
        status: status,
        isEmailVerified: isEmailVerified || false,
        // <-------------------------------v1.0.3
        ...(isSuperAdmin
          ? {}
          : { isProfileCompleted: isProfileCompleted || false }),
        // ------------------------------v1.0.3 >
      });

      const savedUser = await newUser.save();
      const savedUserId = savedUser._id;

      if (!savedUserId) {
        throw new Error("User creation failed, no ID returned.");
      }

      const newContact = new Contacts({
        ...contactData,
        ownerId: savedUserId,
        tenantId: isSuperAdmin ? null : contactData.tenantId, // Set tenantId to null for super admins
      });

      const savedContact = await newContact.save();

      res.locals.logData = {
        tenantId: savedUser.tenantId || contactData.tenantId || "",
        ownerId: savedUser._id?.toString() || "",
        processName: "Create/Update Organization User",
        requestBody: req.body,
        status: "success",
        message: "Organization user created successfully",
        responseBody: {
          userId: savedUser._id,
          contactId: savedContact._id,
        },
      };

      return res.status(200).json({
        message: "User created successfully",
        contactId: savedContact._id, // using this profile image upload
      });
    }
  } catch (error) {
    console.error("Error in organizationUserCreation:", {
      message: error.message,
      stack: error.stack,
      errorDetails: error,
    });

    res.locals.logData = {
      tenantId:
        req.body?.UserData?.tenantId ||
        req.body?.contactData?.tenantId ||
        "",
      ownerId: req.body?.UserData?._id || "",
      processName: "Create/Update Organization User",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const loginOrganization = async (req, res) => {
  try {
    // logger.log("[loginOrganization] Login request received");

    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // ✅ Use lean() for performance (plain JS object, faster than Mongoose doc)
    const user = await Users.findOne({ email }).select("+password").lean();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        isEmailVerified: false,
      });
    }

    // ✅ Run role + tenant + contact lookup in parallel (non-blocking)
    const [role, organization, contact] = await Promise.all([
      user.roleId ? RolesPermissionObject.findById(user.roleId).lean() : null,
      user.tenantId ? Tenant.findById(user.tenantId).lean() : null,
      Contacts.findOne({ ownerId: user._id }).lean(),
    ]);

    // Role details
    const roleName = role?.roleName || null;
    const roleType = role?.roleType || null;

    // Verify password (bcrypt cost factor tuned)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Internal (super admin) login
    if (roleType === "internal") {
      const payload = {
        impersonatedUserId: user._id.toString(),
        timestamp: new Date().toISOString(),
      };
      const impersonationToken = generateToken(payload, { expiresIn: "7h" });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        impersonatedUserId: user._id.toString(),
        impersonationToken,
        roleType,
        isEmailVerified: user.isEmailVerified,
        redirect: "/admin-dashboard",
      });
    }

    // Tenant check
    if (!organization || organization.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account not active",
        status: organization?.status || "not found",
      });
    }

    // JWT for normal users
    const payload = {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      organization: true,
      timestamp: new Date().toISOString(),
    };
    const authToken = generateToken(payload, { expiresIn: "7h" });

    // // Create or update OrganizationRequest with contact ID (profileId)
    // await OrganizationRequest.findOneAndUpdate(
    //   { tenantId: user.tenantId, ownerId: user._id },
    //   {
    //     $setOnInsert: {
    //       tenantId: user.tenantId,
    //       ownerId: user._id,
    //       status: 'pending_review'
    //     },
    //   },
    //   {
    //     upsert: true,
    //     new: true,
    //     setDefaultsOnInsert: true
    //   }
    // );

    const responseData = {
      success: true,
      message: "Login successful",
      ownerId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      authToken,
      isProfileCompleted: user?.isProfileCompleted,
      roleName,
      contactEmailFromOrg: contact?.email || null,
      isEmailVerified: user.isEmailVerified,
      status: organization.status,
      subdomain: organization.subdomain || null,
      fullDomain: organization.fullDomain || null,
      subdomainStatus: organization.subdomainStatus || null,
    };

    res.status(200).json(responseData);
  } catch (error) {
    // logger.error("[loginOrganization] Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRolesByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const roles = await Role.find({ tenantId });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    // Verify token and extract id and type
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const { id, type } = decoded;

    // Find the user
    const user = await Users.findById(id).select("+password"); // In case password is select: false
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if password already exists
    const hasExistingPassword = !!user.password;

    if (type !== "usercreatepass" && hasExistingPassword) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the old password.",
        });
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // If type is 'usercreatepass', mark email as verified
    if (type === "usercreatepass") {
      user.isEmailVerified = true;
    }

    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// get organization details
const getBasedIdOrganizations = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id of the organization

    if (!id) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    // ✅ Fetch the organization by _id
    const organization = await Tenant.findById(id).lean();

    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    // ✅ Respond with the full organization object
    return res.status(200).json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

//related to subdomain

// Check subdomain availability
const checkSubdomainAvailability = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Check Subdomain Availability";

  try {
    const { subdomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        available: false,
        message:
          "Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.",
      });
    }

    // Check if subdomain already exists
    const existingOrganization = await Tenant.findOne({ subdomain });

    if (existingOrganization) {
      res.locals.logData = {
        tenantId: "",
        ownerId: "",
        processName: "Check Subdomain Availability",
        requestBody: req.body,
        status: "success",
        message: `${subdomain} is already taken`,
        responseBody: {
          available: false,
          message: `${subdomain} is already taken`,
        },
      };

      return res.status(200).json({
        available: false,
        message: `${subdomain} is already taken`,
      });
    }

    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Check Subdomain Availability",
      requestBody: req.body,
      status: "success",
      message: `${subdomain} is available`,
      responseBody: {
        available: true,
        message: `${subdomain} is available`,
      },
    };

    return res.status(200).json({
      available: true,
      message: `${subdomain} is available`,
    });
  } catch (error) {
    console.error("Error checking subdomain availability:", error);
    res.locals.logData = {
      tenantId: "",
      ownerId: "",
      processName: "Check Subdomain Availability",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update organization subdomain
const updateSubdomain = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Organization Subdomain";

  try {
    const {
      organizationId,
      subdomain,
      baseDomain,
      subdomainStatus,
      subdomainAddedDate,
      subdomainLastVerified,
    } = req.body;

    if (!organizationId || !subdomain) {
      return res
        .status(400)
        .json({ message: "Organization ID and subdomain are required" });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID format" });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.",
      });
    }

    // Check if subdomain already exists for other organizations
    const existingOrganization = await Tenant.findOne({
      subdomain,
      _id: { $ne: organizationId },
    });

    if (existingOrganization) {
      return res.status(400).json({
        success: false,
        message: `${subdomain} is already taken by another organization`,
      });
    }

    // Update organization with new subdomain
    const fullDomain = `${subdomain}.${baseDomain}`;
    const updatedOrganization = await Tenant.findByIdAndUpdate(
      organizationId,
      {
        subdomain,
        fullDomain,
        subdomainStatus,
        subdomainAddedDate,
        subdomainLastVerified,
      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.locals.logData = {
      tenantId: updatedOrganization._id || "",
      ownerId: updatedOrganization.ownerId || "",
      processName: "Update Organization Subdomain",
      requestBody: req.body,
      status: "success",
      message: "Subdomain updated successfully",
      responseBody: {
        success: true,
        organization: {
          subdomain: updatedOrganization.subdomain,
          fullDomain: updatedOrganization.fullDomain,
          subdomainStatus: updatedOrganization.subdomainStatus,
          subdomainAddedDate: updatedOrganization.subdomainAddedDate,
          subdomainLastVerified: updatedOrganization.subdomainLastVerified,
        },
      },
    };

    return res.status(200).json({
      success: true,
      message: "Subdomain updated successfully",
      organization: {
        //id: updatedOrganization._id,
        subdomain: updatedOrganization.subdomain,
        fullDomain: updatedOrganization.fullDomain,
        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainAddedDate: updatedOrganization.subdomainAddedDate,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified,
      },
    });
  } catch (error) {
    console.error("Error updating subdomain:", error);
    res.locals.logData = {
      tenantId: req.body?.organizationId || "",
      ownerId: "",
      processName: "Update Organization Subdomain",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get organization subdomain
const getOrganizationSubdomain = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID format" });
    }

    const organization = await Tenant.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.status(200).json({
      success: true,
      organization: {
        //id: organization._id,
        subdomain: organization.subdomain || null,
        fullDomain: organization.fullDomain || null,
        subdomainStatus: organization.subdomainStatus || null,
        subdomainAddedDate: organization.subdomainAddedDate || null,
        subdomainLastVerified: organization.subdomainLastVerified || null,
      },
    });
  } catch (error) {
    console.error("Error getting organization subdomain:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Activate subdomain
const activateSubdomain = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Activate Organization Subdomain";

  try {
    const {
      organizationId,
      subdomainStatus,
      subdomainAddedDate,
      subdomainLastVerified,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID format" });
    }

    const updatedOrganization = await Tenant.findByIdAndUpdate(
      organizationId,
      {
        subdomainStatus,
        subdomainLastVerified,
      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.locals.logData = {
      tenantId: updatedOrganization._id || "",
      ownerId: updatedOrganization.ownerId || "",
      processName: "Activate Organization Subdomain",
      requestBody: req.body,
      status: "success",
      message: "Subdomain activated successfully",
      responseBody: {
        success: true,
        organization: {
          subdomainStatus: updatedOrganization.subdomainStatus,
          subdomainLastVerified: updatedOrganization.subdomainLastVerified,
        },
      },
    };

    return res.status(200).json({
      success: true,
      message: "Subdomain activated successfully",
      organization: {
        //id: updatedOrganization._id,

        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified,
      },
    });
  } catch (error) {
    console.error("Error activating subdomain:", error);
    res.locals.logData = {
      tenantId: req.body?.organizationId || "",
      ownerId: "",
      processName: "Activate Organization Subdomain",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Deactivate subdomain
const deactivateSubdomain = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Deactivate Organization Subdomain";

  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res
        .status(400)
        .json({ message: "Invalid organization ID format" });
    }

    const updatedOrganization = await Tenant.findByIdAndUpdate(
      organizationId,
      {
        subdomain: null,
        fullDomain: null,
        subdomainStatus: null,
        subdomainAddedDate: null,
        subdomainLastVerified: null,
      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.locals.logData = {
      tenantId: updatedOrganization._id || "",
      ownerId: updatedOrganization.ownerId || "",
      processName: "Deactivate Organization Subdomain",
      requestBody: req.body,
      status: "success",
      message: "Subdomain deactivated successfully",
      responseBody: {
        success: true,
        organization: {
          subdomain: updatedOrganization.subdomain,
          fullDomain: updatedOrganization.fullDomain,
          subdomainStatus: updatedOrganization.subdomainStatus,
          subdomainAddedDate: updatedOrganization.subdomainAddedDate,
          subdomainLastVerified: updatedOrganization.subdomainLastVerified,
        },
      },
    };

    return res.status(200).json({
      success: true,
      message: "Subdomain deactivated successfully",
      organization: {
        //id: updatedOrganization._id,
        subdomain: updatedOrganization.subdomain,
        fullDomain: updatedOrganization.fullDomain,
        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainAddedDate: updatedOrganization.subdomainAddedDate,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified,
      },
    });
  } catch (error) {
    console.error("Error deactivating subdomain:", error);
    res.locals.logData = {
      tenantId: req.body?.organizationId || "",
      ownerId: "",
      processName: "Deactivate Organization Subdomain",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// patch organization details

const updateBasedIdOrganizations = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Organization Details";

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    // Update the organization
    const organization = await Tenant.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.locals.logData = {
      tenantId: organization._id || id || "",
      ownerId: organization.ownerId || "",
      processName: "Update Organization Details",
      requestBody: req.body,
      status: "success",
      message: "Organization updated successfully",
      responseBody: organization,
    };

    res.status(200).json({
      status: "success",
      message: "Organization updated success",
      data: organization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.locals.logData = {
      tenantId: req.params?.id || "",
      ownerId: "",
      processName: "Update Organization Details",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      message: "Error updating organization",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const decoded = verifyEmailToken(token);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const { email, userId } = decoded;

    // Update user and organization
    await Users.findByIdAndUpdate(userId, { isEmailVerified: true });
    // await Organization.findOneAndUpdate(
    //   { ownerId: userId },
    //   { isEmailVerified: true }
    // );

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
    });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || !decoded.newEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const user = await Users.findById(decoded.userId);
    const contacts = await Contacts.findById(decoded.userId);
    // if (!user || user.newEmail !== decoded.newEmail) {
    //   return res.status(400).json({ success: false, message: 'Email change verification failed' });
    // }

    if (!user || user.newEmail !== decoded.newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email change verification failed" });
    }

    // Update email
    user.email = decoded.newEmail;
    user.newEmail = "";

    if (contacts) {
      contacts.email = decoded.newEmail;
      await contacts.save();
    }
    //     user.newEmail = null;
    contacts.email = decoded.newEmail;
    await user.save();

    return res.json({
      success: true,
      message: "Email address updated successfully",
    });
  } catch (error) {
    console.error("Email change verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying email change" });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = "",
      status,
      subscriptionStatus,
      plan,
      createdDate,
      minUsers,
      maxUsers,
      type,
      valueFilter,
    } = req.query;

    // console.log("req.query", req.query);

    const skip = parseInt(page) * parseInt(limit);
    const limitNum = parseInt(limit);

    const matchStage = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      matchStage.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { Email: searchRegex },
        { Phone: searchRegex },
        { company: searchRegex },
      ];
    }

    if (type) matchStage.type = type;
    if (status) matchStage.status = { $in: status.split(",") };

    if (createdDate) {
      const date = new Date(createdDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      matchStage.createdAt = { $gte: date, $lt: nextDay };
    }

    const pipeline = [
      { $match: matchStage },

      // CONTACT LOOKUP
      {
        $lookup: {
          from: "contacts",
          localField: "_id",
          foreignField: "tenantId",
          as: "contact",
        },
      },
      { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },

      // SUBSCRIPTION LOOKUP (replaced "let")
      // {
      //   $lookup: {
      //     from: "customersubscriptions",
      //     localField: "tenantIdStr",
      //     foreignField: "tenantId",
      //     as: "subscription",
      //   },
      // },
      {
        $lookup: {
          from: "customersubscriptions",
          localField: "tenantIdStr",
          foreignField: "tenantId",
          as: "subscription",
        },
      },
      {
        $addFields: {
          subscription: { $arrayElemAt: ["$subscription", -1] },
        },
      },

      // {
      //   $lookup: {
      //     from: "customersubscriptions",
      //     localField: "_id",
      //     foreignField: "tenantId",
      //     as: "subscription",
      //   },
      // },

      // SUBSCRIPTION PLAN
      // {
      //   $lookup: {
      //     from: "subscriptionplans",
      //     localField: "subscription.subscriptionPlanId",
      //     foreignField: "_id",
      //     as: "subscriptionPlan",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$subscriptionPlan",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      {
        $lookup: {
          from: "subscriptionplans",
          localField: "subscription.subscriptionPlanId",
          foreignField: "_id",
          as: "subscriptionPlan",
        },
      },
      {
        $addFields: {
          planName: { $arrayElemAt: ["$subscriptionPlan.name", 0] },
        },
      },

      // USER STATS LOOKUP (replaced "let + pipeline")
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "tenantId",
          as: "userStats",
        },
      },
      {
        $addFields: {
          usersCount: { $size: "$userStats" },
          activeUsersCount: {
            $size: {
              $filter: {
                input: "$userStats",
                as: "u",
                cond: { $eq: ["$$u.status", "active"] },
              },
            },
          },
          isFreelancer: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$userStats",
                    as: "u",
                    cond: { $eq: ["$$u.isFreelancer", "true"] },
                  },
                },
              },
              0,
            ],
          },
        },
      },

      // VALUE FILTER
      ...(valueFilter
        ? [
            {
              $match: (() => {
                const [prefix, ...rest] = valueFilter.split(":");
                const val = rest.join(":").toLowerCase().trim();

                if (prefix === "role") {
                  return {
                    "contact.currentRole": {
                      $regex: new RegExp(`^${val}$`, "i"),
                    },
                  };
                } else if (prefix === "tech") {
                  return {
                    "contact.currentRole": {
                      $elemMatch: {
                        $regex: new RegExp(`^${val}$`, "i"),
                      },
                    },
                  };
                }

                return {};
              })(),
            },
          ]
        : []),

      // FILTERS
      ...(subscriptionStatus
        ? [
            {
              $match: {
                "subscription.status": {
                  $in: subscriptionStatus.split(","),
                },
              },
            },
          ]
        : []),

      ...(plan
        ? [
            {
              $match: {
                planName: { $in: plan.split(",") },
              },
            },
          ]
        : []),

      ...(minUsers || maxUsers
        ? [
            {
              $match: {
                $and: [
                  minUsers ? { usersCount: { $gte: parseInt(minUsers) } } : {},
                  maxUsers ? { usersCount: { $lte: parseInt(maxUsers) } } : {},
                ],
              },
            },
          ]
        : []),

      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          Email: 1,
          Phone: 1,
          company: 1,
          type: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          usersCount: 1,
          activeUsersCount: 1,
          isFreelancer: 1,
          planName: 1,

          // subscription: 1,
          // subscriptionPlan: 1,
          contact: 1,
        },
      },
    ];

    // Get paginated data with sorting (primary aggregation)
    const dataPipeline = [
      ...pipeline,
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ];

    let organizations = [];
    try {
      organizations = await Tenant.aggregate(dataPipeline);
    } catch (dataErr) {
      console.warn(
        "getAllOrganizations data aggregation failed, falling back to simple find():",
        dataErr?.message
      );

      // Fallback: basic query without lookups/joins
      organizations = await Tenant.find(matchStage)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    // Get total count with aggregation first, then fall back to countDocuments
    let total = 0;
    try {
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Tenant.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } catch (countErr) {
      console.warn(
        "getAllOrganizations count aggregation failed, using countDocuments() fallback:",
        countErr?.message
      );
      try {
        total = await Tenant.countDocuments(matchStage);
      } catch (simpleCountErr) {
        console.warn(
          "getAllOrganizations countDocuments fallback failed, using page length as total:",
          simpleCountErr?.message
        );
        total = organizations.length;
      }
    }

    // Calculate stats using aggregation, with countDocuments fallback
    let stats = {
      total: total,
      activeCount: 0,
      inactiveCount: 0,
      pendingCount: 0,
      organizationCount: 0,
      individualCount: 0,
    };

    try {
      const statsPipeline = [
        ...pipeline,
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            inactiveCount: {
              $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
            },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            organizationCount: {
              $sum: { $cond: [{ $eq: ["$type", "organization"] }, 1, 0] },
            },
            individualCount: {
              $sum: { $cond: [{ $eq: ["$type", "individual"] }, 1, 0] },
            },
          },
        },
      ];

      const statsResult = await Tenant.aggregate(statsPipeline);
      if (statsResult[0]) {
        stats = {
          total: statsResult[0].total,
          activeCount: statsResult[0].activeCount,
          inactiveCount: statsResult[0].inactiveCount,
          pendingCount: statsResult[0].pendingCount,
          organizationCount: statsResult[0].organizationCount,
          individualCount: statsResult[0].individualCount,
        };
      }
    } catch (statsErr) {
      console.warn(
        "getAllOrganizations stats aggregation failed, using countDocuments() fallback:",
        statsErr?.message
      );

      try {
        const [
          activeCount,
          inactiveCount,
          pendingCount,
          organizationCount,
          individualCount,
        ] = await Promise.all([
          Tenant.countDocuments({ ...matchStage, status: "active" }),
          Tenant.countDocuments({ ...matchStage, status: "inactive" }),
          Tenant.countDocuments({ ...matchStage, status: "pending" }),
          Tenant.countDocuments({ ...matchStage, type: "organization" }),
          Tenant.countDocuments({ ...matchStage, type: "individual" }),
        ]);

        stats = {
          total,
          activeCount,
          inactiveCount,
          pendingCount,
          organizationCount,
          individualCount,
        };
      } catch (statsFallbackErr) {
        console.warn(
          "getAllOrganizations stats countDocuments fallback failed:",
          statsFallbackErr?.message
        );
      }
    }

    return res.status(200).json({
      data: organizations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
        itemsPerPage: limitNum,
        ...stats,
      },
      status: true,
    });
  } catch (error) {
    console.error("Error in getAllOrganizations:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: false,
    });
  }
};

// const getAllOrganizations = async (req, res) => {
//   try {
//     const {
//       page = 0,
//       limit = 10,
//       search = "",
//       status,
//       subscriptionStatus,
//       plan,
//       createdDate,
//       minUsers,
//       maxUsers,
//       type,
//       valueFilter,
//     } = req.query;

//     const skip = parseInt(page) * parseInt(limit);
//     const limitNum = parseInt(limit);

//     // Build match stage for base query
//     const matchStage = {};

//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       matchStage.$or = [
//         { firstName: searchRegex },
//         { lastName: searchRegex },
//         { Email: searchRegex },
//         { Phone: searchRegex },
//         { company: searchRegex },
//       ];
//     }

//     if (type) matchStage.type = type;
//     if (status) matchStage.status = { $in: status.split(",") };

//     if (createdDate) {
//       const date = new Date(createdDate);
//       const nextDay = new Date(date);
//       nextDay.setDate(nextDay.getDate() + 1);
//       matchStage.createdAt = { $gte: date, $lt: nextDay };
//     }

//     // Start aggregation pipeline
//     const pipeline = [
//       { $match: matchStage },
//       // Lookup contacts
//       {
//         $lookup: {
//           from: "contacts",
//           localField: "_id",
//           foreignField: "tenantId",
//           as: "contact",
//         },
//       },
//       { $unwind: { path: "$contact", preserveNullAndEmptyArrays: true } },
//       // Lookup latest subscription
//       {
//         $lookup: {
//           from: "customersubscriptions",
//           let: { tenantId: "$_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$tenantId", "$$tenantId"] } } },
//             { $sort: { _id: -1 } },
//             { $limit: 1 },
//           ],
//           as: "subscription",
//         },
//       },
//       { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
//       // Lookup subscription plan
//       {
//         $lookup: {
//           from: "subscriptionplans",
//           localField: "subscription.subscriptionPlanId",
//           foreignField: "_id",
//           as: "subscriptionPlan",
//         },
//       },
//       {
//         $unwind: {
//           path: "$subscriptionPlan",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // Lookup user counts
//       {
//         $lookup: {
//           from: "users",
//           let: { tenantId: "$_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$tenantId", "$$tenantId"] } } },
//             {
//               $group: {
//                 _id: "$tenantId",
//                 usersCount: { $sum: 1 },
//                 activeUsersCount: {
//                   $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
//                 },
//                 hasFreelancer: {
//                   $sum: { $cond: [{ $eq: ["$isFreelancer", "true"] }, 1, 0] },
//                 },
//               },
//             },
//           ],
//           as: "userStats",
//         },
//       },
//       { $unwind: { path: "$userStats", preserveNullAndEmptyArrays: true } },
//       // Add computed fields
//       {
//         $addFields: {
//           usersCount: { $ifNull: ["$userStats.usersCount", 0] },
//           activeUsersCount: { $ifNull: ["$userStats.activeUsersCount", 0] },
//           isFreelancer: {
//             $cond: [
//               { $gt: [{ $ifNull: ["$userStats.hasFreelancer", 0] }, 0] },
//               true,
//               false,
//             ],
//           },
//         },
//       },
//       // Apply valueFilter in aggregation
//       ...(valueFilter
//         ? [
//             {
//               $match: (() => {
//                 const [prefix, ...rest] = valueFilter.split(":");
//                 const val = rest.join(":").toLowerCase().trim();

//                 if (prefix === "role") {
//                   return {
//                     "contact.currentRole": {
//                       $regex: new RegExp(`^${val}$`, "i"),
//                     },
//                   };
//                 } else if (prefix === "tech") {
//                   return {
//                     "contact.currentRole": {
//                       $elemMatch: {
//                         $regex: new RegExp(`^${val}$`, "i"),
//                       },
//                     },
//                   };
//                 }
//                 return {};
//               })(),
//             },
//           ]
//         : []),
//       // Apply other filters
//       ...(subscriptionStatus
//         ? [
//             {
//               $match: {
//                 "subscription.status": {
//                   $in: subscriptionStatus.split(","),
//                 },
//               },
//             },
//           ]
//         : []),
//       ...(plan
//         ? [
//             {
//               $match: {
//                 "subscriptionPlan.name": { $in: plan.split(",") },
//               },
//             },
//           ]
//         : []),
//       // Apply user count filters
//       ...(minUsers || maxUsers
//         ? [
//             {
//               $match: {
//                 $and: [
//                   minUsers ? { usersCount: { $gte: parseInt(minUsers) } } : {},
//                   maxUsers ? { usersCount: { $lte: parseInt(maxUsers) } } : {},
//                 ],
//               },
//             },
//           ]
//         : []),
//       // Project final fields
//       {
//         $project: {
//           _id: 1,
//           firstName: 1,
//           lastName: 1,
//           Email: 1,
//           Phone: 1,
//           company: 1,
//           type: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           usersCount: 1,
//           activeUsersCount: 1,
//           isFreelancer: 1,
//           subscription: 1,
//           subscriptionPlan: 1,
//           contact: 1,
//         },
//       },
//     ];

//     // Get total count
//     const countPipeline = [...pipeline, { $count: "total" }];
//     const countResult = await Tenant.aggregate(countPipeline);
//     const total = countResult[0]?.total || 0;

//     // Get paginated data with sorting
//     const dataPipeline = [
//       ...pipeline,
//       { $sort: { _id: -1 } },
//       { $skip: skip },
//       { $limit: limitNum },
//     ];

//     const organizations = await Tenant.aggregate(dataPipeline);

//     // Calculate stats using another aggregation
//     const statsPipeline = [
//       ...pipeline,
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           activeCount: {
//             $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
//           },
//           inactiveCount: {
//             $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
//           },
//           pendingCount: {
//             $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
//           },
//           organizationCount: {
//             $sum: { $cond: [{ $eq: ["$type", "organization"] }, 1, 0] },
//           },
//           individualCount: {
//             $sum: { $cond: [{ $eq: ["$type", "individual"] }, 1, 0] },
//           },
//         },
//       },
//     ];

//     const statsResult = await Tenant.aggregate(statsPipeline);
//     const stats = statsResult[0] || {
//       total: 0,
//       activeCount: 0,
//       inactiveCount: 0,
//       pendingCount: 0,
//       organizationCount: 0,
//       individualCount: 0,
//     };

//     return res.status(200).json({
//       data: organizations,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limitNum),
//         totalItems: total,
//         hasNext: skip + limitNum < total,
//         hasPrev: parseInt(page) > 0,
//         itemsPerPage: limitNum,
//         ...stats,
//       },
//       status: true,
//     });
//   } catch (error) {
//     console.error("Error in getAllOrganizations:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//       status: false,
//     });
//   }
// };

const deleteTenantAndAssociatedData = async (req, res) => {
  const { tenantId } = req.params;

  // Validate tenantId
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ error: "Invalid tenantId" });
  }

  try {
    // Delete Tenant
    const tenant = await Tenant.findByIdAndDelete(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    // Delete associated Users
    const usersResult = await Users.deleteMany({ tenantId });

    // Find all contacts belonging to the tenant
    const contacts = await Contacts.find({ tenantId });
    const contactIds = contacts.map((contact) => contact._id);

    // Delete all interview availabilities linked to these contacts
    const availabilityResult = await InterviewAvailability.deleteMany({
      contact: { $in: contactIds },
    });

    // Delete the contacts themselves
    const contactsResult = await Contacts.deleteMany({ tenantId });

    res.status(200).json({
      message: "Tenant and associated data deleted successfully",
      deletedTenant: tenant,
      deletedUsersCount: usersResult.deletedCount,
      deletedContactsCount: contactsResult.deletedCount,
      deletedAvailabilityCount: availabilityResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting tenant and associated data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const getOrganizationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id || typeof id !== "string") {
//       return res.status(400).json({ message: "Invalid organization ID" });
//     }

//     const users = await Users.find({ tenantId: id }).select("-password");

//     const organization = await Tenant.findOne({ _id: id }).lean();

//     // Fetch subscription data for the given tenant
//     const subscription = await CustomerSubscription.findOne({ tenantId: id });

//     // Fetch full subscription plan details using subscriptionPlanId
//     let subscriptionPlan = null;
//     if (subscription?.subscriptionPlanId) {
//       subscriptionPlan = await SubscriptionPlan.findById(
//         subscription.subscriptionPlanId
//       ).lean();
//     }

//     // Fetch contacts for all users under this tenant
//     const allContacts = await Contacts.find({ tenantId: id }).lean();

//     const usersWithRoleAndContact = await Promise.all(
//       users.map(async (user) => {
//         let roleName = null;

//         if (user.roleId) {
//           const role = await RolesPermissionObject.findById(user.roleId).select(
//             "roleName"
//           );
//           if (role) {
//             roleName = role.roleName;
//           }
//         }

//         // Find contact for this user
//         const contact = allContacts.find(
//           (contact) => contact.ownerId?.toString() === user._id.toString()
//         );

//         return {
//           ...user,
//           roleName,
//           contact, // attach the contact object if available
//         };
//       })
//     );

//     // Fetch recent activity
//     const recentActivityRaw = await RecentActivity.find({ tenantId: id })
//       .sort({ timestamp: -1 })
//       .limit(10)
//       .lean();

//     // Map contact data to each activity's userId
//     // Map contact data to each activity's entityId
//     const recentActivityWithContact = recentActivityRaw.map((activity) => {
//       const contact = allContacts.find(
//         (contact) =>
//           contact.ownerId?.toString() === activity.entityId?.toString()
//       );

//       return {
//         ...activity,
//         contact,
//       };
//     });

//     const tenant = {
//       tenant: {
//         ...(organization || {}),
//         ...(subscription || {}),
//         subscriptionPlan,
//         recentActivity: recentActivityWithContact,
//       },
//       users: usersWithRoleAndContact,
//     };

//     return res.status(200).json({ organization: tenant });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

//ashraf

// v1.0.0 <--------------------------------------------------------------------------
const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({ message: "Invalid organization ID" });
    // }

    const users = await Users.find({ tenantId: id }).select("-password").lean();
    const user = await Users.findOne({ tenantId: id })
      .select("-password")
      .lean();
    const organization = await Tenant.findOne({ _id: id }).lean();
    const contact = await Contacts.findOne({ tenantId: id }).lean();
    const subscription = await CustomerSubscription.findOne({
      tenantId: id,
    }).lean();

    let subscriptionPlan = null;
    if (subscription?.subscriptionPlanId) {
      subscriptionPlan = await SubscriptionPlan.findById(
        subscription.subscriptionPlanId
      ).lean();
    }

    const allContacts = await Contacts.find({ tenantId: id }).lean();

    const usersWithRoleAndContact = await Promise.all(
      users.map(async (user) => {
        let roleName = null;

        if (user.roleId) {
          const role = await RolesPermissionObject.findById(user.roleId)
            .select("roleName")
            .lean();
          if (role) {
            roleName = role.roleName;
          }
        }

        const contact = allContacts.find(
          (contact) => contact.ownerId?.toString() === user._id.toString()
        );

        return {
          ...user,
          roleName,
          contact,
        };
      })
    );
    const tenant = {
      tenant: {
        // <-------------------------------v1.0.2
        ...organization,
        // ---------------------- v1.0.2 >

        ...subscription,
        subscriptionPlan,
        contact,
        user,
      },
      users: usersWithRoleAndContact,
    };
    // v1.0.0 ---------------------------------------------------------------------------------------->
    return res.status(200).json({ organization: tenant });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
// v1.0.0 -------------------------------------------------------------------------------------------->
const superAdminLoginAsUser = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Super Admin Login As User";

  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await Users.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) {
      return res
        .status(404)
        .json({ success: false, message: "Tenant not found" });
    }

    const isOrganization = tenant.type === "organization";

    const payload = {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      organization: isOrganization,
      timestamp: new Date().toISOString(),
    };
    const authToken = generateToken(payload, { expiresIn: "7h" });

    res.locals.logData = {
      tenantId: user.tenantId?.toString() || "",
      ownerId: user._id?.toString() || "",
      processName: "Super Admin Login As User",
      requestBody: { userId: req.body?.userId },
      status: "success",
      message: "Super admin login as user successful",
      responseBody: {
        userId: user._id.toString(),
        tenantId: user.tenantId.toString(),
        isOrganization,
        redirect: "/home",
      },
    };

    res.status(200).json({
      success: true,
      message: "Login as user successful",
      authToken,
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      isOrganization,
      redirect: "/home",
    });
  } catch (error) {
    console.error("Error during super admin login as user:", error);
    res.locals.logData = {
      tenantId: "",
      ownerId: req.body?.userId || "",
      processName: "Super Admin Login As User",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// ------------------------------------------------------------------------------->

const registerOrganization = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Organization";
  let savedTenant = null;
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      profileId,
      jobTitle,
      company,
      employees,
      country,
      password,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !countryCode ||
      !profileId ||
      !jobTitle ||
      !company ||
      !employees ||
      !country ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate work email
    const domain = email.split("@")[1]?.toLowerCase();
    const personalDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
    ];
    if (personalDomains.includes(domain)) {
      return res
        .status(400)
        .json({ message: "Please use your company email address" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new organization
    const tenant = new Tenant({
      firstName,
      lastName,
      email,
      phone,
      profileId,
      jobTitle,
      company,
      employees,
      country,
      status: "submitted",
      type: "organization",
    });

    savedTenant = await tenant.save();

    // Fetch Admin role
    const adminRole = await RolesPermissionObject.findOne({
      roleName: "Admin",
      roleType: "organization",
    });
    if (!adminRole) {
      throw new Error("Admin role template not found");
    }

    // Create new user
    const newUser = new Users({
      lastName,
      firstName,
      email,
      profileId,
      phone,
      roleId: adminRole._id,
      tenantId: savedTenant._id,
      password: hashedPassword,
      isEmailVerified: false,
      status: "inactive",
    });
    const savedUser = await newUser.save();

    // Update organization with ownerId
    await Tenant.findByIdAndUpdate(savedTenant._id, { ownerId: savedUser._id });

    // Create new contact
    const contact = new Contacts({
      lastName,
      firstName,
      email,
      phone,
      profileId,
      // jobTitle,
      company: company,
      employees: employees,
      countryCode: countryCode,
      tenantId: savedTenant._id,
      ownerId: savedUser._id,
    });
    const savedContact = await contact.save();

    const emailResult = await sendVerificationEmail({
      type: "initial_email_verification",
      to: email,
      data: {
        email,
        userId: savedUser._id,
        firstName: firstName || "",
        lastName: lastName || "",
      },
    });
    if (!emailResult.success) {
      throw new Error(emailResult.message);
    }

    // Generate organization request code using centralized service
    const organizationRequestCode = await generateUniqueId(
      "ORG",
      OrganizationRequest,
      "organizationRequestCode"
    );

    // Create OrganizationRequest with contact ID (profileId)
    try {
      await OrganizationRequest.findOneAndUpdate(
        { tenantId: savedTenant._id, ownerId: savedUser._id },
        {
          $setOnInsert: {
            organizationRequestCode: organizationRequestCode,
            tenantId: savedTenant._id,
            ownerId: savedUser._id,
            status: "pending_review",
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (error) {
      console.error("Error creating/updating OrganizationRequest:", error);
    }

    // Generate JWT
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedTenant._id.toString(),
      organization: true,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    // ✅ Prepare complete response data
    const apiResponse = {
      success: true,
      message: "Organization created successfully",
      tenantId: savedTenant._id,
      ownerId: savedUser._id,
      organization: savedTenant, // full tenant object
      user: savedUser, // full user object
      contact: savedContact, // full contact object
      // emailResult,                     // include email send result
      timestamp: new Date().toISOString(),
    };
    // Generate logs
    res.locals.logData = {
      tenantId: savedTenant._id,
      ownerId: savedUser._id,
      processName: "Create Organization",
      requestBody: req.body,
      message: "Organization created successfully",
      status: "success",
      responseBody: JSON.parse(JSON.stringify(apiResponse)),
    };

    res.status(201).json({
      message: "Organization created successfully",
      tenantId: savedTenant._id,
      ownerId: savedUser._id,
      organization: savedTenant,
      token,
    });
  } catch (error) {
    console.error("Error in organization registration:", error);

    // Generate logs for the error
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Organization",
      requestBody: req.body,
      message: error.message,
      status: "error",
    };
    if (error.code === 11000) {
      if (savedTenant) {
        await Tenant.deleteOne({ _id: savedTenant._id });
      }
      return res.status(400).json({ message: "Duplicate key error" });
    }
    if (savedTenant) {
      await Tenant.deleteOne({ _id: savedTenant._id });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get organization request status
const getOrganizationRequestStatus = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tenantId) ||
      !mongoose.Types.ObjectId.isValid(ownerId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid tenant or owner ID" });
    }

    const request = await OrganizationRequest.findOne({ tenantId, ownerId });

    if (!request) {
      return res.status(200).json({
        success: true,
        data: { status: "NotRequested" },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: request.status,
        updatedAt: request.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting organization request status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  registerOrganization,
  loginOrganization,
  getOrganizationRequestStatus,
  resetPassword,
  organizationUserCreation,
  getRolesByTenant,
  getBasedIdOrganizations,
  checkSubdomainAvailability,
  updateSubdomain,
  getOrganizationSubdomain,
  activateSubdomain,
  deactivateSubdomain,
  updateBasedIdOrganizations,
  verifyEmail,
  verifyEmailChange,
  getAllOrganizations, // SUPER ADMIN added by Ashok
  deleteTenantAndAssociatedData,
  getOrganizationById,
  superAdminLoginAsUser,
};
