import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all internal logs with infinite scroll
export const useInternalLogs = ({
  limit = 20,
  search = "",
  status = "",
  severity = "",
  processName = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InternalLogs?.View;
  const hasAnyPermissions =
    superAdminPermissions && Object.keys(superAdminPermissions).length > 0;
  const isEnabled = Boolean(hasAnyPermissions || isInitialized);

  const {
    data: infiniteData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "internalLogs",
      limit,
      search,
      status,
      severity,
      processName,
      startDate,
      endDate,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pageParam.toString());
      queryParams.append("limit", limit.toString());
      if (search) queryParams.append("search", search);
      if (status) queryParams.append("status", status);
      if (severity) queryParams.append("severity", severity);
      if (processName) queryParams.append("processName", processName);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/internal-logs?${queryParams.toString()}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination?.hasNext) {
        return (pagination?.currentPage ?? 0) + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const logs = infiniteData?.pages?.flatMap((p) => p?.data || []) || [];
  const firstPagination = infiniteData?.pages?.[0]?.pagination || {};
  const firstStats = infiniteData?.pages?.[0]?.stats || {};

  return {
    logs,
    pagination: {
      ...firstPagination,
      totalItems: firstPagination.totalItems || 0,
      hasNext: !!hasNextPage,
    },
    stats: {
      totalLogs: firstStats.totalLogs || 0,
      errorLogs: firstStats.errorLogs || 0,
      warningLogs: firstStats.warningLogs || 0,
      successLogs: firstStats.successLogs || 0,
    },
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

// Hook to fetch internal log by ID
export const useInternalLogById = (logId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InternalLogs?.View;

  const {
    data: log = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["internalLog", logId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/internal-logs/${logId}`
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
    log,
    isLoading,
    isError,
    error,
    refetch,
  };
};
