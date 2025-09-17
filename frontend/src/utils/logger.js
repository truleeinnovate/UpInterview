// Logger utility for development vs production with production control
const isDevelopment = process.env.REACT_NODE_ENV === 'production';

// Global logging control
let isProductionLoggingEnabled = false;
let logLevel = isDevelopment ? 'debug' : 'error'; // 'debug', 'info', 'warn', 'error', 'none'

// Check if user wants to see logs (via localStorage or URL param)
const checkUserLoggingPreference = () => {
  // Check URL parameter for debugging
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  
  // Check localStorage for user preference
  const userPreference = localStorage.getItem('enableProductionLogs');
  
  return debugParam === 'true' || userPreference === 'true';
};

// Initialize logging preference
if (!isDevelopment) {
  isProductionLoggingEnabled = checkUserLoggingPreference();
}

export const logger = {
  // Set log level 
  setLogLevel: (level) => {
    logLevel = level;
  },
  
  // Enable/disable production logging
  enableProductionLogs: (enabled = true) => {
    isProductionLoggingEnabled = enabled;
    localStorage.setItem('enableProductionLogs', enabled.toString());
  },
  
  // Check if logging should happen
  shouldLog: (level) => {
    if (isDevelopment) return true;
    if (!isProductionLoggingEnabled) return false;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
    return levels[level] >= levels[logLevel];
  },
  
  // Only log in development or when explicitly enabled in production
  log: (...args) => {
    if (logger.shouldLog('debug')) {
      console.log(...args);
    }
  },
  
  // Always log errors (but can be controlled)
  error: (...args) => {
    if (logger.shouldLog('error')) {
      console.error(...args);
    }
  },
  
  // Only log warnings in development or when enabled
  warn: (...args) => {
    if (logger.shouldLog('warn')) {
      console.warn(...args);
    }
  },
  
  // Only log info in development or when enabled
  info: (...args) => {
    if (logger.shouldLog('info')) {
      console.info(...args);
    }
  },
  
  // Performance logging (always enabled for monitoring)
  performance: (...args) => {
    console.log('[PERFORMANCE]', ...args);
  },
  
  // Debug logging (only in development or when explicitly enabled)
  debug: (...args) => {
    if (logger.shouldLog('debug')) {
      console.debug(...args);
    }
  },
  
  // Force log (always shows, even in production)
  force: (...args) => {
    console.log('[FORCE LOG]', ...args);
  },
  
  // Get current logging status
  getStatus: () => ({
    isDevelopment,
    isProductionLoggingEnabled,
    logLevel,
    canLog: logger.shouldLog('debug')
  })
};

/**
 * Replace console methods with logger
 * - In DEVELOPMENT: console works as usual
 * - In PRODUCTION: completely disable console.log/info/debug/warn
 *   (only console.error works if logger allows it)
 */
export const replaceConsoleLogs = () => {
  if (!isDevelopment) {
    // 🚨 Important Change:
    // In production, disable console methods so they won't appear anywhere
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
    // Note: console.error is not disabled, because errors are usually important
    // If you also want to disable errors, uncomment the next line:
    // console.error = () => {};
  }
};

// Add global access for debugging
if (typeof window !== 'undefined') {
  window.enableLogs = logger.enableProductionLogs;
  window.setLogLevel = logger.setLogLevel;
  window.getLogStatus = logger.getStatus;
}








// // Logger utility for development vs production with production control
// const isDevelopment = process.env.NODE_ENV === 'development';

// // Global logging control
// let isProductionLoggingEnabled = false;
// let logLevel = isDevelopment ? 'debug' : 'error'; // 'debug', 'info', 'warn', 'error', 'none'

// // Check if user wants to see logs (via localStorage or URL param)
// const checkUserLoggingPreference = () => {
//   // Check URL parameter for debugging
//   const urlParams = new URLSearchParams(window.location.search);
//   const debugParam = urlParams.get('debug');
  
//   // Check localStorage for user preference
//   const userPreference = localStorage.getItem('enableProductionLogs');
  
//   return debugParam === 'true' || userPreference === 'true';
// };

// // Initialize logging preference
// if (!isDevelopment) {
//   isProductionLoggingEnabled = checkUserLoggingPreference();
// }

// export const logger = {
//   // Set log level 
//   setLogLevel: (level) => {
//     logLevel = level;
//   },
  
//   // Enable/disable production logging
//   enableProductionLogs: (enabled = true) => {
//     isProductionLoggingEnabled = enabled;
//     localStorage.setItem('enableProductionLogs', enabled.toString());
//   },
  
//   // Check if logging should happen
//   shouldLog: (level) => {
//     if (isDevelopment) return true;
//     if (!isProductionLoggingEnabled) return false;
    
//     const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
//     return levels[level] >= levels[logLevel];
//   },
  
//   // Only log in development or when explicitly enabled in production
//   log: (...args) => {
//     if (logger.shouldLog('debug')) {
//       console.log(...args);
//     }
//   },
  
//   // Always log errors (but can be controlled)
//   error: (...args) => {
//     if (logger.shouldLog('error')) {
//       console.error(...args);
//     }
//   },
  
//   // Only log warnings in development or when enabled
//   warn: (...args) => {
//     if (logger.shouldLog('warn')) {
//       console.warn(...args);
//     }
//   },
  
//   // Only log info in development or when enabled
//   info: (...args) => {
//     if (logger.shouldLog('info')) {
//       console.info(...args);
//     }
//   },
  
//   // Performance logging (always enabled for monitoring)
//   performance: (...args) => {
//     console.log('[PERFORMANCE]', ...args);
//   },
  
//   // Debug logging (only in development or when explicitly enabled)
//   debug: (...args) => {
//     if (logger.shouldLog('debug')) {
//       console.debug(...args);
//     }
//   },
  
//   // Force log (always shows, even in production)
//   force: (...args) => {
//     console.log('[FORCE LOG]', ...args);
//   },
  
//   // Get current logging status
//   getStatus: () => ({
//     isDevelopment,
//     isProductionLoggingEnabled,
//     logLevel,
//     canLog: logger.shouldLog('debug')
//   })
// };

// // Replace console.log with logger.log in components
// export const replaceConsoleLogs = () => {
//   if (!isDevelopment && !isProductionLoggingEnabled) {
//     // Disable console.log in production only if not explicitly enabled
//     console.log = () => {};
//     console.debug = () => {};
//     console.info = () => {};
//     console.warn = () => {};
//   }
// };

// // Add global access for debugging
// if (typeof window !== 'undefined') {
//   window.enableLogs = logger.enableProductionLogs;
//   window.setLogLevel = logger.setLogLevel;
//   window.getLogStatus = logger.getStatus;
// } 