// v1.0.0 - Ashok - Added console statements to check data fetching

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all integration logs
export const useIntegrationLogs = (options = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.IntegrationLogs?.View;

  const {
    data: infiniteData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["integrationLogs", options],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = Number.isFinite(options.limit) ? options.limit : 10;
      const search =
        typeof options.search === "string" ? options.search : undefined;
      const statusParam = Array.isArray(options.status)
        ? options.status.join(",")
        : typeof options.status === "string"
        ? options.status
        : undefined;
      const severityParam = Array.isArray(options.severity)
        ? options.severity.join(",")
        : typeof options.severity === "string"
        ? options.severity
        : undefined;

      const axiosConfig = {
        params: {
          page: pageParam,
          limit,
          search,
          status: statusParam,
          severity: severityParam,
        },
      };

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/integration-logs`,
        axiosConfig
      );
      return response.data ?? null;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.pagination) return undefined;
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const integrations = infiniteData?.pages?.flatMap((p) => p?.data || []) || [];
  const firstPage = infiniteData?.pages?.[0];
  const stats = firstPage?.stats || null;
  const totalItems = firstPage?.pagination?.totalItems || integrations.length;

  return {
    integrations,
    stats,
    totalItems,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

// Hook to fetch integration log by ID
export const useIntegrationLogById = (logId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.IntegrationLogs?.View;

  const {
    data: selectedLog = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["integrationLog", logId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/integration-logs/${logId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!logId,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    selectedLog,
    isLoading,
    isError,
    error,
    refetch,
  };
};
