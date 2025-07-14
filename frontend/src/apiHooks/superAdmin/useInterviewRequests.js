import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { usePermissions } from "../../Context/PermissionsContext";

// Hook to get all interview requests
export const useInterviewRequests = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InterviewRequest?.View;

  const {
    data: interviewRequests = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["interviewRequests"],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/interviewrequest`);
      return response.data || [];
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    interviewRequests,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// Hook to get a single interview request by ID
export const useInterviewRequestById = (requestId) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.InterviewRequest?.View;

  const {
    data: interviewRequest = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["interviewRequest", requestId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/interviewrequest/${requestId}`
      );
      return response.data || null;
    },
    enabled: isInitialized && !!hasViewPermission && !!requestId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    interviewRequest,
    isLoading,
    isError,
    error,
    refetch,
  };
};
