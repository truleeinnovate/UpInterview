import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const PermissionsContext = createContext();

// Cache keys
const PERMISSIONS_CACHE_KEY = 'app_permissions_cache';
const PERMISSIONS_CACHE_TIMESTAMP = 'app_permissions_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached permissions
const getCachedPermissions = () => {
  try {
    const timestamp = localStorage.getItem(PERMISSIONS_CACHE_TIMESTAMP);
    const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);

    if (timestamp && cached) {
      const age = Date.now() - parseInt(timestamp);
      console.log('⏰ Cache age:', age, 'ms (max:', CACHE_DURATION, 'ms)');
      if (age < CACHE_DURATION) {
        const parsedCache = JSON.parse(cached);
        console.log('✅ Using cached permissions:', parsedCache);
        return parsedCache;
      } else {
        console.log('⏰ Cache expired, will fetch fresh permissions');
      }
    } else {
      console.log('❌ No cached permissions found');
    }
  } catch (error) {
    console.warn('⚠️ Error reading cached permissions:', error);
  }
  return null;
};

// Helper function to cache permissions
const cachePermissions = (permissions) => {
  try {
    console.log('💾 Caching permissions:', permissions);
    localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(permissions));
    localStorage.setItem(PERMISSIONS_CACHE_TIMESTAMP, Date.now().toString());
    console.log('✅ Permissions cached successfully');
  } catch (error) {
    console.warn('⚠️ Error caching permissions:', error);
  }
};

// Helper function to clear cache
const clearPermissionsCache = () => {
  try {
    console.log('🗑️ Clearing permissions cache');
    localStorage.removeItem(PERMISSIONS_CACHE_KEY);
    localStorage.removeItem(PERMISSIONS_CACHE_TIMESTAMP);
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
      // const activeToken = AuthCookieManager.getActiveToken();
      const activeToken = AuthCookieManager.getAuthToken();
      const tokenPayload = activeToken ? decodeJwt(activeToken) : null;

      console.log('🔑 Active token for permissions API:', {
        hasActiveToken: !!activeToken,
        tokenPayload,
        // authStatus

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

      // Cache the permissions
      cachePermissions(permissionData);

      setPermissionState({
        ...permissionData,
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

      setPermissionState((prev) => ({
        ...prev,
        loading: false,
        authError: error.message || 'Failed to load permissions',
      }));
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    console.log('🚀 PermissionsProvider mounted, initializing permissions');
    refreshPermissions();
  }, [refreshPermissions]);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'impersonationToken') {
        console.log('🔄 Authentication changed, clearing cache and refreshing permissions');
        clearPermissionsCache();
        refreshPermissions(true);
      }
    };

    const handleCookieChange = () => {
      console.log('🔄 Cookie changed, refreshing permissions');
      clearPermissionsCache();
      refreshPermissions(true);
    };

    // Listen for storage events (localStorage changes)
    window.addEventListener('storage', handleStorageChange);

    // Listen for cookie changes (we'll use a custom event)
    window.addEventListener('authChange', handleCookieChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleCookieChange);
    };
  }, [refreshPermissions]);

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

    console.log('❌ No permission found for:', { objectName, permissionType });
    return false;
  }, [permissionState]);

  const logout = useCallback(() => {
    AuthCookieManager.logout();
    clearPermissionsCache();
    setPermissionState({
      effectivePermissions: {},
      superAdminPermissions: null,
      inheritedRoleIds: [],
      isImpersonating: false,
      effectivePermissions_RoleType: null,
      effectivePermissions_RoleLevel: null,
      effectivePermissions_RoleName: null,
      impersonatedUser_roleType: null,
      impersonatedUser_roleName: null,
      loading: false,
      authError: null,
    });
  }, []);

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
    logout,
  }), [
    permissionState,
    refreshPermissions,
    hasPermission,
    // getAuthStatus,
    // loginAsSuperAdmin,
    // loginAsEffectiveUser,
    // impersonateUser,
    // logoutFromImpersonation,
    logout
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