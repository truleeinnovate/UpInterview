// v1.0.0 - Ashok - updated addOrUpdateRound
// v1.0.1 - Ashok - removed reverse while fetching interview templates
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  // const params = filters;

  // Build params object with all filters INCLUDING type
  //   const params = {
  //     ...filters,

  //     // Ensure type is explicitly included
  //     // type: filters.type
  //   };

  const queryParams = useMemo(
    () => ({
      tenantId,
      userId,
      organization,
      authToken,
    }),
    [tenantId, userId, organization, authToken]
  );
  // console.log("queryParams", queryParams);

  const {
    data: responseData = {},
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["interviewTemplates", filters],
    queryFn: async () => {
      const params = filters;
      console.log("params", params);
      const data = await fetchFilterData("interviewtemplate", {}, params); // <- lowercase to match backend
      // v1.0.1 <------------------------------------------------------
      //   return data.reverse();
      console.log("interviewTemplates data", data);
      return data;
      // v1.0.1 ------------------------------------------------------>
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // console.log("isQueryLoading ", isQueryLoading);
  const templatesData = responseData?.data || [];
  const totalPages = responseData?.totalPages || 0;
  const totalCount = responseData?.totalItems || 0;
  const currentPage = responseData?.currentPage || 1;
  const itemsPerPage = responseData?.itemsPerPage || 10;
  const customCount = responseData?.customCount || 0;
  const standardCount = responseData?.standardCount || 0;

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
    // console.log('useInterviewTemplates state update:', {
    //     templatesCount: templatesData.length,
    //     isLoading,
    //     isQueryLoading,
    //     isMutationLoading,
    //     saveTemplateState: saveTemplate,
    //     addOrUpdateRoundState: addOrUpdateRound,
    // });
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
    currentPage,
    itemsPerPage,
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
    // getTemplatesByTenantId: getTemplatesByTenantId.mutateAsync,
    // isGetTemplatesLoading: getTemplatesByTenantId.isPending,
  };
};
