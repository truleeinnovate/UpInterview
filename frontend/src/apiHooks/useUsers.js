import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config"; // assuming similar structure
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";

// ✅ Custom hook to fetch user profile with optimized caching
export const useUserProfile = () => {
  const currentUser = AuthCookieManager.getCurrentUserId();
  const {
    data: userProfile = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/owner/${currentUser}`);
      
      // console.log("response.data",response.data);

      return response.data || null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // 60 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    enabled: !!currentUser,
  });

  return { userProfile, isLoading, isError, error, refetch };
};

// ✅ Custom hook to fetch single contact data (replaces singlecontact from context)
export const useSingleContact = () => {
  const currentUser = AuthCookieManager.getCurrentUserId();
  const {
    data: singleContact = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["singleContact", currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/owner/${currentUser}`);
      return response.data || null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!currentUser,
  });

  return { singleContact, isLoading, isError, error, refetch };
};

// ✅ Mutation for requesting email change (no changes here)
export const useRequestEmailChange = () =>
  useMutation({
    mutationFn: (payload) =>
      axios.post(`${config.REACT_APP_API_URL}/emails/auth/request-email-change`, payload),
  });

// ✅ Optimized mutation for updating contact details
export const useUpdateContactDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resolvedId, data }) =>
      axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),

    onSuccess: (response, { data }) => {
      const ownerId = data?.id;
      if (ownerId) {
        // ✅ Optimistically update cache with server response
        queryClient.setQueryData(["userProfile", ownerId], response.data);
        queryClient.setQueryData(["singleContact", ownerId], response.data);

        // ✅ Then trigger a server refetch to confirm state
        queryClient.invalidateQueries(["userProfile", ownerId]);
        queryClient.invalidateQueries(["singleContact", ownerId]);
      }
    },
  });
};