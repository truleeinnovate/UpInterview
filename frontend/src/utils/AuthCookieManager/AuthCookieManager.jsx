import Cookies from 'js-cookie';
import { decodeJwt } from './jwtDecode';
import { resetPermissionPreload } from "../permissionPreloader";

// Token keys
const AUTH_TOKEN_KEY = 'authToken';
const IMPERSONATION_TOKEN_KEY = 'impersonationToken';
const USER_TYPE_KEY = 'userType'; // 'superAdmin' or 'effectiveUser'
const IMPERSONATED_USER_KEY = 'impersonatedUser';

// Permission cache keys - separate for effective and super admin
const EFFECTIVE_PERMISSIONS_CACHE_KEY = 'effective_permissions_cache';
const EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP = 'effective_permissions_timestamp';
const SUPER_ADMIN_PERMISSIONS_CACHE_KEY = 'super_admin_permissions_cache';
const SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP = 'super_admin_permissions_timestamp';

class AuthCookieManager {
  // Get auth token (effective user token)
  static getAuthToken() {
    try {
      return Cookies.get(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn('Error getting auth token:', error);
      return null;
    }
  }

  // Get impersonation token (super admin token)
  static getImpersonationToken() {
    try {
      return Cookies.get(IMPERSONATION_TOKEN_KEY);
    } catch (error) {
      console.warn('Error getting impersonation token:', error);
      return null;
    }
  }

  // Set auth token
  static setAuthToken(token) {
    console.log('🔑 setAuthToken called with token:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });

    try {
      console.log('🍪 Setting cookie with key:', AUTH_TOKEN_KEY);
      
      // Get current domain for proper cookie setting
      const currentDomain = window.location.hostname;
      console.log('🌐 Current domain:', currentDomain);
      
      const cookieOptions = {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'None', // Required for cross-origin
        path: '/', // Ensure cookie is available on all paths
      };
      
      // Only set domain for production (not localhost)
      if (currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1')) {
        cookieOptions.domain = '.upinterview.io'; // Use wildcard domain
        console.log('🌐 Setting cookie domain to .upinterview.io');
      }
      
      Cookies.set(AUTH_TOKEN_KEY, token, cookieOptions);
      
      // User type is now determined directly from token state
      console.log('✅ Auth token set - user type will be determined from tokens');

      // Verify the cookie was set
      const savedToken = Cookies.get(AUTH_TOKEN_KEY);
      console.log('✅ Auth token set successfully. Verification:', {
        cookieExists: !!savedToken,
        tokenMatches: savedToken === token,
        allCookies: document.cookie
      });
    } catch (error) {
      console.error('❌ Error setting auth token:', error);
    }
  }

  // Set impersonation token
  static setImpersonationToken(token, userData = null) {
    console.log('👤 setImpersonationToken called with:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      hasUserData: !!userData,
      userData: userData
    });

    try {
      // Get current domain for proper cookie setting
      const currentDomain = window.location.hostname;
      console.log('🌐 Current domain:', currentDomain);
      
      const cookieOptions = {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'None', // Required for cross-origin
        path: '/', // Ensure cookie is available on all paths
      };
      
      // Only set domain for production (not localhost)
      if (currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1')) {
        cookieOptions.domain = '.upinterview.io'; // Use wildcard domain
        console.log('🌐 Setting cookie domain to .upinterview.io');
      }
      
      // Set the token in cookies
      Cookies.set('impersonationToken', token, cookieOptions);
      
      if (userData) {
        localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(userData));
        console.log('✅ Impersonated user data stored:', userData);
      }

      // User type is now determined directly from token state
      console.log('✅ Impersonation token set - user type will be determined from tokens');

      // Verify the cookie was set
      const savedToken = Cookies.get(IMPERSONATION_TOKEN_KEY);
      console.log('✅ Impersonation token set successfully. Verification:', {
        cookieExists: !!savedToken,
        tokenMatches: savedToken === token,
        allCookies: document.cookie
      });

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
        console.log(`🔄 User type updated in localStorage: ${storedUserType} → ${userType}`);
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
      console.log('✅ User type set to:', type);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  }

  // Get impersonated user data
  static getImpersonatedUser() {
    try {
      const userData = localStorage.getItem(IMPERSONATED_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error getting impersonated user:', error);
      return null;
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
    console.log(`👤 User type stored in localStorage: ${userType}`);

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
      console.log(`🔄 User type synced: ${storedUserType} → ${currentUserType}`);
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
          console.log('👤 Effective user ID from auth token:', userId);
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
          console.log('👤 Super admin impersonatedUserId from impersonation token:', userId);
          return userId;
        } catch (error) {
          console.warn('Error decoding impersonation token for impersonatedUserId:', error);
        }
      }
    }

    console.log('⚠️ No user ID found for user type:', userType);
    return null;
  }

