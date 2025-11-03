// v1.0.0 - Ashok - modified piece of code
// v2.0.0 - Lazy-load master data per dropdown (fetch on open only)

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';

// Custom hook helper to create a disabled query (on-demand fetching)
const ONE_DAY = 1000 * 60 * 60 * 24; // 24 hours

const useOnDemandQuery = (key, path, staleTime = ONE_DAY, retry = 1) =>
  useQuery({
    queryKey: ['masterData', key],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/${path}`);
      return res.data;
    },
    staleTime,                // <--- auto-refresh once per day
    cacheTime: ONE_DAY * 2,   // optional: keep cached for 2 days
    retry,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    networkMode: 'online',
  });


export const useMasterData = () => {
  const staleTime = 1000 * 60 * 60; // 1 hour cache
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

    // // On-demand loaders to be called on dropdown open
    // loadLocations: locationsQ.refetch,
    // loadIndustries: industriesQ.refetch,
    // loadCurrentRoles: rolesQ.refetch,
    // loadSkills: skillsQ.refetch,
    // loadTechnologies: technologiesQ.refetch,
    // loadQualifications: qualificationsQ.refetch,
    // loadColleges: collegesQ.refetch,
    // loadCompanies: companiesQ.refetch,
    // loadCategory: categoryQ.refetch,

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

  };
};