// v1.0.0 - mansoor - changes to save the mock interview
// v2.0.1 - Ranjith added new changes to save the mock interview

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
// import { useEffect, useRef } from "react";
import { fetchFilterData } from "../api";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";
import { uploadFile } from "./imageApis";

export const useMockInterviews = (params = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  // const initialLoad = useRef(true);

  // Check if user has permission to view mock interviews
  const hasViewPermission = effectivePermissions?.MockInterviews?.View;

  // console.log("params", params);
  // Extract and validate params for API call
  // const { search = "", page = 0, limit, filters = {} } = params;

  // // Ensure page is at least 0 and limit is positive
  // const validatedPage = Math.max(0, parseInt(page));
  // const validatedLimit =
  //   limit === Infinity ? Infinity : Math.max(1, parseInt(limit));

  // Query implementation
  const {
    data: responseData = { data: [], totalCount: 0 },
    isLoading: isQueryLoading,
    isError,
    error,
    refetch: refetchMockInterviews,
  } = useQuery({
    queryKey: [
      "mockinterviews",
      params,
      // { search, page: validatedPage, limit: validatedLimit, filters },
    ],
    queryFn: async () => {
      try {
        // Prepare API params for backend filtering
        const apiParams = {
          ...params,
          mockLimit: params?.limit ?? params?.limit ?? Infinity,
        };

        //console.log("apiParams", apiParams);

        const filteredInterviews = await fetchFilterData(
          "mockinterview",
          effectivePermissions,
          apiParams
        );
        // console.log("filteredInterviews", filteredInterviews);
        return filteredInterviews;
      } catch (err) {
        // console.error("Fetch error:", err);
        throw err;
      }
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    // refetchOnMount: "always",
    // staleTime: 0, // IMPORTANT
    refetchOnMount: "always", // ✅ FIX

    // refetchOnMount: false,
    refetchOnReconnect: true,
    // refetchOnReconnect: false,
  });

  // Extract data and total count from response
  const mockinterviewData = responseData?.data || [];
  const totalCount = responseData?.totalCount || 0;
  const totalPages = responseData?.totalPages || 0;
  // const loading = isQueryLoading;
  const loading = isQueryLoading && responseData?.data === undefined;

  // Add/Update mock interview mutation
  // In useMockInterviews.js - FIXED VERSION
  const addOrUpdateMockInterview = useMutation({
    mutationFn: async (params) => {
      const {
        formData,
        id,
        isEdit,
        userId,
        organizationId,
        resume,
        isResumeRemoved,
        round,
      } = params;

      // ✅ CASE 1: Updating just the round (meeting link update)
      // if (round && id) {
      //   // ✅ Normalize id to _id before sending
      //   const normalizedRound = { ...round };
      //   if (normalizedRound.id && !normalizedRound._id) {
      //     normalizedRound._id = normalizedRound.id;
      //     delete normalizedRound.id;
      //   }

      //   const payload = { rounds: [normalizedRound] };
      //   const response = await axios.patch(
      //     `${config.REACT_APP_API_URL}/updateMockInterview/${id}`,
      //     payload
      //   );
      //   return response.data;
      // }

      // ✅ CASE 2: Normal full create/update
      if (!formData) throw new Error("formData is required for create/update");

      // Safely build rounds - FIXED: Handle both array and object formats
      let rounds = [];
      if (formData.rounds) {
        if (Array.isArray(formData.rounds)) {
          rounds = formData.rounds;
        } else if (typeof formData.rounds === "object") {
          rounds = [formData.rounds];
        }
      }

      // Set proper status based on interviewers
      // const status = rounds.length > 0 && rounds[0]?.interviewers?.length > 0 ? "RequestSent" : "Draft";

      // Format skills properly
      // const skills = formData.entries
      //   ? formData.entries
      //       .filter((e) => e.skill || e.experience || e.expertise)
      //       .map((e) => ({
      //         skill: e.skill,
      //         experience: e.experience,
      //         expertise: e.expertise,
      //       }))
      //   : formData.skills || [];

      const skills = Array.isArray(formData.skills) ? formData.skills : [];

      // Build payload - FIXED: Include rounds only if they exist
      const payload = {
        skills,
        currentRole: formData.currentRole || "",
        candidateName: formData.candidateName || "",
        higherQualification: formData.higherQualification || "",
        currentExperience: formData.currentExperience || "",
        // technology: formData.technology || "",
        jobDescription: formData.jobDescription || "",
        createdById: userId,
        lastModifiedById: userId,
        ownerId: userId,
        tenantId: organizationId,
      };

      // Only include rounds if they exist (for Page 2)
      if (rounds.length > 0) {
        payload.rounds = rounds.map((r) => ({
          ...r,
          dateTime: formData.combinedDateTime || r.dateTime,
          // status,
          interviewers: Array.isArray(r.interviewers) ? r.interviewers : [],
        }));
      }

      //"/updateMockInterview/", payload);

      const url = isEdit
        ? `${config.REACT_APP_API_URL}/updateMockInterview/${id}`
        : `${config.REACT_APP_API_URL}/mockinterview`;

      const method = isEdit ? "patch" : "post";

      const response = await axios[method](url, payload);

      // Handle resume upload
      const mockInterviewId =
        response.data.data?.mockInterview?._id ||
        response.data.data?._id ||
        response.data._id;
      if (mockInterviewId) {
        if (isResumeRemoved && !resume) {
          await uploadFile(null, "resume", "mockInterview", mockInterviewId);
        } else if (resume instanceof File) {
          await uploadFile(resume, "resume", "mockInterview", mockInterviewId);
        }
      }

      //console.log("response.data", response);

      return response.data;
    },
    // Change the onSuccess in addOrUpdateMockInterview mutation:
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mockinterviews"],
        exact: false,
      });
      // Also invalidate specific query if needed
      queryClient.invalidateQueries({
        queryKey: ["mockinterviews", params],
      });
    },

    // onSuccess: () => {
    //   queryClient.invalidateQueries(["mockinterviews"]);
    // },
    onError: (error) => {
      console.error("Mock interview error:", error);
    },
  });

  // Calculate loading states
  const isMutationLoading = addOrUpdateMockInterview.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    mockinterviewData,
    totalCount,
    totalPages,
    isLoading,
    loading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isAddOrUpdateError: addOrUpdateMockInterview.isError,
    addOrUpdateError: addOrUpdateMockInterview.error,
    addOrUpdateMockInterview: addOrUpdateMockInterview.mutateAsync,
    refetchMockInterviews,
  };
};

export const useMockInterviewById = (mockInterviewId) => {
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.MockInterviews?.View;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["mockinterview", mockInterviewId],
    queryFn: async () => {
      const authToken = Cookies.get("authToken") ?? "";
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/mockinterview/${mockInterviewId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );
      return response.data?.data;
    },
    enabled: !!mockInterviewId && !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    mockInterview: data,
    isLoading,
    isError,
    error,
  };
};

export const useCancelRound = () => {
  const queryClient = useQueryClient();
  // const authToken = Cookies.get("authToken");

  return useMutation({
    mutationFn: async ({ mockInterviewId, roundId }) => {
      return (
        await axios.patch(
          `${config.REACT_APP_API_URL}/mockinterview/${mockInterviewId}/round/${roundId}/cancel`,
          {}
          // {
          //   headers: {
          //     Authorization: `Bearer ${authToken}`,
          //   },
          //   withCredentials: true,
          // }
        )
      ).data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["mockinterview"]);
      queryClient.invalidateQueries(["mockinterviews"]);
    },
  });
};
