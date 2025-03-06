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

















// const bcrypt = require('bcrypt');
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

const saltRounds = 10;

const registerOrganization = async (req, res) => { 
    try {
        const {
            firstName, lastName, Email, Phone, username, jobTitle,
            company, employees, country, password
        } = req.body;

        // Check if organization already exists
        const existingOrganization = await Users.findOne({ Email });
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
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new organization
        const organization = new Organization({
            firstName, lastName, Email, Phone, username, jobTitle,
            company, employees, country, password: hashedPassword
        });

        const savedOrganization = await organization.save();

        // Create new user
        const newUser = new Users({
            Name: `${firstName} ${lastName}`,
            Firstname: firstName,
            Email,
            UserId: username,
            Phone,
            organizationId: savedOrganization._id,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Create new contact
        const contact = new Contacts({
            Name: `${firstName} ${lastName}`,
            Firstname: firstName,
            Email,
            Phone,
            UserId: username,
            CurrentRole: jobTitle,
            company,
            employees,
            CountryCode: country,
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
        //         email: savedContact.Email,
        //         ownerId: savedUser._id,
        //         tenantId: savedOrganization._id,
        //         name: savedContact.Name,
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
        const { UserData, contactData } = req.body; // Extract user and contact data

        if (!UserData || !contactData) {
            return res.status(400).json({ message: "User and Contact data are required" });
        }

        const { Firstname, Name, Email, organizationId, RoleId, ProfileId, isAddedTeam } = UserData;

        // Check if user already exists
        const existingUser = await Users.findOne({ Email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Create new user
        const newUser = new Users({
            Name,
            Firstname,
            Email,
            organizationId,
            RoleId,
            ProfileId,
            isAddedTeam,
        });

        const savedUser = await newUser.save();
        const savedUserId = savedUser._id; // Get the newly created user's ID

        if (!savedUserId) {
            throw new Error("User creation failed, no ID returned.");
        }

        // Now create a contact and set the ownerId to savedUserId
        const newContact = new Contacts({
            ...contactData,
            ownerId: savedUserId, // Assign user ID as ownerId
        });

        const savedContact = await newContact.save();

        res.status(201).json({
            message: "User and Contact created successfully",
            userId: savedUserId,
            contactId: savedContact._id,
        });

    } catch (error) {
        console.error("Error in organization registration:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const loginOrganization = async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log("email",email);
        console.log("password",password);


        // Trim input to remove unwanted spaces
        email = email?.trim().toLowerCase();
        password = password?.trim();

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Ensure case-insensitive email search
        const user = await Users.findOne({ Email:email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare hashed password
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // console.log(isPasswordValid, "isPasswordValid");

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Return user info upon successful login
        res.status(200).json({
            success: true,
            message: 'Login successful',
            userId: user._id,
            organizationId: user.organizationId
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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
        // if (type !== "usercreatepass") {
        //     const isSamePassword = await bcrypt.compare(newPassword, user.password);
        //     if (isSamePassword) {
        //         return res.status(400).json({ success: false, message: "New password must be different from the old password." });
        //     }
        // }

        // Hash new password and update user
        // user.password = await bcrypt.hash(newPassword, 10);
        // await user.save();

        return res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};





module.exports = { registerOrganization, loginOrganization, resetPassword,organizationUserCreation };

