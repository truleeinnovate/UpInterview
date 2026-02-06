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

    // SAFETY GUARD: If roleType is not recognized, return a query that matches nothing
    // to prevent accidental data exposure (fail-safe, not fail-open)
    if (!roleType || !['individual', 'organization'].includes(roleType)) {
        console.warn('[buildPermissionQuery] Invalid or missing roleType:', roleType, '- returning restrictive query');
        // Return a query that matches nothing
        return { _id: { $in: [] } };
    }

    // Convert to ObjectId if they are strings
    const toObjectId = (id) => {
        if (!id) return null;
        return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
    };

    // Get both ObjectId and String versions for compatibility with different schemas
    const userIdObj = toObjectId(userId);
    const userIdStr = userId?.toString();
    const tenantIdObj = toObjectId(tenantId);
    const tenantIdStr = tenantId?.toString();

    if (roleType === "individual") {
        // Only own records - match both ObjectId and String types
        query.$or = [
            { ownerId: userIdObj },
            { ownerId: userIdStr }
        ];
    }
    else if (roleType === "organization") {
        if (roleName === "Admin") {
            // Admin sees everything in tenant - match both ObjectId and String types
            query.$or = [
                { tenantId: tenantIdObj },
                { tenantId: tenantIdStr },
                { ownerId: userIdObj }, // Allow admin to see own records even if tenantId missing
                { ownerId: userIdStr }
            ];
        } else {
            // Non-admin org user → sees own + inherited roles' users' records
            if (inheritedRoleIds.length > 0) {
                const accessibleUsers = await Users.find({
                    tenantId: { $in: [tenantIdObj, tenantIdStr] },
                    roleId: { $in: inheritedRoleIds },
                }).select("_id").lean();

                const accessibleUserIds = accessibleUsers.map(u => u._id);
                accessibleUserIds.push(userIdObj); // include self

                // Dedupe and create both ObjectId and String versions
                const uniqueIds = [...new Set(accessibleUserIds.map(id => id.toString()))];
                const objectIdVersions = uniqueIds.map(id => new mongoose.Types.ObjectId(id));
                const stringVersions = uniqueIds;

                query.ownerId = { $in: [...objectIdVersions, ...stringVersions] };
            } else {
                // No inherited roles → only own - match both ObjectId and String types
                query.$or = [
                    { ownerId: userIdObj },
                    { ownerId: userIdStr }
                ];
            }
        }
    }

    return query;
};

module.exports = { buildPermissionQuery };