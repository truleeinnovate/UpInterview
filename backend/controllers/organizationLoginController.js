
const bcrypt = require('bcrypt');
const { Organization } = require('../models/Organization');
const { Users } = require('../models/Users');
const { Contacts } = require('../models/Contacts');
const SharingSettings = require('../models/SharingSettings');
const Profile = require('../models/Profile');
const Role = require('../models/RolesData.js');
const Tabs = require('../models/Tabs');
const Objects = require('../models/Objects');
const { loginSendEmail } = require("./loginEmailCommonController");
const jwt = require("jsonwebtoken");
const RolesPermissionObject = require('../models/rolesPermissionObject');
const { generateToken } = require('../utils/jwt');

const saltRounds = 10;
const mongoose = require('mongoose');


const registerOrganization = async (req, res) => {
  let savedOrganization = null;
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

    // Fetch tabs and objects data from DB
    console.log('Fetching tabs and objects data from database...');
    const tabsData = await Tabs.findOne({});
    const objectsData = await Objects.findOne({});
    console.log('Tabs data:', tabsData ? 'Found' : 'Not found');
    console.log('Objects data:', objectsData ? 'Found' : 'Not found');

    if (!tabsData || !objectsData) {
      console.log('Tabs or Objects data not found in database');
      return res.status(500).json({ message: 'Tabs or Objects data not found' });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Create new organization
    console.log('Creating new organization...');
    const organization = new Organization({
      firstName, lastName, email, phone, profileId, jobTitle,
      company, employees, country, password: hashedPassword
    });

    savedOrganization = await organization.save();
    console.log('Organization saved successfully with ID:', savedOrganization._id);

    // Create new user
    console.log('Creating new user...');
    const newUser = new Users({
      lastName,
      firstName,
      email,
      profileId,
      phone,
      tenantId: savedOrganization._id,
      password: hashedPassword
    });
    console.log('New user object:', JSON.stringify(newUser, null, 2));
    const savedUser = await newUser.save();
    console.log('User saved successfully with ID:', savedUser._id);

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
      tenantId: savedOrganization._id,
      ownerId: savedUser._id
    });

    const savedContact = await contact.save();
    console.log('Contact saved successfully with ID:', savedContact._id);

    // Create default sharing settings
    console.log('Creating default sharing settings...');
    const accessBody = objectsData.objects.map(obj => ({
      ObjName: obj,
      Access: 'Public',
      GrantAccess: false
    }));

    const sharingSettings = new SharingSettings({
      Name: 'sharingSettingDefaultName',
      organizationId: savedOrganization._id,
      accessBody
    });

    await sharingSettings.save();
    console.log('Sharing settings saved successfully');

    // Create default profiles
    console.log('Creating default profiles...');
    const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter", "Internal Interviewer"];
    let adminProfileId = "";

    for (let profileName of profileNames) {
      const profileTabs = tabsData.tabs.map(tab => ({
        name: tab,
        status: profileName === "Admin" ? 'Visible' : 'Hidden'
      }));

      const profileObjects = objectsData.objects.map(object => ({
        name: object,
        permissions: {
          View: true,
          Create: true,
          Edit: true,
          Delete: profileName === "Admin"
        }
      }));

      const profile = new Profile({
        label: profileName,
        Name: profileName,
        Description: `Default profile description for ${profileName}`,
        Tabs: profileTabs,
        Objects: profileObjects,
        organizationId: savedOrganization._id
      });

      const savedProfile = await profile.save();
      if (profileName === "Admin") {
        adminProfileId = savedProfile._id;
      }
    }

    // Create default roles from RolesPermissionObject
    console.log('Creating default roles from RolesPermissionObject...');
    const rolesPermissionObjects = await RolesPermissionObject.find({});
    let roleIds = {};

    for (let roleObj of rolesPermissionObjects) {
      const { label, roleName, objects, level } = roleObj;

      const roleObjects = objects.map(obj => ({
        objectName: obj.objectName,
        permissions: obj.permissions
      }));

      const newRole = new Role({
        label,
        roleName,
        description: `Default role description for ${roleName}`,
        tenantId: savedOrganization._id,
        objects: roleObjects,
        level,
        inherits: [],
        isDefault: true
      });

      const savedRole = await newRole.save();
      roleIds[roleName] = savedRole._id;
    }

    // Assign Admin Role and Profile to the User
    console.log('Assigning Admin role and profile to user:', savedUser._id);
    await Users.findByIdAndUpdate(savedUser._id, {
      roleId: roleIds["Admin"],
      ProfileId: adminProfileId
    });
    console.log('Admin role and profile assigned successfully');

    // Generate JWT
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedOrganization._id.toString(),
      organization: true,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    // Set JWT token in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log('Organization registration completed successfully');
    res.status(201).json({
      message: "Organization created successfully",
      tenantId: savedOrganization._id,
      ownerId: savedUser._id,
      token // Include token in response body
    });

  } catch (error) {
    console.error('Error in organization registration:', error);
    if (error.code === 11000) {
      console.log('Duplicate key error detected:', error.message);
      if (savedOrganization) {
        console.log('Cleaning up organization with ID:', savedOrganization._id);
        await Organization.deleteOne({ _id: savedOrganization._id });
      }
      return res.status(400).json({ message: 'Duplicate key error' });
    }
    console.error('Unexpected error:', error.message, error.stack);
    if (savedOrganization) {
      console.log('Cleaning up organization with ID:', savedOrganization._id);
      await Organization.deleteOne({ _id: savedOrganization._id });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const organizationUserCreation = async (req, res) => {
  try {
    const { UserData, contactData } = req.body;

    if (!UserData || !contactData) {
      return res.status(400).json({ message: "User and Contact data are required" });
    }

    const { firstName, name, email, tenantId, roleId, isProfileCompleted, countryCode, editMode, _id } = UserData;

    if (editMode && _id) {
      // Update existing user
      const existingUser = await Users.findById(_id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      existingUser.firstName = firstName;
      existingUser.name = lastName;
      existingUser.email = email;
      existingUser.tenantId = tenantId;
      existingUser.roleId = roleId;
      existingUser.countryCode = countryCode;
      existingUser.isProfileCompleted = isProfileCompleted;

      const savedUser = await existingUser.save();

      // Update contact
      const existingContact = await Contacts.findOne({ ownerId: _id });
      if (existingContact) {
        existingContact.firstName = contactData.firstName;
        existingContact.name = contactData.lastName;
        existingContact.email = contactData.email;
        existingContact.phone = contactData.phone;
        existingContact.tenantId = contactData.tenantId;
        existingContact.countryCode = contactData.countryCode;
        await existingContact.save();
      }

      return res.status(200).json({
        message: "User updated successfully",
        userId: savedUser._id,
        contactId: existingContact?._id
      });
    } else {
      // Create new user
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const newUser = new Users({
        firstName,
        name,
        email,
        tenantId,
        roleId,
        countryCode,
        isProfileCompleted
      });

      const savedUser = await newUser.save();
      const savedUserId = savedUser._id;

      if (!savedUserId) {
        throw new Error("User creation failed, no ID returned.");
      }

      const newContact = new Contacts({
        ...contactData,
        ownerId: savedUserId
      });

      const savedContact = await newContact.save();

      return res.status(201).json({
        message: "User and Contact created successfully",
        userId: savedUserId,
        contactId: savedContact._id
      });
    }
  } catch (error) {
    console.error("Error in organization registration:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const loginOrganization = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    let roleName = null;
    if (user?.isProfileCompleted === false && user.roleId) {
      const role = await Role.findById(user.roleId);
      roleName = role?.roleName;
    }

    // Fetch contactId where ownerId matches user._id
    const contact = await Contacts.findOne({ ownerId: user._id });
    const contactDataFromOrg = contact || null;

    // Generate JWT
    const payload = {
      userId: user._id.toString(),
      tenantId: user.tenantId,
      organization: true,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      ownerId: user._id,
      tenantId: user.tenantId,
      token,
      isProfileCompleted: user?.isProfileCompleted,
      roleName,
      contactDataFromOrg
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




const getUsersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid tenant ID' });
    }

    const users = await Users.find({ tenantId }).lean();
    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    const [contacts, roles] = await Promise.all([
      Contacts.find({ tenantId }).lean(),
      Role.find({ tenantId }).lean() // ✅ Fix: using correct field
    ]);

    const roleMap = roles.reduce((acc, role) => {
      acc[role._id.toString()] = role;
      return acc;
    }, {});

    const contactMap = contacts.reduce((acc, contact) => {
      if (contact.ownerId) {
        acc[contact.ownerId.toString()] = contact;
      }
      return acc;
    }, {});

    const combinedUsers = users.map(user => {
      const contact = contactMap[user._id.toString()] || {};
      const role = user.roleId ? roleMap[user.roleId] : {};

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        gender: user.gender,
        phone: contact.phone || '',
        roleId: user.roleId,
        roleName: role.roleName || '',
        label: role.label || '',
        imageData: contact.imageData || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    res.status(200).json(combinedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRolesByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const roles = await Role.find({ tenantId });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// reset password 
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // Verify token and extract type
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const { id, type } = decoded; // Extract type from token

    // Find user
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If user is resetting password, ensure it's different from the old one
    if (type !== "usercreatepass") {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ success: false, message: "New password must be different from the old password." });
      }
    }

    // Hash new password and update user
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// get organization details
const getBasedIdOrganizations = async (req, res) => {
  try {
    const { id } = req.params; // This is the _id of the organization
    console.log("Requested Organization ID:", id);

    if (!id) {
      return res.status(400).json({ message: 'Organization ID is required.' });
    }

    // ✅ Fetch the organization by _id
    const organization = await Organization.findById(id).lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found.' });
    }

    // ✅ Respond with the full organization object
    return res.status(200).json(organization);

  } catch (error) {
    console.error('Error fetching organization:', error);
    return res.status(500).json({ message: 'An error occurred.', error });
  }
};


//related to subdomain

// Check subdomain availability
const checkSubdomainAvailability = async (req, res) => {
  try {
    const { subdomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({ message: 'Subdomain is required' });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        available: false,
        message: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.'
      });
    }

    // Check if subdomain already exists
    const existingOrganization = await Organization.findOne({ subdomain });

    if (existingOrganization) {
      return res.status(200).json({
        available: false,
        message: `${subdomain} is already taken`
      });
    }

    return res.status(200).json({
      available: true,
      message: `${subdomain} is available`
    });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update organization subdomain
const updateSubdomain = async (req, res) => {
  try {
    const { organizationId, subdomain, baseDomain, subdomainStatus, subdomainAddedDate, subdomainLastVerified } = req.body;

    if (!organizationId || !subdomain) {
      return res.status(400).json({ message: 'Organization ID and subdomain are required' });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: 'Invalid organization ID format' });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.'
      });
    }

    // Check if subdomain already exists for other organizations
    const existingOrganization = await Organization.findOne({
      subdomain,
      _id: { $ne: organizationId }
    });

    if (existingOrganization) {
      return res.status(400).json({
        success: false,
        message: `${subdomain} is already taken by another organization`
      });
    }

    // Update organization with new subdomain
    const fullDomain = `${subdomain}.${baseDomain || 'app.upinterview.io'}`;
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      {
        subdomain,
        fullDomain,
        subdomainStatus,
        subdomainAddedDate,
        subdomainLastVerified

      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subdomain updated successfully',
      organization: {
        //id: updatedOrganization._id,
        subdomain: updatedOrganization.subdomain,
        fullDomain: updatedOrganization.fullDomain,
        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainAddedDate: updatedOrganization.subdomainAddedDate,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified
      }
    });
  } catch (error) {
    console.error('Error updating subdomain:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get organization subdomain
const getOrganizationSubdomain = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: 'Invalid organization ID format' });
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      organization: {
        //id: organization._id,
        subdomain: organization.subdomain || null,
        fullDomain: organization.fullDomain || null,
        subdomainStatus: organization.subdomainStatus || null,
        subdomainAddedDate: organization.subdomainAddedDate || null,
        subdomainLastVerified: organization.subdomainLastVerified || null
      }
    });
  } catch (error) {
    console.error('Error getting organization subdomain:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Activate subdomain
const activateSubdomain = async (req, res) => {
  try {
    const { organizationId, subdomainStatus, subdomainAddedDate, subdomainLastVerified } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: 'Invalid organization ID format' });
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      {
        subdomainStatus,
        subdomainLastVerified
      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subdomain activated successfully',
      organization: {
        //id: updatedOrganization._id,

        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified
      }
    });
  } catch (error) {
    console.error('Error activating subdomain:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Deactivate subdomain
const deactivateSubdomain = async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }

    // Validate organizationId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: 'Invalid organization ID format' });
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      {
        subdomain: null,
        fullDomain: null,
        subdomainStatus: null,
        subdomainAddedDate: null,
        subdomainLastVerified: null
      },
      { new: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subdomain deactivated successfully',
      organization: {
        //id: updatedOrganization._id,
        subdomain: updatedOrganization.subdomain,
        fullDomain: updatedOrganization.fullDomain,
        subdomainStatus: updatedOrganization.subdomainStatus,
        subdomainAddedDate: updatedOrganization.subdomainAddedDate,
        subdomainLastVerified: updatedOrganization.subdomainLastVerified
      }
    });
  } catch (error) {
    console.error('Error deactivating subdomain:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerOrganization, loginOrganization, resetPassword, organizationUserCreation, getUsersByTenant, getRolesByTenant, getBasedIdOrganizations, checkSubdomainAvailability,
  updateSubdomain,
  getOrganizationSubdomain,
  activateSubdomain,
  deactivateSubdomain
};

