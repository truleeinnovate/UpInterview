import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useMemo } from 'react';
import { config } from '../config';
import { useRef } from 'react';
import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const useInterviewTemplates = () => {
    const authToken = Cookies.get('authToken');
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;
    const organization = tokenPayload?.organization;
    const queryClient = useQueryClient();
    const initialLoad = useRef(true);

    // Memoize query parameters to prevent unnecessary re-renders
    const queryParams = useMemo(() => ({
        tenantId,
        userId,
        organization,
        authToken
    }), [tenantId, userId, organization, authToken]);

    // Interview templates query
    const {
        data: templatesData = [],
        isLoading: isQueryLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['interviewTemplates', queryParams],
        queryFn: async () => {
            try {
                let queryString = '';
                if (queryParams.organization) {
                    queryString = `tenantId=${queryParams.tenantId}&organization=true`;
                } else {
                    queryString = `ownerId=${queryParams.userId}&organization=false`;
                }

                const apiUrl = `${config.REACT_APP_API_URL}/interviewTemplates?${queryString}`;
                const headers = { Authorization: `Bearer ${queryParams.authToken}` };

                const response = await axios.get(apiUrl, { headers });
                return response.data.data.reverse();
            } catch (err) {
                console.error('Error fetching templates:', err);
                throw err;
            }
        },
        enabled: !!queryParams.authToken && !!queryParams.tenantId && !!queryParams.userId,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        refetchOnWindowFocus: false,
    });

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
                return response.data.data;;
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
            queryClient.invalidateQueries(['interviewTemplates']);
        },
        onError: (error) => {
            console.error('Template save error:', error.message);
        },
    });

    // Add/edit round mutation
    const addOrUpdateRound = useMutation({
        mutationFn: async ({ id, roundData, roundId, template }) => {
            const headers = { Authorization: `Bearer ${queryParams.authToken}` };
            const currentRounds = template?.rounds || [];
            const updatedRounds = roundId
                ? currentRounds.map((round) =>
                      round._id === roundId ? { ...round, ...roundData } : round
                  )
                : [...currentRounds, roundData];

            const response = await axios.patch(
                `${config.REACT_APP_API_URL}/interviewTemplates/${id}`,
                {
                    tenantId: queryParams.tenantId,
                    rounds: updatedRounds,
                },
                { headers }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['interviewTemplates']);
        },
        onError: (error) => {
            console.error('Error adding/updating round:', error);
        },
    });

    const deleteRoundMutation = useMutation({
        mutationFn: async (roundId) => {
          const response = await axios.delete(
            `${config.REACT_APP_API_URL}/interviewTemplates/delete-round/${roundId}`
          );
          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries(['interviewTemplates']);
        },
        onError: (error) => {
          console.error('Error deleting round:', error);
          //toast.error('Failed to delete round');
        },
      });

    // Calculate loading states
    const isMutationLoading = saveTemplate.isPending || addOrUpdateRound.isPending || deleteRoundMutation.isPending;
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
    }, [templatesData.length, isLoading, isQueryLoading, isMutationLoading, saveTemplate, addOrUpdateRound]);

    return {
        templatesData,
        isLoading,
        isQueryLoading,
        isMutationLoading,
        isError,
        error,
        isSaveTemplateError: saveTemplate.isError,
        saveTemplateError: saveTemplate.error,
        isAddOrUpdateRoundError: addOrUpdateRound.isError,
        addOrUpdateRoundError: addOrUpdateRound.error,
        saveTemplate: saveTemplate.mutateAsync,
        addOrUpdateRound: addOrUpdateRound.mutateAsync,
        deleteRoundMutation:deleteRoundMutation.mutateAsync
    };
};