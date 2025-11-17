import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import toast from "react-hot-toast";
import { usePermissions } from "../../Context/PermissionsContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../services/toastService";
// import AuthCookieManager from '../../utils/AuthCookieManager/AuthCookieManager';




// Hook to get all outsource interviewers
export const useOutsourceInterviewers = (options) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  // const ownerId = AuthCookieManager.getCurrentTenantId();
  const hasViewPermission =
    superAdminPermissions?.OutsourceInterviewerRequest?.View;

  // If no options passed, fetch full list (legacy mode)
  const isPaginated = options && typeof options === 'object';
  const {
    page = 0,
    limit = 10,
    search = "",
    status = "",
  } = options || {};

  const params = new URLSearchParams();
  if (isPaginated) {
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (status) params.append("status", status);
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: isPaginated
      ? ["outsourceInterviewers", page, limit, search, status]
      : ["outsourceInterviewers"],
    queryFn: async () => {
      const base = `${config.REACT_APP_API_URL}/outsourceInterviewers`;
      const url = isPaginated && params.toString() ? `${base}?${params.toString()}` : base;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: isInitialized && !!hasViewPermission,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const defaultPagination = {
    currentPage: page,
    totalPages: 0,
    totalItems: Array.isArray(data) ? (data?.length || 0) : 0,
    hasNext: false,
    hasPrev: false,
    itemsPerPage: limit,
  };

  return {
    outsourceInterviewers: Array.isArray(data) ? (isPaginated ? data : [...data].reverse()) : data?.data || [],
    pagination: Array.isArray(data) ? defaultPagination : data?.pagination || defaultPagination,
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
      notify.success("Feedback Updated Successfully!");
      // Invalidate to refetch updated data
      queryClient.invalidateQueries(["outsourceInterviewers"]);
    },
    onError: (error) => {
      console.error("Error updating feedback:", error);
      notify.error("Error updating feedback");
    },
  });
};

// Hook to update outsource interviewer profile details
// Since outsource interviewers are Contact records, we update via the contact-detail endpoint
export const useUpdateOutsourceInterviewer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resolvedId, data }) => {
      // Use the contact-detail endpoint to update the profile
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
        data
      );
      return response.data;
    },
    onSuccess: (response, { resolvedId }) => {
      notify.success("Profile updated successfully!");
      // Invalidate to refetch updated data
      queryClient.invalidateQueries(["outsourceInterviewers"]);
      queryClient.invalidateQueries(["userProfile", resolvedId]);
    },
    onError: (error) => {
      console.error("Error updating interviewer profile:", error);
      notify.error(error.response?.data?.message || "Error updating profile");
    },
  });
};


export const useOutsourceStatus = (ownerId) => {
  return useQuery({
    queryKey: ["outsourceStatus", ownerId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/outsourceInterviewers/status`,
        { params: { ownerId } }
      );
      return data; // { status: "underReview" | "approved" | "rejected" | "suspended" | null }
    },
    enabled: !!ownerId,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
