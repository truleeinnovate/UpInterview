// // utils/activityTracker.js
// import { EventEmitter } from 'events';

// // console.log('activityTracker.js loaded');

// // Configuration
// const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
// // const INACTIVITY_TIMEOUT = 10 * 1000; // 1 minute
// const WARNING_TIMEOUT = INACTIVITY_TIMEOUT - (5 * 1000); // Show warning 5 seconds before logout
// const CHECK_INTERVAL = 1000; // Check every minute

// // Create event emitter
// const activityEvents = new EventEmitter();

// let lastActivityTime = Date.now();
// let warningTimer;
// let logoutTimer;
// let checkInterval;

// // Activity detection events
// const ACTIVITY_EVENTS = [
//     'mousedown', 'mousemove', 'keydown', 'scroll', 'click',
//     'touchstart', 'touchend', 'touchmove', 'wheel',
//     'input', 'change', 'focus'
// ];

// // Reset timers on activity
// function resetTimers() {
//     lastActivityTime = Date.now();

//     // Clear existing timers
//     clearTimeout(warningTimer);
//     clearTimeout(logoutTimer);

//     // Set new timers
//     warningTimer = setTimeout(showWarning, WARNING_TIMEOUT);
//     logoutTimer = setTimeout(logoutUser, INACTIVITY_TIMEOUT);

//     // Log activity detected
//     //   console.log('✅ Activity detected, timers reset.');

//     // Update UI to show session is active
//     activityEvents.emit('activity');
// }

// // Show warning UI
// function showWarning() {
//     console.log('⚠️ Session will expire soon.');
//     activityEvents.emit('warning', {
//         message: 'Your session will expire due to inactivity soon.',
//         remainingTime: 5 // here it's just 5 seconds for testing
//     });
// }
// // Logout user and show expiration UI
// function logoutUser() {
//     //   console.log('⏰ Session expired due to inactivity.');
//     // Do NOT clear cookies here. Keep UI/components rendered until user explicitly clicks Log In.
//     // Emit logout event
//     activityEvents.emit('logout');

//     // Force show expiration UI
//     showExpirationUI();
// }

// // Show expiration UI
// function showExpirationUI() {
//     // This will be handled by the React component listening to events
//     try {
//         window.sessionExpirationVisible = true;
//     } catch (e) {
//         // ignore if window not available
//     }
//     activityEvents.emit('showExpiration');
// }

// // Initialize activity tracking
// export function startActivityTracking() {
//     resetTimers();

//     ACTIVITY_EVENTS.forEach(event => {
//         window.addEventListener(event, resetTimers, { passive: true });
//     });

//     checkInterval = setInterval(() => {
//         const timeSinceLastActivity = Date.now() - lastActivityTime;
//         const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;

//         // Log remaining time every second
//         // console.log(`⏳ Inactivity time remaining: ${Math.max(0, Math.ceil(timeRemaining / 1000))} seconds`);

//         if (timeRemaining <= 0) {
//             logoutUser();
//         }
//     }, CHECK_INTERVAL);

//     return () => {
//         ACTIVITY_EVENTS.forEach(event => {
//             window.removeEventListener(event, resetTimers);
//         });
//         clearTimeout(warningTimer);
//         clearTimeout(logoutTimer);
//         clearInterval(checkInterval);
//     };
// }

// // Get the event emitter for React components to listen to
// export function getActivityEmitter() {
//     return activityEvents;
// }






// utils/activityTracker.js
import { EventEmitter } from 'events';

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIMEOUT = INACTIVITY_TIMEOUT - (5 * 1000);
const CHECK_INTERVAL = 1000;

const activityEvents = new EventEmitter();

let lastActivityTime = Date.now();
let warningTimer;
let logoutTimer;
let checkInterval;

// List of user actions considered as activity
const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 'scroll', 'click',
  'touchstart', 'touchend', 'touchmove', 'wheel', 'input', 'change', 'focus'
];

// 🔹 Persist last activity time in localStorage
function updateLastActivityTime() {
  lastActivityTime = Date.now();
  localStorage.setItem('lastActivityTime', lastActivityTime.toString());
}

// Reset timers on activity
function resetTimers() {
  updateLastActivityTime();

  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);

  warningTimer = setTimeout(showWarning, WARNING_TIMEOUT);
  logoutTimer = setTimeout(logoutUser, INACTIVITY_TIMEOUT);

  activityEvents.emit('activity');
}

// Show warning UI
function showWarning() {
  activityEvents.emit('warning', {
    message: 'Your session will expire due to inactivity soon.',
    remainingTime: 5,
  });
}

// Logout user and show expiration UI
function logoutUser() {
  activityEvents.emit('logout');
  showExpirationUI();
}

// Show expiration UI
function showExpirationUI() {
  try {
    window.sessionExpirationVisible = true;
  } catch {}
  activityEvents.emit('showExpiration');
}

// ✅ Check last activity even after browser restart
function checkInitialActivity() {
  const savedTime = parseInt(localStorage.getItem('lastActivityTime'), 10);

  if (savedTime) {
    const now = Date.now();
    const timeSinceLast = now - savedTime;

    if (timeSinceLast > INACTIVITY_TIMEOUT) {
      // ⏰ User was inactive too long (even if browser was closed)
      logoutUser();
      return false;
    }
  }

  // If not expired, update the last activity time
  updateLastActivityTime();
  return true;
}

// Start tracking
export function startActivityTracking() {
  const stillActive = checkInitialActivity();
  if (!stillActive) return () => {}; // Stop initialization if already expired

  resetTimers();

  ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, resetTimers, { passive: true });
  });

  checkInterval = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    const timeRemaining = INACTIVITY_TIMEOUT - timeSinceLastActivity;

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

export function getActivityEmitter() {
  return activityEvents;
}