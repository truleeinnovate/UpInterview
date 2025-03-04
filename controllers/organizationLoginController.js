
// // const bcrypt = require('bcrypt');
// const { Organization } = require('../models/Organization');
// // const { Users } = require('../models/Users');
// // const { Contacts } = require('../models/Contacts');
// // const SharingSettings = require('../models/SharingSettings');
// // const Profile = require('../models/Profile');
// // const Role = require('../models/RolesData.js');
// // const Tabs = require('../models/Tabs');
// // const Objects = require('../models/Objects');
// // const { loginSendEmail } = require("./loginEmailCommonController");

// const saltRounds = 10;

// // const registerOrganization = async (req, res) => {
// //     try {
// //         const {
// //             firstName, lastName, Email, Phone, username, jobTitle,
// //             company, employees, country, password
// //         } = req.body;

// //         // Check if organization already exists
// //         const existingOrganization = await Organization.findOne({ Email });
// //         if (existingOrganization) {
// //             return res.status(400).json({ message: 'Email already registered' });
// //         }

// //         // Fetch tabs and objects data from DB
// //         const tabsData = await Tabs.findOne({});
// //         const objectsData = await Objects.findOne({});

// //         if (!tabsData || !objectsData) {
// //             return res.status(500).json({ message: 'Tabs or Objects data not found' });
// //         }

// //         // Hash password
// //         // const hashedPassword = await bcrypt.hash(password, saltRounds);

// //         // Create new organization
// //         const organization = new Organization({
// //             firstName, lastName, Email, Phone, username, jobTitle,
// //             company, employees, country, password: hashedPassword
// //         });

// //         const savedOrganization = await organization.save();

// //         // Create new user
// //         const newUser = new Users({
// //             Name: `${firstName} ${lastName}`,
// //             Firstname: firstName,
// //             Email,
// //             UserId: username,
// //             Phone,
// //             organizationId: savedOrganization._id,
// //             password: hashedPassword
// //         });

// //         const savedUser = await newUser.save();

// //         // Create new contact
// //         const contact = new Contacts({
// //             Name: `${firstName} ${lastName}`,
// //             Firstname: firstName,
// //             Email,
// //             Phone,
// //             UserId: username,
// //             CurrentRole: jobTitle,
// //             company,
// //             employees,
// //             CountryCode: country,
// //             ownerId: savedUser._id
// //         });

// //         const savedContact = await contact.save();

// //         // Create default sharing settings
// //         const accessBody = objectsData.objects.map(obj => ({
// //             ObjName: obj,
// //             Access: 'Public',
// //             GrantAccess: false
// //         }));

// //         const sharingSettings = new SharingSettings({
// //             Name: 'sharingSettingDefaultName',
// //             organizationId: savedOrganization._id,
// //             accessBody
// //         });

// //         await sharingSettings.save();

// //         // Create default profiles
// //         const profileNames = ["Admin", "CEO", "HR Manager", "HR Lead", "HR Recruiter"];
// //         let adminProfileId = "";

// //         for (let profileName of profileNames) {
// //             const profileTabs = tabsData.tabs.map(tab => ({
// //                 name: tab,
// //                 status: profileName === "Admin" ? 'Visible' : 'Hidden'
// //             }));

// //             const profileObjects = objectsData.objects.map(object => ({
// //                 name: object,
// //                 permissions: {
// //                     View: true,
// //                     Create: true,
// //                     Edit: true,
// //                     Delete: profileName === "Admin"
// //                 }
// //             }));

// //             const profile = new Profile({
// //                 label: profileName,
// //                 Name: profileName,
// //                 Description: `Default profile description for ${profileName}`,
// //                 Tabs: profileTabs,
// //                 Objects: profileObjects,
// //                 organizationId: savedOrganization._id
// //             });

// //             const savedProfile = await profile.save();
// //             if (profileName === "Admin") {
// //                 adminProfileId = savedProfile._id;
// //             }
// //         }

// //         // Create default roles
// //         const roles = [
// //             { label: "Admin", name: "Admin" },
// //             { label: "CEO", name: "CEO" },
// //             { label: "HR Manager", name: "HR_Manager" },
// //             { label: "HR Lead", name: "HR_Lead" },
// //             { label: "Recruiter", name: "Recruiter" }
// //         ];

// //         let roleIds = {};
// //         for (let role of roles) {
// //             let reportsToRoleId = roleIds[role.name === "Admin" ? null : roles[roles.indexOf(role) - 1]?.name];

// //             const newRole = new Role({
// //                 roleName: role.name,
// //                 reportsToRoleId: reportsToRoleId || null,
// //                 description: `Default role description for ${role.name}`,
// //                 organizationId: savedOrganization._id
// //             });

// //             const savedRole = await newRole.save();
// //             roleIds[role.name] = savedRole._id;
// //         }

// //         // Assign Admin Role and Profile to the User
// //         await Users.findByIdAndUpdate(savedUser._id, {
// //             RoleId: roleIds["Admin"],
// //             ProfileId: adminProfileId
// //         });

// //         console.log("Calling email sending controller...");
// //         await loginSendEmail({
// //             body: {
// //                 email: savedContact.Email,
// //                 ownerId: savedUser._id,
// //                 tenantId: savedOrganization._id,
// //                 name: savedContact.Name,
// //             },
// //         }, { json: () => {} });

// //         res.status(201).json({
// //             message: "Organization registered successfully",
// //             organization: savedOrganization,
// //             user: savedUser
// //         });

// //     } catch (error) {
// //         console.error('Error in organization registration:', error);
// //         res.status(500).json({ message: 'Internal server error', error: error.message });
// //     }
// // };

// const loginOrganization = async (req, res) => {
//     const { Email, password } = req.body;

//     try {
//         const user = await Users.findOne({ Email: new RegExp(`^${Email}$`, 'i') });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid email or password' });
//         }

//         // Uncomment this if password hashing is enabled
//         // const isPasswordValid = await bcrypt.compare(password, user.password);
//         // if (!isPasswordValid) {
//         //   return res.status(400).json({ message: 'Invalid email or password' });
//         // }

//         res.status(200).json({
//             message: 'Login successful',
//             userId: user._id,
//             organizationId: user.organizationId
//         });
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// module.exports = { 
//     // registerOrganization,
//      loginOrganization };







// for deployment checking data base
const { Organization } = require('../models/Organization'); // Ensure your model is imported

const saveEmailToDatabase = async (req, res) => {
    const { Email } = req.body;

    try {
        console.log('Received Email:', Email); // Log the received email

        // Create a new entry in MongoDB
        const newEntry = new Organization({ Email });
        await newEntry.save();

        console.log('Data saved successfully:', newEntry); // Log the saved entry

        res.status(201).json({
            message: 'Email saved successfully',
            emailId: newEntry._id
        });
    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { saveEmailToDatabase };
