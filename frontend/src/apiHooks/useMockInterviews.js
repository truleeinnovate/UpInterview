// v1.0.0 - mansoor - changes to save the mock interview
// v2.0.1 - Ranjith added new changes to save the mock interview

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import { fetchFilterData } from "../api";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";
import { uploadFile } from "./imageApis";

export const useMockInterviews = () => {
  const queryClient = useQueryClient();
  const { effectivePermissions } = usePermissions();
  const initialLoad = useRef(true);

  // Check if user has permission to view mock interviews
  const hasViewPermission = effectivePermissions?.MockInterviews?.View;

  // Query implementation
  const {
    data: mockinterviewData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch: refetchMockInterviews,
  } = useQuery({
    queryKey: ["mockinterviews"],
    queryFn: async () => {
      try {
        const filteredInterviews = await fetchFilterData(
          "mockinterview",
          effectivePermissions
        );
        return filteredInterviews.reverse();
      } catch (err) {
        console.error("Fetch error:", err);
        throw err;
      }
    },
    enabled: !!hasViewPermission,
    retry: 1,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Add/Update mock interview mutation
// In useMockInterviews.js - FIXED VERSION
const addOrUpdateMockInterview = useMutation({
  mutationFn: async (params) => {
    const { formData, id, isEdit, userId, organizationId, resume, isResumeRemoved, round } = params;

    // ✅ CASE 1: Updating just the round (meeting link update)
    // if (round && id) {
    //   // ✅ Normalize id to _id before sending
    //   const normalizedRound = { ...round };
    //   if (normalizedRound.id && !normalizedRound._id) {
    //     normalizedRound._id = normalizedRound.id;
    //     delete normalizedRound.id;
    //   }
    
    //   const payload = { rounds: [normalizedRound] };
    //   const response = await axios.patch(
    //     `${config.REACT_APP_API_URL}/updateMockInterview/${id}`,
    //     payload
    //   );
    //   return response.data;
    // }
    

    // ✅ CASE 2: Normal full create/update
    if (!formData) throw new Error("formData is required for create/update");

    // Safely build rounds - FIXED: Handle both array and object formats
    let rounds = [];
    if (formData.rounds) {
      if (Array.isArray(formData.rounds)) {
        rounds = formData.rounds;
      } else if (typeof formData.rounds === 'object') {
        rounds = [formData.rounds];
      }
    }

    // Set proper status based on interviewers
    // const status = rounds.length > 0 && rounds[0]?.interviewers?.length > 0 ? "RequestSent" : "Draft";

    // Format skills properly
    const skills = formData.entries
      ? formData.entries
          .filter(e => e.skill || e.experience || e.expertise)
          .map(e => ({ skill: e.skill, experience: e.experience, expertise: e.expertise }))
      : formData.skills || [];

    // Build payload - FIXED: Include rounds only if they exist
    const payload = {
      skills,
      Role: formData.Role || "",
      candidateName: formData.candidateName || "",
      higherQualification: formData.higherQualification || "",
      currentExperience: formData.currentExperience || "",
      technology: formData.technology || "",
      jobDescription: formData.jobDescription || "",
      createdById: userId,
      lastModifiedById: userId,
      ownerId: userId,
      tenantId: organizationId,
    };

    // Only include rounds if they exist (for Page 2)
    if (rounds.length > 0) {
      payload.rounds = rounds.map(r => ({
        ...r,
        dateTime: formData.combinedDateTime || r.dateTime,
        // status,
        interviewers: Array.isArray(r.interviewers) ? r.interviewers : []
      }));
    }

    const url = isEdit
      ? `${config.REACT_APP_API_URL}/updateMockInterview/${id}`
      : `${config.REACT_APP_API_URL}/mockinterview`;

    const method = isEdit ? "patch" : "post";
    console.log("API Call:", { url, method, payload,isEdit });
    
    const response = await axios[method](url, payload);
    console.log("API Response:", response.data);

    // Handle resume upload
    const mockInterviewId = response.data.data?.mockInterview?._id || response.data.data?._id || response.data._id;
    if (mockInterviewId) {
      if (isResumeRemoved && !resume) {
        await uploadFile(null, "resume", "mockInterview", mockInterviewId);
      } else if (resume instanceof File) {
        await uploadFile(resume, "resume", "mockInterview", mockInterviewId);
      }
    }

    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["mockinterviews"]);
  },
  onError: (error) => {
    console.error("Mock interview error:", error);
  },
});
  

  // Calculate loading states
  const isMutationLoading = addOrUpdateMockInterview.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  return {
    mockinterviewData,
    isLoading,
    isQueryLoading,
    isMutationLoading,
    isError,
    error,
    isAddOrUpdateError: addOrUpdateMockInterview.isError,
    addOrUpdateError: addOrUpdateMockInterview.error,
    addOrUpdateMockInterview: addOrUpdateMockInterview.mutateAsync,
    refetchMockInterviews,
  };
};



// // v1.0.0  -  mansoor  -  changes to save the mock interview
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { useEffect, useRef } from "react";
// import { fetchFilterData } from "../api";
// import { config } from "../config";
// import { usePermissions } from "../Context/PermissionsContext";
// import { uploadFile } from "./imageApis";

// export const useMockInterviews = () => {
//   const queryClient = useQueryClient();
//   const { effectivePermissions } = usePermissions();
//   const initialLoad = useRef(true);

//   // Check if user has permission to view mock interviews
//   const hasViewPermission = effectivePermissions?.MockInterviews?.View;

//   // Query implementation
//   const {
//     data: mockinterviewData = [],
//     isLoading: isQueryLoading,
//     isError,
//     error,
//     refetch: refetchMockInterviews,
//   } = useQuery({
//     queryKey: ["mockinterviews"],
//     queryFn: async () => {
//       try {
//         const filteredInterviews = await fetchFilterData(
//           "mockinterview",
//           effectivePermissions
//         );
//         // console.log('Raw API response:', filteredInterviews[0]?.rounds?.interviewers);
//         // console.log('Raw API response:', filteredInterviews);
//         return filteredInterviews.reverse();
//       } catch (err) {
//         console.error("Fetch error:", err);
//         throw err;
//       }
//     },
//     enabled: !!hasViewPermission, // Only fetch if user has permission
//     retry: 1,
//     staleTime: 1000 * 60 * 10, // 10 minutes - data stays fresh longer
//     cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
//     refetchOnWindowFocus: false, // Don't refetch when window regains focus
//     refetchOnMount: false, // Don't refetch when component mounts if data exists
//     refetchOnReconnect: false, // Don't refetch on network reconnect
//   });

//   // useEffect(() => {
//   //   console.log('Mock interview data:', mockinterviewData);
//   //   if (mockinterviewData.length > 0) {
//   //     console.log('First interview data:', mockinterviewData[0]);
//   //     console.log('First interview rounds:', mockinterviewData[0].rounds);
//   //     if (mockinterviewData[0].rounds && mockinterviewData[0].rounds.length > 0) {
//   //       console.log('Interviewers data:', mockinterviewData[0].rounds[0].interviewers);
//   //       if (mockinterviewData[0].rounds[0].interviewers.length > 0) {
//   //         console.log('First interviewer contact:', mockinterviewData[0].rounds[0].interviewers[0].contact);
//   //       }
//   //     }
//   //   }
//   // }, [mockinterviewData]);

//   // Add/Update mock interview mutation
//   const addOrUpdateMockInterview = useMutation({
//     mutationFn: async ({
//       formData,
//       id,
//       isEdit,
//       userId,
//       organizationId,
//       resume,
//       isResumeRemoved,
//     }) => {
//       const status =
//         formData.rounds.interviewers?.length > 0 ? "Requests Sent" : "Draft";

//       // <----------------------------- v1.0.0
//       // Ensure rounds is always an array
//       const rounds = Array.isArray(formData.rounds)
//         ? formData.rounds
//         : [formData.rounds];

//       // Format the dateTime properly for the backend
//       const formatDateTime = (dateTimeStr) => {
//         if (!dateTimeStr) return new Date().toISOString();

//         try {
//           // Parse the date string (format: "18-07-2025 03:47 PM - 04:17")
//           const [datePart, timePart] = dateTimeStr.split(' ');
//           const [day, month, year] = datePart.split('-');

//           // Format as ISO string (backend expects this format)
//           return new Date(
//             `${year}-${month}-${day}T${timePart}:00.000Z`
//           ).toISOString();
//         } catch (error) {
//           console.error('Error formatting date:', error);
//           return new Date().toISOString();
//         }
//       };

//       const payload = {
//         // Filter out empty skill rows - only include rows where at least one field has a value
//         skills: formData.entries
//           ?.filter(entry => entry.skill || entry.experience || entry.expertise)
//           .map((entry) => ({
//             skill: entry.skill,
//             experience: entry.experience,
//             expertise: entry.expertise,
//         })),
//         Role: formData.Role,
//         candidateName: formData.candidateName,
//         higherQualification: formData.higherQualification,
//         currentExperience: formData.currentExperience,
//         technology: formData.technology,
//         jobDescription: formData.jobDescription,
//         rounds: rounds.map(round => ({
//           ...round,
//           dateTime: formatDateTime(formData.combinedDateTime || round.dateTime),
//           status: status,
//           // Ensure interviewers is always an array
//           interviewers: Array.isArray(round.interviewers) ? round.interviewers : []
//         })),
//         createdById: userId,
//         lastModifiedById: userId,
//         ownerId: userId,
//         tenantId: organizationId,
//       };

//       console.log('Sending payload:', JSON.stringify(payload, null, 2));
//       // v1.0.0 ----------------------------->

//       const url = isEdit
//         ? `${config.REACT_APP_API_URL}/updateMockInterview/${id}`
//         : `${config.REACT_APP_API_URL}/mockinterview`;

//       const response = await axios[isEdit ? "patch" : "post"](url, payload);

//       console.log("API response:", response.data); // Debug response

//       // Resume uploads
//       const mockInterviewId = response.data.data._id
//       if (isResumeRemoved && !resume) {
//         await uploadFile(null, "resume", "mockInterview", mockInterviewId);
//       } else if (resume instanceof File) {
//         await uploadFile(resume, "resume", "mockInterview", mockInterviewId);
//       }

//       // //  added by Ranjith - Check if interviewers exist and handle savedRound safely
//       // const hasInterviewers = formData.rounds?.interviewers?.length > 0;
//       // const savedRoundId = response.data.savedRound?._id || 
//       //                     response?.data?.rounds?._id || 
//       //                     response.data.rounds?.[0]?._id;

//       // if (
//       //   hasInterviewers &&
//       //   savedRoundId
//       // ) {
//       //   await Promise.all(
//       //     formData.rounds.interviewers.map(async (interviewerId) => {
//       //       const outsourceRequestData = {
//       //         tenantId: organizationId,
//       //         ownerId: userId,
//       //         scheduledInterviewId: interviewerId,
//       //         id: interviewerId,
//       //         dateTime: formData.combinedDateTime,
//       //         duration: formData.rounds.duration,
//       //         candidateId: formData.candidate?._id || null,
//       //         roundId: savedRoundId,
//       //         requestMessage: "Outsource interview request",
//       //         expiryDateTime: new Date(
//       //           Date.now() + 24 * 60 * 60 * 1000
//       //         ).toISOString(),
//       //       };
//       //       await axios.post(
//       //         `${config.REACT_APP_API_URL}/interviewrequest`,
//       //         outsourceRequestData
//       //       );
//       //     })
//       //   );
//       // }

//       return response.data;
//     },
//     onSuccess: () => {
//       console.log("Invalidating queries for mockinterviews");
//       queryClient.invalidateQueries(["mockinterviews"]);
//     },
//     onError: (error) => {
//       console.error("Mock interview error:", error);
//     },
//   });

//   // Calculate loading states
//   const isMutationLoading = addOrUpdateMockInterview.isPending;
//   const isLoading = isQueryLoading || isMutationLoading;

//   // Controlled logging
//   useEffect(() => {
//     if (initialLoad.current) {
//       initialLoad.current = false;
//       return;
//     }
//     // console.log('useMockInterviews state update:', {
//     //   mockInterviewCount: mockinterviewData.length,
//     //   isLoading,
//     //   isQueryLoading,
//     //   isMutationLoading
//     // });
//   }, [mockinterviewData.length, isLoading, isQueryLoading, isMutationLoading]);

//   return {
//     mockinterviewData,
//     isLoading,
//     isQueryLoading,
//     isMutationLoading,
//     isError,
//     error,
//     isAddOrUpdateError: addOrUpdateMockInterview.isError,
//     addOrUpdateError: addOrUpdateMockInterview.error,
//     addOrUpdateMockInterview: addOrUpdateMockInterview.mutateAsync,
//     refetchMockInterviews,
//   };
// };
