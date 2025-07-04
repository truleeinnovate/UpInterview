// import Cookies from 'js-cookie';
// import axios from 'axios';

// // Configuration
// const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity before logout
// const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // Refresh token every 30 minutes

// // State tracking
// let countdownInterval;
// let lastActivityTime = Date.now();
// let activityTimer;
// let tokenRefreshTimer;

// // Simple throttle function to limit how often a function can be called
// function throttle(func, limit) {
//   let inThrottle;
//   return function() {
//     const args = arguments;
//     const context = this;
//     if (!inThrottle) {
//       func.apply(context, args);
//       inThrottle = true;
//       setTimeout(() => inThrottle = false, limit);
//     }
//   };
// }

// // No longer logging remaining time

// // Reset the activity timer
// function resetActivityTimer() {
//   // Clear any existing timer
//   if (activityTimer) clearTimeout(activityTimer);
  
//   // Update last activity time
//   lastActivityTime = Date.now();
  
//   // Set new timer
//   activityTimer = setTimeout(() => {
//     // Clear the auth token to force logout
//     Cookies.remove('authToken', { path: '/' });
    
//     // Dispatch the userInactive event to trigger navigation
//     const event = new Event('userInactive');
//     window.dispatchEvent(event);
    
//     // Force a hard redirect to login page to ensure immediate navigation
//     window.location.href = '/organization-login';
//   }, INACTIVITY_TIMEOUT);
// }

// // Handle user activity
// const handleActivity = () => {
//   resetActivityTimer();
//   resetAuthToken();
// };

// export const startActivityTracking = () => {
//   // Set up event listeners for user activity
//   const events = [
//     'mousedown', 'mousemove', 'keydown', 'keypress', 'keyup',
//     'touchmove', 'touchend', 'touchstart', 'click', 'scroll',
//     'wheel', 'focus', 'input', 'change', 'drag', 'drop',
//     'pointerdown', 'pointermove', 'pointerup'
//   ];
  
//   // Add event listeners with throttling
//   const throttledActivity = throttle(handleActivity, 1000);
  
//   // Add all event listeners
//   events.forEach(event => {
//     window.addEventListener(event, throttledActivity, { passive: true, capture: true });
//   });
  
//   // Start the initial timer
//   resetActivityTimer();
  
//   // Set up token refresh
//   const setupTokenRefresh = () => {
//     // Clear any existing refresh timer
//     if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
    
//     // Set up periodic token refresh
//     tokenRefreshTimer = setInterval(async () => {
//       try {
//         const token = Cookies.get('authToken');
//         if (!token) return;
        
//         const response = await axios.post('/api/auth/refresh-token', { token });
        
//         if (response.data.token) {
//           const expires = new Date();
//           expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
          
//           Cookies.set('authToken', response.data.token, {
//             expires,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict'
//           });
          
//           console.log('Token refreshed successfully');
//         }
//       } catch (error) {
//         console.error('Error refreshing token:', error);
//       }
//     }, TOKEN_REFRESH_INTERVAL);
//   };
  
//   // Start token refresh
//   setupTokenRefresh();
  
//   console.log(`Activity tracking started - session will expire after ${INACTIVITY_TIMEOUT/1000} seconds of inactivity`);

//   // Return cleanup function
//   return () => {
//     console.log('Cleaning up activity tracker');
    
//     // Clear all timers
//     if (activityTimer) clearTimeout(activityTimer);
//     if (countdownInterval) clearInterval(countdownInterval);
//     if (tokenRefreshTimer) clearInterval(tokenRefreshTimer);
    
//     // Remove all event listeners
//     const events = [
//       'mousedown', 'mousemove', 'keydown', 'keypress', 'keyup',
//       'touchmove', 'touchend', 'touchstart', 'click', 'scroll',
//       'wheel', 'focus', 'input', 'change', 'drag', 'drop',
//       'pointerdown', 'pointermove', 'pointerup'
//     ];
    
//     // Create a new throttled function to match the one used in addEventListener
//     const throttledActivity = throttle(handleActivity, 1000);
    
//     events.forEach(event => {
//       window.removeEventListener(event, throttledActivity, { passive: true, capture: true });
//     });
    
//     console.log('Activity tracker cleanup complete');
//   };
// };

