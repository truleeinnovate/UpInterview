// v1.0.0 - Ashok - Fixing fetching internal logs data
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to fetch all internal logs
export const useInternalLogs = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InternalLogs?.View;

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["internalLogs"],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/internal-logs`
      );
      // v1.0.0 <----------------------------------------------------------------
      console.log("1. INTERNAL LOGS AT RESPONSE HOOK :", response.data);
      return response.data?.logs || [];
      // v1.0.0 ---------------------------------------------------------------->
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10, // 5 minutes
    cacheTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    logs,
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
      // v1.0.0 ---------------------------------------------------------------
      console.log('3. SELECTED INTERNAL LOG RESPONSE AT HOOK: ', response.data);
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
