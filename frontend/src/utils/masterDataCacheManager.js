// Utility for managing master data cache across the application
import { useQueryClient } from '@tanstack/react-query';

// Map frontend types to API endpoints
const TYPE_TO_QUERY_KEY_MAP = {
  'industries': 'industries',
  'technologies': 'technology', 
  'skills': 'skills',
  'locations': 'locations',
  'roles': 'roles',
  'qualifications': 'qualification',
  'colleges': 'universitycollege',
  'companies': 'company',
  'category': 'category'
};

/**
 * Invalidate specific master data type cache
 * This forces all users to refetch data on next access
 */
export const invalidateMasterDataCache = async (queryClient, type) => {
  const queryKey = TYPE_TO_QUERY_KEY_MAP[type] || type;
  
  // Invalidate the specific cache
  await queryClient.invalidateQueries({ 
    queryKey: ['masterData', queryKey] 
  });
  
  console.log(`Cache invalidated for master data type: ${type}`);
};

/**
 * Invalidate all master data caches
 * Use when major updates occur
 */
export const invalidateAllMasterDataCache = async (queryClient) => {
  await queryClient.invalidateQueries({ 
    queryKey: ['masterData'] 
  });
  
  console.log('All master data caches invalidated');
};

/**
 * Force refresh specific master data
 * Immediately fetches new data
 */
export const refreshMasterData = async (queryClient, type) => {
  const queryKey = TYPE_TO_QUERY_KEY_MAP[type] || type;
  
  // Invalidate and refetch
  await queryClient.invalidateQueries({ 
    queryKey: ['masterData', queryKey],
    refetchType: 'all'
  });
};

/**
 * Check if master data is stale
 * Returns true if data needs refresh
 */
export const isMasterDataStale = (queryClient, type) => {
  const queryKey = TYPE_TO_QUERY_KEY_MAP[type] || type;
  const query = queryClient.getQueryState(['masterData', queryKey]);
  
  if (!query) return true;
  
  const now = Date.now();
  const dataUpdatedAt = query.dataUpdatedAt;
  const staleTime = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  return (now - dataUpdatedAt) > staleTime;
};

/**
 * Get cache statistics for debugging
 */
export const getMasterDataCacheStats = (queryClient) => {
  const queries = queryClient.getQueryCache().getAll();
  const masterDataQueries = queries.filter(q => 
    q.queryKey[0] === 'masterData'
  );
  
  return masterDataQueries.map(q => ({
    type: q.queryKey[1],
    status: q.state.status,
    dataUpdatedAt: new Date(q.state.dataUpdatedAt),
    dataAge: Date.now() - q.state.dataUpdatedAt,
    isStale: q.isStale(),
    dataSize: JSON.stringify(q.state.data || {}).length
  }));
};

/**
 * Clear all master data from cache and storage
 * Use for logout or data reset
 */
export const clearAllMasterData = async (queryClient) => {
  // Remove from React Query cache
  queryClient.removeQueries({ queryKey: ['masterData'] });
  
  // Clear from IndexedDB/localforage
  if (typeof window !== 'undefined' && window.localforage) {
    try {
      await window.localforage.clear();
      console.log('Master data cleared from storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

/**
 * Hook to use cache manager
 */
export const useMasterDataCacheManager = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateCache: (type) => invalidateMasterDataCache(queryClient, type),
    invalidateAll: () => invalidateAllMasterDataCache(queryClient),
    refresh: (type) => refreshMasterData(queryClient, type),
    isStale: (type) => isMasterDataStale(queryClient, type),
    getStats: () => getMasterDataCacheStats(queryClient),
    clearAll: () => clearAllMasterData(queryClient)
  };
};

const masterDataCacheManager = {
  invalidateMasterDataCache,
  invalidateAllMasterDataCache,
  refreshMasterData,
  isMasterDataStale,
  getMasterDataCacheStats,
  clearAllMasterData,
  useMasterDataCacheManager
};

export default masterDataCacheManager;
