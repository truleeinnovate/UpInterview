// v1.0.0 - Ashok - Fixing fetching internal logs data
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all internal logs with pagination and filters
export const useInternalLogs = ({
  page = 0,
  limit = 10,
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

  // Simple enabled logic - enable if we have permissions or if initialized
  const isEnabled = Boolean(hasAnyPermissions || isInitialized);

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);
  if (status) queryParams.append("status", status);
  if (severity) queryParams.append("severity", severity);
  if (processName) queryParams.append("processName", processName);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "internalLogs",
      page,
      limit,
      search,
      status,
      severity,
      processName,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/internal-logs?${queryParams.toString()}`
      );
      return response.data;
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true, // Keep previous data while fetching new page
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination || {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
      itemsPerPage: limit,
    },
    stats: data?.stats || {
      totalLogs: 0,
      errorLogs: 0,
      warningLogs: 0,
      successLogs: 0,
    },
    isLoading,
    isError,
    error,
    refetch,
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
