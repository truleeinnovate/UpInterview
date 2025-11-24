// Console filter to reduce ZegoCloud verbose logging
export const setupConsoleFilter = () => {
    // Store original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Filter function to check if log should be suppressed
    const shouldSuppress = (message) => {
        if (typeof message === 'string') {
            // Suppress ZegoCloud verbose logs
            return message.includes('ZegoExpressLogger') ||
                message.includes('"level":1') ||
                message.includes('"level":2') ||
                message.includes('socket') ||
                message.includes('connection') ||
                message.includes('wss://') ||
                message.includes('appid') ||
                message.includes('roomid') ||
                message.includes('userid') ||
                message.includes('sessionid');
        }
        if (typeof message === 'object' && message !== null) {
            const messageStr = JSON.stringify(message);
            return messageStr.includes('ZegoExpressLogger') ||
                messageStr.includes('"level":1') ||
                messageStr.includes('"level":2') ||
                messageStr.includes('socket') ||
                messageStr.includes('connection') ||
                messageStr.includes('wss://') ||
                messageStr.includes('appid') ||
                messageStr.includes('roomid') ||
                messageStr.includes('userid') ||
                messageStr.includes('sessionid');
        }
        return false;
    };

    // Override console.log
    console.log = (...args) => {
        if (!shouldSuppress(args[0])) {
            originalLog.apply(console, args);
        }
    };

    // Override console.warn
    console.warn = (...args) => {
        if (!shouldSuppress(args[0])) {
            originalWarn.apply(console, args);
        }
    };

    // Override console.info
    console.info = (...args) => {
        if (!shouldSuppress(args[0])) {
            originalInfo.apply(console, args);
        }
    };

    // Also try to disable ZegoCloud's internal logger
    try {
        // Override the global console.error to filter ZegoCloud logs
        const originalError = console.error;
        console.error = (...args) => {
            if (!shouldSuppress(args[0])) {
                originalError.apply(console, args);
            }
        };
    } catch (error) {
        // Ignore if this fails
    }


    // Try to override ZegoCloud's internal logger
    try {
        // Override the global console methods more aggressively
        const originalMethods = {
            log: console.log,
            warn: console.warn,
            info: console.info,
            error: console.error
        };

        // Create a more aggressive filter
        const aggressiveFilter = (method, args) => {
            const firstArg = args[0];
            if (typeof firstArg === 'string' && (
                firstArg.includes('ZegoExpressLogger') ||
                firstArg.includes('"level":') ||
                firstArg.includes('socket') ||
                firstArg.includes('connection') ||
                firstArg.includes('wss://') ||
                firstArg.includes('appid') ||
                firstArg.includes('roomid') ||
                firstArg.includes('userid') ||
                firstArg.includes('sessionid') ||
                firstArg.includes('frequently shutdown') ||
                firstArg.includes('socket close') ||
                firstArg.includes('socket open')
            )) {
                return; // Suppress this log
            }

            if (typeof firstArg === 'object' && firstArg !== null) {
                const str = JSON.stringify(firstArg);
                if (str.includes('ZegoExpressLogger') ||
                    str.includes('"level":') ||
                    str.includes('socket') ||
                    str.includes('connection') ||
                    str.includes('wss://') ||
                    str.includes('appid') ||
                    str.includes('roomid') ||
                    str.includes('userid') ||
                    str.includes('sessionid')) {
                    return; // Suppress this log
                }
            }

            // Allow the log to proceed
            originalMethods[method].apply(console, args);
        };

        // Override all console methods
        console.log = (...args) => aggressiveFilter('log', args);
        console.warn = (...args) => aggressiveFilter('warn', args);
        console.info = (...args) => aggressiveFilter('info', args);
        console.error = (...args) => aggressiveFilter('error', args);

    } catch (error) {
    }
};

// Function to restore original console methods
export const restoreConsole = () => {
    // This would restore original console methods if needed
}; 