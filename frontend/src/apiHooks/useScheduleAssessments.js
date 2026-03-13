// hooks/useScheduleAssessments.js
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
 *       { scheduleData, total, page, totalPages, itemsPerPage, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage }
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
    !!(arg && typeof arg === "object" && !Array.isArray(arg));
  const legacyAssessmentId =
    !isOptionsMode && typeof arg === "string" ? arg : undefined;

  // Normalized options object for advanced querying
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = isOptionsMode ? arg || {} : {};

  const buildParams = useMemo(() => {
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
  /*                     INFINITE QUERY: OPTIONS MODE                           */
  /* -------------------------------------------------------------------------- */
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    error: infiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["scheduleassessment-infinite", JSON.stringify(buildParams)],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...buildParams, page: pageParam, limit: buildParams.limit || 20 };
      const response = await fetchFilterData(
        "scheduleassessment",
        effectivePermissions,
        params
      );

      // fetchFilterData returns response.data.data which can be array or object
      if (Array.isArray(response)) {
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
        page: response?.page ?? pageParam,
        totalPages: response?.totalPages ?? 1,
        itemsPerPage: response?.itemsPerPage ?? (params.limit || arr.length || 20),
        responseAssessmentDashBoard: response?.assessmentsCompleted,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage?.total || 0;
      const loadedSoFar = allPages.reduce((sum, p) => {
        return sum + (Array.isArray(p?.data) ? p.data.length : 0);
      }, 0);
      if (loadedSoFar < totalItems) {
        return allPages.length + 1; // 1-indexed pages
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!hasViewPermission && isOptionsMode,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  /* -------------------------------------------------------------------------- */
  /*                       LEGACY QUERY: STRING MODE                            */
  /* -------------------------------------------------------------------------- */
  const {
    data: legacyData,
    isLoading: isLegacyLoading,
    isError: isLegacyError,
    error: legacyError,
  } = useQuery({
    queryKey: ["scheduleassessment-legacy", JSON.stringify(buildParams)],
    queryFn: async () => {
      const response = await fetchFilterData(
        "scheduleassessment",
        effectivePermissions,
        buildParams
      );

      if (Array.isArray(response)) {
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
        page: response?.page ?? 1,
        totalPages: response?.totalPages ?? 1,
        itemsPerPage: (response?.itemsPerPage ?? arr.length) || 10,
        responseAssessmentDashBoard: response?.assessmentsCompleted,
      };
    },
    enabled: !!hasViewPermission && !isOptionsMode && !!legacyAssessmentId,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const infiniteScheduleData = useMemo(() => infiniteData?.pages?.flatMap((p) => p?.data || []) || [], [infiniteData?.pages]);
  const legacyScheduleData = useMemo(() => legacyData?.data || [], [legacyData?.data]);

  /* -------------------------------------------------------------------------- */
  /*                                 RETURN                                     */
  /* -------------------------------------------------------------------------- */

  const finalResult = useMemo(() => {
    if (isOptionsMode) {
      const scheduleData = infiniteScheduleData;
      const total = infiniteData?.pages?.[0]?.total ?? scheduleData.length;
      const responseAssessmentDashBoard = infiniteData?.pages?.[0]?.responseAssessmentDashBoard;

      return {
        scheduleData,
        responseAssessmentDashBoard,
        total,
        page: 1,
        totalPages: 1,
        itemsPerPage: 20,
        isLoading: isInfiniteLoading,
        isError: isInfiniteError,
        error: infiniteError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
      };
    }

    const scheduleData = legacyScheduleData;
    const total = legacyData?.total ?? scheduleData.length;
    const page = legacyData?.page ?? 1;
    const totalPages = legacyData?.totalPages ?? 1;
    const itemsPerPage = legacyData?.itemsPerPage ?? scheduleData.length;
    const responseAssessmentDashBoard = legacyData?.responseAssessmentDashBoard;

    return {
      scheduleData,
      responseAssessmentDashBoard,
      total,
      page,
      totalPages,
      itemsPerPage,
      isLoading: isLegacyLoading,
      isError: isLegacyError,
      error: legacyError,
    };
  }, [
    isOptionsMode,
    infiniteScheduleData,
    infiniteData,
    isInfiniteLoading,
    isInfiniteError,
    infiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    legacyScheduleData,
    legacyData,
    isLegacyLoading,
    isLegacyError,
    legacyError,
  ]);

  return finalResult;
};
