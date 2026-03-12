import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFilterData } from "../api.js";
import { usePermissions } from "../Context/PermissionsContext";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { useSingleContact } from "./useUsers.js";

export const useFeedbacks = (filters = {}) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Feedback?.View;

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
    queryKey: ["feedbacks", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        type: filters.type ? filters.type : "feedback",
        page: pageParam,
        limit: filters.limit || 20,
      };

      // Convert Infinity to string "infinity" since Infinity can't be serialized as a query param
      if (params.limit === Infinity || params.limit === "Infinity") {
        params.limit = "infinity";
      }

      const data = await fetchFilterData(
        "feedback",
        effectivePermissions,
        params,
      );

      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage?.pagination?.totalItems || 0;
      const loadedSoFar = allPages.reduce(
        (sum, p) => sum + (p?.feedbacks?.length || 0),
        0,
      );
      if (loadedSoFar < totalItems) {
        return allPages.length + 1; // 1-indexed pages
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!hasViewPermission && isInitialized,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: false,
  });

  // Flatten all pages
  const feedbacks = infiniteData?.pages?.flatMap((p) => p?.feedbacks || []) || [];
  const totalItems = infiniteData?.pages?.[0]?.pagination?.totalItems || 0;

  return {
    data: {
      feedbacks,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems,
        itemsPerPage: filters.limit || 20,
      },
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

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/feedback/create`,
        feedbackData,
      );
      return response.data;
    },
    onSuccess: () => {
      // Ensure feedback lists are refreshed after creating new feedback
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["feedbackDatas"] });
      // queryClient.invalidateQueries({ queryKey: ["feedbackData"] });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error("⚠️ Feedback already exists for this candidate and round!");
      } else {
        toast.error("❌ Failed to submit feedback: " + error.message);
      }
      // console.error('Error creating feedback:', error);
      // throw error;
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedbackId, feedbackData }) => {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/feedback/${feedbackId}`,
        feedbackData,
      );
      return response.data;
    },
    onSuccess: () => {
      // Ensure feedback lists are refreshed after updating existing feedback
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["feedbackDatas"] });
      //  queryClient.invalidateQueries({ queryKey: ["feedbackData"] });
    },
    onError: (error) => {
      console.error("Error updating feedback:", error);
      throw error;
    },
  });
};

export const useFeedbackData = ({ roundId, interviewerId, interviewType }) => {
  return useQuery({
    queryKey: ["feedbackDatas", roundId, interviewerId, interviewType],
    queryFn: async () => {
      if (!roundId) {
        return null;
      }

      // console.log("roundId", roundId);
      // console.log("interviewerId", interviewerId);
      // console.log("interviewType", interviewType);

      // Build URL with query parameters
      // let url = `${process.env.REACT_APP_API_URL}/feedback/round/${roundId}`;
      // if (interviewerId) {
      //   url += `?interviewerId=${(interviewerId, interviewType)}`;
      //   // url += `?interviewType=${interviewType}`;
      // }

      const params = {
        interviewType,
      };

      if (interviewerId) {
        params.interviewerId = interviewerId;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/feedback/round/${roundId}`,
        { params },
      );

      // {
      //     params: mockInterviewId
      //       ? { mockInterviewId }
      //       : { mockInterviewRoundId },
      //   },
      // const response = await axios.get(url, {
      //   headers: {
      //     "Content-Type": "application/json",
      //     // 'Authorization': `Bearer ${Cookies.get('authToken')}`
      //   },
      // });
      console.log("response response", response)

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch feedback data",
        );
      }
    },
    enabled: !!roundId, // only run if roundId exists
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const usePendingFeedbacks = () => {
  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);

  const { singleContact } = useSingleContact();

  const contactId = singleContact?.contactId;



  return useQuery({
    queryKey: ["pendingFeedbacks", contactId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/feedback/pending-feedbacks`,
        {
          params: { contactId }
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch pending feedbacks"
        );
      }
    },
    enabled: !!contactId,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
