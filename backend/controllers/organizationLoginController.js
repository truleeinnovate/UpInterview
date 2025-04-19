// const bcrypt = require('bcrypt');
// const {Organization} = require('../models/Organization');
// const {Users} = require('../models/Users');
// const {Contacts} = require('../models/Contacts');
// const SharingSettings = require('../models/SharingSettings');
// const Profile = require('../models/Profile');
// const Role = require('../models/RolesData.js');
// const Tabs = require('../models/Tabs');  // Import Tabs model
// const Objects = require('../models/Objects');  // Import Objects model
// const { loginSendEmail } = require("./loginEmailCommonController");

// const saltRounds = 10;

// const organizationLoginController = {
//     async registerOrganization(req, res) {
//         try {
//             const {
//                 firstName, lastName, Email, Phone, username, jobTitle,
//                 company, employees, country, password
//             } = req.body;

//             // Check if organization already exists
//             const existingOrganization = await Organization.findOne({ Email });
//             if (existingOrganization) {
//                 return res.status(400).json({ message: 'Email already registered' });
//             }

//             // Fetch tabs and objects data from DB
//             const tabsData = await Tabs.findOne({});
//             const objectsData = await Objects.findOne({});

//             if (!tabsData || !objectsData) {
//                 return res.status(500).json({ message: 'Tabs or Objects data not found' });
//             }

//             // Hash password
//             const hashedPassword = await bcrypt.hash(password, saltRounds);

//             // Create new organization
//             const organization = new Organization({
//                 firstName, lastName, Email, Phone, username, jobTitle,
//                 company, employees, country, password: hashedPassword
//             });

//             const savedOrganization = await organization.save();

//             // Create new user
//             const newUser = new Users({
//                 Name: `${firstName} ${lastName}`,
//                 Firstname: firstName,
//                 Email,
//                 UserId: username,
//                 Phone,
//                 organizationId: savedOrganization._id,
//                 password: hashedPassword
//             });

//             const savedUser = await newUser.save();
//             await savedUser.save();

//             // Create new contact
//             const contact = new Contacts({
//                 Name: `${firstName} ${lastName}`,
//                 Firstname: firstName,
//                 Email,
//                 Phone,
//                 UserId: username,
//                 CurrentRole: jobTitle,
//                 company,
//                 employees,
//                 CountryCode: country,
//                 ownerId: savedUser._id
//             });

//            const savedContact = await contact.save();

//             // Create default sharing settings
//             const accessBody = objectsData.objects.map(obj => ({
//                 ObjName: obj,
//                 Access: 'Public',
//                 GrantAccess: false
//             }));

//             const sharingSettings = new SharingSettings({
//                 Name: 'sharingSettingDefaultName',
//                 organizationId: savedOrganization._id,
//                 accessBody
//             });

//             await sharingSettings.save();

//             // Create default profiles
//             const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter"];
//             let adminProfileId = "";

//             for (let profileName of profileNames) {
//                 const profileTabs = tabsData.tabs.map(tab => ({
//                     name: tab,
//                     status: profileName === "Admin" ? 'Visible' : 'Hidden'
//                 }));

//                 const profileObjects = objectsData.objects.map(object => ({
//                     name: object,
//                     permissions: {
//                         View: true,
//                         Create: true,
//                         Edit: true,
//                         Delete: profileName === "Admin"
//                     }
//                 }));

//                 const profile = new Profile({
//                     label: profileName,
//                     Name: profileName,
//                     Description: `Default profile description for ${profileName}`,
//                     Tabs: profileTabs,
//                     Objects: profileObjects,
//                     organizationId: savedOrganization._id
//                 });

//                 const savedProfile = await profile.save();
//                 if (profileName === "Admin") {
//                     adminProfileId = savedProfile._id;
//                 }
//             }

//             // Create default roles
//             const roles = [
//                 { label: "Admin", name: "Admin" },
//                 { label: "CEO", name: "CEO" },
//                 { label: "HR Manager", name: "HR_Manager" },
//                 { label: "HR Lead", name: "HR_Lead" },
//                 { label: "Recruiter", name: "Recruiter" }
//             ];

//             let roleIds = {};
//             for (let role of roles) {
//                 let reportsToRoleId = roleIds[role.name === "Admin" ? null : roles[roles.indexOf(role) - 1]?.name];

//                 const newRole = new Role({
//                     roleName: role.name,
//                     reportsToRoleId: reportsToRoleId || null,
//                     description: `Default role description for ${role.name}`,
//                     organizationId: savedOrganization._id
//                 });

//                 const savedRole = await newRole.save();
//                 roleIds[role.name] = savedRole._id;
//             }

//             // Assign Admin Role and Profile to the User
//             await Users.findByIdAndUpdate(savedUser._id, {
//                 RoleId: roleIds["Admin"],
//                 ProfileId: adminProfileId
//             });

