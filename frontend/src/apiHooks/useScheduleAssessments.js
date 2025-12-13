// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';
// import { useRef } from 'react';
// import { fetchFilterData } from "../api";
// import { config } from '../config';
// import { usePermissions } from '../Context/PermissionsContext';

// /**
//  * useScheduleAssessments – React-Query hook for CRUD operations on Scheduled Assessments.
//  *
//  * The implementation purposefully mirrors `useAssessments` so that the existing
//  * Assessment Template UI can be reused with minimal changes: simply swap the hook
//  * and table column definitions.
//  */
// export const useScheduleAssessments = () => {
//   const queryClient = useQueryClient();
//   const { effectivePermissions } = usePermissions();

//   // Scheduled Assessments visibility is tied to the generic Assessments → View permission
//   const hasViewPermission = effectivePermissions?.Assessments?.View;
//   const initialLoad = useRef(true);

//   /* -------------------------------------------------------------------------- */
//   /*                               QUERY:  LIST                                */
//   /* -------------------------------------------------------------------------- */
//   const {
//     data: scheduleData = [],
//     isLoading: isQueryLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ['Assessments'],
//     queryFn: async () => {
//       // `scheduleassessment` matches the backend collection name; adjust if needed.
//       const data = await fetchFilterData('scheduleassessment');
//       return data.map(scheduleassessment => ({
//         ...scheduleassessment,
//         // Add any assessment-specific transformations here
//       })).reverse(); // Latest first
//     },
//     enabled: !!hasViewPermission,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   });
//  // Remove console.log to prevent loops
//  // console.log("scheduleData------",scheduleData);
//   /* -------------------------------------------------------------------------- */
//   /*                           MUTATION:  CREATE / UPDATE                       */
//   /* -------------------------------------------------------------------------- */
// //   const addOrUpdateSchedule = useMutation({
// //     mutationFn: async ({ isEditing, id, payload }) => {
// //       if (isEditing) {
// //         const { data } = await axios.patch(
// //           `${config.REACT_APP_API_URL}/schedule-assessment/update/${id}`,
// //           payload,
// //         );
// //         return data;
// //       }
// //       const { data } = await axios.post(
// //         `${config.REACT_APP_API_URL}/schedule-assessment/create`,
// //         payload,
// //       );
// //       return data;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries(['Assessments']);
// //     },
// //     onError: (err) => {
// //       console.error('Schedule save error:', err.message);
// //     },
// //   });

//   /* -------------------------------------------------------------------------- */
//   /*                                 RETURN                                     */
//   /* -------------------------------------------------------------------------- */
//   return {
//     scheduleData,
//     isLoading: isQueryLoading,
//     isError,
//     error,
//    // addOrUpdateSchedule: addOrUpdateSchedule.mutateAsync,
//   };
// };

// hooks/useScheduleAssessments.js
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchFilterData } from "../api";

import { usePermissions } from "../Context/PermissionsContext";

/**
 * useScheduleAssessments
 *
 * @param {string|object} [arg] - Legacy: assessmentId string, or new options object
 *   New options shape:
 *     {
 *       assessmentId?: string;
 *       page?: number;        // 1-based page index for server pagination
 *       limit?: number;       // items per page
 *       searchQuery?: string; // free text search
 *       status?: string[];    // status filters (Scheduled, Completed, ...)
 *       templates?: string[]; // assessment template _ids
 *       orderRange?: { min?: number|string; max?: number|string };
 *       expiryPreset?: string;  // '', 'expired', 'next7', 'next30'
 *       createdPreset?: string; // '', 'last7', 'last30', 'last90'
 *     }
 *
 * @returns {object} -
 *   - For options mode:
 *       { scheduleData, total, page, totalPages, itemsPerPage, isLoading, isError, error }
 *   - For legacy mode (string arg or no arg):
 *       { scheduleData, isLoading, isError, error }
 */
