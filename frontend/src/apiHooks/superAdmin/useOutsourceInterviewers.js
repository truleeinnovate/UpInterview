import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get all outsource interviewers
export const useOutsourceInterviewers = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.OutsourceInterviewerRequest?.View;

  const {
    data: outsourceInterviewers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["outsourceInterviewers"],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/outsourceInterviewers`
      );
      return response.data.reverse() || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    outsourceInterviewers,
    isLoading,
    isError,
    error,
    refetch,
  };
};
