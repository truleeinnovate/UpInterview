// v1.0.0  -  Ashraf  -  effectivePermissions_RoleName added to smartLogout,when individual logout navigate to there linked page
// v1.0.1  -  Ashraf  -  login as user issue
// v1.0.2  -  Ashraf  -  using authcookie manager to get current tokein,cookies works in all browsers correctly,creaing cookies or expiry cookies correctly
// v1.0.3  -  Ashraf  -  in local cookies expiring issue colved
// v1.0.4  -  Venkatesh  -  Added getCurrentTenantId method to extract tenantId from JWT token for wallet operations

import Cookies from 'js-cookie';
// <---------------------- v1.0.2
import { jwtDecode } from 'jwt-decode';
import { decodeJwt } from './jwtDecode';
import { config } from '../../config';
// ---------------------- v1.0.2 >

// Token keys
const AUTH_TOKEN_KEY = 'authToken';
const IMPERSONATION_TOKEN_KEY = 'impersonationToken';
const USER_TYPE_KEY = 'userType'; // 'superAdmin' or 'effectiveUser'
// const IMPERSONATED_USER_KEY = 'impersonatedUser';

// Permission cache keys - separate for effective and super admin
// const EFFECTIVE_PERMISSIONS_CACHE_KEY = 'effective_permissions_cache';
// const EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP = 'effective_permissions_timestamp';
// const SUPER_ADMIN_PERMISSIONS_CACHE_KEY = 'super_admin_permissions_cache';
// const SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP = 'super_admin_permissions_timestamp';

class AuthCookieManager {
  // Get auth token (effective user token)
  // FIXED - Don't clear tokens in getter methods!
  static getAuthToken() {
    try {
      const token = Cookies.get(AUTH_TOKEN_KEY);

      // JUST return the token - don't validate expiration here!
      // Expiration validation should happen separately
      return token;
    } catch (error) {
      console.warn('Error getting auth token:', error);
      return null;
    }
  }

  static getImpersonationToken() {
    try {
      const token = Cookies.get(IMPERSONATION_TOKEN_KEY);

      // JUST return the token - don't validate expiration here!
      return token;
    } catch (error) {
      console.warn('Error getting impersonation token:', error);
      return null;
    }
  }
  // ---------------------- v1.0.2 >
  // Set auth token
  static setAuthToken(token) {
    try {
      const currentDomain = window.location.hostname;
      const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');

      const cookieOptions = {
        expires: 7, // 7 days
        secure: !isLocalhost, // Only secure in production
        sameSite: isLocalhost ? 'Lax' : 'None', // Use Lax for localhost, None for production
        path: '/',
      };

      // Only set domain for production and when not localhost
      if (!isLocalhost && currentDomain.includes('upinterview.io')) {
        cookieOptions.domain = '.upinterview.io';
      }

      Cookies.set(AUTH_TOKEN_KEY, token, cookieOptions);

    } catch (error) {
      console.error('❌ Error setting auth token:', error);
    }
  }
  // ---------------------- v1.0.2 >
  // Set impersonation token
  static setImpersonationToken(token, userData = null) {
    try {
      const currentDomain = window.location.hostname;
      const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');

      const cookieOptions = {
        expires: 7, // 7 days
        secure: !isLocalhost, // Only secure in production
        sameSite: isLocalhost ? 'Lax' : 'None', // Use Lax for localhost, None for production
        path: '/',
      };

      // Only set domain for production and when not localhost
      if (!isLocalhost && currentDomain.includes('upinterview.io')) {
        cookieOptions.domain = '.upinterview.io';
      }

      // Set the token in cookies
      Cookies.set(IMPERSONATION_TOKEN_KEY, token, cookieOptions);

      // if (userData) {
      //   localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(userData));
      // }

      // Verify the cookie was set
      const savedToken = Cookies.get(IMPERSONATION_TOKEN_KEY);

    } catch (error) {
      console.error('❌ Error setting impersonation token:', error);
    }
  }

