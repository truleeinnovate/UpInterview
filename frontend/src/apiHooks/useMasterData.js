// v1.0.0 - Ashok - modified piece of code
// v2.0.0 - Lazy-load master data per dropdown (fetch on open only)
// v3.0.0 - Optimized for production with 7-day cache and persistence

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import { ONE_DAY, ONE_WEEK, TWO_WEEKS } from '../utils/queryClient';

const useOnDemandQuery = (key, path, staleTime = ONE_WEEK, retry = 1) =>
  useQuery({
    queryKey: ['masterData', key],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/${path}`);
      return res.data;
    },
    staleTime,                // Data considered fresh for 7 days by default
    cacheTime: TWO_WEEKS,     // Keep in memory/storage for 14 days
    retry,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    networkMode: 'online',
  });

export const useMasterData = () => {
  const queryClient = useQueryClient();
  const staleTime = ONE_WEEK; // 7 days - master data rarely changes
  const retry = 1;

  // Individual queries for each master list (all disabled by default)
  const locationsQ = useOnDemandQuery('locations', 'locations', staleTime, retry);
  const industriesQ = useOnDemandQuery('industries', 'industries', staleTime, retry);
  const rolesQ = useOnDemandQuery('roles', 'roles', staleTime, retry);
  const skillsQ = useOnDemandQuery('skills', 'skills', staleTime, retry);
  const technologiesQ = useOnDemandQuery('technology', 'technology', staleTime, retry);
  const qualificationsQ = useOnDemandQuery('qualification', 'qualification', staleTime, retry);
  const collegesQ = useOnDemandQuery('universitycollege', 'universitycollege', staleTime, retry);
  const companiesQ = useOnDemandQuery('company', 'company', staleTime, retry);
  const categoryQ = useOnDemandQuery('category', 'category', staleTime, retry);

  // Aggregate helpers (backward compatible fields and combined states)
  const masterData = {
    locations: locationsQ.data || [],
    industries: industriesQ.data || [],
    currentRoles: rolesQ.data || [],
    skills: skillsQ.data || [],
    technologies: technologiesQ.data || [],
    qualifications: qualificationsQ.data || [],
    colleges: collegesQ.data || [],
    companies: companiesQ.data || [],
    category: categoryQ.data || [],
  };

  const isMasterDataLoading = [
    locationsQ.isFetching,
    industriesQ.isFetching,
    rolesQ.isFetching,
    skillsQ.isFetching,
    technologiesQ.isFetching,
    qualificationsQ.isFetching,
    collegesQ.isFetching,
    companiesQ.isFetching,
    categoryQ.isFetching,
  ].some(Boolean);

  const errors = [
    locationsQ.error,
    industriesQ.error,
    rolesQ.error,
    skillsQ.error,
    technologiesQ.error,
    qualificationsQ.error,
    collegesQ.error,
    companiesQ.error,
    categoryQ.error,
  ].filter(Boolean);

  const isMasterDataError = errors.length > 0;
  const masterDataError = errors[0] || null;

  // Explicit fetchers (trigger on dropdown open)
  const refetchMasterData = async () => {
    // Fetch all on demand (only if explicitly called)
    await Promise.all([
      locationsQ.refetch(),
      industriesQ.refetch(),
      rolesQ.refetch(),
      skillsQ.refetch(),
      technologiesQ.refetch(),
      qualificationsQ.refetch(),
      collegesQ.refetch(),
      companiesQ.refetch(),
      categoryQ.refetch(),
    ]);
  };

  // Force refresh all master data (admin use or manual refresh)
  const forceRefreshMasterData = async () => {
    // Invalidate all master data queries
    await queryClient.invalidateQueries({ queryKey: ['masterData'] });
    // Then refetch
    return refetchMasterData();
  };

  // Clear all cached master data
  const clearMasterDataCache = () => {
    queryClient.removeQueries({ queryKey: ['masterData'] });
  };

  // CHANGE 9: Added new function for selective lazy loading (backward compatibility)
  const ensureDataLoaded = async (dataType) => {
    const queryMap = {
      locations: locationsQ,
      industries: industriesQ,
      roles: rolesQ,
      skills: skillsQ,
      technologies: technologiesQ,
      qualifications: qualificationsQ,
      colleges: collegesQ,
      companies: companiesQ,
      category: categoryQ,
    };

    const query = queryMap[dataType];
    if (query && !query.data && !query.isFetching) {
      await query.refetch();
    }
  };

  return {
    // Backward-compatible shape
    masterData,
    isMasterDataLoading,
    isMasterDataError,
    masterDataError,
    refetchMasterData,

    // Individual data for easier access
    locations: masterData.locations,
    industries: masterData.industries,
    currentRoles: masterData.currentRoles,
    skills: masterData.skills,
    technologies: masterData.technologies,
    qualifications: masterData.qualifications,
    colleges: masterData.colleges,
    companies: masterData.companies,
    category: masterData.category,

    // CHANGE 10: Updated loader functions - now they just ensure data is available
    // These will return immediately if data is already cached
    loadLocations: () => ensureDataLoaded('locations'),
    loadIndustries: () => ensureDataLoaded('industries'),
    loadCurrentRoles: () => ensureDataLoaded('roles'),
    loadSkills: () => ensureDataLoaded('skills'),
    loadTechnologies: () => ensureDataLoaded('technologies'),
    loadQualifications: () => ensureDataLoaded('qualifications'),
    loadColleges: () => ensureDataLoaded('colleges'),
    loadCompanies: () => ensureDataLoaded('companies'),
    loadCategory: () => ensureDataLoaded('category'),

    // Per-entity loading flags for better UX (e.g., show loading spinners per dropdown)
    isLocationsFetching: locationsQ.isFetching,
    isIndustriesFetching: industriesQ.isFetching,
    isCurrentRolesFetching: rolesQ.isFetching,
    isSkillsFetching: skillsQ.isFetching,
    isTechnologiesFetching: technologiesQ.isFetching,
    isQualificationsFetching: qualificationsQ.isFetching,
    isCollegesFetching: collegesQ.isFetching,
    isCompaniesFetching: companiesQ.isFetching,
    isCategoryFetching: categoryQ.isFetching,

    // CHANGE 11: Added new utility functions
    isDataReady: !isMasterDataLoading && !isMasterDataError,
    hasData: (dataType) => {
      const data = masterData[dataType];
      return Array.isArray(data) && data.length > 0;
    },

    // v3.0.0 - Additional utility functions for cache management
    forceRefreshMasterData, // Force refresh all master data (bypasses cache)
    clearMasterDataCache,   // Clear all cached master data
    cacheInfo: {
      staleTime: staleTime / ONE_DAY, // in days
      cacheTime: TWO_WEEKS / ONE_DAY,  // in days
      persistence: true,
    },
  };
};