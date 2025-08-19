// v1.0.0  -  Ashraf  -  fixed login as user then only effective permissions will have.backto super admin then reload super admin permissions
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const PermissionsContext = createContext();

// Cache management functions
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const EFFECTIVE_PERMISSIONS_CACHE_KEY = 'permissions_effective';
const SUPER_ADMIN_PERMISSIONS_CACHE_KEY = 'permissions_superAdmin';

const getCachedPermissions = () => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) {
      return null;
    }

    let cacheKey;
    if (userType === 'effective') {
      cacheKey = EFFECTIVE_PERMISSIONS_CACHE_KEY;
    } else if (userType === 'superAdmin') {
      cacheKey = SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
    } else {
      return null;
    }

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

    let cacheKey;
    if (userType === 'effective') {
      cacheKey = EFFECTIVE_PERMISSIONS_CACHE_KEY;
    } else if (userType === 'superAdmin') {
      cacheKey = SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
    } else {
      return;
    }

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
    if (userType === 'effective') {
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      // Also clear old cache key if it exists
      localStorage.removeItem('effective_permissions');
    } else if (userType === 'superAdmin') {
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      // Also clear old cache key if it exists
      localStorage.removeItem('super_admin_permissions');
    } else {
      // Clear all permission caches
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      // Also clear old cache keys
      localStorage.removeItem('effective_permissions');
      localStorage.removeItem('super_admin_permissions');
      localStorage.removeItem('permissions_effective');
      localStorage.removeItem('permissions_superAdmin');
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

      // console.log('[PermissionsContext] Fetching permissions with token:', {
      //   hasToken: !!activeToken,
      //   tokenLength: activeToken ? activeToken.length : 0,
      //   userType
      // });

      // console.log('[PermissionsContext] Making request to:', permissionsUrl);
      // console.log('[PermissionsContext] Request headers:', {
      //   'Authorization': `Bearer ${activeToken ? activeToken.substring(0, 20) + '...' : 'null'}`,
      //   'withCredentials': true
      // });

      const response = await axios.get(permissionsUrl, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });

      // console.log('[PermissionsContext] Permissions response received:', {
      //   status: response.status,
      //   hasData: !!response.data,
      //   dataKeys: response.data ? Object.keys(response.data) : []
      // });

      const permissionData = response.data;
      
      // console.log('[PermissionsContext] Permission data details:', {
      //   effectivePermissions: permissionData.effectivePermissions ? Object.keys(permissionData.effectivePermissions) : [],
      //   superAdminPermissions: permissionData.superAdminPermissions ? Object.keys(permissionData.superAdminPermissions) : [],
      //   isImpersonating: permissionData.isImpersonating,
      //   roleType: permissionData.effectivePermissions_RoleType,
      //   roleName: permissionData.effectivePermissions_RoleName
      // });

      // Separate permissions based on user type and cache appropriately
      let permissionsToCache;
      
      if (userType === 'effective') {
        // For effective users, only cache effective permissions - no super admin or impersonation data
        permissionsToCache = {
          effectivePermissions: permissionData.effectivePermissions || {},
          effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
          effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
          effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
          inheritedRoleIds: permissionData.inheritedRoleIds || [],
              // <-------------------------------v1.0.0

          superAdminPermissions: null, // <-- Always clear super admin permissions when logging in as user
          isImpersonating: false,
          impersonatedUser_roleType: null,
          impersonatedUser_roleName: null
        };
        
        // Explicitly clear super admin permissions from cache when logging in as user (impersonation)
        clearPermissionsCache('superAdmin');
 // ------------------------------v1.0.0 > 

      } else if (userType === 'superAdmin') {
        // For super admin, cache super admin permissions - no effective permissions unless impersonating
        const isImpersonating = permissionData.isImpersonating || false;
        
        permissionsToCache = {
          superAdminPermissions: permissionData.superAdminPermissions || {},
          isImpersonating: isImpersonating,
          // Only include effective permissions and impersonation data if actually impersonating
          effectivePermissions: isImpersonating ? (permissionData.effectivePermissions || {}) : {},
          effectivePermissions_RoleType: isImpersonating ? permissionData.effectivePermissions_RoleType : null,
          effectivePermissions_RoleLevel: isImpersonating ? permissionData.effectivePermissions_RoleLevel : null,
          effectivePermissions_RoleName: isImpersonating ? permissionData.effectivePermissions_RoleName : null,
          inheritedRoleIds: isImpersonating ? (permissionData.inheritedRoleIds || []) : [],
          impersonatedUser_roleType: isImpersonating ? permissionData.impersonatedUser_roleType : null,
          impersonatedUser_roleName: isImpersonating ? permissionData.impersonatedUser_roleName : null
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
            superAdminPermissions: null,
            isImpersonating: false,
            impersonatedUser_roleType: null,
            impersonatedUser_roleName: null
          };
        } else if (hasSuperAdminPermissions && !hasEffectivePermissions) {
          // Only super admin permissions available
          permissionsToCache = {
            superAdminPermissions: permissionData.superAdminPermissions,
            effectivePermissions: {},
            effectivePermissions_RoleType: null,
            effectivePermissions_RoleLevel: null,
            effectivePermissions_RoleName: null,
            inheritedRoleIds: [],
            isImpersonating: false,
            impersonatedUser_roleType: null,
            impersonatedUser_roleName: null
          };
        } else if (hasEffectivePermissions && hasSuperAdminPermissions) {
          // Both permissions available - determine if impersonating
          const isImpersonating = permissionData.isImpersonating || false;
          
          if (isImpersonating) {
            // User is impersonating, include both permission sets
            permissionsToCache = {
              effectivePermissions: permissionData.effectivePermissions,
              superAdminPermissions: permissionData.superAdminPermissions,
              effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType,
              effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel,
              effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName,
              inheritedRoleIds: permissionData.inheritedRoleIds || [],
              isImpersonating: true,
              impersonatedUser_roleType: permissionData.impersonatedUser_roleType,
              impersonatedUser_roleName: permissionData.impersonatedUser_roleName
            };
          } else {
            // Not impersonating, use super admin permissions only
            permissionsToCache = {
              superAdminPermissions: permissionData.superAdminPermissions,
              effectivePermissions: {},
              effectivePermissions_RoleType: null,
              effectivePermissions_RoleLevel: null,
              effectivePermissions_RoleName: null,
              inheritedRoleIds: [],
              isImpersonating: false,
              impersonatedUser_roleType: null,
              impersonatedUser_roleName: null
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
      // console.error('Permission refresh error:', {
      //   message: error.message,
      //   status: error.response?.status,
      //   statusText: error.response?.statusText,
      //   data: error.response?.data,
      //   config: {
      //     url: error.config?.url,
      //     method: error.config?.method,
      //     headers: error.config?.headers
      //   }
      // });
      
      setPermissionState((prev) => ({
        ...prev,
        loading: false,
        authError: error.message || 'Failed to load permissions',
      }));
    }
  }, []);

  // Initialize permissions on mount - only once
  useEffect(() => {
    // Check if permissions are already loaded from cache
    const cached = getCachedPermissions();
    if (cached) {
      setPermissionState({
        ...cached,
        loading: false,
        authError: null,
        isInitialized: true,
      });
    } else {
      // Only load if not cached
      refreshPermissions();
    }
  }, []); // Remove refreshPermissions from dependency to prevent reloads

  // Optimized permission checking function
  const hasPermission = useCallback((objectName, permissionType = "ViewTab") => {
    const { effectivePermissions, superAdminPermissions, isInitialized, isImpersonating } = permissionState;

    // If we have any permissions data available, use it immediately
    const hasEffectiveData = effectivePermissions && Object.keys(effectivePermissions).length > 0;
    const hasSuperAdminData = superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
    
    if (hasEffectiveData || hasSuperAdminData) {
      // Use available permissions even if not fully initialized
      if (superAdminPermissions && superAdminPermissions[objectName]) {
        if (typeof superAdminPermissions[objectName] === "boolean") {
          return superAdminPermissions[objectName];
        }
        return superAdminPermissions[objectName][permissionType] ?? false;
      }

      if (effectivePermissions && effectivePermissions[objectName]) {
        if (typeof effectivePermissions[objectName] === "boolean") {
          return effectivePermissions[objectName];
        }
        return effectivePermissions[objectName][permissionType] ?? false;
      }
    }
    
    // Only return false if we have no permissions data at all
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