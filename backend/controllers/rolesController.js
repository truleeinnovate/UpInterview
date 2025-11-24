const Role = require("../models/RolesData");

//  const saveRole = async (req, res) => {
//     const { roleName, reportsToRoleId, description, organizationId, permissions, level, inherits, canAssign } = req.body;

//     const newRole = new Role({
//       roleName,
//       reportsToRoleId,
//       description,
//       organizationId,
//       permissions,
//       level,
//       inherits,
//       canAssign

//     });

//     try {
//       const savedRole = await newRole.save();
//       res.status(201).json(savedRole);
//     } catch (error) {
//       res.status(500).json({ message: 'Error saving role', error: error.message });
//   }
//   };
// const saveRole = async (req, res) => {
//   try {

//     // Create a new role with all the data from request body
//     const newRole = new Role(req.body);

//     // Validate the role before saving
//     // const validationError = newRole.validateSync();
//     // if (validationError) {
//     //   console.error('Validation error:', validationError);
//     //   return res.status(400).json({
//     //     message: 'Validation error',
//     //     errors: validationError.errors
//     //   });
//     // }

//     const savedRole = await newRole.save();
//     res.status(201).json(savedRole);
//   } catch (error) {
//     console.error('Error saving role:', error);
//     res.status(500).json({
//       message: 'Error saving role',
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };

// const getRolesByOrganization = async (req, res) => {
//     const { organizationId } = req.query; // Use query parameters
//     try {
//       const roles = await Role.find({ organizationId }).populate('reportsToRoleId');
//       if (!roles || roles.length === 0) {
//         return res.status(404).json({ message: 'No roles found for this organization' });
//       }
//       res.status(200).json(roles);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching roles', error: error.message });
//   }
//   };
const mongoose = require("mongoose");
const rolesPermissionObject = require("../models/rolesPermissionObject");
// const getRolesByOrganization = async (req, res) => {
//     const { tenantId } = req.query;
//     if (!tenantId) {
//         return res.status(400).json({ message: 'organizationId is required' });
//     }
//     try {
//         let query = { tenantId };
//         if (mongoose.Types.ObjectId.isValid(tenantId)) {
//             query = { tenantId: new mongoose.Types.ObjectId(tenantId) };
//         }
//         const roles = await Role.find(query);
//         if (!roles || roles.length === 0) {
//             return res.status(404).json({ message: 'No roles found for this organization' });
//         }
//         res.status(200).json(roles);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching roles', error: error.message });
//     }
// };

//   const updateRole = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const updatedRole = await Role.findByIdAndUpdate(id, req.body, { new: true });
//       res.status(200).json(updatedRole);
//     } catch (error) {
//       console.error('Error updating role:', error);
//       res.status(500).json({ message: 'Error updating role', error: error.message });
//     }
//   };

// GET all role permission objects
const getAllRoles = async (req, res) => {
  try {
    // Optional: Simulate loading delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await rolesPermissionObject.find().lean();

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  // saveRole,
  // getRolesByOrganization,
  // updateRole,
  getAllRoles,
};
