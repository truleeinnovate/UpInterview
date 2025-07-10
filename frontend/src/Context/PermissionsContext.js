import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { config } from '../config';
import Cookies from 'js-cookie';
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

    console.log('🔍 Checking cached permissions:', { timestamp, cached: !!cached });

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
    loading: false, // Changed to false by default
    authError: null,
    isInitialized: false, // New flag to track if permissions are loaded
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
          });
          return;
        }
      }

      console.log('🌐 Fetching fresh permissions from API');
      setPermissionState((prev) => ({ ...prev, loading: true }));

      const authToken = Cookies.get('authToken');
      const impersonationToken = Cookies.get('impersonationToken');
      const tokenPayload = authToken ? decodeJwt(authToken) : null;

      console.log('🔑 Tokens:', {
        hasAuthToken: !!authToken,
        hasImpersonationToken: !!impersonationToken,
        tokenPayload
      });

      const response = await axios.get(`${config.REACT_APP_API_URL}/users/permissions`, {
        withCredentials: true,
      });

      const permissionData = response.data;
      console.log('📡 API Response:', permissionData);

      // Cache the permissions
      cachePermissions(permissionData);

      setPermissionState({
        ...permissionData,
        loading: false,
        authError: null,
        isInitialized: true,
      });

      console.log('✅ Permissions loaded and state updated');
    } catch (error) {
      console.error('❌ Permission refresh error:', error);
      setPermissionState((prev) => ({
        ...prev,
        loading: false,
        authError: error.message || 'Failed to load permissions',
        isInitialized: true,
      }));
    }
  }, []);

  // Initialize permissions on mount
  useEffect(() => {
    console.log('🚀 PermissionsProvider mounted, initializing permissions');
    refreshPermissions();
  }, [refreshPermissions]);

  // Clear cache on logout or token change
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'impersonationToken') {
        console.log('🔄 Token changed, clearing cache and refreshing permissions');
        clearPermissionsCache();
        refreshPermissions(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshPermissions]);

  // Optimized permission checking function
  const hasPermission = useCallback((objectName, permissionType = "ViewTab") => {
    const { effectivePermissions, superAdminPermissions, isInitialized } = permissionState;

    console.log('🔍 Checking permission:', { objectName, permissionType, isInitialized });
    console.log('📊 Current permissions:', { effectivePermissions, superAdminPermissions });

    if (!isInitialized) {
      console.log('❌ Permissions not initialized yet');
      return false;
    }

    // Check super admin permissions first
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

    // Check effective permissions
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

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...permissionState,
    refreshPermissions,
    hasPermission,
  }), [permissionState, refreshPermissions, hasPermission]);

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