  /**
   * Get current permissions based on user type
   * 
   * @returns {Object|null} Current permissions for the active user type
   */
  static getCurrentPermissions() {
    const userType = this.getUserType();

    if (userType === 'effective') {
      return this.getEffectivePermissions();
    } else if (userType === 'superAdmin') {
      return this.getSuperAdminPermissions();
    }

    return null;
  }

  /**
   * Get effective user permissions from localStorage
   * 
   * @returns {Object|null} Effective user permissions
   */
  static getEffectivePermissions() {
    try {
      const permissions = localStorage.getItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      return permissions ? JSON.parse(permissions) : null;
    } catch (error) {
      console.warn('Error getting effective permissions:', error);
      return null;
    }
  }

  /**
   * Set effective user permissions in localStorage
   * 
   * @param {Object} permissions - Effective user permissions
   */
  static setEffectivePermissions(permissions) {
    try {
      localStorage.setItem(EFFECTIVE_PERMISSIONS_CACHE_KEY, JSON.stringify(permissions));
      localStorage.setItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP, Date.now().toString());
      console.log('✅ Effective permissions set:', permissions);
    } catch (error) {
      console.error('Error setting effective permissions:', error);
    }
  }

  /**
   * Get super admin permissions from localStorage
   * 
   * @returns {Object|null} Super admin permissions
   */
  static getSuperAdminPermissions() {
    try {
      const permissions = localStorage.getItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      return permissions ? JSON.parse(permissions) : null;
    } catch (error) {
      console.warn('Error getting super admin permissions:', error);
      return null;
    }
  }

  /**
   * Set super admin permissions in localStorage
   * 
   * @param {Object} permissions - Super admin permissions
   */
  static setSuperAdminPermissions(permissions) {
    try {
      localStorage.setItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY, JSON.stringify(permissions));
      localStorage.setItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP, Date.now().toString());
      console.log('✅ Super admin permissions set:', permissions);
    } catch (error) {
      console.error('Error setting super admin permissions:', error);
    }
  }

  /**
   * Set permissions based on current user type
   * 
   * @param {Object} permissions - Permissions to set
   */
  static setCurrentPermissions(permissions) {
    const userType = this.getUserType();

    if (userType === 'effective') {
      this.setEffectivePermissions(permissions);
    } else if (userType === 'superAdmin') {
      this.setSuperAdminPermissions(permissions);
    } else {
      console.warn('⚠️ Cannot set permissions - no valid user type');
    }
  }

  /**
   * Clear all permission caches from localStorage
   * This includes both old and new cache keys
   */
  static clearAllPermissionCaches() {
    try {
      // Clear old permission cache keys
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
      localStorage.removeItem('app_permissions_cache');
      localStorage.removeItem('app_permissions_timestamp');
      
      // Clear new permission cache keys
      localStorage.removeItem('permissions_effective');
      localStorage.removeItem('permissions_superAdmin');
      
      console.log('✅ All permission caches cleared');
    } catch (error) {
      console.warn('Error clearing permission caches:', error);
    }
  }

  /**
   * Clear permissions for a specific user type
   * 
   * @param {string} userType - The user type to clear permissions for ('effective' or 'superAdmin')
   */
  static clearPermissions(userType) {
    try {
      if (userType === 'effective') {
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
        console.log('✅ Effective permissions cleared');
      } else if (userType === 'superAdmin') {
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
        console.log('✅ Super admin permissions cleared');
      }
    } catch (error) {
      console.error('Error clearing permissions:', error);
    }
  }

  // Clear only effective user data (return to super admin)
  // static clearEffectiveUser() {
  //   try {
  //     // Clear impersonation token and related data
  //     Cookies.remove(IMPERSONATION_TOKEN_KEY);
  //     localStorage.removeItem(IMPERSONATED_USER_KEY);

  //     // Clear effective user permissions
  //     this.clearPermissions('effective');

  //     // Also clear the old legacy cache keys for backward compatibility
  //     localStorage.removeItem('app_permissions_cache');
  //     localStorage.removeItem('app_permissions_timestamp');

  //     // Update user type based on current state
  //     AuthCookieManager.updateUserType();

  //     console.log('✅ Effective user data cleared, returning to super admin');
  //   } catch (error) {
  //     console.error('Error clearing effective user data:', error);
  //   }
  // }

  // // Login as super admin
  // static loginAsSuperAdmin(token) {
  //   try {
  //     this.clearAllAuth(); // Clear any existing data
  //     this.setAuthToken(token);
  //     console.log('✅ Logged in as super admin');
  //   } catch (error) {
  //     console.error('Error logging in as super admin:', error);
  //   }
  // }

  // // Login as effective user (direct login)
  // static loginAsEffectiveUser(token) {
  //   try {
  //     this.clearAllAuth(); // Clear any existing data
  //     this.setImpersonationToken(token);
  //     console.log('✅ Logged in as effective user');
  //   } catch (error) {
  //     console.error('Error logging in as effective user:', error);
  //   }
  // }

  // Impersonate user (super admin impersonating effective user)
  // static impersonateUser(token, userData) {
  //   try {
  //     // Keep super admin token, add impersonation token
  //     this.setImpersonationToken(token, userData);
  //     console.log('✅ Impersonating user:', userData);
  //   } catch (error) {
  //     console.error('Error impersonating user:', error);
  //   }
  // }

  // Login as user (super admin switching to user account)
  static loginAsUser(authToken, userData) {
    try {
      console.log('🔄 Login as user - keeping super admin session and adding user auth token');

      // Store the current super admin impersonation token
      const currentImpersonationToken = AuthCookieManager.getImpersonationToken();
      console.log('👤 Current super admin impersonation token exists:', !!currentImpersonationToken);

      // Set the user's auth token as the auth token (effective user session)
      console.log('🔑 Setting user token as auth token');
      AuthCookieManager.setAuthToken(authToken);

      // Restore the super admin's impersonation token
      if (currentImpersonationToken) {
        console.log('👤 Restoring super admin impersonation token');
        AuthCookieManager.setImpersonationToken(currentImpersonationToken);
      }

      console.log('✅ Login as user completed successfully - both super admin and effective user sessions active');
    } catch (error) {
      console.error('❌ Error during login as user:', error);
    }
  }



  // Smart logout based on current authentication state
  static async smartLogout(navigate, setLoading = null) {
    try {
      console.log('🚪 Smart logout initiated with loading state');
      
      // Set loading state if provided
      if (setLoading) {
        setLoading(true);
      }

      // Reset permission preload flag
      resetPermissionPreload();
      
      // Get current authentication state
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();

      console.log('🚪 Smart logout initiated with state:', {
        hasAuthToken: !!authToken,
        hasImpersonationToken: !!impersonationToken
      });

      // Simulate backend processing time for cookie clearing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Helper function to clear cookies using multiple methods
      const clearCookie = (name) => {
        try {
          const currentDomain = window.location.hostname;
          console.log(`🧹 Clearing cookie: ${name} on domain: ${currentDomain}`);
          
          const clearOptions = {
            expires: new Date(0),
            path: '/'
          };
          
          // Only set domain for production (not localhost)
          if (currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1')) {
            clearOptions.domain = '.upinterview.io';
          }
          
          Cookies.set(name, '', clearOptions);
          console.log(`✅ Cookie ${name} cleared`);
        } catch (error) {
          console.error(`Error clearing cookie ${name}:`, error);
        }
      };

      if (impersonationToken && !authToken) {
        // Scenario 1: Only impersonation token exists (super admin)
        console.log('👤 Clearing super admin data and navigating to main domain organization login');
        // Clear super admin related data
        clearCookie(IMPERSONATION_TOKEN_KEY);
        localStorage.removeItem(IMPERSONATED_USER_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('superAdmin');
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
        // Always redirect to main domain
        // window.location.href = "https://app.upinterview.io/organization-login";
        navigate("/organization-login");


      } else if (authToken && !impersonationToken) {
        // Scenario 2: Only auth token exists (effective user)
        console.log('🔑 Clearing effective user data and navigating to main domain organization login');
        // Clear effective user related data
        clearCookie(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('effective');
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
        localStorage.removeItem('app_permissions_cache');
        localStorage.removeItem('app_permissions_timestamp');
        // Always redirect to main domain
        // window.location.href = "https://app.upinterview.io/organization-login";
        navigate("/organization-login");

      } else if (authToken && impersonationToken) {
        // Scenario 3: Both tokens exist (super admin logged in as user)
        console.log('🔄 Clearing effective user data, keeping super admin data, navigating to admin dashboard');
        // Clear effective user data, keep super admin data
        clearCookie(AUTH_TOKEN_KEY);
        AuthCookieManager.clearPermissions('effective');
        AuthCookieManager.clearAllPermissionCaches();
        localStorage.removeItem(USER_TYPE_KEY);
        navigate("/admin-dashboard");
      } else {
        // No tokens exist, just navigate to main domain organization login
        console.log('⚠️ No tokens found, navigating to main domain organization login');
        // window.location.href = "https://app.upinterview.io/organization-login";
        navigate("/organization-login");

      }

      // Wait a moment for cookies to be cleared, then verify
      setTimeout(() => {
        // Verify that cookies and localStorage were cleared
        const verifyAuthToken = AuthCookieManager.getAuthToken();
        const verifyImpersonationToken = AuthCookieManager.getImpersonationToken();
        const verifyEffectivePermissions = localStorage.getItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        const verifySuperAdminPermissions = localStorage.getItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);

        console.log('🔍 Verification after logout:', {
          authTokenCleared: !verifyAuthToken,
          impersonationTokenCleared: !verifyImpersonationToken,
          effectivePermissionsCleared: !verifyEffectivePermissions,
          superAdminPermissionsCleared: !verifySuperAdminPermissions,
          allCookies: document.cookie
        });

        // Only use aggressive fallback if we're not in the "both tokens" scenario
        // In the "both tokens" scenario, we expect the authToken to be cleared but impersonationToken to remain
        const originalAuthToken = authToken;
        const originalImpersonationToken = impersonationToken;

        if (originalAuthToken && originalImpersonationToken) {
          // Scenario 3: Both tokens existed - only authToken should be cleared
          if (verifyAuthToken && !verifyImpersonationToken) {
            console.log('⚠️ Auth token not cleared properly, clearing it again');
            clearCookie(AUTH_TOKEN_KEY);
          } else if (!verifyAuthToken && verifyImpersonationToken) {
            console.log('✅ Correct state: auth token cleared, impersonation token preserved');
          } else {
            console.log('⚠️ Unexpected state, using aggressive fallback');
            AuthCookieManager.clearAllAuth();
          }
        } else {
          // Other scenarios: both tokens should be cleared
          if (verifyAuthToken || verifyImpersonationToken) {
            console.log('⚠️ Cookies still exist, using aggressive fallback');
            AuthCookieManager.clearAllAuth();
          }
        }

        console.log('✅ Smart logout completed');
      }, 100);

    } catch (error) {
      console.error('Error during smart logout:', error);
      // Ensure loading is turned off even if there's an error
      if (setLoading) {
        setLoading(false);
      }
      // Fallback to main domain organization login
      // window.location.href = "https://app.upinterview.io/organization-login";
      navigate("/organization-login");

    }
  }

  // Get authentication status summary
  static getAuthStatus() {
    const authToken = this.getAuthToken();
    const impersonationToken = this.getImpersonationToken();
    const userType = this.getUserType();
    const impersonatedUser = this.getImpersonatedUser();

    return {
      hasAuthToken: !!authToken,
      hasImpersonationToken: !!impersonationToken,
      isImpersonating: !!impersonationToken,
      isSuperAdminOnly: this.isSuperAdminOnly(),
      isEffectiveUserOnly: this.isEffectiveUserOnly(),
      isAuthenticated: this.isAuthenticated(),
      userType,
      impersonatedUser,
      activeToken: this.getActiveToken() ? 'present' : 'none'
    };
  }

  // Clear all authentication data
  static clearAllAuth() {
    try {
      // Reset permission preload flag
      resetPermissionPreload();
      
      console.log('🧹 clearAllAuth called');
      console.log('📋 Current cookies before clearing:', document.cookie);

      // Clear localStorage
      localStorage.clear();
      console.log('✅ localStorage cleared');

      // Get current domain for proper cookie clearing
      const currentDomain = window.location.hostname;
      console.log('🌐 Current domain for cookie clearing:', currentDomain);
      
      const clearOptions = {
        expires: new Date(0),
        secure: true,
        sameSite: 'None',
        path: '/'
      };
      
      // Only set domain for production (not localhost)
      if (currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1')) {
        clearOptions.domain = '.upinterview.io';
        console.log('🌐 Clearing cookies with domain .upinterview.io');
      }

      // Clear specific auth cookies with proper options
      Cookies.set(AUTH_TOKEN_KEY, '', clearOptions);
      Cookies.set(IMPERSONATION_TOKEN_KEY, '', clearOptions);

      // Also try without domain for development
      if (currentDomain === 'localhost' || currentDomain.includes('127.0.0.1')) {
        Cookies.set(AUTH_TOKEN_KEY, '', { 
          expires: new Date(0),
          path: '/'
        });
        Cookies.set(IMPERSONATION_TOKEN_KEY, '', { 
          expires: new Date(0),
          path: '/'
        });
      }

      // Generic cookie clearing as fallback
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          if (currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.upinterview.io;`;
          }
        }
      });

      console.log('📋 Current cookies after clearing:', document.cookie);
      console.log('✅ All auth data cleared');
    } catch (error) {
      console.error('Error clearing all auth data:', error);
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
    // Log the incoming data for debugging
    console.log('🍪 Setting auth cookies with data:', {
      hasAuthToken: !!data.authToken,
      hasImpersonationToken: !!data.impersonationToken,
      hasImpersonatedUser: !!data.impersonatedUser,
      userId: data.userId,
      tenantId: data.tenantId,
      organization: data.organization
    });

    try {
      // Step 1: Set auth token (effective user token) if provided
      if (data.authToken) {
        console.log('🔑 Setting auth token (effective user)...');
        AuthCookieManager.setAuthToken(data.authToken);
        console.log('✅ Auth token set successfully');
      } else {
        console.log('⚠️ No auth token provided');
      }

      // Step 2: Set impersonation token (super admin token) if provided
      if (data.impersonationToken) {
        console.log('👤 Setting impersonation token (super admin)...');
        AuthCookieManager.setImpersonationToken(data.impersonationToken, data.impersonatedUser);
        console.log('✅ Impersonation token set successfully');
      } else {
        console.log('⚠️ No impersonation token provided');
      }

      // Step 3: Update user type based on current token state
      console.log('🔄 Updating user type...');
      AuthCookieManager.updateUserType();

      // Step 4: Verify final state
      const finalAuthToken = AuthCookieManager.getAuthToken();
      const finalImpersonationToken = AuthCookieManager.getImpersonationToken();
      const finalUserType = AuthCookieManager.getUserType();

      console.log('🔍 Final authentication state:', {
        hasAuthToken: !!finalAuthToken,
        hasImpersonationToken: !!finalImpersonationToken,
        userType: finalUserType
      });

      console.log('✅ Auth cookies set successfully');
    } catch (error) {
      console.error('❌ Error setting auth cookies:', error);
      throw error; // Re-throw to allow calling code to handle
    }
  }

  // Test cookie functionality (legacy function)
  static testCookieFunctionality() {
    try {
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();
      return {
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        success: true
      };
    } catch (error) {
      console.error('Error testing cookie functionality:', error);
      return { success: false, error: error.message };
    }
  }

  // Debug token sources (legacy function)
  static debugTokenSources() {
    try {
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();
      const authTokenFromDocument = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
      const impersonationTokenFromDocument = document.cookie.split(';').find(cookie => cookie.trim().startsWith('impersonationToken='));

      return {
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        authTokenFromDocument: !!authTokenFromDocument,
        impersonationTokenFromDocument: !!impersonationTokenFromDocument,
        success: true
      };
    } catch (error) {
      console.error('Error debugging token sources:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify cookie state and log detailed information for debugging
   * This helps identify if cookies are being set multiple times
   */
  static verifyCookieState() {
    try {
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();
      const userType = AuthCookieManager.getUserType();
      
      // Count cookies in document.cookie
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const authTokenCount = allCookies.filter(c => c.startsWith('authToken=')).length;
      const impersonationTokenCount = allCookies.filter(c => c.startsWith('impersonationToken=')).length;
      
      console.log('🔍 Cookie State Verification:', {
        authToken: {
          exists: !!authToken,
          length: authToken ? authToken.length : 0,
          count: authTokenCount,
          preview: authToken ? `${authToken.substring(0, 20)}...` : 'null'
        },
        impersonationToken: {
          exists: !!impersonationToken,
          length: impersonationToken ? impersonationToken.length : 0,
          count: impersonationTokenCount,
          preview: impersonationToken ? `${impersonationToken.substring(0, 20)}...` : 'null'
        },
        userType,
        totalCookies: allCookies.length,
        allCookieNames: allCookies.map(c => c.split('=')[0])
      });

      // Check for duplicate cookies
      if (authTokenCount > 1) {
        console.warn('⚠️ Multiple authToken cookies detected:', authTokenCount);
      }
      if (impersonationTokenCount > 1) {
        console.warn('⚠️ Multiple impersonationToken cookies detected:', impersonationTokenCount);
      }

      return {
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        userType,
        authTokenCount,
        impersonationTokenCount,
        hasDuplicates: authTokenCount > 1 || impersonationTokenCount > 1
      };
    } catch (error) {
      console.error('Error verifying cookie state:', error);
      return { error: error.message };
    }
  }

  /**
   * Debug function to check cookie state and help identify issues
   */
  static debugCookieState() {
    try {
      const currentDomain = window.location.hostname;
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();
      
      // Count cookies in document.cookie
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const authTokenCount = allCookies.filter(c => c.startsWith('authToken=')).length;
      const impersonationTokenCount = allCookies.filter(c => c.startsWith('impersonationToken=')).length;
      
      console.log('🔍 Cookie State Debug:', {
        currentDomain,
        authToken: {
          exists: !!authToken,
          length: authToken ? authToken.length : 0,
          count: authTokenCount,
          preview: authToken ? `${authToken.substring(0, 20)}...` : 'null'
        },
        impersonationToken: {
          exists: !!impersonationToken,
          length: impersonationToken ? impersonationToken.length : 0,
          count: impersonationTokenCount,
          preview: impersonationToken ? `${impersonationToken.substring(0, 20)}...` : 'null'
        },
        totalCookies: allCookies.length,
        allCookieNames: allCookies.map(c => c.split('=')[0]),
        documentCookie: document.cookie
      });

      // Check for duplicate cookies
      if (authTokenCount > 1) {
        console.warn('⚠️ Multiple authToken cookies detected:', authTokenCount);
      }
      if (impersonationTokenCount > 1) {
        console.warn('⚠️ Multiple impersonationToken cookies detected:', impersonationTokenCount);
      }

      return {
        currentDomain,
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        authTokenCount,
        impersonationTokenCount,
        hasDuplicates: authTokenCount > 1 || impersonationTokenCount > 1,
        totalCookies: allCookies.length
      };
    } catch (error) {
      console.error('Error debugging cookie state:', error);
      return { error: error.message };
    }
  }


}

// Named exports for backward compatibility
export const setAuthCookies = AuthCookieManager.setAuthCookies;
export const clearAllAuth = AuthCookieManager.clearAllAuth;
export const debugTokenSources = AuthCookieManager.debugTokenSources;
export const testCookieFunctionality = AuthCookieManager.testCookieFunctionality;
export const verifyCookieState = AuthCookieManager.verifyCookieState;
export const debugCookieState = AuthCookieManager.debugCookieState;

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
export const getAuthStatus = AuthCookieManager.getAuthStatus;

// Impersonation
export const getImpersonatedUser = AuthCookieManager.getImpersonatedUser;
export const loginAsUser = AuthCookieManager.loginAsUser;

// Permissions
export const clearPermissions = AuthCookieManager.clearPermissions;
export const clearAllPermissionCaches = AuthCookieManager.clearAllPermissionCaches;

// Smart logout
export const smartLogout = AuthCookieManager.smartLogout;

export default AuthCookieManager;