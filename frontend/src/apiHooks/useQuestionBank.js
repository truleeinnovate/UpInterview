//<-----v1.0.0----Venkatesh--------update get added suggested to myquestionlist question api


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const useQuestions = (filters = {}) => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.QuestionBank?.View;

  const authToken = Cookies.get('authToken');
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  const {
    data: myQuestionsList = {},
    isLoading: isMyQuestionsLoading,
    isError: isMyQuestionsError,
    error: myQuestionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['questions', filters],
    queryFn: async () => {
      const data = await fetchFilterData('tenantquestions');
      return Object.keys(data).reduce((acc, key) => {
        acc[key] = Array.isArray(data[key])
          ? data[key].map(question => ({
            ...question,
            isAdded: false // Additional transformation
          }))
          : [];
        return acc;
      }, {});
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  // 2️⃣ Fetch Created Lists
  const {
    data: createdLists = [],
    isLoading: isListsLoading,
    isError: isListsError,
    error: listsError,
    refetch: refetchLists,
  } = useQuery({
    queryKey: ['createdLists', userId, tenantId, organization, filters],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-list/lists/${userId}`, {
        params: {
          tenantId: tenantId,
          organization: organization,
        },
      });
      return response.data.reverse();
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // 3️⃣ Fetch Suggested Questions
  const {
    data: suggestedQuestions = [],
    isLoading: isSuggestedQuestionsLoading,
    isError: isSuggestedQuestionsError,
    error: suggestedQuestionsError,
    refetch: refetchSuggestedQuestions,
  } = useQuery({
    queryKey: ['suggestedQuestions', filters],
    queryFn: async () => {
      const response = await axios.get(`${config.REACT_APP_API_URL}/suggested-questions/questions`);
      if (response.data.success) {
        return response.data.questions.map((q) => ({ ...q, isAdded: false }));
      }
      return [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // 4️⃣ Custom Hook: Fetch Question by Suggested ID
  const useQuestionBySuggestedId = (suggestedQuestionId) =>
    useQuery({
      queryKey: ['questionBySuggestedId', suggestedQuestionId, tenantId, userId],
      queryFn: async () => {
        if (!suggestedQuestionId) return null;
        try {
          const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`, {
            params: {
              [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId,
            },
          });
          return response.data;
        } catch (error) {
          if (error.response?.status === 404) {
            return null; // Handle not found gracefully
          }
          console.error('Error fetching question by suggested ID:', error.message);
          throw error; // Rethrow other errors for React Query to handle
        }
      },
      enabled: !!suggestedQuestionId && !!(organization ? tenantId : userId),
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

  // ✅ Mutation #1: Save or Update a Question
  const saveOrUpdateQuestionMutation = useMutation({
    mutationFn: async ({ questionData, isEdit, questionId }) => {
      // Ensure required fields are included
      const payload = {
        ...questionData,
        suggestedQuestionId: questionData.suggestedQuestionId || '',
        ownerId: userId || '',  // Add ownerId from current user
        tenantId: tenantId || '',//<-----v1.0.0----
        isEdit: isEdit
      };

      console.log('Payload:', payload);
      console.log('isEdit:', isEdit);
      console.log('questionId:', questionId);

      const url = isEdit
        ? `${config.REACT_APP_API_URL}/newquestion/${questionId}`
        : `${config.REACT_APP_API_URL}/newquestion`;

      const method = isEdit ? 'patch' : 'post';
      const response = await axios[method](url, payload);
      console.log('Mutation response:', response.data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('saveOrUpdateQuestion mutation succeeded');
      
      // Optimistically update the cache
      queryClient.setQueryData(['questions', filters], (oldData) => {
        if (!oldData) return oldData;
        
        if (variables.isEdit) {
          // Update existing question
          return Object.keys(oldData).reduce((acc, key) => {
            acc[key] = oldData[key].map(question => 
              question._id === variables.questionId 
                ? { ...question, ...data.data }
                : question
            );
            return acc;
          }, {});
        } else {
          // Add new question to appropriate category
          const category = data.data.category || 'general';
          return {
            ...oldData,
            [category]: [data.data, ...(oldData[category] || [])]
          };
        }
      });
      
      queryClient.invalidateQueries(['questions']);//<-----v1.0.0----
    },
    onError: (error) => {
      console.error('saveOrUpdateQuestion mutation failed:', error.response?.data?.message || error.message);
    },
  });

  // ✅ Mutation #2: Create or Update a List
  //<----v1.0.0----
  const saveOrUpdateListMutation = useMutation({
    mutationFn: async ({ isEditing, editingSectionId, newListName, newListNameForName, userId, orgId, type }) => {
      if (isEditing && editingSectionId) {
        const response = await axios.patch(`${config.REACT_APP_API_URL}/tenant-list/lists/${editingSectionId}`, {
          label: newListName,
          name: newListNameForName,
          ownerId: userId,
          tenantId: orgId,
          ...(typeof type !== 'undefined' ? { type } : {}),
        });
        return { updated: true, data: response.data };
      } else {
        const response = await axios.post(`${config.REACT_APP_API_URL}/tenant-list/lists`, {
          label: newListName,
          name: newListNameForName,
          ownerId: userId,
          tenantId: orgId,
          type,
        });
        return response.data;
      }
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['createdLists', userId, tenantId, organization, filters], (oldData) => {
        if (!oldData) return oldData;
        
        if (variables.isEditing) {
          // Update existing list
          return oldData.map(list => 
            list._id === variables.editingSectionId 
              ? { 
                  ...list, 
                  label: variables.newListName, 
                  name: variables.newListNameForName,
                  ...(typeof variables.type !== 'undefined' ? { type: variables.type } : {})
                }
                //----v1.0.0---->
              : list
          );
        } else {
          // Add new list
          return [data, ...oldData];
        }
      });
      
      queryClient.invalidateQueries(['createdLists']);
    },
    onError: (error) => {
      console.error('Failed to save or update list:', error.response?.data?.message || error.message);
    },
  });

  // ✅ Mutation #3: Add or Update Question in Lists
  const addQuestionToListMutation = useMutation({
    mutationFn: async ({ listIds, suggestedQuestionId, isInterviewType }) => {
      if (!suggestedQuestionId || !listIds?.length) {
        throw new Error('Missing required fields');
      }

      try {
        // First get existing question with current lists
        const { data } = await axios.get(
          `${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`,
          { params: { [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : ownerId } }
        );

        // Merge existing and new list IDs
        const currentListIds = data.data?.tenantListId?.map(id => id.toString()) || [];
        const updatedListIds = [...new Set([...currentListIds, ...listIds])];

        // Update question with merged list IDs
        const response = await axios.patch(
          `${config.REACT_APP_API_URL}/newquestion/${data.data._id}`,
          //<-----v1.0.0----
          {
            tenantListId: updatedListIds,
            tenantId,
            ...(organization ? {} : { ownerId: userId })
          }
          //-----v1.0.0---->
        );
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          // Create new question if not found
          const createResponse = await axios.post(
            `${config.REACT_APP_API_URL}/newquestion`,
            {
              suggestedQuestionId,
              tenantListId: listIds,
              //<-----v1.0.0----
              tenantId,
              ...(organization ? {} : { ownerId: userId }),
              // Pass through interview/assessment type for correct collection routing
              ...(typeof isInterviewType !== 'undefined' ? { isInterviewType } : {})
              //-----v1.0.0---->
            }
          );
          return createResponse.data;
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      //queryClient.invalidateQueries(['myQuestions']);
      queryClient.invalidateQueries(['questions']);//<-----v1.0.0----
      queryClient.invalidateQueries(['questionBySuggestedId', variables.suggestedQuestionId]);
      //queryClient.invalidateQueries(['allQuestionLists']);
      queryClient.invalidateQueries(['createdLists']);//<-----v1.0.0----
    },
    onError: (error) => {
      console.error('Update failed:', error.response?.data?.message || error.message);
    }
  });

  // ✅ Mutation #4: Remove Question from Lists
  const removeQuestionFromListMutation = useMutation({
    mutationFn: async ({ suggestedQuestionId, listIdsToRemove, userId }) => {
      if (!suggestedQuestionId || !listIdsToRemove?.length) {
        throw new Error('Missing required fields: suggestedQuestionId or listIdsToRemove');
      }
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenant-questions/${suggestedQuestionId}`, {
        params: {
          [organization ? 'tenantId' : 'ownerId']: organization ? tenantId : userId,
        },
      });
      const existingQuestion = response.data;

      if (existingQuestion && existingQuestion.data) {
        const currentListIds = existingQuestion.data.tenantListId.map((id) => id.toString());
        const updatedListIds = currentListIds.filter((id) => !listIdsToRemove.includes(id));
        const updateResponse = await axios.patch(
          `${config.REACT_APP_API_URL}/newquestion/${existingQuestion.data._id}`,
          {
            tenantListId: updatedListIds,
            //<-----v1.0.0----
            tenantId,
            ...(organization ? {} : { ownerId: userId })
            //-----v1.0.0---->
          }
        );
        return updateResponse.data;
      }
    },
    onSuccess: (data, variables) => {
      //queryClient.invalidateQueries(['myQuestions']);
      queryClient.invalidateQueries(['questions']);
      queryClient.invalidateQueries(['questionBySuggestedId', variables.suggestedQuestionId]);
      //queryClient.invalidateQueries(['allQuestionLists']);
      queryClient.invalidateQueries(['createdLists']);
    },
    onError: (error) => {
      console.error('Remove failed:', error.response?.data?.message || error.message);
    }
  });

  // Calculate loading states
  const isMutationLoading = saveOrUpdateQuestionMutation.isPending || 
                           saveOrUpdateListMutation.isPending || 
                           addQuestionToListMutation.isPending || 
                           removeQuestionFromListMutation.isPending;

  const isLoading = isMyQuestionsLoading || isListsLoading || isSuggestedQuestionsLoading || isMutationLoading;

  return {
    myQuestionsList,
    createdLists,
    suggestedQuestions,
    isLoading,
    isMyQuestionsLoading,
    isListsLoading,
    isSuggestedQuestionsLoading,
    isMutationLoading,
    isMyQuestionsError,
    myQuestionsError,
    isListsError,
    listsError,
    isSuggestedQuestionsError,
    suggestedQuestionsError,
    saveOrUpdateQuestion: saveOrUpdateQuestionMutation.mutateAsync,
    saveOrUpdateList: saveOrUpdateListMutation.mutateAsync,
    addQuestionToList: addQuestionToListMutation.mutateAsync,
    removeQuestionFromList: removeQuestionFromListMutation.mutateAsync,
    useQuestionBySuggestedId,
    refetchQuestions,
    refetchLists,
    refetchSuggestedQuestions,
  };
};