import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const PermissionsContext = createContext();

// Cache keys - separate for effective and super admin
const EFFECTIVE_PERMISSIONS_CACHE_KEY = 'effective_permissions_cache';
const EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP = 'effective_permissions_timestamp';
const SUPER_ADMIN_PERMISSIONS_CACHE_KEY = 'super_admin_permissions_cache';
const SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP = 'super_admin_permissions_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached permissions based on user type
const getCachedPermissions = () => {
  try {
    const userType = AuthCookieManager.getUserType();
    let cacheKey, timestampKey;
    
    if (userType === 'effective') {
      cacheKey = EFFECTIVE_PERMISSIONS_CACHE_KEY;
      timestampKey = EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP;
    } else if (userType === 'superAdmin') {
      cacheKey = SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
      timestampKey = SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP;
    } else {
      console.log('❌ No valid user type for permissions cache');
      return null;
    }

    const timestamp = localStorage.getItem(timestampKey);
    const cached = localStorage.getItem(cacheKey);

    if (timestamp && cached) {
      const age = Date.now() - parseInt(timestamp);
      console.log(`⏰ ${userType} cache age:`, age, 'ms (max:', CACHE_DURATION, 'ms)');
      if (age < CACHE_DURATION) {
        const parsedCache = JSON.parse(cached);
        console.log(`✅ Using cached ${userType} permissions:`, parsedCache);
        return parsedCache;
      } else {
        console.log(`⏰ ${userType} cache expired, will fetch fresh permissions`);
      }
    } else {
      console.log(`❌ No cached ${userType} permissions found`);
    }
  } catch (error) {
    console.warn('⚠️ Error reading cached permissions:', error);
  }
  return null;
};

// Helper function to cache permissions based on user type
const cachePermissions = (permissions) => {
  try {
    const userType = AuthCookieManager.getUserType();
    let cacheKey, timestampKey;
    
    if (userType === 'effective') {
      cacheKey = EFFECTIVE_PERMISSIONS_CACHE_KEY;
      timestampKey = EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP;
    } else if (userType === 'superAdmin') {
      cacheKey = SUPER_ADMIN_PERMISSIONS_CACHE_KEY;
      timestampKey = SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP;
    } else {
      console.log('❌ No valid user type for caching permissions');
      return;
    }

    console.log(`💾 Caching ${userType} permissions:`, permissions);
    localStorage.setItem(cacheKey, JSON.stringify(permissions));
    localStorage.setItem(timestampKey, Date.now().toString());
    console.log(`✅ ${userType} permissions cached successfully`);
  } catch (error) {
    console.warn('⚠️ Error caching permissions:', error);
  }
};

