import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import { fetchFilterData } from "../utils/dataUtils";
import { config } from "../config";
import { usePermissions } from "../Context/PermissionsContext";
import { uploadFile } from "./imageApis";

export const useMockInterviews = () => {
  const queryClient = useQueryClient();
  const { sharingPermissionscontext = {} } = usePermissions() || {};
  const initialLoad = useRef(true);

  // Use simple assignment instead of memo if issues persist
  const mockInterviewPermissions =
    sharingPermissionscontext?.mockInterviews || {};

  // Query implementation
  const {
    data: mockinterviewData = [],
    isLoading: isQueryLoading,
    isError,
    error,
    refetch: refetchMockInterviews,
  } = useQuery({
    queryKey: ["mockinterviews", mockInterviewPermissions],
    queryFn: async () => {
      try {
        const filteredInterviews = await fetchFilterData(
          "mockinterview",
          mockInterviewPermissions
        );
        // console.log('Raw API response:', filteredInterviews[0]?.rounds?.interviewers);
        // console.log('Raw API response:', filteredInterviews);
        return filteredInterviews.reverse();
      } catch (err) {
        console.error("Fetch error:", err);
        throw err;
      }
    },
    enabled: !!mockInterviewPermissions, // Original simpler condition
    retry: 1,
  });

  // useEffect(() => {
  //   console.log('Mock interview data:', mockinterviewData);
  //   if (mockinterviewData.length > 0) {
  //     console.log('First interview data:', mockinterviewData[0]);
  //     console.log('First interview rounds:', mockinterviewData[0].rounds);
  //     if (mockinterviewData[0].rounds && mockinterviewData[0].rounds.length > 0) {
  //       console.log('Interviewers data:', mockinterviewData[0].rounds[0].interviewers);
  //       if (mockinterviewData[0].rounds[0].interviewers.length > 0) {
  //         console.log('First interviewer contact:', mockinterviewData[0].rounds[0].interviewers[0].contact);
  //       }
  //     }
  //   }
  // }, [mockinterviewData]);

  // Add/Update mock interview mutation
  const addOrUpdateMockInterview = useMutation({
    mutationFn: async ({
      formData,
      id,
      isEdit,
      userId,
      organizationId,
      resume,
      isResumeRemoved,
    }) => {
      const status =
        formData.rounds.interviewers?.length > 0 ? "Requests Sent" : "Draft";
    
      // Ensure rounds is always an array
      const rounds = Array.isArray(formData.rounds) 
        ? formData.rounds 
        : [formData.rounds];
  
      // Format the dateTime properly for the backend
      const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return new Date().toISOString();
        
        try {
          // Parse the date string (format: "18-07-2025 03:47 PM - 04:17")
          const [datePart, timePart] = dateTimeStr.split(' ');
          const [day, month, year] = datePart.split('-');
          
          // Format as ISO string (backend expects this format)
          return new Date(
            `${year}-${month}-${day}T${timePart}:00.000Z`
          ).toISOString();
        } catch (error) {
          console.error('Error formatting date:', error);
          return new Date().toISOString();
        }
      };
  
      const payload = {
        skills: formData.entries?.map((entry) => ({
          skill: entry.skill,
          experience: entry.experience,
          expertise: entry.expertise,
        })),
        Role: formData.Role,
        candidateName: formData.candidateName,
        higherQualification: formData.higherQualification,
        currentExperience: formData.currentExperience,
        technology: formData.technology,
        jobDescription: formData.jobDescription,
        rounds: rounds.map(round => ({
          ...round,
          dateTime: formatDateTime(formData.combinedDateTime || round.dateTime),
          status: status,
          // Ensure interviewers is always an array
          interviewers: Array.isArray(round.interviewers) ? round.interviewers : []
        })),
        createdById: userId,
        lastModifiedById: userId,
        ownerId: userId,
        tenantId: organizationId,
      };
  
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      const url = isEdit
        ? `${config.REACT_APP_API_URL}/updateMockInterview/${id}`
        : `${config.REACT_APP_API_URL}/mockinterview`;

      const response = await axios[isEdit ? "patch" : "post"](url, payload);

      console.log("API response:", response.data); // Debug response

      // Resume uploads
      const mockInterviewId = response.data.data._id
      if (isResumeRemoved && !resume) {
        await uploadFile(null, "resume", "mockInterview", mockInterviewId);
      } else if (resume instanceof File) {
        await uploadFile(resume, "resume", "mockInterview", mockInterviewId);
      }

      if (
        formData.rounds.interviewers?.length > 0 &&
        response.data.savedRound?._id
      ) {
        await Promise.all(
          formData.rounds.interviewers.map(async (interviewerId) => {
            const outsourceRequestData = {
              tenantId: organizationId,
              ownerId: userId,
              scheduledInterviewId: interviewerId,
              id: interviewerId,
              dateTime: formData.combinedDateTime,
              duration: formData.rounds.duration,
              candidateId: formData.candidate?._id || null,
              roundId: response.data.savedRound._id,
              requestMessage: "Outsource interview request",
              expiryDateTime: new Date(
                Date.now() + 24 * 60 * 60 * 1000
              ).toISOString(),
            };
            await axios.post(
              `${config.REACT_APP_API_URL}/interviewrequest`,
              outsourceRequestData
            );
          })
        );
      }

      return response.data;
    },
    onSuccess: () => {
      console.log("Invalidating queries for mockinterviews");
      queryClient.invalidateQueries(["mockinterviews"]);
    },
    onError: (error) => {
      console.error("Mock interview error:", error);
    },
  });

  // Calculate loading states
  const isMutationLoading = addOrUpdateMockInterview.isPending;
  const isLoading = isQueryLoading || isMutationLoading;

  // Controlled logging
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    // console.log('useMockInterviews state update:', {
    //   mockInterviewCount: mockinterviewData.length,
    //   isLoading,
    //   isQueryLoading,
    //   isMutationLoading
    // });
  }, [mockinterviewData.length, isLoading, isQueryLoading, isMutationLoading]);

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