  // Get current user type directly from token state (no localStorage)
  static getUserType() {
    try {
      const authToken = this.getAuthToken();
      const impersonationToken = this.getImpersonationToken();

      // Determine user type directly from token state
      let userType = null;

      if (authToken && impersonationToken) {
        // Check if impersonation token has impersonatedUserId (super admin) or userId (effective user)
        const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
        if (impersonationPayload?.impersonatedUserId) {
          userType = 'effective'; // super admin logged in as user
        } else {
          userType = 'effective'; // both tokens but no impersonatedUserId (shouldn't happen)
        }
      } else if (authToken && !impersonationToken) {
        userType = 'effective'; // direct effective user login
      } else if (!authToken && impersonationToken) {
        userType = 'superAdmin'; // super admin with impersonatedUserId
      } else {
        userType = null; // not authenticated
      }

      // Update localStorage to keep it in sync
      const storedUserType = this.getStoredUserType();
      if (userType !== storedUserType) {
        this.setUserType(userType);
      }

      return userType;
    } catch (error) {
      console.warn('Error getting user type:', error);
      return null;
    }
  }

  // Get stored user type from localStorage (legacy)
  static getStoredUserType() {
    try {
      return localStorage.getItem(USER_TYPE_KEY);
    } catch (error) {
      console.warn('Error getting stored user type:', error);
      return null;
    }
  }