//             console.log("Calling email sending controller...");
//                 await loginSendEmail({
//                   body: {
//                     email: savedContact.Email,
//                     ownerId :savedUser._id,
//                     tenantId: savedOrganization._id,
//                     name: savedContact.Name,
//                   },
//                 }, { json: () => {} });

//             res.status(201).json({
//                 message: "Organization registered successfully",
//                 organization: savedOrganization,
//                 user: savedUser
//             });

//         } catch (error) {
//             console.error('Error in organization registration:', error);
//             res.status(500).json({ message: 'Internal server error', error: error.message });
//         }
//     }
// };

// module.exports = organizationLoginController;

















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
const mangoose = require("mongoose");

const saltRounds = 10;

const registerOrganization = async (req, res) => { 
    try {
        const {
            firstName, lastName, email, phone, profileId, jobTitle,
            company, employees, country, password
        } = req.body;

        // Check if organization already exists
        const existingOrganization = await Users.findOne({ email });
        if (existingOrganization) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Fetch tabs and objects data from DB
        const tabsData = await Tabs.findOne({});
        const objectsData = await Objects.findOne({});

        if (!tabsData || !objectsData) {
            return res.status(500).json({ message: 'Tabs or Objects data not found' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new organization
        const organization = new Organization({
            firstName, lastName, email, phone, profileId, jobTitle,
            company, employees, country, password: hashedPassword
        });

        const savedOrganization = await organization.save();

        // Create new user
        const newUser = new Users({
            lastName,
            firstName,
            email,
            profileId,
            phone,
            tenantId: savedOrganization._id,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Create new contact
        const contact = new Contacts({
            lastName,
            firstName,
            email,
            phone,
            profileId,
            currentRole: jobTitle,
            company,
            employees,
            countryCode: country,
            tenantId: savedOrganization._id,
            ownerId: savedUser._id
        });

        const savedContact = await contact.save();

        // Create default sharing settings
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

        // Create default profiles
        const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter","Internal Interviewer"];
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

        // Create default roles
        const roles = [
            { label: "Admin", name: "Admin" },
            { label: "CEO", name: "CEO" },
            { label: "HR Manager", name: "HR_Manager" },
            { label: "HR Lead", name: "HR_Lead" },
            { label: "Recruiter", name: "Recruiter" },
            { label: "Internal Interviewer", name: "Internal_Interviewer" }
        ];

        let roleIds = {};
        for (let role of roles) {
            let reportsToRoleId = roleIds[role.name === "Admin" ? null : roles[roles.indexOf(role) - 1]?.name];

            const newRole = new Role({
                roleName: role.name,
                reportsToRoleId: reportsToRoleId || null,
                description: `Default role description for ${role.name}`,
                organizationId: savedOrganization._id
            });

            const savedRole = await newRole.save();
            roleIds[role.name] = savedRole._id;
        }

        // Assign Admin Role and Profile to the User
        await Users.findByIdAndUpdate(savedUser._id, {
            RoleId: roleIds["Admin"],
            ProfileId: adminProfileId
        });

        console.log("Calling email sending controller...");
        // await loginSendEmail({
        //     body: {
        //         email: savedContact.email,
        //         ownerId: savedUser._id,
        //         tenantId: savedOrganization._id,
        //         name: savedContact.lastName,
        //     },
        // }, { json: () => { } });  

        res.status(201).json({
            message: "Organization registered successfully",
            organization: savedOrganization,
            user: savedUser
        });

    } catch (error) {
        console.error('Error in organization registration:', error);
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

        const user = await Users.findOne({  email });
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

        res.status(200).json({
            success: true,
            message: 'Login successful',
            userId: user._id,
            organizationId: user.organizationId,
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

    // Validate tenantId
    // if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    //   return res.status(400).json({ message: 'Invalid tenant ID' });
    // }

    // Get all users for the tenant
    const users = await Users.find({ tenantId }).lean();

    // If no users found, return empty array
    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    // Get all necessary data in parallel for better performance
    const [contacts, roles] = await Promise.all([
      Contacts.find({ tenantId }).lean(),
      Role.find({ organizationId: tenantId }).lean()
    ]);

    // Create a map of roleId to role for quick lookup
    const roleMap = roles.reduce((acc, role) => {
      acc[role._id.toString()] = role;
      return acc;
    }, {});

    // Create a map of ownerId to contact for quick lookup
    const contactMap = contacts.reduce((acc, contact) => {
      if (contact.ownerId) {
        acc[contact.ownerId.toString()] = contact;
      }
      return acc;
    }, {});

    // Combine the data
    const combinedUsers = users.map(user => {
      const contact = contactMap[user._id.toString()] || {};
      const role = user.roleId ? roleMap[user.roleId] : {};

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: contact.phone || '',
        roleId: user.roleId,
        roleName: role.roleName || '',
        label: role.label || '',
        imageUrl: contact.imageData ? 
          `${process.env.API_URL}/${contact.imageData.path.replace(/\\/g, '/')}` : 
          null,
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





module.exports = { registerOrganization, loginOrganization, resetPassword,organizationUserCreation,getUsersByTenant };

