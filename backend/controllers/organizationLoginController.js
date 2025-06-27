const bcrypt = require("bcrypt");
const Tenant = require("../models/Tenant");
const { Users } = require("../models/Users");
const { Contacts } = require("../models/Contacts");
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

// const registerOrganization = async (req, res) => {
//   let savedTenant = null;
//   try {
//     console.log('Starting organization registration process...');
//     const {
//       firstName, lastName, email, phone, countryCode, profileId, jobTitle,
//       company, employees, country, password
//     } = req.body;
//     console.log('Request body received:', { firstName, lastName, email, phone, countryCode, profileId, jobTitle, company, employees, country });

//     // Validate required fields
//     if (!firstName || !lastName || !email || !phone || !countryCode || !profileId || !jobTitle || !company || !employees || !country || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Validate work email
//     const domain = email.split('@')[1]?.toLowerCase();
//     const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
//     if (personalDomains.includes(domain)) {
//       return res.status(400).json({ message: 'Please use your company email address' });
//     }

//     // Fetch tabs and objects data from DB
//     console.log('Fetching tabs and objects data from database...');
//     const tabsData = await Tabs.findOne({});
//     const objectsData = await Objects.findOne({});
//     console.log('Tabs data:', tabsData ? 'Found' : 'Not found');
//     console.log('Objects data:', objectsData ? 'Found' : 'Not found');

//     if (!tabsData || !objectsData) {
//       console.log('Tabs or Objects data not found in database');
//       return res.status(500).json({ message: 'Tabs or Objects data not found' });
//     }

//     // Hash password
//     console.log('Hashing password...');
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     console.log('Password hashed successfully');

//     // Create new organization
//     console.log('Creating new organization...');
//     const tenant = new Tenant({
//       firstName, lastName, email, phone, profileId, jobTitle,
//       company, employees, country, password: hashedPassword,
//       status: 'submitted',
//       type: 'organization',
//     });

//     // savedOrganization = await organization.save();
//     const savedTenant = await tenant.save();
//     console.log('Organization saved successfully with ID:', savedTenant._id);



//     // Create new user
//     console.log('Creating new user...');
//     const newUser = new Users({
//       lastName,
//       firstName,
//       email,
//       profileId,
//       phone,
//       tenantId: savedTenant._id,
//       password: hashedPassword,
//       isEmailVerified: false
//     });
//     console.log('New user object:', JSON.stringify(newUser, null, 2));
//     const savedUser = await newUser.save();
//     console.log('User saved successfully with ID:', savedUser._id);

//     // Update the organization with ownerId (user's _id)
//     await Tenant.findByIdAndUpdate(savedTenant._id, {
//       ownerId: savedUser._id
//     });
//     console.log('Organization updated with ownerId:', savedUser._id);

//     // Create new contact
//     console.log('Creating new contact...');
//     const contact = new Contacts({
//       lastName,
//       firstName,
//       email,
//       phone,
//       profileId,
//       currentRole: jobTitle,
//       company: company,
//       employees: employees,
//       countryCode: countryCode,
//       tenantId: savedTenant._id,
//       ownerId: savedUser._id
//     });

//     const savedContact = await contact.save();
//     console.log('Contact saved successfully with ID:', savedContact._id);


//     //sending email verification
//     const emailResult = await sendVerificationEmail(email, savedUser._id, firstName, lastName);
//     if (!emailResult.success) {
//       throw new Error(emailResult.message);
//     }

//     // Create default sharing settings
//     console.log('Creating default sharing settings...');
//     const accessBody = objectsData.objects.map(obj => ({
//       ObjName: obj,
//       Access: 'Public',
//       GrantAccess: false
//     }));

//     const sharingSettings = new SharingSettings({
//       Name: 'sharingSettingDefaultName',
//       organizationId: savedTenant._id,
//       accessBody
//     });

//     await sharingSettings.save();
//     console.log('Sharing settings saved successfully');

//     // Create default profiles
//     console.log('Creating default profiles...');
//     const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter", "Internal Interviewer"];
//     let adminProfileId = "";

//     for (let profileName of profileNames) {
//       const profileTabs = tabsData.tabs.map(tab => ({
//         name: tab,
//         status: profileName === "Admin" ? 'Visible' : 'Hidden'
//       }));

//       const profileObjects = objectsData.objects.map(object => ({
//         name: object,
//         permissions: {
//           View: true,
//           Create: true,
//           Edit: true,
//           Delete: profileName === "Admin"
//         }
//       }));