  // Set user type
  static setUserType(type) {
    try {
      localStorage.setItem(USER_TYPE_KEY, type);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  }

  // Check if user is super admin only
  static isSuperAdminOnly() {
    return !!(this.getAuthToken() && !this.getImpersonationToken());
  }

  // Check if user is effective user only
  static isEffectiveUserOnly() {
    return !!(this.getImpersonationToken() && !this.getAuthToken());
  }

  // Check if super admin is logged in as user (both tokens exist)
  static isSuperAdminLoggedInAsUser() {
    return !!(this.getAuthToken() && this.getImpersonationToken());
  }

  /**
   * Update user type in localStorage (legacy - for backward compatibility)
   * 
   * User Type Logic:
   * - authToken: effective user (direct login)
   * - impersonationToken: super admin (with impersonatedUserId)
   * - Both tokens: effective (super admin logged in as user)
   * - No tokens: null (not authenticated)
   * 
   * @returns {string|null} The determined user type
   */
  static updateUserType() {
    const userType = this.getUserType(); // Get from token state

    // Store in localStorage for legacy compatibility
    this.setUserType(userType);

    return userType;
  }

  /**
   * Check if user type needs to be synced with localStorage
   * This ensures localStorage is always up to date with current token state
   * 
   * @returns {boolean} True if user type was updated, false if already in sync
   */
  static syncUserType() {
    const currentUserType = this.getUserType(); // Get from token state
    const storedUserType = this.getStoredUserType(); // Get from localStorage

    if (currentUserType !== storedUserType) {
      this.setUserType(currentUserType);
      return true;
    }

    return false;
  }

  // Check if user has any valid authentication
  static isAuthenticated() {
    return !!(this.getAuthToken() || this.getImpersonationToken());
  }

  // Get the active token (impersonation token takes precedence)
  static getActiveToken() {
    return this.getImpersonationToken() || this.getAuthToken();
  }

  // Get active user data
  static getActiveUserData() {
    const token = this.getActiveToken();
    if (!token) return null;

    try {
      const decoded = decodeJwt(token);
      return decoded;
    } catch (error) {
      console.warn('Error decoding active token:', error);
      return null;
    }
  }

  /**
   * Get the current user ID based on user type from cookies
   * 
   * User ID Logic:
   * - Effective users: Get from auth token (userId/id)
   * - Super admin: Get from impersonation token (impersonatedUserId)
   * 
   * @returns {string|null} The current user ID
   */
  static getCurrentUserId() {
    const userType = this.getUserType();

    if (userType === 'effective') {
      // For effective users, get user ID from auth token
      const authToken = this.getAuthToken();
      if (authToken) {
        try {
          const decoded = decodeJwt(authToken);
          const userId = decoded.userId || decoded.id;
          return userId;
        } catch (error) {
          console.warn('Error decoding auth token for user ID:', error);
        }
      }
    } else if (userType === 'superAdmin') {
      // For super admin, get user ID from impersonation token (impersonatedUserId)
      const impersonationToken = this.getImpersonationToken();
      if (impersonationToken) {
        try {
          const decoded = decodeJwt(impersonationToken);
          // For super admin, use impersonatedUserId
          const userId = decoded.impersonatedUserId;
          return userId;
        } catch (error) {
          console.warn('Error decoding impersonation token for impersonatedUserId:', error);
        }
      }
    }

    // console.log('⚠️ No user ID found for user type:', userType);
    return null;
  }

  /**
   * Get the current tenant ID from the active token
   * 
   * @returns {string|null} The current tenant ID
   */
  static getCurrentTenantId() {
    // Get the active token based on user type
    const authToken = this.getAuthToken();
    
    if (authToken) {
      try {
        const decoded = decodeJwt(authToken);
        const tenantId = decoded.tenantId;
        return tenantId || null;
      } catch (error) {
        console.warn('Error decoding auth token for tenant ID:', error);
      }
    }
    
    // Fallback: try to get from impersonation token if no auth token
    const impersonationToken = this.getImpersonationToken();
    if (impersonationToken) {
      try {
        const decoded = decodeJwt(impersonationToken);
        const tenantId = decoded.tenantId;
        return tenantId || null;
      } catch (error) {
        console.warn('Error decoding impersonation token for tenant ID:', error);
      }
    }

    return null;
  }

  static clearAllPermissionCaches() {
    try {
      // Clear new permission cache keys
      localStorage.removeItem('permissions_effective');
      localStorage.removeItem('permissions_superAdmin');

    } catch (error) {
      console.warn('Error clearing permission caches:', error);
    }
  }
  static clearCookie(name) {
    try {
      const currentDomain = window.location.hostname;
      const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');

      const baseOptions = {
        path: '/',
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'Lax' : 'None',
      };

      // Clear with domain in production
      if (!isLocalhost && currentDomain.includes('upinterview.io')) {
        Cookies.remove(name, { ...baseOptions, domain: '.upinterview.io' });
      }

      // Clear without domain as fallback
      Cookies.remove(name, baseOptions);

      // Extra fallback for subdomains
      if (!isLocalhost && currentDomain.startsWith('app.')) {
        Cookies.remove(name, { ...baseOptions, domain: 'upinterview.io' });
      }

      // console.log(`Cleared cookie: ${name}`);
    } catch (error) {
      console.error(`Error clearing cookie ${name}:`, error);
    }
  }
  /**
   * Clear permissions for a specific user type
   * 
   * @param {string} userType - The user type to clear permissions for ('effective' or 'superAdmin')
   */
 
  // Login as user (super admin switching to user account)
  // Login as user (clear all cookies and set new user session)
  static async loginAsUser(authToken, userData) {
    try {
      // Step 1: Clear all existing cookies and localStorage
      await AuthCookieManager.clearAllAuth();

      // Step 2: Clear all permission caches
      AuthCookieManager.clearAllPermissionCaches();

      // Step 3: Set the new user's auth token
      AuthCookieManager.setAuthToken(authToken);

      // Step 4: Delay and verify with retries
      const maxRetries = 3;
      let retries = 0;
      let verified = false;

      while (!verified && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay per attempt
        const currentAuthToken = AuthCookieManager.getAuthToken();
        const currentImpersonationToken = AuthCookieManager.getImpersonationToken();

        verified = !!currentAuthToken && !currentImpersonationToken;

        if (!verified) {
          console.warn(`Verification failed on attempt ${retries + 1}. Re-clearing and re-setting.`);
          await AuthCookieManager.clearAllAuth();
          AuthCookieManager.setAuthToken(authToken);
        }

        retries++;
      }

      if (!verified) {
        throw new Error('Failed to verify cookie state after retries');
      }

      // Step 6: Update user type
      AuthCookieManager.updateUserType();

      // Step 7: Sync auth state across tabs
      // AuthCookieManager.syncAuthAcrossTabs();

      // Step 8: Log final state
      const finalAuthToken = AuthCookieManager.getAuthToken();
    } catch (error) {
      console.error('❌ Error during login as user:', error);
      throw error;
    }
  }

  // Smart logout based on current authentication state
  //<---------------------- v1.0.0
  static async smartLogout(navigate, setLoading = null, effectivePermissions_RoleName = null) {
    try {
      if (setLoading) {
        setLoading(true);
      }

      // const { resetPermissionPreload } = await import("../permissionPreloader");
      // resetPermissionPreload();

      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (impersonationToken && !authToken) {
        AuthCookieManager.clearCookie(IMPERSONATION_TOKEN_KEY);
        // localStorage.removeItem(IMPERSONATED_USER_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        // AuthCookieManager.clearPermissions('superAdmin');
        // localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        // localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
        window.location.href = process.env.NODE_ENV === 'production' ? `https://${config.REACT_APP_API_URL_FRONTEND}/organization-login` : "http://localhost:3000/organization-login";
      } else if (authToken && !impersonationToken) {
        AuthCookieManager.clearCookie(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        // AuthCookieManager.clearPermissions('effective');
        // localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        // localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
        localStorage.removeItem('app_permissions_cache');
        localStorage.removeItem('permissions_effective');
        localStorage.removeItem('app_permissions_timestamp');
        console.log('Logging out with role:', effectivePermissions_RoleName);
        console.log('Current config.REACT_APP_API_URL_FRONTEND:', config.REACT_APP_API_URL_FRONTEND);
        
        // Ensure the URL is properly formatted
        let baseUrl = config.REACT_APP_API_URL_FRONTEND;
        // Remove trailing slash if present
        baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        // Ensure the URL has a protocol
        if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
          baseUrl = window.location.protocol + '//' + baseUrl;
        }
        
        const loginPath = (effectivePermissions_RoleName === 'Individual' || effectivePermissions_RoleName === 'Individual_Freelancer')
          ? '/individual-login'
          : '/organization-login';
          
        const redirectUrl = `${baseUrl}${loginPath}`;
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else if (authToken && impersonationToken) {
        AuthCookieManager.clearCookie(AUTH_TOKEN_KEY);
        // AuthCookieManager.clearPermissions('effective');
        AuthCookieManager.clearAllPermissionCaches();
        localStorage.removeItem(USER_TYPE_KEY);
        navigate("/admin-dashboard");
      } else {
        window.location.href = `https://${config.REACT_APP_API_URL_FRONTEND}/organization-login`;
      }

      setTimeout(async () => {
        const verifyAuthToken = AuthCookieManager.getAuthToken();
        const verifyImpersonationToken = AuthCookieManager.getImpersonationToken();
        // const verifyEffectivePermissions = localStorage.getItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        // const verifySuperAdminPermissions = localStorage.getItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);

        const originalAuthToken = authToken;
        const originalImpersonationToken = impersonationToken;

        if (originalAuthToken && originalImpersonationToken) {
          if (verifyAuthToken && !verifyImpersonationToken) {
            AuthCookieManager.clearCookie(AUTH_TOKEN_KEY);
          } else if (!verifyAuthToken && verifyImpersonationToken) {
            // Expected state
          } else {
            await AuthCookieManager.clearAllAuth();
          }
        } else {
          if (verifyAuthToken || verifyImpersonationToken) {
            await AuthCookieManager.clearAllAuth();
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error during smart logout:', error);
      if (setLoading) {
        setLoading(false);
      }
      window.location.href = `https://${config.REACT_APP_API_URL_FRONTEND}/organization-login`;
    }
  }
  // ---------------------- v1.0.2 >

  // Clear all authentication data
  static async clearAllAuth() {
    try {
      // Reset permission preload flag
      // const { resetPermissionPreload } = await import("../permissionPreloader");
      // resetPermissionPreload();

      // Clear localStorage
      localStorage.clear();

      // Clear specific auth cookies
      this.clearCookie(AUTH_TOKEN_KEY);
      this.clearCookie(IMPERSONATION_TOKEN_KEY);

      // Generic fallback: clear all cookies
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName) {
          this.clearCookie(cookieName);
        }
      });

      // Log cookie state after clearing
      // console.log('All auth cleared, final cookie state:', this.debugCookieState());
    } catch (error) {
      console.error('Error clearing all auth data:', error);
      throw error; // Rethrow to propagate to calling functions
    }
  }

  /**
   * Set authentication cookies based on provided data
   * This method handles both auth tokens and impersonation tokens
   * 
   * @param {Object} data - Authentication data object
   * @param {string} data.authToken - Super admin authentication token
   * @param {string} data.impersonationToken - User impersonation token  
   * @param {Object} data.impersonatedUser - User data for impersonation
   * @param {string} data.userId - User ID (legacy)
   * @param {string} data.tenantId - Tenant ID (legacy)
   * @param {string} data.organization - Organization name (legacy)
   */
  static setAuthCookies(data) {
    try {

      // Step 1: Set auth token (effective user token) if provided
      if (data.authToken) {
        AuthCookieManager.setAuthToken(data.authToken);
      }

      // Step 2: Set impersonation token (super admin token) if provided
      if (data.impersonationToken) {
        AuthCookieManager.setImpersonationToken(data.impersonationToken, data.impersonatedUser);
      }

      AuthCookieManager.updateUserType();

    } catch (error) {
      console.error("❌ Error setting auth cookies:", error);
      throw error; // Re-throw to allow calling code to handle
    }
  }
  // ---------------------- v1.0.2 >
  // Check browser permissions and capabilities
  static checkBrowserPermissions() {
    const permissions = {
      cookies: false,
      localStorage: false,
      sessionStorage: false,
      notifications: false
    };

    try {
      // Check cookie support
      document.cookie = 'test=1';
      permissions.cookies = document.cookie.includes('test=1');
      document.cookie = 'test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (e) {
      console.warn('Cookie support check failed:', e);
    }

    try {
      // Check localStorage support
      localStorage.setItem('test', '1');
      permissions.localStorage = localStorage.getItem('test') === '1';
      localStorage.removeItem('test');
    } catch (e) {
      console.warn('localStorage support check failed:', e);
    }

    try {
      // Check sessionStorage support
      sessionStorage.setItem('test', '1');
      permissions.sessionStorage = sessionStorage.getItem('test') === '1';
      sessionStorage.removeItem('test');
    } catch (e) {
      console.warn('sessionStorage support check failed:', e);
    }

    // Check notification permission
    if ('Notification' in window) {
      permissions.notifications = Notification.permission === 'granted';
    }

    return permissions;
  }

  // Request notification permissions only
  static async requestNotificationPermission() {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } else if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch (e) {
      console.warn('Notification permission request failed:', e);
      return false;
    }
  }

 }



// Named exports for backward compatibility
export const setAuthCookies = AuthCookieManager.setAuthCookies;
export const clearAllAuth = AuthCookieManager.clearAllAuth.bind(AuthCookieManager);
export const clearCookie = AuthCookieManager.clearCookie.bind(AuthCookieManager);
export const verifyCookieState = AuthCookieManager.verifyCookieState;

// Token getters
export const getAuthToken = AuthCookieManager.getAuthToken;
export const getImpersonationToken = AuthCookieManager.getImpersonationToken;
export const getActiveToken = AuthCookieManager.getActiveToken;
export const getActiveUserData = AuthCookieManager.getActiveUserData;
export const getCurrentUserId = AuthCookieManager.getCurrentUserId;
export const getCurrentTenantId = AuthCookieManager.getCurrentTenantId;

// User type management
export const getUserType = AuthCookieManager.getUserType;
export const setUserType = AuthCookieManager.setUserType;
export const updateUserType = AuthCookieManager.updateUserType;
export const syncUserType = AuthCookieManager.syncUserType;

// Authentication status
export const isAuthenticated = AuthCookieManager.isAuthenticated;
export const isSuperAdminOnly = AuthCookieManager.isSuperAdminOnly;
export const isEffectiveUserOnly = AuthCookieManager.isEffectiveUserOnly;

// Impersonation
// export const getImpersonatedUser = AuthCookieManager.getImpersonatedUser;
export const loginAsUser = AuthCookieManager.loginAsUser;

// Permissions
export const clearPermissions = AuthCookieManager.clearPermissions;
export const clearAllPermissionCaches = AuthCookieManager.clearAllPermissionCaches;

// Smart logout
export const smartLogout = AuthCookieManager.smartLogout;
// <---------------------- v1.0.2
// export const handleTokenExpiration = AuthCookieManager.handleTokenExpiration;
// ---------------------- v1.0.2 >






export default AuthCookieManager;