// v1.0.0  -  Ashraf  -  effectivePermissions_RoleName added to smartLogout,when individual logout navigate to there linked page
// v1.0.1  -  Ashraf  -  login as user issue
// v1.0.2  -  Ashraf  -  using authcookie manager to get current tokein,cookies works in all browsers correctly,creaing cookies or expiry cookies correctly
import Cookies from 'js-cookie';
// <---------------------- v1.0.2
import { jwtDecode } from 'jwt-decode';
import { decodeJwt } from './jwtDecode';
// ---------------------- v1.0.2 >

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
      // <---------------------- v1.0.2
      const token = Cookies.get(AUTH_TOKEN_KEY);
      
      // If token exists, validate it's not expired
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime >= decoded.exp) {
              // Token is expired, clear it
              this.clearExpiredToken(AUTH_TOKEN_KEY);
              return null;
            }
          }
        } catch (error) {
          console.warn('Error decoding auth token:', error);
          this.clearExpiredToken(AUTH_TOKEN_KEY);
          return null;
        }
      }

      return token;
      // ---------------------- v1.0.2 >
    } catch (error) {
      console.warn('Error getting auth token:', error);
      return null;
    }
  }

  // Get impersonation token (super admin token)
  static getImpersonationToken() {
    try {
      // <---------------------- v1.0.2
      const token = Cookies.get(IMPERSONATION_TOKEN_KEY);
      
      // If token exists, validate it's not expired
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime >= decoded.exp) {
              // Token is expired, clear it
              this.clearExpiredToken(IMPERSONATION_TOKEN_KEY);
              return null;
            }
          }
        } catch (error) {
          console.warn('Error decoding impersonation token:', error);
          this.clearExpiredToken(IMPERSONATION_TOKEN_KEY);
          return null;
        }
      }
      
      return token;
      // ---------------------- v1.0.2 >
    } catch (error) {
      console.warn('Error getting impersonation token:', error);
      return null;
    }
  }
  // ---------------------- v1.0.2 >

  // Clear expired token and trigger smart logout
  static clearExpiredToken(tokenKey) {
    try {
      // Clear the expired cookie
      const currentDomain = window.location.hostname;
      const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');
      
      const clearOptions = {
        expires: new Date(0),
        path: '/',
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'Lax' : 'None'
      };
      
      if (!isLocalhost && currentDomain.includes('upinterview.io')) {
        clearOptions.domain = '.upinterview.io';
      }
      
      Cookies.set(tokenKey, '', clearOptions);
      
      // Clear any localStorage backup (cleanup)
      try {
        localStorage.removeItem(`${tokenKey}_backup`);
      } catch (e) {
        // Ignore localStorage errors
      }
      
      // Trigger token expired event for smart logout
      window.dispatchEvent(new CustomEvent('tokenExpired', { 
        detail: { tokenKey } 
      }));
      
      console.log(`Expired token cleared: ${tokenKey}`);
    } catch (error) {
      console.error(`Error clearing expired token ${tokenKey}:`, error);
    }
  }

  // Sync authentication state across tabs
  static syncAuthAcrossTabs() {
    try {
      const authToken = this.getAuthToken();
      const impersonationToken = this.getImpersonationToken();
      
      // Broadcast auth state to other tabs
      if (typeof window !== 'undefined' && window.localStorage) {
        const authState = {
          authToken,
          impersonationToken,
          timestamp: Date.now()
        };
        
        localStorage.setItem('auth_sync_state', JSON.stringify(authState));
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_sync_state',
          newValue: JSON.stringify(authState)
        }));
      }
    } catch (error) {
      console.warn('Error syncing auth across tabs:', error);
    }
  }

  // Listen for auth changes from other tabs
  static setupCrossTabAuthListener() {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event) => {
      if (event.key === 'auth_sync_state') {
        try {
          const authState = JSON.parse(event.newValue);
          if (authState && authState.timestamp) {
            // Update local state if the remote state is newer
            const localTimestamp = localStorage.getItem('auth_sync_timestamp') || '0';
            if (authState.timestamp > parseInt(localTimestamp)) {
              // Sync the tokens
              if (authState.authToken) {
                this.setAuthToken(authState.authToken);
              }
              if (authState.impersonationToken) {
                this.setImpersonationToken(authState.impersonationToken);
              }
              localStorage.setItem('auth_sync_timestamp', authState.timestamp.toString());
            }
          }
        } catch (error) {
          console.warn('Error processing auth sync event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

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
      
      if (userData) {
        localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(userData));
      }

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
      } else if (userType === 'superAdmin') {
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
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

      // Store the current super admin impersonation token
      const currentImpersonationToken = AuthCookieManager.getImpersonationToken();

      // Set the user's auth token as the auth token (effective user session)
      AuthCookieManager.setAuthToken(authToken);

      // Restore the super admin's impersonation token
      if (currentImpersonationToken) {
        AuthCookieManager.setImpersonationToken(currentImpersonationToken);
      }

    } catch (error) {
      console.error('❌ Error during login as user:', error);
    }
  }

  // Smart logout based on current authentication state
  //<---------------------- v1.0.0
  static async smartLogout(navigate, setLoading = null, effectivePermissions_RoleName = null) {
    try {
        // ---------------------- v1.0.0 >
      
      // Set loading state if provided
      if (setLoading) {
        setLoading(true);
      }

      // Reset permission preload flag
      // <---------------------- v1.0.2
      const { resetPermissionPreload } = await import("../permissionPreloader");
      resetPermissionPreload();
      // ---------------------- v1.0.2 >
      
      // Get current authentication state
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();

      // Simulate backend processing time for cookie clearing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Helper function to clear cookies using multiple methods
      const clearCookie = (name) => {
        try {
          const currentDomain = window.location.hostname;
          // <---------------------- v1.0.2
          const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');
          
          const clearOptions = {
            expires: new Date(0),
            path: '/',
            secure: !isLocalhost,
            sameSite: isLocalhost ? 'Lax' : 'None'
          };
          
          // Only set domain for production and when not localhost
          if (!isLocalhost && currentDomain.includes('upinterview.io')) {
            clearOptions.domain = '.upinterview.io';
          }
          
          // Clear from cookies
          Cookies.set(name, '', clearOptions);
          
        } catch (error) {
          console.error(`Error clearing cookie ${name}:`, error);
        }
      };
      // ---------------------- v1.0.2 >

      if (impersonationToken && !authToken) {
        // Clear super admin related data
        clearCookie(IMPERSONATION_TOKEN_KEY);
        localStorage.removeItem(IMPERSONATED_USER_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('superAdmin');
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
        // Always redirect to main domain
        window.location.href = process.env.NODE_ENV === 'production' ? "https://app.upinterview.io/organization-login" : "http://localhost:3000/organization-login";
        // navigate("/organization-login");


      } else if (authToken && !impersonationToken) {
        // Clear effective user related data
        clearCookie(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('effective');
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
        localStorage.removeItem('app_permissions_cache');
        localStorage.removeItem('permissions_effective');
        localStorage.removeItem('app_permissions_timestamp');
        
        // Check if user is individual or individual freelancer and redirect accordingly
        if (effectivePermissions_RoleName === 'Individual' || effectivePermissions_RoleName === 'Individual_Freelancer') {
          window.location.href = process.env.NODE_ENV === 'production' ? "https://app.upinterview.io/welcome-page-upinterview-individual" : "http://localhost:3000/welcome-page-upinterview-individual";
        } else {
          // Always redirect to main domain
          window.location.href = process.env.NODE_ENV === 'production' ? "https://app.upinterview.io/organization-login" : "http://localhost:3000/organization-login";
        }
        // navigate("/organization-login");

      } else if (authToken && impersonationToken) {
        // Clear effective user data, keep super admin data
        clearCookie(AUTH_TOKEN_KEY);
        AuthCookieManager.clearPermissions('effective');
        AuthCookieManager.clearAllPermissionCaches();
        localStorage.removeItem(USER_TYPE_KEY);
        navigate("/admin-dashboard");
      } else {
        window.location.href = process.env.NODE_ENV === 'production' ? "https://app.upinterview.io/organization-login" : "http://localhost:3000/organization-login";
        // navigate("/organization-login");

      }

      // Wait a moment for cookies to be cleared, then verify
      // <---------------------- v1.0.2
      setTimeout(async () => {
      // ---------------------- v1.0.2 >
        // Verify that cookies and localStorage were cleared
        const verifyAuthToken = AuthCookieManager.getAuthToken();
        const verifyImpersonationToken = AuthCookieManager.getImpersonationToken();
        const verifyEffectivePermissions = localStorage.getItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        const verifySuperAdminPermissions = localStorage.getItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);

        // Only use aggressive fallback if we're not in the "both tokens" scenario
        // In the "both tokens" scenario, we expect the authToken to be cleared but impersonationToken to remain
        const originalAuthToken = authToken;
        const originalImpersonationToken = impersonationToken;

        if (originalAuthToken && originalImpersonationToken) {
          // Scenario 3: Both tokens existed - only authToken should be cleared
          if (verifyAuthToken && !verifyImpersonationToken) {
            clearCookie(AUTH_TOKEN_KEY);
          } else if (!verifyAuthToken && verifyImpersonationToken) {
            // <---------------------- v1.0.2
          } else {
            await AuthCookieManager.clearAllAuth();
          }
        } else {
          // Other scenarios: both tokens should be cleared
          if (verifyAuthToken || verifyImpersonationToken) {
            await AuthCookieManager.clearAllAuth();
            // ---------------------- v1.0.2 >
          }
        }

      }, 100);
      
    } catch (error) {
      console.error('Error during smart logout:', error);
      // Ensure loading is turned off even if there's an error
      if (setLoading) {
        setLoading(false);
      }
      // Fallback to main domain organization login
      window.location.href = process.env.NODE_ENV === 'production' ? "https://app.upinterview.io/organization-login" : "http://localhost:3000/organization-login";
      // navigate("/organization-login");

    }
  }
  // ---------------------- v1.0.2 >

  // Simplified logout for token expiration (no navigation required)
  static async handleTokenExpiration() {
    try {
      console.log('🔄 Handling token expiration...');
      
      // Reset permission preload flag
      const { resetPermissionPreload } = await import("../permissionPreloader");
      resetPermissionPreload();
      
      // Get current authentication state
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();

      // Helper function to clear cookies
      const clearCookie = (name) => {
        try {
          const currentDomain = window.location.hostname;
          const isLocalhost = currentDomain === 'localhost' || currentDomain.includes('127.0.0.1');
          
          const clearOptions = {
            expires: new Date(0),
            path: '/',
            secure: !isLocalhost,
            sameSite: isLocalhost ? 'Lax' : 'None'
          };
          
          if (!isLocalhost && currentDomain.includes('upinterview.io')) {
            clearOptions.domain = '.upinterview.io';
          }
          
          Cookies.set(name, '', clearOptions);
        } catch (error) {
          console.error(`Error clearing cookie ${name}:`, error);
        }
      };

      // Clear all authentication data based on current state
      if (impersonationToken && !authToken) {
        // Clear super admin related data
        clearCookie(IMPERSONATION_TOKEN_KEY);
        localStorage.removeItem(IMPERSONATED_USER_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('superAdmin');
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(SUPER_ADMIN_PERMISSIONS_CACHE_TIMESTAMP);
        
      } else if (authToken && !impersonationToken) {
        // Clear effective user related data
        clearCookie(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        AuthCookieManager.clearPermissions('effective');
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_KEY);
        localStorage.removeItem(EFFECTIVE_PERMISSIONS_CACHE_TIMESTAMP);
        localStorage.removeItem('app_permissions_cache');
        localStorage.removeItem('permissions_effective');
        localStorage.removeItem('app_permissions_timestamp');
        
      } else if (authToken && impersonationToken) {
        // Clear effective user data, keep super admin data
        clearCookie(AUTH_TOKEN_KEY);
        AuthCookieManager.clearPermissions('effective');
        AuthCookieManager.clearAllPermissionCaches();
        localStorage.removeItem(USER_TYPE_KEY);
      }

      // Always redirect to login page for token expiration
      const loginUrl = process.env.NODE_ENV === 'production' 
        ? "https://app.upinterview.io/organization-login" 
        : "http://localhost:3000/organization-login";
      
      window.location.href = loginUrl;
      
    } catch (error) {
      console.error('❌ Error handling token expiration:', error);
      // Fallback: redirect to login
      window.location.href = process.env.NODE_ENV === 'production' 
        ? "https://app.upinterview.io/organization-login" 
        : "http://localhost:3000/organization-login";
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
  static async clearAllAuth() {
    try {
      // Reset permission preload flag
      const { resetPermissionPreload } = await import("../permissionPreloader");

      resetPermissionPreload();
      // ---------------------- v1.0.2 >
      
      // Clear localStorage
      localStorage.clear();

      // Get current domain for proper cookie clearing
      const currentDomain = window.location.hostname;
      
      const clearOptions = {
        expires: new Date(0),
        secure: true,
        sameSite: 'None',
        path: '/'
      };
      

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
        }
      });

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

    try {
      // Step 1: Set auth token (effective user token) if provided
      if (data.authToken) {
        AuthCookieManager.setAuthToken(data.authToken);
      } else {
        console.log('⚠️ No auth token provided');
      }

      // Step 2: Set impersonation token (super admin token) if provided
      if (data.impersonationToken) {
        AuthCookieManager.setImpersonationToken(data.impersonationToken, data.impersonatedUser);
      } else {
        console.log('⚠️ No impersonation token provided');
      }

      // Step 3: Update user type based on current token state
      AuthCookieManager.updateUserType();

      // Step 4: Verify final state
      const finalAuthToken = AuthCookieManager.getAuthToken();
      const finalImpersonationToken = AuthCookieManager.getImpersonationToken();
      const finalUserType = AuthCookieManager.getUserType();

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

  // Detect if we're in a new browser context
  static isNewBrowserContext() {
    try {
      const contextId = sessionStorage.getItem('browser_context_id');
      if (!contextId) {
        // Generate new context ID
        const newContextId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem('browser_context_id', newContextId);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Could not check browser context:', e);
      return true; // Assume new context if we can't check
    }
  }

  // Validate token expiration periodically
  static startTokenValidation() {
    // Check tokens every 5 minutes
    const validationInterval = setInterval(() => {
      try {
        const authToken = this.getAuthToken();
        const impersonationToken = this.getImpersonationToken();
        
        // If no tokens exist, clear the interval
        if (!authToken && !impersonationToken) {
          clearInterval(validationInterval);
          return;
        }
        
        // Validation is already done in getAuthToken() and getImpersonationToken()
        // This just ensures we check periodically
        console.log('Token validation check completed');
        
      } catch (error) {
        console.error('Error during token validation:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Return cleanup function
    return () => clearInterval(validationInterval);
  }

  // Check if token will expire soon (within 1 hour)
  static isTokenExpiringSoon(token) {
    try {
      if (!token) return false;
      
      const decoded = jwtDecode(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const oneHour = 60 * 60; // 1 hour in seconds
        return (decoded.exp - currentTime) <= oneHour;
      }
      return false;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return false;
    }
  }
  // ---------------------- v1.0.2 >

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
// <---------------------- v1.0.2
export const handleTokenExpiration = AuthCookieManager.handleTokenExpiration;
// ---------------------- v1.0.2 >






export default AuthCookieManager;