//       const profile = new Profile({
//         label: profileName,
//         Name: profileName,
//         Description: `Default profile description for ${profileName}`,
//         Tabs: profileTabs,
//         Objects: profileObjects,
//         organizationId: savedTenant._id
//       });

//       const savedProfile = await profile.save();
//       if (profileName === "Admin") {
//         adminProfileId = savedProfile._id;
//       }
//     }

//     // Create default roles from RolesPermissionObject
//     console.log('Creating default roles from RolesPermissionObject...');
//     const rolesPermissionObjects = await RolesPermissionObject.find({});
//     let roleIds = {};

//     for (let roleObj of rolesPermissionObjects) {
//       const { label, roleName, objects, level } = roleObj;

//       const roleObjects = objects.map(obj => ({
//         objectName: obj.objectName,
//         permissions: obj.permissions
//       }));

//       const newRole = new Role({
//         label,
//         roleName,
//         description: `Default role description for ${roleName}`,
//         tenantId: savedTenant._id,
//         objects: roleObjects,
//         level,
//         inherits: [],
//         isDefault: true
//       });

//       const savedRole = await newRole.save();
//       roleIds[roleName] = savedRole._id;
//     }

//     // Assign Admin Role and Profile to the User
//     console.log('Assigning Admin role and profile to user:', savedUser._id);
//     await Users.findByIdAndUpdate(savedUser._id, {
//       roleId: roleIds["Admin"],
//       ProfileId: adminProfileId
//     });
//     console.log('Admin role and profile assigned successfully');

//     // Generate JWT
//     const payload = {
//       userId: savedUser._id.toString(),
//       tenantId: savedTenant._id.toString(),
//       organization: true,
//       timestamp: new Date().toISOString(),
//     };
//     const token = generateToken(payload);

//     // Set JWT token in HTTP-only cookie
//     res.cookie('jwt', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     console.log('Organization registration completed successfully');
//     res.status(201).json({
//       message: "Organization created successfully",
//       tenantId: savedTenant._id,
//       ownerId: savedUser._id,
//       organization: savedTenant,
//       token
//     });

//   } catch (error) {
//     console.error('Error in organization registration:', error);
//     if (error.code === 11000) {
//       console.log('Duplicate key error detected:', error.message);
//       if (savedTenant) {
//         console.log('Cleaning up organization with ID:', savedTenant._id);
//         await Organization.deleteOne({ _id: savedTenant._id });
//       }
//       return res.status(400).json({ message: 'Duplicate key error' });
//     }
//     console.error('Unexpected error:', error.message, error.stack);
//     if (savedTenant) {
//       console.log('Cleaning up organization with ID:', savedTenant._id);
//       await Organization.deleteOne({ _id: savedTenant._id });
//     }
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };

const organizationUserCreation = async (req, res) => {
  try {
    console.log("req.body User", req.body);

    console.log("req.body User", req.body);

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
    } = UserData;

    // if (editMode && _id) {
    //   // Update existing user
    //   const existingUser = await Users.findById(_id);
    //   if (!existingUser) {
    //     return res.status(404).json({ message: "User not found" });
    //   }

    //   // Update user fields
    //   existingUser.firstName = firstName;
    //   existingUser.lastName = lastName;
    //   existingUser.email = email;
    //   existingUser.tenantId = tenantId;
    //   existingUser.roleId = roleId;

    //   const savedUser = await existingUser.save();

    //   // Update contact
    //   const existingContact = await Contacts.findOne({ ownerId: _id });
    //   if (existingContact) {
    //     existingContact.firstName = contactData.firstName;
    //     existingContact.lastName = contactData.lastName;
    //     existingContact.email = contactData.email;
    //     existingContact.phone = contactData.phone;
    //     existingContact.tenantId = contactData.tenantId;
    //     existingContact.countryCode = contactData.countryCode;
    //     await existingContact.save();
    //   }

    //   return res.status(200).json({
    //     message: "User updated successfully",
    //     userId: savedUser._id,
    //     contactId: existingContact?._id
    //   });
    // } else {
    // Create new user
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    } else {
      const newUser = new Users({
        firstName,
        lastName,
        email,
        tenantId,
        roleId,
        countryCode,
        isProfileCompleted,
        status,
        isEmailVerified: false,
      });

      const savedUser = await newUser.save();
      const savedUserId = savedUser._id;

      if (!savedUserId) {
        throw new Error("User creation failed, no ID returned.");
      }

      const newContact = new Contacts({
        ...contactData,
        ownerId: savedUserId,
      });

      const savedContact = await newContact.save();

      return res.status(201).json({
        message: "User and Contact created successfully",
        userId: savedUserId,
        contactId: savedContact._id,
      });
    }
  } catch (error) {
    console.error("Error in organization registration:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// const loginOrganization = async (req, res) => {
//   try {
//     let { email, password } = req.body;
//     email = email?.trim().toLowerCase();
//     password = password?.trim();

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     const user = await Users.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'Invalid email or password' });
//     }
//     if (!user.isEmailVerified) {
//       return res.status(403).json({
//         success: false,
//         message: 'Email not verified',
//         isEmailVerified: false
//       });
//     }

