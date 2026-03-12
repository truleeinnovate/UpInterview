// v1.0.0 - Ashok - updated addOrUpdateRound
// v1.0.1 - Ashok - removed reverse while fetching interview templates
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { config } from "../config";
import { useRef } from "react";
import Cookies from "js-cookie";
import { notify } from "../services/toastService";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { fetchFilterData } from "../api";
import { usePermissions } from "../Context/PermissionsContext";

export const useInterviewTemplates = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.InterviewTemplates?.View;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;
  const initialLoad = useRef(true);

  // Build query key WITHOUT page
  const { page, ...filtersWithoutPage } = filters;

  const {
    data: responseData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["interviewTemplates", filtersWithoutPage],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...filtersWithoutPage, page: pageParam, limit: filters.limit || 20 };
      const data = await fetchFilterData("interviewtemplate", {}, params);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage?.totalItems || lastPage?.total || 0;
      const items = lastPage?.data || [];
      const loadedSoFar = allPages.reduce((sum, p) => {
        return sum + (Array.isArray(p?.data) ? p.data.length : 0);
      }, 0);
      if (loadedSoFar < totalItems) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: false,
  });

  const templatesData = responseData?.pages?.flatMap((p) => p?.data || []) || [];
  const totalCount = responseData?.pages?.[0]?.totalItems || responseData?.pages?.[0]?.total || templatesData.length;
  const totalPages = Math.ceil(totalCount / (filters.limit || 20));
  const customCount = responseData?.pages?.[0]?.customCount || 0;
  const standardCount = responseData?.pages?.[0]?.standardCount || 0;

  // Child hook returned from useInterviews
  const useInterviewtemplateDetails = (templateId) => {
    return useQuery({
      queryKey: ["interviewTemplates", templateId],
      queryFn: async () => {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interviewTemplates/template/${templateId}`
        );

        return response?.data?.template;
      },
      enabled: !!templateId,
      retry: 1,
      staleTime: 1000 * 60 * 10,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnMount: "always",
      refetchOnReconnect: false,
      keepPreviousData: true,
    });
  };

  // Save template mutation
  const saveTemplate = useMutation({
    mutationFn: async ({ id, templateData, isEditMode }) => {
      const headers = { Authorization: `Bearer ${queryParams.authToken}` };

      if (isEditMode) {
        const response = await axios.patch(
          `${config.REACT_APP_API_URL}/interviewTemplates/${id}`,
          {
            tenantId: queryParams.tenantId,
            ownerId: queryParams.userId,
            templateData,
          },
          { headers }
        );
        return response.data.data;
      } else {
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/interviewTemplates`,
          {
            ...templateData,
            tenantId: queryParams.tenantId,
            ownerId: queryParams.userId,
          },
          { headers }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewTemplates"]);
    },
    onError: (error) => {
      console.error("Template save error:", error.message);
    },
  });

  // get templates by tenantId
  // const getTemplatesByTenantId = useMutation({
  //     mutationFn: async (tenantId) => {
  //         const headers = { Authorization: `Bearer ${queryParams.authToken}` };
  //         const response = await axios.get(
  //             `${config.REACT_APP_API_URL}/interviewTemplates/tenant/${tenantId}`,
  //             { headers }
  //         );
  //         return response.data.data;
  //     },
  //     onSuccess: () => {
  //         queryClient.invalidateQueries(['interviewTemplates']);
  //     },
  //     onError: (error) => {
  //         console.error('Template save error:', error.message);
  //     },
  // });

  const addOrUpdateRound = useMutation({
    mutationFn: async ({ id, roundData, roundId, template }) => {
      const headers = { Authorization: `Bearer ${queryParams.authToken}` };
      const currentRounds = template?.rounds || [];

      // Remove the round being edited
      const filteredRounds = roundId
        ? currentRounds.filter((r) => r._id !== roundId)
        : [...currentRounds];

      // Insert the updated round at the correct sequence index (sequence is 1-based)
      const newIndex = Math.max((roundData.sequence || 1) - 1, 0);
      filteredRounds.splice(newIndex, 0, roundData);

      // Normalize all sequence values before sending
      const reorderedRounds = filteredRounds.map((round, index) => ({
        ...round,
        sequence: index + 1,
      }));

      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/interviewTemplates/${id}`,
        {
          tenantId: queryParams.tenantId,
          rounds: reorderedRounds,
        },
        { headers }
      );

      return response.data;
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(["interviewTemplates"], (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((template) =>
          template._id === variables.id
            ? {
                ...template,
                rounds: data?.data?.rounds || [], // Backend will return ordered rounds
              }
            : template
        );
      });

      queryClient.invalidateQueries(["interviewTemplates"]);
    },

    onError: (error) => {
      console.error("Error adding/updating round:", error);
    },
  });
  // v1.0.0 ------------------------------------------------------------------------->

  const deleteRoundMutation = useMutation({
    mutationFn: async (roundId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/interviewTemplates/delete-round/${roundId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["interviewTemplates"]);
    },
    onError: (error) => {
      console.error("Error deleting round:", error);
      //toast.error('Failed to delete round');
    },
  });

  // Delete interview template mutation
  const deleteInterviewTemplate = useMutation({
    mutationFn: async (templateId) => {
      const token = Cookies.get("authToken");
      const tokenPayload = decodeJwt(token);
      const tenantId = tokenPayload?.tenantId;

      if (!tenantId) {
        throw new Error("Tenant ID not found in authentication token");
      }

      const { data } = await axios.delete(
        `${config.REACT_APP_API_URL}/interviewTemplates/${templateId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Tenant-ID": tenantId,
          },
          params: {
            tenantId: tenantId,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the templates query to update the UI
      queryClient.invalidateQueries(["interviewTemplates"]);
      notify.success("Interview template deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting interview template:", error);
      notify.error(
        error.response?.data?.message || "Failed to delete interview template"
      );
    },
  });

  // Calculate loading states
  const isMutationLoading =
    saveTemplate.isPending ||
    addOrUpdateRound.isPending ||
    deleteRoundMutation.isPending ||
    deleteInterviewTemplate.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
  }, [
    templatesData.length,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    saveTemplate,
    addOrUpdateRound,
  ]);

  return {
    templatesData,
    customCount,
    standardCount,
    totalPages,
    totalCount,
    useInterviewtemplateDetails,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isSaveTemplateError: saveTemplate.isError,
    saveTemplateError: saveTemplate.error,
    isAddOrUpdateRoundError: addOrUpdateRound.isError,
    addOrUpdateRoundError: addOrUpdateRound.error,
    isDeleteInterviewTemplateError: deleteInterviewTemplate.isError,
    deleteInterviewTemplateError: deleteInterviewTemplate.error,
    saveTemplate: saveTemplate.mutateAsync,
    addOrUpdateRound: addOrUpdateRound.mutateAsync,
    deleteRound: deleteRoundMutation.mutateAsync,
    deleteInterviewTemplate: deleteInterviewTemplate.mutateAsync,
    isDeleting: deleteInterviewTemplate.isPending,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
