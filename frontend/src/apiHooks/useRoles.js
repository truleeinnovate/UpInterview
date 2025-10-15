import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { sortPermissions } from '../utils/RoleUtils';

export const useRolesQuery = ({ filters = {}, fetchAllRoles = false } = {}) => {
  const userType = AuthCookieManager.getUserType();
  const authToken = AuthCookieManager.getAuthToken();
  const tenantId = authToken ? JSON.parse(atob(authToken.split('.')[1])).tenantId : null;

  return useQuery({
    queryKey: ['roles', userType, tenantId, filters, fetchAllRoles],
    queryFn: async () => {
      // Fetch all roles
      const response = await axios.get(`${config.REACT_APP_API_URL}/getAllRoles`);
      let allRoles = response.data;

      // Apply userType-based filtering
      let filteredRoles;
      if (userType === 'superAdmin') {
        // Super admins get all roles with sorted permissions
        filteredRoles = allRoles.map((role) => ({
          ...role,
          level: role.level ?? 0,
          objects: role.objects.map((obj) => ({
            ...obj,
            permissions: sortPermissions(obj.permissions),
          })),
        }));
      } else {
        // Non-super admins get organization roles with overrides
        filteredRoles = await Promise.all(
          allRoles
            .filter((role) => role.roleType === 'organization')
            .map(async (role) => {
              try {
                const overrideResponse = await axios.get(
                  `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${role.roleName}`,
                  { validateStatus: (status) => status < 500 } // Handle 404 gracefully
                );
                const override = overrideResponse.data;

                if (override && overrideResponse.status !== 404) {
                  const overrideObjectsMap = new Map(
                    override.objects?.map((obj) => [obj.objectName, obj.permissions]) || []
                  );
                  const roleObjectsMap = new Map(
                    role.objects.map((obj) => [obj.objectName, obj.permissions])
                  );

                  const mergedObjects = Array.from(
                    new Map([...roleObjectsMap, ...overrideObjectsMap]).entries()
                  ).map(([objectName, permissions]) => ({
                    objectName,
                    permissions: sortPermissions(permissions),
                    visibility: role.objects.find((o) => o.objectName === objectName)?.visibility || 'view_all',
                    type: role.roleType,
                  }));

                  return {
                    ...role,
                    level: override.level ?? role.level ?? 0,
                    objects: mergedObjects,
                    inherits: override.inherits || role.inherits || [],
                  };
                }
                return {
                  ...role,
                  level: role.level ?? 0,
                  objects: role.objects.map((obj) => ({
                    ...obj,
                    permissions: sortPermissions(obj.permissions),
                  })),
                };
              } catch (error) {
                console.error(`Error fetching override for role ${role.roleName}:`, error);
                return {
                  ...role,
                  level: role.level ?? 0,
                  objects: role.objects.map((obj) => ({
                    ...obj,
                    permissions: sortPermissions(obj.permissions),
                  })),
                };
              }
            })
        );
      }

      // Apply additional client-side filters if provided
      if (filters && Object.keys(filters).length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          Object.entries(filters).every(([key, value]) => role[key] === value)
        );
      }

      return filteredRoles;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    enabled: !!userType && !!tenantId, // Only run if userType and tenantId are available
    refetchOnWindowFocus: false, // Prevent refetch on focus
    refetchOnMount: false, // Prevent refetch on mount if cached
    refetchOnReconnect: false, // Prevent refetch on reconnect
     refetchInterval: 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
  });
};


// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const userType = AuthCookieManager.getUserType();

  return useMutation({
    mutationFn: async (roleData) => {
      if (userType === 'superAdmin') {
        const response = await axios.post(`${config.REACT_APP_API_URL}/roles`, roleData);
        return response.data;
      } else {
        const response = await axios.post(`${config.REACT_APP_API_URL}/role-overrides`, roleData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    },
  });
};


// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const userType = AuthCookieManager.getUserType();

  return useMutation({
    mutationFn: async ({ roleId, roleData }) => {
      if (userType === 'superAdmin') {
        const response = await axios.patch(`${config.REACT_APP_API_URL}/roles/${roleId}`, roleData);
        return response.data;
      } else {
        const authToken = AuthCookieManager.getAuthToken();
        const tenantId = authToken ? JSON.parse(atob(authToken.split('.')[1])).tenantId : null;
        
        // First check if override exists
        const overrideResponse = await axios.get(
          `${config.REACT_APP_API_URL}/role-overrides?tenantId=${tenantId}&roleName=${roleData.roleName}`
        );
        const existingOverride = overrideResponse.data;

        if (existingOverride) {
          const response = await axios.patch(
            `${config.REACT_APP_API_URL}/role-overrides/${existingOverride._id}`,
            roleData
          );
          return response.data;
        } else {
          const response = await axios.post(`${config.REACT_APP_API_URL}/role-overrides`, roleData);
          return response.data;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
    },
  });
};