import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

/**
 * Hook to fetch paginated wallet transactions from the backend.
 * @param {Object} options
 * @param {number} options.page - Page number (0-indexed)
 * @param {number} options.limit - Number of transactions per page
 * @param {string} options.search - Search term
 * @param {boolean} options.enabled - Whether to enable the query
 */
export const useWalletTransactions = ({ page = 0, limit = 20, search = '', enabled = true } = {}) => {
    const userId = AuthCookieManager.getCurrentUserId();

    return useQuery({
        queryKey: ['walletTransactions', userId, page, limit, search],
        queryFn: async () => {
            if (!userId) return { transactions: [], totalCount: 0, hasMore: false };
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/wallet/${userId}/transactions`,
                {
                    params: { page, limit, search: search || undefined },
                }
            );
            return response.data;
        },
        enabled: !!userId && enabled,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });
};
