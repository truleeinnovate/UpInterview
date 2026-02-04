// utils/buildPermissionQuery.js   ← create this file
const { Users } = require("../models/Users");
const mongoose = require("mongoose");

/**
 * Builds MongoDB query based on user permissions
 * @param {ObjectId} userId
 * @param {ObjectId} tenantId
 * @param {Object} permissions - from res.locals.effectivePermissions
 * @returns {Object} Mongo query fragment (e.g. { tenantId }, { ownerId: ... })
 */
const buildPermissionQuery = async (userId, tenantId,
    inheritedRoleIds,
    effectivePermissions_RoleType,
    effectivePermissions_RoleName) => {
    const roleType = effectivePermissions_RoleType;
    const roleName = effectivePermissions_RoleName;

    let query = {};

    // Convert to ObjectId if they are strings
    const toObjectId = (id) => {
        if (!id) return null;
        return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
    };

    if (roleType === "individual") {
        // Only own records
        query.ownerId = toObjectId(userId);
    }
    else if (roleType === "organization") {
        if (roleName === "Admin") {
            // Admin sees everything in tenant
            query.tenantId = toObjectId(tenantId);
        } else {
            // Non-admin org user → sees own + inherited roles' users' records
            if (inheritedRoleIds.length > 0) {
                const accessibleUsers = await Users.find({
                    tenantId: toObjectId(tenantId),
                    roleId: { $in: inheritedRoleIds },
                }).select("_id").lean();

                const accessibleUserIds = accessibleUsers.map(u => u._id);
                accessibleUserIds.push(toObjectId(userId)); // include self

                // Dedupe
                const uniqueIds = [...new Set(accessibleUserIds.map(id => id.toString()))]
                    .map(id => new mongoose.Types.ObjectId(id));

                query.ownerId = { $in: uniqueIds };
            } else {
                // No inherited roles → only own
                query.ownerId = toObjectId(userId);
            }
        }
    }


    // Always restrict to tenant (safety net)
    // if (tenantId && roleType !== "individual") {
    //     query.tenantId = tenantId;
    // }

    return query;
};

module.exports = { buildPermissionQuery };