import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useAssessments = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Assessment_Template?.View;
  const initialLoad = useRef(true);

  const {
    data: assessmentData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['Assessment_Template', filters],
    queryFn: async () => {
      const data = await fetchFilterData('assessment');
      return data.map(assessment => ({
        ...assessment,
        // Add any assessment-specific transformations here
      })).reverse(); // Latest first
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

  const addOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      if (isEditing) {
        const { data } = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData,
        );
        return data;
      }
      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessments/new-assessment`,
        assessmentData,
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['Assessment_Template', filters], (oldData) => {
        if (!oldData) return oldData;
        
        if (variables.isEditing) {
          // Update existing assessment
          return oldData.map(assessment => 
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
      queryClient.invalidateQueries(['Assessment_Template']);
    },
    onError: (err) => {
      console.error('Assessment save error:', err.message);
    },
  });

  const upsertAssessmentQuestions = useMutation({
    mutationFn: async (assessmentQuestionsData) => {
      const { data } = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        assessmentQuestionsData,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['Assessment_Template']);
    },
    onError: (err) => {
      console.error('Assessment questions save error:', err.message);
    },
  });

  const fetchAssessmentQuestions = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessment-questions/list/${assessmentId}`
      );
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      return { data: null, error: error.message };
    }
  };

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
      console.error('Error fetching assessment results:', error);
      return { data: null, error: error.message };
    }
  };

  const fetchScheduledAssessments = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`
      );
      if (response.data.success) {
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: response.data.message };
      }
    } catch (error) {
      console.error('Error fetching scheduled assessments:', error);
      return { data: null, error: error.message };
    }
  };

  const isMutationLoading = addOrUpdateAssessment.isPending || upsertAssessmentQuestions.isPending;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    console.log('useAssessments state update:', {
      assessmentDataCount: assessmentData.length,
      isLoading,
      isQueryLoading,
      isMutationLoading
    });
  }, [assessmentData.length, isLoading, isQueryLoading, isMutationLoading]);

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
    fetchScheduledAssessments,
    refetch,
  };
};