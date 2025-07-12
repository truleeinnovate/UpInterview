import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config"; // assuming similar structure
import AuthCookieManager from "../utils/AuthCookieManager/AuthCookieManager";


// ✅ Custom hook to fetch user profile
export const useUserProfile = () => {
  const currentUser = AuthCookieManager.getCurrentUserId();
  const {
    data: userProfile = null,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", currentUser],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/owner/${currentUser}`);
      
      // console.log("response.data",response.data);

      return response.data || null;
    },
    staleTime: 0, // ✅ Always fetch fresh data
    cacheTime: 0, // ✅ Discard cache immediately
    enabled: !!currentUser,
  });

  return { userProfile, isLoading, isError, error };
};



// const useUserProfile = (ownerId) => {
//   const {
//     data: userProfile = null,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["userProfile", ownerId],
//     queryFn: async () => {
//       if (!ownerId) return null;

//       const response = await axios.get(
//         `${config.REACT_APP_API_URL}/users/owner/${ownerId}`
//       );

//       const contact = response.data;

//       console.log("contact response", contact);

//       if (contact && contact._id) {
//         return contact;
//       }

//       return null;
//     },
//     // staleTime: 0, // ✅ data becomes stale immediately so it refetches
// //   cacheTime: 1000 * 60 * 5,
//     enabled: !!ownerId,
//     // retry: 1,
//     // ❌ staleTime: avoid unless necessary so it always refetches on invalidation
//     // staleTime: 1000 * 60 * 5,
//   });

//   return {
//     userProfile,
//     isLoading,
//     isError,
//     error,
//   };
// };








// ✅ Mutation for requesting email change (no changes here)


export const useRequestEmailChange = () =>
  useMutation({
    mutationFn: (payload) =>
      axios.post(`${config.REACT_APP_API_URL}/emails/auth/request-email-change`, payload),
  });


  export const useUpdateContactDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resolvedId, data }) =>
      axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),

    onSuccess: (response, { data }) => {
      const ownerId = data?.id;
      if (ownerId) {
        // ✅ Update with latest server data, not optimistic
        queryClient.setQueryData(["userProfile", ownerId], response.data);

        // ✅ Then trigger a server refetch to confirm state
        queryClient.invalidateQueries(["userProfile", ownerId]);
      }
    },
  });
};


// ✅ Mutation for updating user profile details
// export const useUpdateContactDetail = () => {
//   const queryClient = useQueryClient(); // 🔧 get query client instance

//   return useMutation({
//   mutationFn: ({ resolvedId, data }) =>
//     axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),

//   onSuccess: (response, { data }) => {
//   const ownerId = data?.id;
//   if (ownerId) {
//     // ✅ Use the latest server data directly instead of manually merging
//     queryClient.setQueryData(["userProfile", ownerId], response.data);

//     // ✅ Trigger a refetch anyway to confirm server state
//     queryClient.invalidateQueries(["userProfile", ownerId]);
//   }
// }


// //   onSuccess: (response, { data }) => {
// //     const ownerId = data?.id;
// //     if (ownerId) {
// //       // ✅ Immediately update cache for instant UI update
// //       queryClient.setQueryData(["userProfile", ownerId], (old) => ({
// //         ...old,
// //         ...data,
// //       }));

// //       // ✅ Then trigger refetch to sync with server
// //       queryClient.invalidateQueries(["userProfile", ownerId]);
// //     }
// //   },
// });


// //   return useMutation({
// //   mutationFn: ({ resolvedId, data }) =>
// //     axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),

// //   onSuccess: (response, { data }) => {
// //     const ownerId = data?.id;
// //     if (ownerId) {
// //       queryClient.invalidateQueries(["userProfile", ownerId]); // ✅ refetch updated data
// //     }
// //   },
// // });

// //   return useMutation({
// //     mutationFn: ({ resolvedId, data }) =>
// //       axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),

// //     // ✅ Automatically refetch the profile after successful update
// //     onSuccess: (response, { data }) => {
// //       const ownerId = data?.id; // assumes id used in query key
// //       if (ownerId) {
// //         queryClient.invalidateQueries(["userProfile", ownerId]); // ✅ trigger refetch of updated profile
// //       }

// //       // ✅ Optional: instantly reflect the changes before refetch completes
// //       queryClient.setQueryData(["userProfile", ownerId], (old) => ({
// //         ...old,
// //         ...data,
// //       }));
// //     },
// //   });
// };



// export const useUserProfile = (ownerId) => {
//   const {
//     data: userProfile = null,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["userProfile", ownerId],
//     queryFn: async () => {
//       if (!ownerId) return null;

//       const response = await axios.get(
//         `${config.REACT_APP_API_URL}/users/owner/${ownerId}`
//       );

//       const contact = response.data;

//       console.log("contact response",contact);

//       // Check if it's a valid object with an _id
//       if (contact && contact._id) {
//         return contact;
//       }

//       return null;
//     },
//     enabled: !!ownerId,
//     retry: 1,
//     // staleTime: 1000 * 60 * 5,
//   });

//   return {
//     userProfile,
//     isLoading,
//     isError,
//     error,
//   };
// };

// // for email change and for updation 
// export const useRequestEmailChange = () =>
//   useMutation({
//     mutationFn: (payload) =>
//       axios.post(`${config.REACT_APP_API_URL}/emails/auth/request-email-change`, payload),
//   });

// // for user edit profiles  updation 
//   export const useUpdateContactDetail = () =>
//   useMutation({
//     mutationFn: ({ resolvedId, data }) =>
//       axios.patch(`${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`, data),
//   });