export const useScheduleAssessments = (arg) => {
  // const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const hasViewPermission = effectivePermissions?.Assessments?.View;
  // const initialLoad = useRef(true);

  // Determine call mode: either new options object or legacy assessmentId string
  const isOptionsMode =
    arg && typeof arg === "object" && !Array.isArray(arg);
  const legacyAssessmentId =
    !isOptionsMode && typeof arg === "string" ? arg : undefined;

  // Normalized options object for advanced querying
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = isOptionsMode ? arg || {} : {};

  const params = useMemo(() => {
    // Legacy mode: hook called with a single assessmentId string
    if (!isOptionsMode) {
      if (legacyAssessmentId) {
        // Default type for legacy callers is scheduled assessments
        return { assessmentId: legacyAssessmentId, type: "scheduled" };
      }
      // No assessment context → don't send any params
      return {};
    }

    const {
      assessmentId,
      page,
      limit,
      searchQuery,
      status,
      templates,
      orderRange,
      expiryPreset,
      createdPreset,
      type,
    } = options;

    const p = {};

    if (assessmentId) p.assessmentId = assessmentId;
    if (page) p.page = page;
    if (limit) p.limit = limit;
    if (type) p.type = type;

    if (typeof searchQuery === "string" && searchQuery.trim()) {
      p.searchQuery = searchQuery.trim();
    }

    if (Array.isArray(status) && status.length) {
      // Normalize status values to lowercase to match backend enum
      const normalizedStatuses = status.map((s) =>
        typeof s === "string" ? s.toLowerCase() : s
      );
      p.status = normalizedStatuses.join(",");
    }

    if (Array.isArray(templates) && templates.length) {
      // Backend expects comma-separated assessment template ids
      p.assessmentIds = templates.join(",");
    }

    if (orderRange) {
      const { min, max } = orderRange;
      if (min !== undefined && min !== null && min !== "") p.orderMin = min;
      if (max !== undefined && max !== null && max !== "") p.orderMax = max;
    }

    if (typeof expiryPreset === "string" && expiryPreset) {
      p.expiryPreset = expiryPreset;
    }

    if (typeof createdPreset === "string" && createdPreset) {
      p.createdPreset = createdPreset;
    }

    return p;
  }, [isOptionsMode, legacyAssessmentId, options]);

  /* -------------------------------------------------------------------------- */
  /*                               QUERY: LIST                                  */
  /* -------------------------------------------------------------------------- */
  const {
    data: rawData,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["scheduleassessment", params],
    queryFn: async () => {
      const response = await fetchFilterData(
        "scheduleassessment",
        effectivePermissions,
        params
      );

      // When backend advanced params are used, it returns an object
      //   { data: [...], total, page, totalPages, itemsPerPage }
      // When not, it returns a plain array.

      // fetchFilterData currently returns `response.data.data || []`.
      // To support both shapes, we treat array vs object differently:

      if (Array.isArray(response)) {
        // Legacy behavior: array only, no metadata
        return {
          data: response.slice().reverse(),
          total: response.length,
          page: 1,
          totalPages: 1,
          itemsPerPage: response.length,
        };
      }

      const arr = Array.isArray(response?.data) ? response.data : [];
      return {
        data: arr.slice().reverse(),
        total: response?.total ?? arr.length,
        page: response?.page ?? (params.page || 1),
        totalPages: response?.totalPages ?? 1,
        itemsPerPage:
          response?.itemsPerPage ?? (params.limit || arr.length || 10),
        responseAssessmentDashBoard: response?.assessmentsCompleted,
      };
    },
    enabled: !!hasViewPermission && (isOptionsMode || !!legacyAssessmentId),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });

  /* -------------------------------------------------------------------------- */
  /*                           MUTATION: CREATE / UPDATE                        */
  /* -------------------------------------------------------------------------- */
  // const addOrUpdateSchedule = useMutation({
  //   mutationFn: async ({ isEditing, id, payload }) => {
  //     if (isEditing) {
  //       const { data } = await axios.patch(
  //         `${config.REACT_APP_API_URL}/schedule-assessment/update/${id}`,
  //         payload
  //       );
  //       return data;
  //     }
  //     const { data } = await axios.post(
  //       `${config.REACT_APP_API_URL}/schedule-assessment/create`,
  //       payload
  //     );
  //     return data;
  //   },
  //   onSuccess: () => {
  //     // Invalidate both general and specific queries
  //     queryClient.invalidateQueries(['scheduleassessment']);
  //   },
  //   onError: (err) => {
  //     console.error('Schedule save error:', err.message);
  //   },
  // });

  /* -------------------------------------------------------------------------- */
  /*                                 RETURN                                     */
  /* -------------------------------------------------------------------------- */

  const scheduleData = rawData?.data || [];
  const total = rawData?.total ?? scheduleData.length;
  const page = rawData?.page ?? 1;
  const totalPages = rawData?.totalPages ?? 1;
  const itemsPerPage = rawData?.itemsPerPage ?? scheduleData.length;
  const responseAssessmentDashBoard = rawData?.responseAssessmentDashBoard;

  // Legacy callers (Dashboard, RoundCard, VerticalRoundsView, AssessmentViewAssessmentTab)
  // only care about scheduleData + isLoading + errors and pass an assessmentId string.
  // They will ignore the extra fields.

  return {
    scheduleData,
    responseAssessmentDashBoard,
    total,
    page,
    totalPages,
    itemsPerPage,
    isLoading: isQueryLoading,
    isError,
    error,
    // addOrUpdateSchedule: addOrUpdateSchedule.mutateAsync,
    // isMutating: addOrUpdateSchedule.isLoading,
  };
};
