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

  // Fetch assessment questions by assessment ID
  const fetchAssessmentQuestions = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/assessment-questions/list/${assessmentId}`
      );
      if (response.data.success) {
        return {
          data: response.data.data,
          error: null
        };
      } else {
        throw new Error('Failed to fetch assessment questions');
      }
    } catch (error) {
      console.error('Error fetching assessment questions:', error.message);
      return {
        data: null,
        error: error.message
      };
    }
  };


  // Fetch results for a specific assessment
const fetchAssessmentResults = async (assessmentId) => {
  try {
    const response = await axios.get(
      `${config.REACT_APP_API_URL}/assessments/${assessmentId}/results`
    );
    return {
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('Error fetching assessment results:', error.message);
    return {
      data: [],
      error: error.message
    };
  }
};


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
    fetchAssessmentQuestions, // assessment questions getting 
    fetchAssessmentResults
  };
};