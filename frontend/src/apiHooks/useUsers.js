import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

      return response.data || null;
    },
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
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
        queryClient.setQueryData(["userProfile", ownerId], response.data);
        queryClient.setQueryData(["singleContact", ownerId], response.data);
        queryClient.invalidateQueries(["userProfile", ownerId]);
        queryClient.invalidateQueries(["singleContact", ownerId]);
      }
    },
  });
};

// ------------------------------ These are moved from ContextFetch -------------------------------
export const useUsers = (filters = {}) => {
  const queryClient = useQueryClient();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;

  const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return searchParams.toString();
  };

  const {
    data: infiniteData,
    isLoading: usersLoading,
    refetch: refetchUsers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["users", tenantId, filters],
    queryFn: async ({ pageParam = 1 }) => {
      if (!tenantId) return { users: [], pagination: { totalItems: 0 } };
      const queryString = buildQueryString({
        ...filters,
        page: pageParam,
        limit: filters.limit || 20,
      });
      const url = `${config.REACT_APP_API_URL}/users/${tenantId}${queryString ? `?${queryString}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalItems = lastPage?.pagination?.totalItems || lastPage?.totalCount || 0;
      const loadedSoFar = allPages.reduce(
        (sum, p) => sum + (p?.users?.length || 0),
        0,
      );
      if (loadedSoFar < totalItems) {
        return allPages.length + 1; // 1-indexed pages
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!tenantId,
  });

  // Flatten all pages
  const users = infiniteData?.pages?.flatMap((p) => p?.users || []) || [];
  const totalItems = infiniteData?.pages?.[0]?.pagination?.totalItems || infiniteData?.pages?.[0]?.totalCount || 0;

  const usersRes = {
    users,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems,
      hasNext: !!hasNextPage,
      hasPrev: false,
    },
    totalCount: totalItems,
  };

  // ✅ Add or Update User
  const addOrUpdateUser = useMutation({
    mutationFn: async ({ userData, file, isFileRemoved, editMode }) => {
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

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Organization/new-user-Creation`,
        payload
      );

      // UPLOADING FILES LIKE IMAGES AND RESUMES
      if (isFileRemoved && !file) {
        await uploadFile(null, "image", "contact", response.data.contactId);
      } else if (file instanceof File) {
        await uploadFile(file, "image", "contact", response.data.contactId);
      }

      // Send welcome email only for new user creation
      // if (!editMode) {
      //   await axios.post(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
      //     email: userData.email,
      //     type: "usercreatepass",
      //   });
      // }

      return response.data;
    },
    onSuccess: () => {
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
