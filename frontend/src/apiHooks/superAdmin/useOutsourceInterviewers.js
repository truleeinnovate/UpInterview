import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import toast from "react-hot-toast";
import { usePermissions } from "../../Context/PermissionsContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Hook to get all outsource interviewers
export const useOutsourceInterviewers = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission =
    superAdminPermissions?.OutsourceInterviewerRequest?.View;

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
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
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

export const useUpdateInterviewerFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/outsourceInterviewers`,
        feedbackData
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Feedback Updated Successfully!");
      // Invalidate to refetch updated data
      queryClient.invalidateQueries(["outsourceInterviewers"]);
    },
    onError: (error) => {
      console.error("Error updating feedback:", error);
      toast.error("Error updating feedback");
    },
  });
};