// Helper function to clear cache for specific user type
const clearPermissionsCache = (userType = null) => {
  try {
    if (userType === 'effective') {
      console.log('🗑️ Clearing effective permissions cache');
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
    } else if (userType === 'superAdmin') {
      console.log('🗑️ Clearing super admin permissions cache');
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
    } else {
      // Clear all permission caches
      console.log('🗑️ Clearing all permissions cache');
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
    }
  } catch (error) {
    console.warn('⚠️ Error clearing permissions cache:', error);
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
    // authStatus: null, // New field to track authentication status
  });

  console.log('🔄 PermissionsProvider state:', permissionState);

  const refreshPermissions = useCallback(async (forceRefresh = false) => {
    console.log('🔄 refreshPermissions called, forceRefresh:', forceRefresh);

    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedPermissions();
        if (cached) {
          console.log('✅ Using cached permissions, setting state');
          setPermissionState({
            ...cached,
            loading: false,
            authError: null,
            isInitialized: true,
            // authStatus: AuthCookieManager.getAuthStatus(),
          });
          return;
        }
      }

      console.log('🌐 Fetching fresh permissions from API');
      setPermissionState((prev) => ({ ...prev, loading: true }));


      // Get authentication status
      // const authStatus = AuthCookieManager.getAuthStatus();
      // console.log('🔑 Current auth status:', authStatus);

      // Check if we have any valid authentication
      // if (!authStatus.isAuthenticated) {
      //   console.log('❌ No authentication found, returning empty permissions');
      //   setPermissionState({
      //     effectivePermissions: {},
      //     superAdminPermissions: null,
      //     inheritedRoleIds: [],
      //     isImpersonating: false,
      //     effectivePermissions_RoleType: null,
      //     effectivePermissions_RoleLevel: null,
      //     effectivePermissions_RoleName: null,
      //     impersonatedUser_roleType: null,
      //     impersonatedUser_roleName: null,
      //     loading: false,
      //     authError: 'No authentication found',
      //     isInitialized: true,
      //     // authStatus,
      //   });
      //   return;
      // }

      // Get the active token for API calls
      const activeToken = AuthCookieManager.getActiveToken();
      const tokenPayload = activeToken ? decodeJwt(activeToken) : null;

      console.log('🔑 Active token for permissions API:', {
        hasActiveToken: !!activeToken,
        tokenPayload,
        userType: AuthCookieManager.getUserType()
      });

      const permissionsUrl = `${config.REACT_APP_API_URL}/users/permissions`;
      console.log('📡 Making permissions API call to:', permissionsUrl);

      const response = await axios.get(permissionsUrl, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });

      const permissionData = response.data;
      console.log('📡 Permissions API Response:', permissionData);

      // Separate permissions based on user type and cache appropriately
      const userType = AuthCookieManager.getUserType();
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
          superAdminPermissions: null // Remove super admin permissions completely
        };
      } else if (userType === 'superAdmin') {
        // For super admin, cache super admin permissions and keep effective permissions for fallback
        permissionsToCache = {
          effectivePermissions: permissionData.effectivePermissions || {}, // Keep for fallback
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
            effectivePermissions: {}, // Empty object instead of null
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
              effectivePermissions: permissionData.effectivePermissions || {}, // Keep for fallback
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

      console.log(`💾 Caching ${userType} permissions:`, permissionsToCache);

      // Cache the separated permissions
      cachePermissions(permissionsToCache);

      setPermissionState({
        ...permissionsToCache,
        loading: false,
        authError: null,
        isInitialized: true,
        // authStatus,
      });

      console.log('✅ Permissions loaded and state updated');
    } catch (error) {
      console.error('❌ Permission refresh error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // For super admin users, provide fallback permissions on error
      const userType = AuthCookieManager.getUserType();
      if (userType === 'superAdmin') {
        console.log('🔄 Setting fallback permissions for super admin due to error');
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
    console.log('🚀 PermissionsProvider mounted, initializing permissions');
    refreshPermissions();
  }, [refreshPermissions]);

  // Listen for authentication changes
  // useEffect(() => {
  //   const handleStorageChange = (e) => {
  //     if (e.key === 'authToken' || e.key === 'impersonationToken') {
  //       console.log('🔄 Authentication changed, clearing cache and refreshing permissions');
  //       clearPermissionsCache();
  //       refreshPermissions(true);
  //     }
  //   };

  //   const handleCookieChange = () => {
  //     console.log('🔄 Cookie changed, refreshing permissions');
  //     clearPermissionsCache();
  //     refreshPermissions(true);
  //   };

  //   // Listen for storage events (localStorage changes)
  //   window.addEventListener('storage', handleStorageChange);

  //   // Listen for cookie changes (we'll use a custom event)
  //   window.addEventListener('authChange', handleCookieChange);

  //   return () => {
  //     window.removeEventListener('storage', handleStorageChange);
  //     window.removeEventListener('authChange', handleCookieChange);
  //   };
  // }, [refreshPermissions]);

  // Optimized permission checking function
  const hasPermission = useCallback((objectName, permissionType = "ViewTab") => {
    const { effectivePermissions, superAdminPermissions, isInitialized, isImpersonating } = permissionState;

    console.log('🔍 Checking permission:', { objectName, permissionType, isInitialized, isImpersonating });
    console.log('📊 Current permissions:', { effectivePermissions, superAdminPermissions });

    if (!isInitialized) {
      console.log('❌ Permissions not initialized yet, returning false');
      return false;
    }

    // Check super admin permissions first (if user is super admin)
    if (superAdminPermissions && superAdminPermissions[objectName]) {
      if (typeof superAdminPermissions[objectName] === "boolean") {
        const result = superAdminPermissions[objectName];
        console.log('✅ Super admin permission found:', { objectName, result });
        return result;
      }
      const result = superAdminPermissions[objectName][permissionType] ?? false;
      console.log('✅ Super admin permission found:', { objectName, permissionType, result });
      return result;
    }

    // Check effective permissions (for effective users or when impersonating)
    if (effectivePermissions && effectivePermissions[objectName]) {
      if (typeof effectivePermissions[objectName] === "boolean") {
        const result = effectivePermissions[objectName];
        console.log('✅ Effective permission found:', { objectName, result });
        return result;
      }
      const result = effectivePermissions[objectName][permissionType] ?? false;
      console.log('✅ Effective permission found:', { objectName, permissionType, result });
      return result;
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
          console.log('🔄 Using fallback permission for super admin:', { objectName, fallback });
          return fallback;
        }
        const result = fallback[permissionType] ?? false;
        console.log('🔄 Using fallback permission for super admin:', { objectName, permissionType, result });
        return result;
      }
    }

    console.log('❌ No permission found for:', { objectName, permissionType });
    return false;
  }, [permissionState]);

  // const logout = useCallback(() => {
  //   AuthCookieManager.logout();
  //   clearPermissionsCache();
  //   setPermissionState({
  //     effectivePermissions: {},
  //     superAdminPermissions: null,
  //     inheritedRoleIds: [],
  //     isImpersonating: false,
  //     effectivePermissions_RoleType: null,
  //     effectivePermissions_RoleLevel: null,
  //     effectivePermissions_RoleName: null,
  //     impersonatedUser_roleType: null,
  //     impersonatedUser_roleName: null,
  //     loading: false,
  //     authError: null,
  //   });
  // }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...permissionState,
    refreshPermissions,
    hasPermission,
    // getAuthStatus,
    // loginAsSuperAdmin,
    // loginAsEffectiveUser,
    // impersonateUser,
    // logoutFromImpersonation,
    // logout,
  }), [
    permissionState,
    refreshPermissions,
    hasPermission,
    // getAuthStatus,
    // loginAsSuperAdmin,
    // loginAsEffectiveUser,
    // impersonateUser,
    // logoutFromImpersonation,
    // logout
  ]);

  console.log('🎯 Context value:', contextValue);

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