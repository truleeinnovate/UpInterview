import { lazy } from "react";

/**
 * A wrapper around React.lazy that retries the dynamic import if it fails.
 * This is useful for handling network errors or chunk load failures.
 * 
 * @param {Function} componentImport A function that returns a Promise (dynamic import)
 * @param {number} retries Number of times to retry before failing
 * @param {number} interval Time in ms between retries
 * @returns {React.Component} A lazy-loaded component with retry logic
 */
export const lazyWithRetry = (componentImport, retries = 2, interval = 1000) => {
    return lazy(async () => {
        try {
            return await componentImport();
        } catch (error) {
            if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, interval));
                return lazyWithRetry(componentImport, retries - 1, interval)._payload._result();
            }
            throw error;
        }
    });
};

/**
 * Alternative implementation using a simpler loop
 */
export const lazyRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
            window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
        );

        try {
            return await componentImport();
        } catch (error) {
            if (!pageHasAlreadyBeenForceRefreshed) {
                // Clear the cache/force refresh once if it fails
                window.localStorage.setItem('page-has-been-force-refreshed', 'true');
                return window.location.reload();
            }

            // If it still fails after a refresh, let the ErrorBoundary handle it
            throw error;
        }
    });

export default lazyWithRetry;
