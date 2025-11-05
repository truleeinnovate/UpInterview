// v1.0.0  -  Ashraf  -  while editing assessment id not getting issues
//v1.0.1  -  Ashraf  -  AssessmentTemplates permission name changed to AssessmentTemplates
//v1.0.2  -  Ashraf  -  assessment question api data get when exist is true
//v1.0.3  -  Ashraf  -  assessment data getting loop so added usecallback
//v1.0.4  -  Ashraf  -  assessment data added reverse to get updated data first
//v1.0.5  -  Ashraf  -  converted fetchScheduledAssessments to use React Query for proper caching,added cancel,extend,check expired,update all schedule statuses api code
//v1.0.6  -  Ashok   -  added creating and fetching lists apis

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// <---------------------- v1.0.3

import { useEffect, useRef, useCallback } from "react";
// ------------------------------ v1.0.3 >
import { fetchFilterData } from "../api";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";
// <---------------------- v1.0.5
import toast from "react-hot-toast";
import { notify } from "../services/toastService";
// ------------------------------ v1.0.5 >
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";

export const useAssessments = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  // <---------------------- v1.0.1
  const hasViewPermission = effectivePermissions?.AssessmentTemplates?.View;
  // ---------------------- v1.0.1 >
  const initialLoad = useRef(true);
  const authToken = AuthCookieManager.getAuthToken();
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;
  const ownerId = tokenPayload.userId;


  const {
    data: assessmentData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    // <---------------------- v1.0.1
    queryKey: ["AssessmentTemplates", filters],
    // ---------------------- v1.0.1 >
    queryFn: async () => {
      const data = await fetchFilterData("assessment");

      return data
        .map((assessment) => ({
          ...assessment,
          // <---------------------- v1.0.4
          // Add any assessment-specific transformations here
        }))
        .reverse();
      // ---------------------- v1.0.4 >
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const isLoading = isQueryLoading;

  // <---------------------- v1.0.0

  const addOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      if (isEditing && id && id !== "" && id !== null && id !== undefined) {
        const { data } = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData
        );
        return data;
      }

      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessments/new-assessment`,
        assessmentData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      // <---------------------- v1.0.1
      queryClient.setQueryData(["AssessmentTemplates", filters], (oldData) => {
        // ---------------------- v1.0.1 >
        if (!oldData) return oldData;

        if (
          variables.isEditing &&
          variables.id &&
          variables.id !== "" &&
          variables.id !== null &&
          variables.id !== undefined
        ) {
          // <---------------------- v1.0.0
          // Update existing assessment
          return oldData.map((assessment) =>
            assessment._id === variables.id
              ? { ...assessment, ...data.data }
              : assessment
          );
        } else {
          // Add new assessment
          return [data.data, ...oldData];
        }
      });

      // Invalidate to ensure consistency
      // <---------------------- v1.0.1
      queryClient.invalidateQueries(["AssessmentTemplates"]);
      // ---------------------- v1.0.1 >
    },
    onError: (err) => {
      console.error("Assessment save error:", err.message);
    },
  });

  const upsertAssessmentQuestions = useMutation({
    mutationFn: async (assessmentQuestionsData) => {
      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        assessmentQuestionsData
      );
      return data;
    },
    onSuccess: () => {
      // <---------------------- v1.0.1
      queryClient.invalidateQueries(["AssessmentTemplates"]);
      // ---------------------- v1.0.1 >
    },
    onError: (err) => {
      console.error("Assessment questions save error:", err.message);
    },
  });
  // ------------------------------ v1.0.5 >

  // Assessment Actions - Combined from useAssessmentActions
  const extendAssessment = useMutation({
    mutationFn: async ({ candidateAssessmentIds, extensionDays }) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/candidate-assessment/extend`,
        { candidateAssessmentIds, extensionDays }
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(data.message || "Assessment extended successfully");
      // Invalidate all related queries to ensure data refresh
      queryClient.invalidateQueries({ queryKey: ["Assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessmentResults"] });
      queryClient.invalidateQueries({ queryKey: ["scheduleassessment"] });
      queryClient.invalidateQueries({ queryKey: ["AssessmentTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledAssessments"] });
    },
    onError: (error) => {
      notify.error(
        error.response?.data?.message || "Failed to extend assessment"
      );
    },
  });

  const cancelAssessment = useMutation({
    mutationFn: async ({ candidateAssessmentIds }) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/candidate-assessment/cancel`,
        { candidateAssessmentIds }
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(data.message || "Assessment cancelled successfully");
      // Invalidate all related queries to ensure data refresh
      queryClient.invalidateQueries({ queryKey: ["Assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessmentResults"] });
      queryClient.invalidateQueries({ queryKey: ["scheduleassessment"] });
      queryClient.invalidateQueries({ queryKey: ["AssessmentTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledAssessments"] });
    },
    onError: (error) => {
      notify.error(
        error.response?.data?.message || "Failed to cancel assessment"
      );
    },
  });

  const checkExpiredAssessments = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/candidate-assessment/check-expired`
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(data.message || "Expiry check completed successfully");
      // Invalidate all related queries to ensure data refresh
      queryClient.invalidateQueries({ queryKey: ["Assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessmentResults"] });
      queryClient.invalidateQueries({ queryKey: ["scheduleassessment"] });
      queryClient.invalidateQueries({ queryKey: ["AssessmentTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledAssessments"] });
    },
    onError: (error) => {
      notify.error(
        error.response?.data?.message || "Failed to check expired assessments"
      );
    },
  });

  const updateAllScheduleStatuses = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/candidate-assessment/update-all-schedule-statuses`
      );
      return response.data;
    },
    onSuccess: (data) => {
      notify.success(
        data.message || "All schedule statuses updated successfully"
      );
      // Invalidate all related queries to ensure data refresh
      queryClient.invalidateQueries({ queryKey: ["Assessments"] });
      queryClient.invalidateQueries({ queryKey: ["assessmentResults"] });
      queryClient.invalidateQueries({ queryKey: ["scheduleassessment"] });
      queryClient.invalidateQueries({ queryKey: ["AssessmentTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["scheduledAssessments"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update schedule statuses"
      );
    },
  });
  // ------------------------------ v1.0.5 >

  // <---------------------- v1.0.3
  const fetchAssessmentQuestions = useCallback(async (assessmentId) => {
    // ------------------------------ v1.0.3 >
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessment-questions/list/${assessmentId}`
      );
      if (response.data.success) {
        // <---------------------- v1.0.2
        // If exists is false, the data might be empty or have empty sections
        if (response.data.exists === false) {
          return { data: { sections: [] }, error: null };
        }

        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      return { data: null, error: error.message };
    }
  }, []);

  const fetchAssessmentResults = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessments/${assessmentId}/results`
      );
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      return { data: null, error: error.message };
    }
  };
  // ------------------------------ v1.0.5 >
  // <---------------------- v1.0.5
  // Convert fetchScheduledAssessments to use React Query for proper caching
  // const fetchScheduledAssessments = useCallback(
  //   async (assessmentId) => {
  //     try {
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`,
  //         {
  //           params: {
  //             ownerId,
  //             tenantId,
  //           },
  //         }
  //       );

  //       if (response.data.success) {
  //         return { data: response.data.data, error: null };
  //       } else {
  //         return { data: null, error: response.data.message };
  //       }
  //     } catch (error) {
  //       console.error("Error fetching scheduled assessments:", error);
  //       return { data: null, error: error.message };
  //     }
  //   },
  //   [ownerId, tenantId]
  // );

  // ------------------------------ v1.0.5 >
  // React Query hook for scheduled assessments
  // const useScheduledAssessments = (assessmentId) => {
  //   return useQuery({
  //     queryKey: ["scheduledAssessments", assessmentId],
  //     queryFn: async () => {
  //       const { data, error } = await fetchScheduledAssessments(assessmentId);
  //       if (error) {
  //         throw new Error(error);
  //       }
  //       return data || [];
  //     },
  //     enabled: !!assessmentId && !!hasViewPermission,
  //     retry: 1,
  //     staleTime: 0, // Always consider data stale for immediate updates
  //     cacheTime: 1000 * 60 * 5, // 5 minutes cache
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: true, // Refetch when component mounts
  //     refetchOnReconnect: false,
  //   });
  // };

  const isMutationLoading =
    addOrUpdateAssessment.isPending ||
    upsertAssessmentQuestions.isPending ||
    extendAssessment.isPending ||
    cancelAssessment.isPending ||
    checkExpiredAssessments.isPending ||
    updateAllScheduleStatuses.isPending;
  // ------------------------------ v1.0.5 >
  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    console.log("useAssessments state update:", {
      assessmentDataCount: assessmentData.length,
      isLoading,
      isQueryLoading,
      isMutationLoading,
    });
  }, [assessmentData.length, isLoading, isQueryLoading, isMutationLoading]);

  // Delete assessment mutation
  const deleteAssessment = useMutation({
    mutationFn: async (assessmentId) => {
      const { data } = await axios.delete(
        `${config.REACT_APP_API_URL}/assessments/${assessmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the assessments query to update the UI
      queryClient.invalidateQueries(["AssessmentTemplates"]);
    },
    onError: (error) => {
      console.error("Error deleting assessment:", error);
      throw error;
    },
  });

  const createAssessmentTemplateList = useMutation({
    mutationFn: async ({ categoryOrTechnology, name, tenantId, ownerId }) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/assessments/create-list`,
        { categoryOrTechnology, name, tenantId, ownerId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["AssessmentTemplates"]);
      queryClient.invalidateQueries(["AssessmentList"]);
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to create list");
    },
  });

  const useAssessmentList = (filters = {}, hasViewPermission) => {
    const {
      data: assessmentListData = [],
      isLoading,
      isError,
      error,
      refetch,
    } = useQuery({
      queryKey: ["AssessmentList", filters],
      queryFn: async () => {
        const data = await fetchFilterData("assessmentlist"); // API endpoint
        console.log("useAssessmentList:", data);

        return data
          .map((assessment) => ({
            ...assessment,
            // Optional: add any transformations here
          }))
          .reverse(); // latest first
      },
      enabled: !!hasViewPermission,
      retry: 1,
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

    return { assessmentListData, isLoading, isError, error, refetch };
  };

  // const assessmentLists = async (tenantId, ownerId) => {
  //   try {
  //     const response = await axios.get(
  //       `${config.REACT_APP_API_URL}/assessments/lists`,
  //       {
  //         params: { tenantId, ownerId },
  //       }
  //     );
  //     return response.data.data;
  //   } catch (error) {
  //     console.error("Error fetching assessment list:", error);
  //     return {
  //       data: null,
  //       error: error.response?.data?.message || error.message,
  //     };
  //   }
  // };

  return {
    assessmentData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isAddOrUpdateAssessmentError: addOrUpdateAssessment.isError,
    addOrUpdateAssessmentError: addOrUpdateAssessment.error,
    isUpsertQuestionsError: upsertAssessmentQuestions.isError,
    upsertQuestionsError: upsertAssessmentQuestions.error,
    addOrUpdateAssessment: addOrUpdateAssessment.mutateAsync,
    upsertAssessmentQuestions: upsertAssessmentQuestions.mutateAsync,
    fetchAssessmentQuestions, // assessment questions getting
    fetchAssessmentResults,
    // ------------------------------ v1.0.5 >
    // fetchScheduledAssessments, // Keep for backward compatibility
    // useScheduledAssessments, // New React Query hook
    refetch,
    // Assessment Actions
    extendAssessment,
    cancelAssessment,
    checkExpiredAssessments,
    updateAllScheduleStatuses,
    // ------------------------------ v1.0.5 >
    deleteAssessment,
    createAssessmentTemplateList,
    // assessmentLists,
    useAssessmentList,
  };
};
