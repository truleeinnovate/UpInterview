import Cookies from 'js-cookie';
import axios from 'axios';

// Configuration
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity before logout
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // Refresh token every 30 minutes

// State tracking
let countdownInterval;
let lastActivityTime = Date.now();
let activityTimer;
let tokenRefreshTimer;

// Simple throttle function to limit how often a function can be called
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// No longer logging remaining time

// Reset the activity timer
function resetActivityTimer() {
  // Clear any existing timer
  if (activityTimer) clearTimeout(activityTimer);
  
  // Update last activity time
  lastActivityTime = Date.now();
  
  // Set new timer
  activityTimer = setTimeout(() => {
    // Clear the auth token to force logout
    Cookies.remove('authToken', { path: '/' });
    
    // Dispatch the userInactive event to trigger navigation
    const event = new Event('userInactive');
    window.dispatchEvent(event);
    
    // Force a hard redirect to login page to ensure immediate navigation
    window.location.href = '/organization-login';
  }, INACTIVITY_TIMEOUT);
}

// Handle user activity
const handleActivity = () => {
  resetActivityTimer();
  resetAuthToken();
};

export const startActivityTracking = () => {
  // Set up event listeners for user activity
  const events = [
    'mousedown', 'mousemove', 'keydown', 'keypress', 'keyup',
    'touchmove', 'touchend', 'touchstart', 'click', 'scroll',
    'wheel', 'focus', 'input', 'change', 'drag', 'drop',
    'pointerdown', 'pointermove', 'pointerup'
  ];
  
  // Add event listeners with throttling
  const throttledActivity = throttle(handleActivity, 1000);
  
  // Add all event listeners
  events.forEach(event => {
    window.addEventListener(event, throttledActivity, { passive: true, capture: true });
  });
  
  // Start the initial timer
  resetActivityTimer();
  
  // Set up token refresh
  const setupTokenRefresh = () => {
    // Clear any existing refresh timer
    if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
    
    // Set up periodic token refresh
    tokenRefreshTimer = setInterval(async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) return;
        
        const response = await axios.post('/api/auth/refresh-token', { token });
        
        if (response.data.token) {
          const expires = new Date();
          expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
          
          Cookies.set('authToken', response.data.token, {
            expires,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          });
          
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  };
  
  // Start token refresh
  setupTokenRefresh();
  
  console.log(`Activity tracking started - session will expire after ${INACTIVITY_TIMEOUT/1000} seconds of inactivity`);

  // Return cleanup function
  return () => {
    console.log('Cleaning up activity tracker');
    
    // Clear all timers
    if (activityTimer) clearTimeout(activityTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
    
    // Remove all event listeners
    const events = [
      'mousedown', 'mousemove', 'keydown', 'keypress', 'keyup',
      'touchmove', 'touchend', 'touchstart', 'click', 'scroll',
      'wheel', 'focus', 'input', 'change', 'drag', 'drop',
      'pointerdown', 'pointermove', 'pointerup'
    ];
    
    // Create a new throttled function to match the one used in addEventListener
    const throttledActivity = throttle(handleActivity, 1000);
    
    events.forEach(event => {
      window.removeEventListener(event, throttledActivity, { passive: true, capture: true });
    });
    
    console.log('Activity tracker cleanup complete');
  };
};

export const refreshAuthToken = async () => {
  try {
    const authToken = Cookies.get('authToken');
    if (!authToken) return null;

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    if (response.data.token) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (30 * 1000)); // 30 seconds from now
      
      Cookies.set('authToken', response.data.token, {
        expires,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Setup token refresh interval
const setupTokenRefresh = () => {
  // Clear existing timer if any
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
  }
  
  // Set up new refresh interval
  tokenRefreshTimer = setInterval(() => {
    refreshAuthToken().catch(console.error);
  }, TOKEN_REFRESH_INTERVAL);
};

// Reset the token refresh interval on user activity
export const resetAuthToken = () => {
  const authToken = Cookies.get('authToken');
  if (authToken) {
    // Reset the cookie with a new expiration
    const expires = new Date();
    expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    Cookies.set('authToken', authToken, { 
      expires,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    
    // Reset the refresh interval
    setupTokenRefresh();
  }
};

// startActivityTracking function is already defined above
