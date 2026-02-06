import { useState, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';
import Cookies from 'js-cookie';

const API_BASE_URL = config.REACT_APP_API_URL;

/**
 * Hook for global search functionality
 */
export const useGlobalSearch = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const globalSearch = useCallback(async ({ query, mode = 'contains', filter = null, limit = 10 }) => {
        if (!query || query.trim().length === 0) {
            setResults(null);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: query.trim(),
                mode,
                limit: limit.toString()
            });

            if (filter) {
                params.append('filter', filter);
            }

            const authToken = Cookies.get("authToken") ?? "";
            const response = await axios.get(
                `${API_BASE_URL}/api/global-search?${params.toString()}`,
                {
                    headers: authToken
                        ? {
                            Authorization: `Bearer ${authToken}`,
                        }
                        : undefined,
                    withCredentials: true,
                }

            );

            if (response.data.success) {
                setResults(response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Search failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Search failed';
            setError(errorMessage);
            console.error('Global search error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
    }, []);

    return {
        globalSearch,
        clearResults,
        loading,
        error,
        results
    };
};

export default useGlobalSearch;
