import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useMemo, useRef } from 'react';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export const useInterviews = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const initialLoad = useRef(true);

  // Memoize permissions
  const interviewPermissions = useMemo(
    () => sharingPermissionscontext?.interviews || {},
    [sharingPermissionscontext]
  );

  // Interviews query with candidate data
  const {
    data: interviewData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch: refetchInterviews,
  } = useQuery({
    queryKey: ['interviews', interviewPermissions],
    queryFn: async () => {
      const filteredInterviews = await fetchFilterData('interview', interviewPermissions);
      
      const interviewsWithCandidates = await Promise.all(
        filteredInterviews.map(async (interview) => {
          if (!interview.CandidateId) {
            return { ...interview, candidate: null };
          }
          
          try {
            const candidateResponse = await axios.get(
              `${config.REACT_APP_API_URL}/candidate/${interview.CandidateId}`
            );
            const candidate = candidateResponse.data;
            
            if (candidate.ImageData?.filename) {
              candidate.imageUrl = `${config.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
            }
            
            return { ...interview, candidate };
          } catch (error) {
            return { ...interview, candidate: null };
          }
        })
      );
      
      return interviewsWithCandidates.reverse();
    },
    enabled: !!interviewPermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Create new interview mutation
  const createInterview = useMutation({
    mutationFn: async ({ candidateId, positionId, orgId, userId, templateId, id }) => {
      const interviewData = {
        candidateId,
        positionId,
        orgId,
        userId,
        ...(templateId && { templateId }),
        status: "Draft",
      };

      const response = await axios.post(`${config.REACT_APP_API_URL}/interview`, {
        ...interviewData,
        interviewId: id
      });

      // Link candidate to position
      await axios.post(`${config.REACT_APP_API_URL}/candidateposition`, {
        candidateId,
        positionId,
        interviewId: response.data._id,
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries([' inclusief']);
      navigate(`/interviews/${data._id}`);
    },
    onError: (error) => {
      console.error('Interview creation error:', error);
    }
  });

  // Save interview round mutation
  const saveInterviewRound = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/interview/save-round`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
    },
    onError: (error) => {
      console.error('Round save error:', error);
    }
  });

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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
    },
    onError: (error) => {
      console.error('Interview status update error:', error);
    }
  });

  const deleteRoundMutation = useMutation({
          mutationFn: async (roundId) => {
            const response = await axios.delete(
              `${config.REACT_APP_API_URL}/interview/delete-round/${roundId}`
            );
            return response.data;
          },
          onSuccess: () => {
            queryClient.invalidateQueries(['interviews']);
          },
          onError: (error) => {
            console.error('Error deleting round:', error);
            //toast.error('Failed to delete round');
          },
        });

  // Calculate loading states
  const isMutationLoading = createInterview.isPending || saveInterviewRound.isPending || updateInterviewStatus.isPending || deleteRoundMutation.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    console.log('useInterviews state update:', {
      interviewCount: interviewData.length,
      isLoading,
      isQueryLoading,
      isMutationLoading
    });
  }, [interviewData.length, isLoading, isQueryLoading, isMutationLoading]);

  return {
    interviewData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isCreateError: createInterview.isError,
    createError: createInterview.error,
    isSaveRoundError: saveInterviewRound.isError,
    saveRoundError: saveInterviewRound.error,
    isUpdateStatusError: updateInterviewStatus.isError,
    updateStatusError: updateInterviewStatus.error,
    createInterview: createInterview.mutateAsync,
    saveInterviewRound: saveInterviewRound.mutateAsync,
    updateInterviewStatus: updateInterviewStatus.mutateAsync,
    refetchInterviews,
    deleteRoundMutation: deleteRoundMutation.mutateAsync,
  };
};