//     // const organization = await Tenant.findOne({ _id: user.tenantId });

//     // if (!['active', 'payment_pending'].includes(organization.status)) {
//     //   return res.status(403).json({
//     //     success: false,
//     //     message: 'Account not active',
//     //     status: organization.status
//     //   });
//     // }

//     const organization = await Tenant.findOne({ _id: user.tenantId });

//     if (organization.status === 'inactive') {
//       return res.status(403).json({
//         success: false,
//         message: 'Account not active',
//         status: organization.status
//       });
//     }


//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ success: false, message: 'Invalid email or password' });
//     }

//     let roleName = null;
//     if (user?.isProfileCompleted === false && user.roleId) {
//       const role = await RolesPermissionObject.findById(user.roleId);
//       roleName = role?.roleName;
//     }

//     // Fetch contactId where ownerId matches user._id
//     const contact = await Contacts.findOne({ ownerId: user._id });
//     const contactEmailFromOrg = contact?.email || null;

//     // Generate JWT
//     const payload = {
//       userId: user._id.toString(),
//       tenantId: user.tenantId,
//       organization: true,
//       timestamp: new Date().toISOString(),
//     };
//     const token = generateToken(payload);

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       ownerId: user._id,
//       tenantId: user.tenantId,
//       token,
//       isProfileCompleted: user?.isProfileCompleted,
//       roleName,
//       contactEmailFromOrg,
//       isEmailVerified: user.isEmailVerified,
//       status: organization.status
//     });

//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

