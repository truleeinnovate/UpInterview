// v1.0.1 - Ashraf - Optimized permission fetching, added immediate cache fallback, improved error handling
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt, encodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const PermissionsContext = createContext();

const EFFECTIVE_PERMISSIONS_CACHE_KEY = 'permissions_effective';
const SUPER_ADMIN_PERMISSIONS_CACHE_KEY = 'permissions_superAdmin';

const getCachedPermissions = () => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) return null;

    const cacheKey = userType === 'effective' ? EFFECTIVE_PERMISSIONS_CACHE_KEY : SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const permissions = decodeJwt(cached);
    if (!permissions || Object.keys(permissions).length === 0) return null;

    return permissions;
  } catch (error) {
    console.warn('Error reading cached permissions:', error);
    return null;
  }
};

const cachePermissions = (permissions) => {
  try {
    const userType = AuthCookieManager.getUserType();
    if (!userType) return;

    const cacheKey = userType === 'effective' ? EFFECTIVE_PERMISSIONS_CACHE_KEY : SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
    const encodedPermissions = encodeJwt(permissions);
    if (encodedPermissions) {
      localStorage.setItem(cacheKey, encodedPermissions);
    }
  } catch (error) {
    console.warn('Error caching permissions:', error);
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
    inheritedRoleIds: [],
    isImpersonating: false,
    loading: false,
    authError: null,
    isInitialized: false,
  });

  const refreshPermissions = useCallback(async (forceRefresh = false) => {
    setPermissionState((prev) => ({ ...prev, loading: true, authError: null }));

    try {
      // Check cache first unless forcing refresh
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

      const activeToken = AuthCookieManager.getActiveToken();
      if (!activeToken) {
        throw new Error('No active token found');
      }

      const userType = AuthCookieManager.getUserType();
      const permissionsUrl = `${config.REACT_APP_API_URL}/users/permissions`;

      const response = await axios.get(permissionsUrl, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${activeToken}` },
        timeout: 10000, // Add timeout to prevent hanging
      });

      const permissionData = response.data;

      let permissionsToCache;

      if (userType === 'effective') {
        permissionsToCache = {
          effectivePermissions: permissionData.effectivePermissions || {},
          effectivePermissions_RoleType: permissionData.effectivePermissions_RoleType || null,
          effectivePermissions_RoleLevel: permissionData.effectivePermissions_RoleLevel || null,
          effectivePermissions_RoleName: permissionData.effectivePermissions_RoleName || null,
          inheritedRoleIds: permissionData.inheritedRoleIds || [],
          superAdminPermissions: null, // Clear super admin permissions
          isImpersonating: false,
          impersonatedUser_roleType: null,
          impersonatedUser_roleName: null,
        };
      } else if (userType === 'superAdmin') {
        const isImpersonating = permissionData.isImpersonating || false;
        permissionsToCache = {
          superAdminPermissions: permissionData.superAdminPermissions || {},
          isImpersonating,
          effectivePermissions: isImpersonating ? (permissionData.effectivePermissions || {}) : {},
          effectivePermissions_RoleType: isImpersonating ? permissionData.effectivePermissions_RoleType : null,
          effectivePermissions_RoleLevel: isImpersonating ? permissionData.effectivePermissions_RoleLevel : null,
          effectivePermissions_RoleName: isImpersonating ? permissionData.effectivePermissions_RoleName : null,
          inheritedRoleIds: isImpersonating ? (permissionData.inheritedRoleIds || []) : [],
          impersonatedUser_roleType: isImpersonating ? permissionData.impersonatedUser_roleType : null,
          impersonatedUser_roleName: isImpersonating ? permissionData.impersonatedUser_roleName : null,
        };
      } else {
        permissionsToCache = {
          effectivePermissions: {},
          superAdminPermissions: null,
          effectivePermissions_RoleType: null,
          effectivePermissions_RoleLevel: null,
          effectivePermissions_RoleName: null,
          inheritedRoleIds: [],
          isImpersonating: false,
          impersonatedUser_roleType: null,
          impersonatedUser_roleName: null,
        };
      }

      cachePermissions(permissionsToCache);

      setPermissionState({
        ...permissionsToCache,
        loading: false,
        authError: null,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Permission refresh error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      // Fallback to cached permissions if API fails
      const cached = getCachedPermissions();
      if (cached) {
        setPermissionState({
          ...cached,
          loading: false,
          authError: 'Using cached permissions due to API error',
          isInitialized: true,
        });
      } else {
        setPermissionState((prev) => ({
          ...prev,
          loading: false,
          authError: error.message || 'Failed to load permissions',
          isInitialized: true,
        }));
      }
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    const cached = getCachedPermissions();
    if (cached) {
      setPermissionState({
        ...cached,
        loading: false,
        authError: null,
        isInitialized: true,
      });
    } else {
      refreshPermissions();
    }
  }, [refreshPermissions]);

  // Handle token changes (e.g., login, logout, impersonation switch)
  useEffect(() => {
    const handleTokenChange = () => {
      refreshPermissions(true); // Force refresh on token change
    };

    window.addEventListener('tokenChanged', handleTokenChange);
    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, [refreshPermissions]);

  // Optimized permission checking function
  const hasPermission = useCallback(
    (objectName, permissionType = 'ViewTab') => {
      const { effectivePermissions, superAdminPermissions, isInitialized } = permissionState;

      if (!isInitialized) {
        // Fallback to cached permissions during initialization
        const cached = getCachedPermissions();
        if (cached) {
          const combined = { ...cached.effectivePermissions, ...cached.superAdminPermissions };
          if (!combined[objectName]) return false;
          if (typeof combined[objectName] === 'boolean') return combined[objectName];
          return combined[objectName][permissionType] ?? false;
        }
        return false;
      }

      const combined = { ...effectivePermissions, ...superAdminPermissions };
      if (!combined[objectName]) return false;
      if (typeof combined[objectName] === 'boolean') return combined[objectName];
      return combined[objectName][permissionType] ?? false;
    },
    [permissionState]
  );

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      ...permissionState,
      refreshPermissions,
      hasPermission,
    }),
    [permissionState, refreshPermissions, hasPermission]
  );

  return <PermissionsContext.Provider value={contextValue}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    // Return a mock implementation when used outside of provider
    return {
      effectivePermissions: {},
      superAdminPermissions: null,
      loading: false,
      isInitialized: true,
      refreshPermissions: () => Promise.resolve({}),
      hasPermission: () => true,
      switchToSuperAdmin: () => {},
      switchToEffective: () => {},
    };
  }
  return context;
};

export { getCachedPermissions };