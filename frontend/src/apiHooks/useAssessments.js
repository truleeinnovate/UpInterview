import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { fetchFilterData } from '../utils/dataUtils';
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

export const useAssessments = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  
  // Use ref to track initial load and prevent initial log
  const initialLoad = useRef(true);
  
  // Get permissions without memo to ensure fresh data
  const assessmentPermissions = sharingPermissionscontext?.assessment || {};

  // Assessment data query
  const {
    data: assessmentData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['assessments', assessmentPermissions],
    queryFn: async () => {
      const filteredAssessments = await fetchFilterData('assessment', assessmentPermissions);
      return filteredAssessments.reverse(); // Latest first
    },
    enabled: !!assessmentPermissions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // Add/Update assessment mutation
  const addOrUpdateAssessment = useMutation({
    mutationFn: async ({ isEditing, id, assessmentData, tabsSubmitStatus }) => {
      let response;

      if (isEditing) {
        response = await axios.patch(
          `${config.REACT_APP_API_URL}/assessments/update/${id}`,
          assessmentData
        );
      } else {
        if (!tabsSubmitStatus?.["Basicdetails"]) {
          response = await axios.post(
            `${config.REACT_APP_API_URL}/assessments/new-assessment`,
            assessmentData
          );
        } else {
          response = await axios.patch(
            `${config.REACT_APP_API_URL}/assessments/update/${tabsSubmitStatus.responseId}`,
            assessmentData
          );
        }
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']);
    },
    onError: (error) => {
      console.error('Assessment save error:', error.message);
    }
  });

  // Questions upsert mutation
  const upsertAssessmentQuestions = useMutation({
    mutationFn: async (questionsData) => {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/assessment-questions/upsert`,
        questionsData
      );
      return response.data;
    },
    onError: (error) => {
      console.error('Questions upsert error:', error.message);
    }
  });

  // Calculate loading states
  const isMutationLoading = addOrUpdateAssessment.isPending || upsertAssessmentQuestions.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

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
  };
};