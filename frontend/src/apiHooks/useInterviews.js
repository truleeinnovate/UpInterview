// v1.0.0 - Ashraf - added sending interview email link update in rounds api
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { config } from "../config";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { fetchFilterData } from "../api";
import { usePermissions } from "../Context/PermissionsContext";

export const useInterviews = (filters = {}, page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Interviews?.View;
  const navigate = useNavigate();
  const initialLoad = useRef(true);
  // const params = filters

  // // const total = 0;
  const params = useMemo(
    () => ({
      ...filters,
      page: page,
      limit: limit,
    }),
    [filters, page, limit]
  );

  // FIX: Use state to hold total
  // const [total, setTotal] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);

  const {
    // data: interviewData = [],
    data: responseData = {},
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["interviews", params],
    queryFn: async () => {
      const response = await fetchFilterData("interview", {}, params);
      // Enhanced with candidate data

      // FIX: Extract pagination info
      // const { data: interviews = [], total = 0, totalPages = 1 } = response;

      // Update total state
      // setTotal(total);
      // setTotalPages(totalPages);

      // Return both data and total
      return {
        data: response,
      };

      // return response?.data
      // return interviewsWithCandidates;
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    keepPreviousData: true,
  });

  // console.log("responseData", responseData);
  // Extract data and total from response
  const interviewData = responseData?.data?.data || [];
  const total = responseData?.data?.total || 0;
  const currentPage = responseData?.data?.page || 1;
  const totalPages = responseData?.data?.totalPages || 1;

  // Create new interview mutation
  const createInterview = useMutation({
    mutationFn: async ({
      candidateId,
      positionId,
      orgId,
      userId,
      templateId,
      id,
    }) => {
      const interviewData = {
        candidateId,
        positionId,
        orgId,
        userId,
        ...(templateId && { templateId }),
        status: "Draft",
      };

      // const response = await axios.post(`${config.REACT_APP_API_URL}/interview`, {
      //   ...interviewData,
      //   interviewId: id
      // });

      let response;

      if (id) {
        // 🔹 PATCH call when interviewId exists (update)
        response = await axios.patch(
          `${config.REACT_APP_API_URL}/interview/${id}`,
          interviewData
        );
      } else {
        // 🔹 POST call when creating a new interview
        response = await axios.post(
          `${config.REACT_APP_API_URL}/interview`,
          interviewData
        );
      }

      // Link candidate to position
      await axios.post(`${config.REACT_APP_API_URL}/candidateposition`, {
        candidateId,
        positionId,
        interviewId: response.data._id,
      });

      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update the cache
      // queryClient.setQueryData(['interviews', params], (oldData) => {
      //   if (!oldData) return oldData;
      //   return [data, ...oldData];
      // });

      queryClient.invalidateQueries(["interviews"]);
      navigate(`/interviews/${data._id}`);
    },
    onError: (error) => {
      console.error("Interview creation error:", error);
    },
  });

  // Save interview round mutation
  const saveInterviewRound = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/interview/save-round`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      return response.data;
    },
    // v1.0.2 <-----------------------------------------
    onSuccess: (data) => {
      queryClient.invalidateQueries(["interviews"]);
      // Toast notifications are now handled in the frontend after meeting links are generated
    },
    onError: (error) => {
      console.error("Round save error:", error);
      // Error toast will be handled in the frontend
    },
  });

  // 🔹 New mutation: Update interview round (PATCH for edit)
  const updateInterviewRound = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/interview/update-round/${payload.roundId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviews"]);
    },
    onError: (error) => {
      console.error("Round update error:", error);
    },
  });

  // Update round with meeting links mutation
  // const updateRoundWithMeetingLinks = useMutation({
  //   mutationFn: async ({ interviewId, roundId, roundData, meetingUrls }) => {
  //     console.log('=== updateRoundWithMeetingLinks mutation START ===');
  //     console.log('Input interviewId:', interviewId);
  //     console.log('Input roundId:', roundId);
  //     console.log('Input roundData:', roundData);
  //     console.log('Input meetingUrls:', meetingUrls);
  //     console.log('meetLink field:', meetingUrls.meetLink);
  //     console.log('meetLink structure:', meetingUrls.meetLink?.map(item => ({ linkType: item.linkType, link: item.link })));

  //     // Clean up roundData by removing undefined values and fields that might cause issues
  //     const cleanedRoundData = Object.fromEntries(
  //       Object.entries(roundData).filter(([key, value]) => {
  //         // Remove undefined, null, and questions field (handled separately)
  //         return value !== undefined && value !== null && key !== 'questions';
  //       })
  //     );

  //     // Convert interviewers array to proper ObjectId format if it exists
  //     if (cleanedRoundData.interviewers && Array.isArray(cleanedRoundData.interviewers)) {
  //       cleanedRoundData.interviewers = cleanedRoundData.interviewers.map(id =>
  //         typeof id === 'string' ? id : id.toString()
  //       );
  //     }

  //     console.log('Original roundData keys:', Object.keys(roundData));
  //     console.log('Cleaned roundData keys:', Object.keys(cleanedRoundData));

  //     // Update round data with meeting links
  //     const updatedRoundData = {
  //       ...cleanedRoundData,
  //       meetingId: meetingUrls.meetingId, // Original meeting link
  //       meetLink: meetingUrls.meetLink // Three URLs with parameters in correct format
  //     };

  //     console.log('Updated round data:', updatedRoundData);
  //     console.log('Updated round data keys:', Object.keys(updatedRoundData));

  //     // Use the existing saveInterviewRound API endpoint which handles both create and update
  //     const updatePayload = {
  //       interviewId,
  //       roundId, // This will trigger an update if roundId exists
  //       round: updatedRoundData
  //     };

  //     console.log('API payload:', updatePayload);
  //     console.log('API payload round keys:', Object.keys(updatePayload.round));
  //     console.log('API URL:', `${config.REACT_APP_API_URL}/interview/save-round`);

  //     const response = await axios.post(
  //       `${config.REACT_APP_API_URL}/interview/save-round`,
  //       updatePayload,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${Cookies.get("authToken")}`,
  //         },
  //       }
  //     );

  //     console.log('API response:', response.data);
  //     console.log('=== updateRoundWithMeetingLinks mutation END ===');
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['interviews']);
  //   },
  //   onError: (error) => {
  //     console.error('=== Round update with meeting links ERROR ===');
  //     console.error('Round update with meeting links error:', error);
  //     console.error('Error details:', {
  //       message: error.message,
  //       stack: error.stack,
  //       response: error.response?.data,
  //       status: error.response?.status,
  //       responseText: error.response?.data?.message || error.response?.data
  //     });
  //     console.error('=== Round update with meeting links ERROR END ===');
  //   }
  // });
  // v1.0.2 <-----------------------------------------

  // Update interview status mutation

  const updateInterviewStatus = useMutation({
    mutationFn: async ({ interviewId, status, reason }) => {
      const interviewData = {
        status,
        ...(reason && { completionReason: reason }),
        interviewId,
        updatingInterviewStatus: true,
      };

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/interview`,
        interviewData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      // queryClient.setQueryData(['interviews', params], (oldData) => {
      //   if (!oldData) return oldData;
      //   return oldData.map(interview =>
      //     interview._id === variables.interviewId
      //       ? { ...interview, status: variables.status }
      //       : interview
      //   );
      // });

      queryClient.invalidateQueries(["interviews"]);
    },
    onError: (error) => {
      console.error("Interview status update error:", error);
    },
  });

  //  round deletion
  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/interview/delete-round/${roundId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviews"]);
    },
    onError: (error) => {
      console.error("Error deleting round:", error);
      //toast.error('Failed to delete round');
    },
  });

  //  interview and round deletion
  // Interview deletion mutation
  const deleteInterviewMutation = useMutation({
    mutationFn: async (interviewId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/interview/delete-interview/${interviewId}`
        // {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${Cookies.get("authToken")}`,
        //   },
        // }
      );
      return response.data;
    },
    onSuccess: (data, deletedInterviewId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(["interviews", params], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(
          (interview) => interview._id !== deletedInterviewId
        );
      });

      // Invalidate and refetch
      queryClient.invalidateQueries(["interviews"]);
    },
    onError: (error) => {
      console.error("Interview deletion error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete interview";
      // toast.error(errorMessage);
    },
  });

  // Calculate loading states
  const isMutationLoading =
    createInterview.isPending ||
    saveInterviewRound.isPending ||
    updateInterviewStatus.isPending ||
    deleteRoundMutation.isPending;
  const isLoading =
    isQueryLoading || isMutationLoading || deleteInterviewMutation.isPending;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
  }, [interviewData.length, isLoading, isQueryLoading, isMutationLoading]);

  return {
    interviewData,
    total,
    currentPage,
    totalPages,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isCreateError: createInterview.isError,
    createError: createInterview.error,
    isSaveRoundError: saveInterviewRound.isError,
    saveRoundError: saveInterviewRound.error,
    // isUpdateRoundWithMeetingLinksError: updateRoundWithMeetingLinks.isError,
    // updateRoundWithMeetingLinksError: updateRoundWithMeetingLinks.error,
    isUpdateStatusError: updateInterviewStatus.isError,
    updateStatusError: updateInterviewStatus.error,
    isDeleteInterviewError: deleteInterviewMutation.isError, // Add this
    deleteInterviewError: deleteInterviewMutation.error, // Add this
    createInterview: createInterview.mutateAsync,
    saveInterviewRound: saveInterviewRound.mutateAsync,
    updateInterviewRound: updateInterviewRound.mutateAsync,
    // updateRoundWithMeetingLinks: updateRoundWithMeetingLinks.mutateAsync,
    updateInterviewStatus: updateInterviewStatus.mutateAsync,
    // refetchInterviews,
    deleteRoundMutation: deleteRoundMutation.mutateAsync,
    deleteInterviewMutation: deleteInterviewMutation.mutateAsync,
    refetch,
  };
};
