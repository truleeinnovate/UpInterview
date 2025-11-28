import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { notify } from "../../services/toastService";

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

// API call function
// Updated useSuperAdminUsers hook with proper parameter handling
export const useSuperAdminUsers = (filters = {}) => {
  const { search = "", role = "", page = 1, limit = 10 } = filters;

  return useQuery({
    queryKey: ["superAdminUsers", { search, role, page, limit }],
    queryFn: () => fetchSuperAdminUsers({ search, role, page, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      notify.error(error.message);
    },
  });
};

// Updated API call function with proper parameters
const fetchSuperAdminUsers = async (params = {}) => {
  try {
    const { search, role, page, limit } = params;
    const url = `${config.REACT_APP_API_URL}/users/super-admins`;

    const response = await axios.get(url, {
      params: {
        search: search || undefined,
        role: role || undefined,
        page: page || 1,
        limit: limit || 10,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching super admin users:", error);
    throw new Error("Failed to load super admin users");
  }
};
// const fetchSuperAdminUsers = async (params = {}) => {
//   try {
//     const url = `${config.REACT_APP_API_URL}/users/super-admins`;
//     const response = await axios.get(
//       url,
//       { params },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // v1.0.0 - Reverse to show latest at top
//     return (response.data || []).reverse();
//   } catch (error) {
//     console.error("Error fetching super admin users:", error);
//     throw new Error("Failed to load super admin users");
//   }
// };

// // React Query hook
// export const useSuperAdminUsers = () => {
//   return useQuery({
//     queryKey: ["superAdminUsers"],
//     queryFn: fetchSuperAdminUsers,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//     retry: 2,
//     onError: (error) => {
//       notify.error(error.message);
//     },
//   });
// };
