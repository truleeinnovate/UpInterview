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
  // ====================== MUTATION 1: Save MockInterview (Page 1) ======================
  const saveMockInterview = useMutation({
    mutationFn: async ({ formData, id, userId, organizationId, resume, isResumeRemoved }) => {
      const payload = {
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        candidateName: formData.candidateName || "",
        higherQualification: formData.higherQualification || "",
        currentExperience: formData.currentExperience || "",
        currentRole: formData.currentRole || "",
        jobDescription: formData.jobDescription || "",
        ownerId: userId,
        tenantId: organizationId,
        createdById: userId,
        lastModifiedById: userId,
      };

      const url = id
        ? `${config.REACT_APP_API_URL}/mockinterview/${id}`
        : `${config.REACT_APP_API_URL}/mockinterview/create`;

      const method = id ? "patch" : "post";

      const response = await axios[method](url, payload);

      const mockId = response.data.data?.mockInterview?._id || response.data.data?._id || response.data?._id;

      // Resume upload
      if (mockId) {
        if (isResumeRemoved && !resume) {
          await uploadFile(null, "resume", "mockInterview", mockId);
        } else if (resume instanceof File) {
          await uploadFile(resume, "resume", "mockInterview", mockId);
        }
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockinterviews"] });
    },
  });

  // ====================== MUTATION 2: Save/Update Round (Page 2) ======================
  const saveMockRound = useMutation({
    mutationFn: async ({ mockInterviewId, round, interviewers, roundId }) => {
      if (!mockInterviewId) throw new Error("Mock Interview ID is required");

    const payload = {
      round,
    };

      const url = roundId
        ? `${config.REACT_APP_API_URL}/mockinterview/${mockInterviewId}/round/${roundId}`
        : `${config.REACT_APP_API_URL}/mockinterview/${mockInterviewId}/round`;

      const method = roundId ? "patch" : "post";

      const response = await axios[method](url, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mockinterviews"] });
    },
  });

  // Loading states
  const isMutationLoading = saveMockInterview.isPending || saveMockRound.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    // List data
    mockinterviewData,
    totalCount,
    totalPages,
    isLoading,
    loading,
    isQueryLoading,
    isError,
    error,
    refetchMockInterviews,

    // Mutations
    saveMockInterview: saveMockInterview.mutateAsync,
    isSavingMock: saveMockInterview.isPending,

    saveMockRound: saveMockRound.mutateAsync,
    isSavingRound: saveMockRound.isPending,
  };
};

export const useMockInterviewById = (mockInterviewId) => {
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.MockInterviews?.View;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["mockinterview", mockInterviewId],
    queryFn: async () => {
      if (!mockInterviewId) return null;

      const authToken = Cookies.get("authToken");
      if (!authToken) throw new Error("No auth token");

      const response = await axios.get(
        `${config.REACT_APP_API_URL}/mockinterview/${mockInterviewId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          withCredentials: true,
        }
      );

      return response.data?.data || null;
    },
    enabled: !!mockInterviewId && !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    mockInterview: data,
    isLoading,
    isError,
    error,
    refetch,
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
