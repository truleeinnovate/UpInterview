import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const getAllSubordinateRoles = async (currentRoleId, allRoles) => {
    let subordinateRoles = [];

    const findSubordinates = (roleId) => {
        allRoles.forEach(role => {
            const reportsToRoleId = role.reportsToRoleId?._id || role.reportsToRoleId;
            if (reportsToRoleId === roleId) {
                subordinateRoles.push(role._id);
                findSubordinates(role._id);
            }
        });
    };
    findSubordinates(currentRoleId);
    return subordinateRoles;
};

const getSharingRulesUserIds = async (currentUserRoleId, sharingPermissions, userId, organizationId) => {

    let relevantSharingRules = [];
    try {
        if (sharingPermissions.ObjName) {
            const sharingRulesResponse = await axios.get(`${config.REACT_APP_API_URL}/api/sharing-rules`, {
                params: {
                    tenantId: organizationId,
                    objectName: sharingPermissions.ObjName,
                    shareWithId: [userId, currentUserRoleId]
                }
            });
            relevantSharingRules = sharingRulesResponse.data || [];
        }

    } catch (error) {
        console.error('Error fetching sharing rules:', error.response ? error.response.data : error.message);
        return new Set();
    }


    const sharingRuleUserIds = new Set([userId]);
    const recordsOwnedByRoleIds = new Set();

    if (relevantSharingRules.length > 0) {
        for (const rule of relevantSharingRules) {
            if (rule.recordsOwnedBy === 'Role') {
                recordsOwnedByRoleIds.add(rule.recordsOwnedById.toString());
            } else if (rule.recordsOwnedBy === 'User') {
                sharingRuleUserIds.add(rule.recordsOwnedById.toString());
            }
        }
    }

    if (recordsOwnedByRoleIds.size > 0) {
        const usersResponse = await axios.get(`${config.REACT_APP_API_URL}/getUsersByRoleId`, {
            params: {
                organizationId: organizationId,
                roleId: Array.from(recordsOwnedByRoleIds)
            }
        });
        const users = usersResponse.data;

        if (users !== undefined && users.length > 0) {
            users.forEach(user => {
                sharingRuleUserIds.add(user._id.toString());
            });
        }
    }
    return sharingRuleUserIds;
};

const fetchFilterData = async (endpoint, sharingPermissions) => {

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);

    const userId = tokenPayload?.userId;
    const organizationId = tokenPayload?.tenantId;
    const organization = tokenPayload?.organization;
    console.log('userId', userId);
    console.log('organizationId', organizationId);
    console.log('organization', organization);
    if (!endpoint || !userId) {
        console.error("Missing required parameters: endpoint, userId, or organizationId");
        return [];
    }
    let filteredData = [];
    try {
        // Fetch current user's role
        console.log('userId sdf', userId);
        console.log('config.REACT_APP_API_URL', config.REACT_APP_API_URL);
        const currentUserResponse = await axios.get(`${config.REACT_APP_API_URL}/auth/users/${userId}`);
        console.log('currentUserResponse', currentUserResponse);
        let currentUserRoleId;
        if (currentUserResponse.data) {
            const currentUser = currentUserResponse.data;
            currentUserRoleId = currentUser.RoleId;
        }
        const sharingRuleUserIds = await getSharingRulesUserIds(currentUserRoleId, sharingPermissions, userId, organizationId);

        // Fetch role details if needed
        let currentUserRole;
        if (currentUserRoleId) {
            const roleResponse = await axios.get(`${config.REACT_APP_API_URL}/rolesdata/${currentUserRoleId}`);
            currentUserRole = roleResponse.data.roleName;
        }
        // if (organizationId) {
        //     const queryParam = organization === 'true' ? `tenantId=${organizationId}` : `ownerId=${userId}`;
        //     const url = `${process.env.REACT_APP_API_URL}/api/${endpoint}?${queryParam}`;
        // }

        // const response = await axios.get(url);
        if (!userId) return [];
        const response = await axios.get(`${config.REACT_APP_API_URL}/api/${endpoint}`, {
            params: { tenantId: organizationId, ownerId: userId }
        });
        if (response.data) {
            const data = response.data;

            if (organization === 'true') {

                if (sharingPermissions.Access === 'Private' && sharingPermissions.GrantAccess === true && currentUserRole !== 'Admin') {
                    const sharingRuleUserIds = await getSharingRulesUserIds(currentUserRoleId, sharingPermissions, userId, organizationId);
                    const visibleUserIds = [userId];
                    const allRolesResponse = await axios.get(`${config.REACT_APP_API_URL}/rolesdata?organizationId=${organizationId}`);
                    const allRoles = allRolesResponse.data;

                    const visibleRoles = await getAllSubordinateRoles(currentUserRoleId, allRoles);

                    const visibleUsersResponse = await axios.get(`${config.REACT_APP_API_URL}/users?organizationId=${organizationId}`);
                    const visibleUsers = visibleUsersResponse.data.filter(user =>
                        visibleRoles.includes(user.RoleId)
                    );

                    visibleUserIds.push(...visibleUsers.map(user => user._id));

                    if (sharingRuleUserIds !== undefined && sharingRuleUserIds.size > 0) {
                        sharingRuleUserIds.forEach(uid => {
                            if (!visibleUserIds.includes(uid.toString())) {
                                visibleUserIds.push(uid.toString());
                            }
                        });
                    }
                    filteredData = data.filter(item =>
                        item.ownerId && (visibleUserIds.includes(item.ownerId))
                    );
                } else if (currentUserRole === 'Admin' || sharingPermissions.Access === 'Public') {
                    filteredData = data;
                } else if (sharingPermissions.Access === 'Private' && sharingPermissions.GrantAccess === false) {
                    filteredData = data.filter(item => item.ownerId === userId);
                } else {
                    console.log('error');
                }
            } else {
                filteredData = data
            }
        }
        return filteredData;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return [];
    }
};

const fetchMultipleData = async (requests) => {
    try {
        const results = await Promise.all(requests.map(({ endpoint, sharingPermissions }) =>
            fetchFilterData(endpoint, sharingPermissions)
        ));
        return results;
    } catch (error) {
        console.error('Error fetching multiple data:', error);
        throw error;
    }
};


export { fetchFilterData, fetchMultipleData };