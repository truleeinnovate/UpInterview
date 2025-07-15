import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const PermissionsContext = createContext();

// Cache management functions
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedPermissions = () => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) {
      return null;
    }

    const cacheKey = `permissions_${userType}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return null;
    }

    const { permissions, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return permissions;
  } catch (error) {
    console.warn('Error reading cached permissions:', error);
    return null;
  }
};

const cachePermissions = (permissions) => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) {
      return;
    }

    const cacheKey = `permissions_${userType}`;
    const cacheData = {
      permissions,
      timestamp: Date.now()
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error caching permissions:', error);
  }
};

const clearPermissionsCache = (userType = null) => {
  try {
    if (userType) {
      localStorage.removeItem(`permissions_${userType}`);
    } else {
      // Clear all permission caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('permissions_')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn('Error clearing permissions cache:', error);
  }
};

export const PermissionsProvider = ({ children }) => {
  const [permissionState, setPermissionState] = useState({
    effectivePermissions: {},
    superAdminPermissions: null,
    effectivePermissions_RoleType: null,
    effectivePermissions_RoleLevel: null,
    effectivePermissions_RoleName: null,
    impersonatedUser_roleType: null,
    impersonatedUser_roleName: null,
    loading: false,
    authError: null,
    isInitialized: false,
  });

  const refreshPermissions = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedPermissions();
        if (cached) {
          setPermissionState({
            ...cached,
            loading: false,
            authError: null,
            isInitialized: true,
          });
          return;
        }
      }

      setPermissionState((prev) => ({ ...prev, loading: true }));

      // Get the active token for API calls
      const activeToken = AuthCookieManager.getActiveToken();
      if (!activeToken) {
        throw new Error('No active token found');
      }

      const userType = AuthCookieManager.getUserType();
      const permissionsUrl = `${config.REACT_APP_API_URL}/users/permissions`;

      const response = await axios.get(permissionsUrl, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });

      const permissionData = response.data;

      // Separate permissions based on user type and cache appropriately
      let permissionsToCache;
      
      if (userType === 'effective') {
        // For effective users, only cache effective permissions
        permissionsToCache = {
          effectivePermissions: permissionData.effectivePermissions || {},
          effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
          effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
          effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
          inheritedRoleIds: permissionData.inheritedRoleIds || [],
          isImpersonating: permissionData.isImpersonating || false,
          impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
          impersonatedUser_roleName: permissionData.impersonatedUser_roleName,
          superAdminPermissions: null
        };
      } else if (userType === 'superAdmin') {
        // For super admin, cache super admin permissions and keep effective permissions for fallback
        permissionsToCache = {
          effectivePermissions: permissionData.effectivePermissions || {},
          superAdminPermissions: permissionData.superAdminPermissions || {},
          effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
          effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
          effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
          inheritedRoleIds: permissionData.inheritedRoleIds || [],
          isImpersonating: permissionData.isImpersonating || false,
          impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
          impersonatedUser_roleName: permissionData.impersonatedUser_roleName
        };
      } else {
        // Fallback - check what permissions are available and use accordingly
        const hasEffectivePermissions = permissionData.effectivePermissions && Object.keys(permissionData.effectivePermissions).length > 0;
        const hasSuperAdminPermissions = permissionData.superAdminPermissions && Object.keys(permissionData.superAdminPermissions).length > 0;
        
        if (hasEffectivePermissions && !hasSuperAdminPermissions) {
          // Only effective permissions available
          permissionsToCache = {
            effectivePermissions: permissionData.effectivePermissions,
            effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
            effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
            effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
            inheritedRoleIds: permissionData.inheritedRoleIds || [],
            isImpersonating: permissionData.isImpersonating || false,
            impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
            impersonatedUser_roleName: permissionData.impersonatedUser_roleName,
            superAdminPermissions: null
          };
        } else if (hasSuperAdminPermissions && !hasEffectivePermissions) {
          // Only super admin permissions available
          permissionsToCache = {
            effectivePermissions: {},
            superAdminPermissions: permissionData.superAdminPermissions,
            effectivePermissions_RoleType: null,
            effectivePermissions_RoleLevel: null,
            effectivePermissions_RoleName: null,
            inheritedRoleIds: permissionData.inheritedRoleIds || [],
            isImpersonating: permissionData.isImpersonating || false,
            impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
            impersonatedUser_roleName: permissionData.impersonatedUser_roleName
          };
        } else if (hasEffectivePermissions && hasSuperAdminPermissions) {
          // Both permissions available - use based on user type
          if (userType === 'effective') {
            permissionsToCache = {
              effectivePermissions: permissionData.effectivePermissions,
              effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
              effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
              effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
              inheritedRoleIds: permissionData.inheritedRoleIds || [],
              isImpersonating: permissionData.isImpersonating || false,
              impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
              impersonatedUser_roleName: permissionData.impersonatedUser_roleName,
              superAdminPermissions: null
            };
          } else {
            permissionsToCache = {
              effectivePermissions: permissionData.effectivePermissions || {},
              superAdminPermissions: permissionData.superAdminPermissions,
              effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
              effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
              effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
              inheritedRoleIds: permissionData.inheritedRoleIds || [],
              isImpersonating: permissionData.isImpersonating || false,
              impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
              impersonatedUser_roleName: permissionData.impersonatedUser_roleName
            };
          }
        } else {
          // No permissions available
          permissionsToCache = {
            effectivePermissions: {},
            superAdminPermissions: {},
            effectivePermissions_RoleType: null,
            effectivePermissions_RoleLevel: null,
            effectivePermissions_RoleName: null,
            inheritedRoleIds: [],
            isImpersonating: false,
            impersonatedUser_roleType: null,
            impersonatedUser_roleName: null
          };
        }
      }

      // Cache the separated permissions
      cachePermissions(permissionsToCache);

      setPermissionState({
        ...permissionsToCache,
        loading: false,
        authError: null,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Permission refresh error:', error);
      
      // For super admin users, provide fallback permissions on error
      const userType = AuthCookieManager.getUserType();
      if (userType === 'superAdmin') {
        const fallbackPermissions = {
          effectivePermissions: {},
          superAdminPermissions: {
            Tenants: { ViewTab: true, View: true, Create: true, Edit: true },
            InterviewRequest: { ViewTab: true, View: true },
            OutsourceInterviewerRequest: { ViewTab: true, View: true },
            SupportDesk: { ViewTab: true, View: true },
            Billing: { ViewTab: true, View: true },
            InternalLogs: { ViewTab: true, View: true },
            IntegrationLogs: { ViewTab: true, View: true },
            MyProfile: { ViewTab: true, View: true },
            Roles: { ViewTab: true, View: true },
            Users: { ViewTab: true, View: true }
          },
          effectivePermissions_RoleType: null,
          effectivePermissions_RoleLevel: null,
          effectivePermissions_RoleName: null,
          inheritedRoleIds: [],
          isImpersonating: false,
          impersonatedUser_roleType: null,
          impersonatedUser_roleName: null
        };

        setPermissionState({
          ...fallbackPermissions,
          loading: false,
          authError: error.message || 'Failed to load permissions',
          isInitialized: true,
        });
      } else {
        setPermissionState((prev) => ({
          ...prev,
          loading: false,
          authError: error.message || 'Failed to load permissions',
        }));
      }
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Optimized permission checking function
  const hasPermission = useCallback((objectName, permissionType = "ViewTab") => {
    const { effectivePermissions, superAdminPermissions, isInitialized, isImpersonating } = permissionState;

    if (!isInitialized) {
      return false;
    }

    // Check super admin permissions first (if user is super admin)
    if (superAdminPermissions && superAdminPermissions[objectName]) {
      if (typeof superAdminPermissions[objectName] === "boolean") {
        return superAdminPermissions[objectName];
      }
      return superAdminPermissions[objectName][permissionType] ?? false;
    }

    // Check effective permissions (for effective users or when impersonating)
    if (effectivePermissions && effectivePermissions[objectName]) {
      if (typeof effectivePermissions[objectName] === "boolean") {
        return effectivePermissions[objectName];
      }
      return effectivePermissions[objectName][permissionType] ?? false;
    }

    // For super admin users, provide fallback permissions for common objects
    const userType = AuthCookieManager.getUserType();
    if (userType === 'superAdmin') {
      const fallbackPermissions = {
        'Tenants': { ViewTab: true, View: true, Create: true, Edit: true },
        'InterviewRequest': { ViewTab: true, View: true },
        'OutsourceInterviewerRequest': { ViewTab: true, View: true },
        'SupportDesk': { ViewTab: true, View: true },
        'Billing': { ViewTab: true, View: true },
        'InternalLogs': { ViewTab: true, View: true },
        'IntegrationLogs': { ViewTab: true, View: true },
        'MyProfile': { ViewTab: true, View: true },
        'Roles': { ViewTab: true, View: true },
        'Users': { ViewTab: true, View: true }
      };
      
      if (fallbackPermissions[objectName]) {
        const fallback = fallbackPermissions[objectName];
        if (typeof fallback === "boolean") {
          return fallback;
        }
        return fallback[permissionType] ?? false;
      }
    }

    return false;
  }, [permissionState]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...permissionState,
    refreshPermissions,
    hasPermission,
  }), [
    permissionState,
    refreshPermissions,
    hasPermission,
  ]);

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};