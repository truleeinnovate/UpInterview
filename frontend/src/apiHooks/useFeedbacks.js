import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFilterData } from "../api.js";
import { usePermissions } from "../Context/PermissionsContext";
import axios from "axios";
import toast from "react-hot-toast";

export const useFeedbacks = (filters = {}) => {
  const { effectivePermissions, isInitialized } = usePermissions();
  const hasViewPermission = effectivePermissions?.Feedback?.View;
  const params = {
    ...filters,
    type: filters.type ? filters.type : "feedback",
  };

  return useQuery({
    queryKey: ["feedbacks", filters],
    queryFn: async () => {
      const data = await fetchFilterData(
        "feedback",
        effectivePermissions,
        params,
      );

      return data;
    },
    enabled: !!hasViewPermission && isInitialized,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    // refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnMount: "always",
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
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
    queryKey: ["feedbackDatas", roundId, interviewerId],
    queryFn: async () => {
      if (!roundId) {
        return null;
      }

      console.log("roundId", roundId);
      console.log("interviewerId", interviewerId);
      console.log("interviewType", interviewType);

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
        { params }
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
