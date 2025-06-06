import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';

export const useMasterData = () => {
  const {
    data: masterData = {
      locations: [],
      industries: [],
      currentRoles: [],
      skills: [],
      technologies: [],
      qualifications: [],
      colleges: [],
      companies: [],
    },
    isLoading: isMasterDataLoading,
    isError: isMasterDataError,
    error: masterDataError,
    refetch: refetchMasterData,
  } = useQuery({
    queryKey: ['masterData'],
    queryFn: async () => {
      try {
        const [
          locationsRes,
          industriesRes,
          rolesRes,
          skillsRes,
          technologiesRes,
          qualificationsRes,
          collegesRes,
          companiesRes,
        ] = await Promise.all([
          axios.get(`${config.REACT_APP_API_URL}/locations`),
          axios.get(`${config.REACT_APP_API_URL}/industries`),
          axios.get(`${config.REACT_APP_API_URL}/roles`),
          axios.get(`${config.REACT_APP_API_URL}/skills`),
          axios.get(`${config.REACT_APP_API_URL}/technology`),
          axios.get(`${config.REACT_APP_API_URL}/qualification`),
          axios.get(`${config.REACT_APP_API_URL}/universitycollege`),
          axios.get(`${config.REACT_APP_API_URL}/company`),
        ]);
        console.log('rolesRes', rolesRes.data);

        return {
          locations: locationsRes.data,
          industries: industriesRes.data,
          currentRoles: rolesRes.data,
          skills: skillsRes.data,
          technologies: technologiesRes.data,
          qualifications: qualificationsRes.data,
          colleges: collegesRes.data,
          companies: companiesRes.data,
        };
      } catch (error) {
        console.error('Error fetching master data:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 1,
  });

  return {
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
  };
};