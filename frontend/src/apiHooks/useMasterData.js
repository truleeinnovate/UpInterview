// v1.0.0 - Ashok - modified piece of code
// v2.0.0 - Lazy-load master data per dropdown (fetch on open only)
// v3.0.0 - Optimized for production with 7-day cache and persistence

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import { ONE_DAY, ONE_WEEK, TWO_WEEKS } from "../utils/queryClient";

const useOnDemandQuery = (
  key,
  type,
  pageType,
  paramsData,
  // type,
  staleTime = ONE_WEEK,
  retry = 1,
  enabled = true,
) =>
  useQuery({
    queryKey: ["masterData", type, key, pageType, paramsData],

    queryFn: async () => {
      const params = {
        ...paramsData,
        pageType,
      };

      const res = await axios.get(
        `${config.REACT_APP_API_URL}/master-data/${type}`,
        {
          params,
        },
      );
      return res?.data;
    },
    retry,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    networkMode: "online",
  });

const sortByAlphabet = (data, field) => {
  if (!Array.isArray(data)) return [];

  return [...data].sort((a, b) =>
    (a?.[field] || "").localeCompare(b?.[field] || "", "en", {
      sensitivity: "base",
    }),
  );
};

const maybeSortByAlphabet = (data, field, shouldSort) => {
  if (!Array.isArray(data)) return [];
  if (!shouldSort) return data;

  return [...data].sort((a, b) =>
    (a?.[field] || "").localeCompare(b?.[field] || "", "en", {
      sensitivity: "base",
    }),
  );
};

export const useMasterData = (paramsData, pageType, type) => {
  const queryClient = useQueryClient();
  const staleTime = ONE_WEEK; // 7 days - master data rarely changes
  const retry = 1;

  // On Super Admin master table pages we only need the active type
  // (e.g. technology, locations, universitycollege). Avoid firing
  // all other master-data queries to reduce backend load.
  const isSuperAdminTable = pageType === "Super Admin" && !!type;
  const shouldEnable = (key) => !isSuperAdminTable || key === type;

  // console.log("shouldEnable", paramsData, pageType, type);

  // Individual queries for each master list (all disabled by default)
  const locationsQ = useOnDemandQuery(
    "locations",
    type ? type : "locations",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("locations"),
  );
  const industriesQ = useOnDemandQuery(
    "industries",
    type ? type : "industries",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("industries"),
  );
  const rolesQ = useOnDemandQuery(
    "roles",
    type ? type : "roles",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("roles"),
  );
  const skillsQ = useOnDemandQuery(
    "skills",
    type ? type : "skills",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("skills"),
  );
  const technologiesQ = useOnDemandQuery(
    "technology",
    type ? type : "technology",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("technology"),
  );
  const qualificationsQ = useOnDemandQuery(
    "qualification",
    type ? type : "qualification",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("qualification"),
  );
  const collegesQ = useOnDemandQuery(
    "universitycollege",
    type ? type : "universitycollege",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("universitycollege"),
  );
  const companiesQ = useOnDemandQuery(
    "company",
    type ? type : "company",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("company"),
  );
  const categoryQ = useOnDemandQuery(
    "category",
    type ? type : "category",
    pageType,
    paramsData,

    staleTime,
    retry,
    shouldEnable("category"),
  );

  // Aggregate helpers (backward compatible fields and combined states)
  // const masterData = {
  //   locations: locationsQ?.data || locationsQ?.data || [],
  //   industries: industriesQ?.data || industriesQ?.data || [],
  //   currentRoles: rolesQ?.data || rolesQ?.data || [],
  //   skills: skillsQ?.data || skillsQ?.data || [],
  //   technologies: technologiesQ?.data || technologiesQ?.data || [],
  //   qualifications: qualificationsQ?.data || qualificationsQ?.data || [],
  //   colleges: collegesQ?.data || collegesQ.data || [],
  //   companies: companiesQ?.data || companiesQ.data || [],
  //   category: categoryQ?.data || categoryQ.data || [],
  // };

  const shouldSort = pageType === "adminPortal" ? true : false;

  const masterData = {
    locations: shouldSort
      ? sortByAlphabet(locationsQ?.data, "LocationName")
      : locationsQ?.data || [],

    industries: shouldSort
      ? sortByAlphabet(industriesQ?.data, "IndustryName")
      : industriesQ?.data || [],
    currentRoles: shouldSort
      ? sortByAlphabet(rolesQ?.data, "roleName")
      : rolesQ?.data || [],
    skills: shouldSort
      ? sortByAlphabet(skillsQ?.data, "SkillName")
      : skillsQ?.data || [],

    technologies: shouldSort
      ? sortByAlphabet(technologiesQ?.data, "TechnologyMasterName")
      : technologiesQ?.data || [],
    qualifications: shouldSort
      ? sortByAlphabet(qualificationsQ?.data, "QualificationName")
      : qualificationsQ?.data || [],
    colleges: shouldSort
      ? sortByAlphabet(collegesQ?.data, "University_CollegeName")
      : collegesQ?.data || [],
    companies: shouldSort
      ? maybeSortByAlphabet(companiesQ?.data, "CompanyName", shouldSort)
      : companiesQ?.data || [],
    category: shouldSort
      ? sortByAlphabet(categoryQ?.data, "CategoryName")
      : categoryQ?.data || [],
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
    await queryClient.invalidateQueries({ queryKey: ["masterData"] });
    // Then refetch
    return refetchMasterData();
  };

  // Clear all cached master data
  const clearMasterDataCache = () => {
    queryClient.removeQueries({ queryKey: ["masterData"] });
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
    loadLocations: () => ensureDataLoaded("locations"),
    loadIndustries: () => ensureDataLoaded("industries"),
    loadCurrentRoles: () => ensureDataLoaded("roles"),
    loadSkills: () => ensureDataLoaded("skills"),
    loadTechnologies: () => ensureDataLoaded("technologies"),
    loadQualifications: () => ensureDataLoaded("qualifications"),
    loadColleges: () => ensureDataLoaded("colleges"),
    loadCompanies: () => ensureDataLoaded("companies"),
    loadCategory: () => ensureDataLoaded("category"),

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
    clearMasterDataCache, // Clear all cached master data
    cacheInfo: {
      staleTime: staleTime / ONE_DAY, // in days
      cacheTime: TWO_WEEKS / ONE_DAY, // in days
      persistence: true,
    },
  };
};
