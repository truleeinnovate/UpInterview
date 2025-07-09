import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRef } from 'react';
import { fetchFilterData } from "../api";
import { config } from '../config';
import { usePermissions } from '../Context/PermissionsContext';

/**
 * useScheduleAssessments – React-Query hook for CRUD operations on Scheduled Assessments.
 *
 * The implementation purposefully mirrors `useAssessments` so that the existing
 * Assessment Template UI can be reused with minimal changes: simply swap the hook
 * and table column definitions.
 */
export const useScheduleAssessments = () => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();

  // Scheduled Assessments visibility is tied to the generic Assessments → View permission
  const hasViewPermission = effectivePermissions?.Assessments?.View;
  const initialLoad = useRef(true);

  /* -------------------------------------------------------------------------- */
  /*                               QUERY:  LIST                                */
  /* -------------------------------------------------------------------------- */
  const {
    data: scheduleData = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['Assessments'],
    queryFn: async () => {
      // `scheduleassessment` matches the backend collection name; adjust if needed.
      const data = await fetchFilterData('scheduleassessment');
      return data.map(scheduleassessment => ({
        ...scheduleassessment,
        // Add any assessment-specific transformations here
      })).reverse(); // Latest first
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
 console.log("scheduleData------",scheduleData);
  /* -------------------------------------------------------------------------- */
  /*                           MUTATION:  CREATE / UPDATE                       */
  /* -------------------------------------------------------------------------- */
//   const addOrUpdateSchedule = useMutation({
//     mutationFn: async ({ isEditing, id, payload }) => {
//       if (isEditing) {
//         const { data } = await axios.patch(
//           `${config.REACT_APP_API_URL}/schedule-assessment/update/${id}`,
//           payload,
//         );
//         return data;
//       }
//       const { data } = await axios.post(
//         `${config.REACT_APP_API_URL}/schedule-assessment/create`,
//         payload,
//       );
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['Assessments']);
//     },
//     onError: (err) => {
//       console.error('Schedule save error:', err.message);
//     },
//   });

  /* -------------------------------------------------------------------------- */
  /*                                 RETURN                                     */
  /* -------------------------------------------------------------------------- */
  return {
    scheduleData,
    isLoading: isQueryLoading,
    isError,
    error,
   // addOrUpdateSchedule: addOrUpdateSchedule.mutateAsync,
  };
};
