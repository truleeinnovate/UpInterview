import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";

export const useContacts = (organizationId, enabled = true) => {
  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contacts", organizationId],
    queryFn: async () => {
      const res = await axios.get(
        `${config.REACT_APP_API_URL}/contacts/organization/${organizationId}`
      );
      return res.data || [];
    },
    enabled: !!organizationId && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    contacts,
    isLoading,
    isError,
    error,
    refetch,
  };
};