const loginOrganization = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await Users.findOne({ email });
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

    // Check user role
    let roleName = null;
    let roleType = null;
    if (user.roleId) {
      const role = await RolesPermissionObject.findById(user.roleId);
      roleName = role?.roleName;
      roleType = role?.roleType;
    }

    // For internal roleType, skip tenant checks and modify token
    if (roleType === 'internal') {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
      // Generate JWT for internal user
      const payload = {
        impersonatedUserId: user._id.toString(),
        timestamp: new Date().toISOString(),
      };
      const token = generateToken(payload);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        ownerId: user._id,
        token,
        roleType,
        isEmailVerified: user.isEmailVerified,
      });
    }

    // For non-internal users, proceed with tenant checks
    const organization = await Tenant.findOne({ _id: user.tenantId });
    if (!organization || organization.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account not active',
        status: organization?.status || 'not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Fetch contactId where ownerId matches user._id
    const contact = await Contacts.findOne({ ownerId: user._id });
    const contactEmailFromOrg = contact?.email || null;

    // Generate JWT for non-internal users
    const payload = {
      userId: user._id.toString(),
      tenantId: user.tenantId,
      organization: true,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ownerId: user._id,
      tenantId: user.tenantId,
      token,
      isProfileCompleted: user?.isProfileCompleted,
      roleName,
      contactEmailFromOrg,
      isEmailVerified: user.isEmailVerified,
      status: organization.status,
    });
  } catch (error) {
    console.error("Error during login:", error);
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
    // console.log("Requested Organization ID:", id);

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
      return res.status(200).json({
        available: false,
        message: `${subdomain} is already taken`,
      });
    }

    return res.status(200).json({
      available: true,
      message: `${subdomain} is available`,
    });
  } catch (error) {
    console.error("Error checking subdomain availability:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update organization subdomain
const updateSubdomain = async (req, res) => {
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
    const fullDomain = `${subdomain}.${baseDomain || "app.upinterview.io"}`;
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
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Deactivate subdomain
const deactivateSubdomain = async (req, res) => {
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
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// patch organization details

const updateBasedIdOrganizations = async (req, res) => {
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

    res.status(200).json({
      status: "success",
      message: "Organization updated success",
      data: organization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification token",
        });
    }

    const user = await Users.findById(decoded.userId);
    const contacts = await Contacts.findById(decoded.userId);
    if (!user || user.newEmail !== decoded.newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email change verification failed" });
    }

    // Update email
    user.email = decoded.newEmail;
    user.newEmail = null;
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

// SUPER ADMIN added by Ashok ---------------------------------------------------->
const getAllOrganizations = async (req, res) => {
  try {
    const userCounts = await Users.aggregate([
      {
        $group: {
          _id: "$tenantId",
          userCount: { $sum: 1 },
        },
      },
    ]);

    const userCountMap = {};
    userCounts.forEach(({ _id, userCount }) => {
      userCountMap[_id?.toString()] = userCount;
    });

    const organizations = await Organization.find();

    const enrichedOrganizations = organizations.map((org) => {
      const orgId = org._id.toString();
      return {
        ...org.toObject(),
        usersCount: userCountMap[orgId] || 0,
      };
    });

    return res.status(200).json({
      organizations: enrichedOrganizations,
      totalOrganizations: organizations.length,
      status: true,
    });
  } catch (error) {
    console.log("Error in get organizations controller:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};
// ------------------------------------------------------------------------------->
















const registerOrganization = async (req, res) => {
  let savedTenant = null;
  try {
    console.log('Starting organization registration process...');
    const {
      firstName, lastName, email, phone, countryCode, profileId, jobTitle,
      company, employees, country, password
    } = req.body;
    console.log('Request body received:', { firstName, lastName, email, phone, countryCode, profileId, jobTitle, company, employees, country });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !countryCode || !profileId || !jobTitle || !company || !employees || !country || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate work email
    const domain = email.split('@')[1]?.toLowerCase();
    const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    if (personalDomains.includes(domain)) {
      return res.status(400).json({ message: 'Please use your company email address' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Create new organization
    console.log('Creating new organization...');
    const tenant = new Tenant({
      firstName, lastName, email, phone, profileId, jobTitle,
      company, employees, country,
      status: 'submitted',
      type: 'organization'
    });

    savedTenant = await tenant.save();
    console.log('Organization saved successfully with ID:', savedTenant._id);

    // Fetch Admin role
    const adminRole = await RolesPermissionObject.findOne({ roleName: 'Admin', roleType: 'organization' });
    if (!adminRole) {
      throw new Error('Admin role template not found');
    }

    // Create new user
    console.log('Creating new user...');
    const newUser = new Users({
      lastName,
      firstName,
      email,
      profileId,
      phone,
      roleId: adminRole._id,
      tenantId: savedTenant._id,
      password: hashedPassword,
      isEmailVerified: false
    });
    const savedUser = await newUser.save();
    console.log('User saved successfully with ID:', savedUser._id);

    // Update organization with ownerId
    await Tenant.findByIdAndUpdate(savedTenant._id, { ownerId: savedUser._id });
    console.log('Organization updated with ownerId:', savedUser._id);

    // Create new contact
    console.log('Creating new contact...');
    const contact = new Contacts({
      lastName,
      firstName,
      email,
      phone,
      profileId,
      currentRole: jobTitle,
      company: company,
      employees: employees,
      countryCode: countryCode,
      tenantId: savedTenant._id,
      ownerId: savedUser._id
    });
    const savedContact = await contact.save();
    console.log('Contact saved successfully with ID:', savedContact._id);

    // Send email verification
    const emailResult = await sendVerificationEmail(email, savedUser._id, firstName, lastName);
    if (!emailResult.success) {
      throw new Error(emailResult.message);
    }

    // Generate JWT
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedTenant._id.toString(),
      organization: true,
      timestamp: new Date().toISOString()
    };
    const token = generateToken(payload);

    // Set JWT token in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    console.log('Organization registration completed successfully');
    res.status(201).json({
      message: 'Organization created successfully',
      tenantId: savedTenant._id,
      ownerId: savedUser._id,
      organization: savedTenant,
      token
    });
  } catch (error) {
    console.error('Error in organization registration:', error);
    if (error.code === 11000) {
      console.log('Duplicate key error detected:', error.message);
      if (savedTenant) {
        console.log('Cleaning up organization with ID:', savedTenant._id);
        await Tenant.deleteOne({ _id: savedTenant._id });
      }
      return res.status(400).json({ message: 'Duplicate key error' });
    }
    if (savedTenant) {
      console.log('Cleaning up organization with ID:', savedTenant._id);
      await Tenant.deleteOne({ _id: savedTenant._id });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


module.exports = {
  registerOrganization,
  loginOrganization,
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
};
