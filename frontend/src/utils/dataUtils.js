import axios from 'axios';
import Cookies from 'js-cookie';


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
            const sharingRulesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/sharing-rules`, {
                params: {
                    orgId: organizationId,
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
        const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/getUsersByRoleId`, {
            params: {
                organizationId: organizationId,
                roleId: Array.from(recordsOwnedByRoleIds)
            }
        });
        const users = usersResponse.data;

        // console.log("Users:", users.length);
        if (users !== undefined && users.length > 0) {
            users.forEach(user => {
                // console.log("User ID:", user._id);
                sharingRuleUserIds.add(user._id.toString());
            });
        }
    }
    // console.log("sharingRuleUserIds", sharingRuleUserIds)
    return sharingRuleUserIds;
};


const fetchFilterData = async (endpoint, sharingPermissions) => {
    // console.log("sharingPermissions", sharingPermissions)
    const userId = Cookies.get('userId');
    const organizationId = Cookies.get('organizationId');
    // console.log("Organizationid", organizationId)
    const organization = Cookies.get('organization');
    // console.log("organization", organization)
    if (!endpoint || !userId) {
        // console.error("Missing required parameters: endpoint, userId, or organizationId");
        return [];
    }
    let filteredData = [];
    try {
       
            // Fetch current user's role
            const currentUserResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/${userId}`);
            let currentUserRoleId;
            if (currentUserResponse.data) {
                const currentUser = currentUserResponse.data;
                currentUserRoleId = currentUser.RoleId;
            }
            // console.log("currentUserRoleId", currentUserRoleId)
            // const sharingRuleUserIds = await getSharingRulesUserIds(currentUserRoleId, sharingPermissions, userId, organizationId);
            // console.log("sharingRuleUserIds", sharingRuleUserIds)

            // Fetch role details if needed
            let currentUserRole;
            if (currentUserRoleId) {
                const roleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/rolesdata/${currentUserRoleId}`);
                currentUserRole = roleResponse.data.roleName;
                // console.log("currentUserRole", currentUserRole)
            }
            if (organizationId) {
                const queryParam = organization === 'true' ? `orgId=${organizationId}` : `OwnerId=${userId}`;
                const url = `${process.env.REACT_APP_API_URL}/api/${endpoint}?${queryParam}`;
                // console.log("url", url)
            }

            // const response = await axios.get(url);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/${endpoint}`, {
                params: { orgId: organizationId }
            });
            if (response.data) {
                const data = response.data;
                // console.log("Fetched data from server:", data);

                if (organization === 'true') {
                    // console.log("Sharing Permissions:", sharingPermissions);
                    // console.log("Data before filtering:", data);


                    if (sharingPermissions.Access === 'Private' && sharingPermissions.GrantAccess === true && currentUserRole !== 'Admin') {
                        const sharingRuleUserIds = await getSharingRulesUserIds(currentUserRoleId, sharingPermissions, userId, organizationId);
                        // console.log("sharingRuleUserIds", sharingRuleUserIds)
                        // console.log("sharingRuleUserIds11:", JSON.stringify(sharingRuleUserIds));
                        const visibleUserIds = [userId];
                        // console.log("sharingRuleUserIds22:", JSON.stringify(sharingRuleUserIds));
                        const allRolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/rolesdata?organizationId=${organizationId}`);
                        const allRoles = allRolesResponse.data;

                        const visibleRoles = await getAllSubordinateRoles(currentUserRoleId, allRoles);

                        const visibleUsersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users?organizationId=${organizationId}`);
                        const visibleUsers = visibleUsersResponse.data.filter(user =>
                            visibleRoles.includes(user.RoleId)
                        );

                        visibleUserIds.push(...visibleUsers.map(user => user._id));

                        // console.log("Sharing Rule User IDs:", JSON.stringify(sharingRuleUserIds));
                        if (sharingRuleUserIds !== undefined && sharingRuleUserIds.size > 0) {
                            sharingRuleUserIds.forEach(uid => {
                                console.log("User ID:", uid);
                                if (!visibleUserIds.includes(uid.toString())) {
                                    visibleUserIds.push(uid.toString());
                                }
                            });
                        }
                        // Filter data based on visible user IDs and current user ID
                        filteredData = data.filter(item =>
                            item.OwnerId && (visibleUserIds.includes(item.OwnerId))
                        );
                        // console.log("FilteredData0", JSON.stringify(filteredData));
                    } else if (currentUserRole === 'Admin' || sharingPermissions.Access === 'Public') {
                        filteredData = data;
                        // console.log("FilteredData1", filteredData);
                    } else if (sharingPermissions.Access === 'Private' && sharingPermissions.GrantAccess === false) {
                        filteredData = data.filter(item => item.OwnerId === userId);
                        // console.log("FilteredData3", filteredData);
                    } else {
                        // console.log('error');
                    }
                } else {
                    filteredData = data
                    // console.log("FilteredData4", filteredData);
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
const BASE_WS_URL = "ws://localhost:8080";
const webSocketHandler = (url, onMessage, onOpen, onClose) => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
        if (onOpen) onOpen();
    };

    ws.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (onMessage) onMessage(type, data);
    };

    ws.onclose = () => {
        if (onClose) onClose();
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return ws;
};

const handleWebSocket = (formType, setSkillsData, setNotification) => {
    const handleWebSocketMessage = (type, data) => {
        if (type === formType) {
            setSkillsData(data);
            setNotification(`A new ${formType} has been successfully created!`);

            setTimeout(() => {
                setNotification("");
            }, 3000);
        }
    };

    const ws = webSocketHandler(
        BASE_WS_URL,
        handleWebSocketMessage,
        null,
        null
    );

    return ws;
};

export { fetchFilterData, fetchMultipleData, handleWebSocket };