// export const refreshAuthToken = async () => {
//   try {
//     const authToken = Cookies.get('authToken');
//     if (!authToken) return null;

//     const response = await axios.post(
//       `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
//       {},
//       {
//         headers: {
//           'Authorization': `Bearer ${authToken}`,
//           'Content-Type': 'application/json'
//         },
//         withCredentials: true
//       }
//     );

//     if (response.data.token) {
//       const expires = new Date();
//       expires.setTime(expires.getTime() + (30 * 1000)); // 30 seconds from now
      
//       Cookies.set('authToken', response.data.token, {
//         expires,
//         sameSite: 'strict',
//         secure: process.env.NODE_ENV === 'production',
//         path: '/'
//       });
      
//       return response.data.token;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     throw error;
//   }
// };

// // Setup token refresh interval
// const setupTokenRefresh = () => {
//   // Clear existing timer if any
//   if (tokenRefreshTimer) {
//     clearInterval(tokenRefreshTimer);
//   }
  
//   // Set up new refresh interval
//   tokenRefreshTimer = setInterval(() => {
//     refreshAuthToken().catch(console.error);
//   }, TOKEN_REFRESH_INTERVAL);
// };

// // Reset the token refresh interval on user activity
// export const resetAuthToken = () => {
//   const authToken = Cookies.get('authToken');
//   if (authToken) {
//     // Reset the cookie with a new expiration
//     const expires = new Date();
//     expires.setTime(expires.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
//     Cookies.set('authToken', authToken, { 
//       expires,
//       sameSite: 'strict',
//       secure: process.env.NODE_ENV === 'production',
//       path: '/'
//     });
    
//     // Reset the refresh interval
//     setupTokenRefresh();
//   }
// };






// utils/activityTracker.js
import Cookies from 'js-cookie';
import { EventEmitter } from 'events';

// console.log('activityTracker.js loaded');

// Configuration
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIMEOUT = INACTIVITY_TIMEOUT - (5 * 1000); // Show warning 5 seconds before logout
const CHECK_INTERVAL = 1000; // Check every minute

// Create event emitter
const activityEvents = new EventEmitter();

let lastActivityTime = Date.now();
let warningTimer;
let logoutTimer;
let checkInterval;

// Activity detection events
const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 'scroll', 'click',
  'touchstart', 'touchend', 'touchmove', 'wheel',
  'input', 'change', 'focus'
];

// Reset timers on activity
function resetTimers() {
  lastActivityTime = Date.now();

  // Clear existing timers
  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);

  // Set new timers
  warningTimer = setTimeout(showWarning, WARNING_TIMEOUT);
  logoutTimer = setTimeout(logoutUser, INACTIVITY_TIMEOUT);

  // Log activity detected
  // console.log('✅ Activity detected, timers reset.');

  // Update UI to show session is active
  activityEvents.emit('activity');
}

// Show warning UI
function showWarning() {
  // console.log('⚠️ Session will expire soon.');
  activityEvents.emit('warning', {
    message: 'Your session will expire due to inactivity soon.',
    remainingTime: 5 // here it's just 5 seconds for testing
  });
}
// Logout user and show expiration UI
function logoutUser() {
  // console.log('⏰ Session expired due to inactivity.');

  // Clear all cookies except those needed for super admin
  Cookies.remove('authToken', { path: '/' });
  
  // Emit logout event
  activityEvents.emit('logout');
  
  // Force show expiration UI
  showExpirationUI();
}

// Show expiration UI
function showExpirationUI() {
  // This will be handled by the React component listening to events
  activityEvents.emit('showExpiration');
}

// Initialize activity tracking
export function startActivityTracking() {
  resetTimers();

  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, resetTimers, { passive: true });
  });

  checkInterval = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;

    // Log remaining time every second
    // console.log(`⏳ Inactivity time remaining: ${Math.max(0, Math.ceil(timeRemaining / 1000))} seconds`);

    if (timeRemaining <= 0) {
      logoutUser();
    }
  }, CHECK_INTERVAL);

  return () => {
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, resetTimers);
    });
    clearTimeout(warningTimer);
    clearTimeout(logoutTimer);
    clearInterval(checkInterval);
  };
}

// Get the event emitter for React components to listen to
export function getActivityEmitter() {
  return activityEvents;
}