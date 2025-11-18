// v1.0.0 - Ashok - Added new apis for users migrated from Context

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config"; // assuming similar structure
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";
import { uploadFile } from "../apiHooks/imageApis";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";

// ✅ Custom hook to fetch user profile with optimized caching
export const useUserProfile = (usersId) => {
  const currentUser = usersId ? usersId : AuthCookieManager.getCurrentUserId();
  const {
    data: userProfile = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/users/owner/${currentUser}`
      );

      // console.log("response.data",response.data);

      return response.data || null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // 60 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    enabled: !!currentUser,
  });

  return { userProfile, isLoading, isError, error, refetch };
};

// ✅ Custom hook to fetch single contact data (replaces singlecontact from context)
export const useSingleContact = () => {
  const currentUser = AuthCookieManager.getCurrentUserId();
  const {
    data: singleContact = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["singleContact", currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/users/owner/${currentUser}`
      );
      return response.data || null;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!currentUser,
  });

  return { singleContact, isLoading, isError, error, refetch };
};

// ✅ Mutation for requesting email change (no changes here)
export const useRequestEmailChange = () =>
  useMutation({
    mutationFn: (payload) =>
      axios.post(
        `${config.REACT_APP_API_URL}/emails/auth/request-email-change`,
        payload
      ),
  });

// ✅ Optimized mutation for updating contact details
export const useUpdateContactDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resolvedId, data }) =>
      axios.patch(
        `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
        data
      ),

    onSuccess: (response, { data }) => {
      const ownerId = data?.id;
      if (ownerId) {
        // ✅ Optimistically update cache with server response
        queryClient.setQueryData(["userProfile", ownerId], response.data);
        queryClient.setQueryData(["singleContact", ownerId], response.data);

        // ✅ Then trigger a server refetch to confirm state
        queryClient.invalidateQueries(["userProfile", ownerId]);
        queryClient.invalidateQueries(["singleContact", ownerId]);
      }
    },
  });
};

// ------------------------------ These are moved from ContextFetch -------------------------------
export const useUsers = (filters = {}) => {
  const queryClient = useQueryClient();
  // Derive auth and tenant per invocation (avoid stale module-level values)
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;


  // ✅ Build query string properly
  const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Handle array parameters (like roles)
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  };
  

  let queryParams = filters
  console.log("queryParams queryParams", queryParams);
  console.log("tenantId tenantId", tenantId);

  // ✅ Fetch Users
  const {
    data: usersRes = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users", tenantId, filters],
    queryFn: async () => {
      if (!tenantId) return []; // Skip fetch if tenantId missing
      const queryString = buildQueryString(filters);
      const url = `${config.REACT_APP_API_URL}/users/${tenantId}${queryString ? `?${queryString}` : ''}`;
      
      console.log("API URL:", url);
      
      const response = await axios.get(url);
      return response.data;

      // Process image URLs
      // const processedUsers = response.data
      //   .map((contact) => {
      //     if (contact.imageData?.filename) {
      //       const imageUrl = `${
      //         config.REACT_APP_API_URL
      //       }/${contact.imageData.path.replace(/\\/g, "/")}`;
      //       return { ...contact, imageUrl };
      //     }
      //     return contact;
      //   })
      //   .reverse();

      // return response.data;
    },
    staleTime: 1000 * 60 * 30, // data fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // keep cache for 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!tenantId, // fetch only when tenantId exists
  });

  // ✅ Add or Update User
  const addOrUpdateUser = useMutation({
    mutationFn: async ({ userData, file, isFileRemoved, editMode }) => {
      console.log("addOrUpdateUser mutation payload:", { userData, editMode });

      const payload = {
        UserData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          tenantId: userData.tenantId, // Will be null for super admins
          phone: userData.phone,
          roleId: userData.roleId,
          countryCode: userData.countryCode,
          status: userData.status,
          isProfileCompleted: false,
          isEmailVerified: true,
          type: userData.type, // Include type
          ...(editMode && { _id: userData._id }), // Only include _id in edit mode
          editMode,
        },
        contactData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          tenantId: userData.tenantId, // Will be null for super admins
          countryCode: userData.countryCode,
        },
      };

      console.log(
        "Sending payload to /Organization/new-user-Creation:",
        payload
      );

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Organization/new-user-Creation`,
        payload
      );

      // UPLOADING FILES LIKE IMAGES AND RESUMES
      if (isFileRemoved && !file) {
        console.log("Removing file for contactId:", response.data.contactId);
        await uploadFile(null, "image", "contact", response.data.contactId);
      } else if (file instanceof File) {
        console.log("Uploading file for contactId:", response.data.contactId);
        await uploadFile(file, "image", "contact", response.data.contactId);
      }

      // Send welcome email only for new user creation
      if (!editMode) {
        console.log(`Sending welcome email to: ${userData.email}`);
        await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
          email: userData.email,
          type: "usercreatepass",
        });
      }

      return response.data;
    },
    onSuccess: () => {
      console.log("User operation successful, invalidating users query");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      console.error("User operation error:", error);
    },
  });

  // ✅ Toggle User Status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, newStatus }) => {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/users/${userId}/status`,
        {
          status: newStatus, // or you could send the new status explicitly
          updatedBy: `${userId}`, // Track who made the change
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // Refresh the users list
    },
    onError: (error) => {
      console.error("Status toggle error:", error);
      // toast.error("Failed to update user status");
    },
  });

  // ✅ Delete User
  const deleteUser = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(
        `${config.REACT_APP_API_URL}/users/${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // Refresh the users list
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      // toast.error("Failed to delete user");
    },
  });

  return {
    usersRes,
    usersLoading,
    refetchUsers,
    addOrUpdateUser,
    toggleUserStatus,
    deleteUser,
  };
};
