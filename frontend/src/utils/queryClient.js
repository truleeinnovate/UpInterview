// React Query Client Configuration
import { QueryClient } from '@tanstack/react-query';

// Cache time constants
export const FIVE_MINUTES = 5 * 60 * 1000;
export const TEN_MINUTES = 10 * 60 * 1000;
export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const ONE_WEEK = 7 * ONE_DAY;
export const TWO_WEEKS = 14 * ONE_DAY;

// Create QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default options for all queries
      staleTime: FIVE_MINUTES,        // 5 minutes for regular queries
      cacheTime: TEN_MINUTES,         // 10 minutes for regular queries
      refetchOnWindowFocus: false,    // Don't refetch when window regains focus
      refetchOnMount: false,          // Don't refetch when component mounts
      retry: 1,                       // Retry failed requests once
      networkMode: 'online',          // Only fetch when online
    },
    mutations: {
      retry: 0,                       // Don't retry mutations
      networkMode: 'online',          // Only mutate when online
    },
  },
});

// Export a function to get query client (useful for SSR or testing)
export const getQueryClient = () => queryClient;

// Export default query options for consistency
export const defaultQueryOptions = {
  staleTime: FIVE_MINUTES,
  cacheTime: TEN_MINUTES,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
};

// Export master data specific options
export const masterDataQueryOptions = {
  staleTime: ONE_WEEK,           // 7 days for master data
  cacheTime: TWO_WEEKS,          // 14 days for master data
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
};

export default queryClient;
