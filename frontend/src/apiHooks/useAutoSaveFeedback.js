// useAutoSaveFeedback.js
// Custom hook for auto-saving feedback with debouncing

import { useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { config } from "../config.js";
import { useCreateFeedback, useUpdateFeedback } from "./useFeedbacks.js";
// import { notify } from "../../services/toastService.js";

const useAutoSaveFeedback = ({
  isAddMode,
  interviewRoundId,
  tenantId,
  interviewerId,
  interviewerSectionData,
  preselectedQuestionsResponses,
  skillRatings,
  overallRating,
  communicationRating,
  recommendation,
  comments,
  candidateId,
  positionId,
  ownerId,
  feedbackCode,
  isMockInterview,
  feedbackId, // For PATCH operations if feedback already exists
}) => {
  const timeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isSavingRef = useRef(false);
  const { mutate: createFeedback, isLoading: isCreating } = useCreateFeedback();
  const { mutate: updateFeedback, isLoading: isUpdating } = useUpdateFeedback();

  // Helper to convert UI answer type to backend format
  const toBackendAnswerType = (ui) => {
    if (ui === "Fully Answered") return "correct";
    if (ui === "Partially Answered") return "partial";
    if (ui === "Not Answered") return "incorrect";
    return "not answered";
  };

  console.log("useAutoSaveFeedback called with feedbackId:", {
    isAddMode,
    interviewRoundId,
    tenantId,
    interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    overallRating,
    communicationRating,
    recommendation,
    comments,
    candidateId,
    positionId,
    ownerId,
    feedbackCode,
    feedbackId, // For PATCH operations if feedback already exists
    isMockInterview
  });

  // Prepare feedback payload
  const prepareFeedbackPayload = useCallback(() => {
    return {
      type: "draft",
      tenantId: tenantId || undefined,
      ownerId: ownerId || undefined,
      interviewRoundId: interviewRoundId || undefined,
      candidateId: candidateId || undefined,
      positionId: positionId || undefined,
      interviewerId: interviewerId || undefined,
      skills:
        skillRatings.length > 0
          ? skillRatings.map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments || "",
          }))
          : undefined,
      questionFeedback: [
        // Interviewer section questions
        ...(interviewerSectionData || []).map((question) => ({
          questionId: question,
          candidateAnswer: {
            answerType: toBackendAnswerType(
              question.isAnswered || "Not Answered",
            ),
            submittedAnswer: "",
          },
          interviewerFeedback: {
            liked: question.isLiked || "none",
            note: question.note || undefined,
            dislikeReason: question.whyDislike || undefined,
          },
        })),
        // Preselected questions responses
        ...(preselectedQuestionsResponses || []).map((response) => ({
          questionId:
            typeof response === "string"
              ? response
              : response?.questionId || response?.id || response?._id || "",
          candidateAnswer: {
            answerType: toBackendAnswerType(
              response.isAnswered || "Not Answered",
            ),
            submittedAnswer: "",
          },
          interviewerFeedback: {
            liked: response.isLiked || "none",
            note: response.note || undefined,
            dislikeReason: response.whyDislike || undefined,
          },
        })),
      ],
      isMockInterview: isMockInterview,
      generalComments: comments || "",
      overallImpression: {
        overallRating: overallRating || 0,
        communicationRating: communicationRating || 0,
        recommendation: recommendation || "Maybe",
        note: "",
      },
      status: "draft",
    };
  }, [
    tenantId,
    ownerId,
    interviewRoundId,
    candidateId,
    positionId,
    interviewerId,
    skillRatings,
    interviewerSectionData,
    preselectedQuestionsResponses,
    comments,
    overallRating,
    communicationRating,
    isMockInterview,
    recommendation,
    feedbackCode
    // feedbackId,
  ]);

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    const currentData = JSON.stringify(prepareFeedbackPayload());
    const lastData = lastSavedDataRef.current;
    return currentData !== lastData;
  }, [prepareFeedbackPayload]);

  // Auto-save function
  // const autoSave = useCallback(async () => {
  //   if (!isAddMode || isSavingRef.current || !hasDataChanged()) {
  //     return;
  //   }

  //   try {
  //     isSavingRef.current = true;
  //     //   const authToken = Cookies.get("authToken");
  //     const payload = prepareFeedbackPayload();

  //     console.log("🔄 Auto-saving feedback...", feedbackId);
  //     console.log("🔄 Auto-saving feedback...", payload);

  //     let response;
  //     if (feedbackId) {
  //       // PATCH - Update existing feedback
  //       response = await updateFeedback({ feedbackId, feedbackData: payload });
  //       //  await axios.patch(
  //       //   `${config.REACT_APP_API_URL}/feedback/${feedbackId}`,
  //       //   payload,
  //       //   {
  //       //     headers: {
  //       //       Authorization: `Bearer ${authToken}`,
  //       //       "Content-Type": "application/json",
  //       //     },
  //       //   }
  //       // );
  //     } else {
  //       // POST - Create new feedback

  //       response = await createFeedback(payload);
  //       // response = await axios.post(
  //       //   `${config.REACT_APP_API_URL}/feedback`,
  //       //   payload,
  //       //   {
  //       //     headers: {
  //       //       Authorization: `Bearer ${authToken}`,
  //       //       "Content-Type": "application/json",
  //       //     },
  //       //   }
  //       // );
  //     }

  //     console.log("✅ Auto-save response:", response);

  //     if (response.data.success) {
  //       lastSavedDataRef.current = JSON.stringify(payload);
  //       console.log("✅ Auto-save successful");
  //       // Optional: Show subtle notification
  //       // notify.success("Changes saved", { autoClose: 1000 });
  //     }
  //   } catch (error) {
  //     console.error("❌ Auto-save failed:", error);
  //     // Optional: Show error notification
  //     // notify.error("Failed to auto-save changes");
  //   } finally {
  //     isSavingRef.current = false;
  //   }
  // }, [isAddMode, feedbackId, prepareFeedbackPayload, hasDataChanged]);

  // useAutoSaveFeedback.js - Add this function
  const triggerAutoSave = useCallback(async () => {
    if (!isAddMode || isSavingRef.current) {
      return;
    }
    console.log("🔄 Triggering immediate auto-save...", feedbackId);
    // console.log(
    //   "🔄 Triggering payload auto-save with data:",
    //   prepareFeedbackPayload(),
    // );
    try {
      isSavingRef.current = true;
      const payload = prepareFeedbackPayload();

      console.log("🔄 Triggering immediate auto-save...", feedbackId);

      let response;
      if (feedbackId) {
        response = await updateFeedback({ feedbackId, feedbackData: payload });
      } else {
        response = await createFeedback(payload);
      }
      // console.log("✅ Immediate auto-save response:", response);

      if (response.data.success) {
        lastSavedDataRef.current = JSON.stringify(payload);
        console.log("✅ Immediate auto-save successful");
      }
    } catch (error) {
      console.error("❌ Immediate auto-save failed:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [
    isAddMode,
    feedbackId,
    prepareFeedbackPayload,
    updateFeedback,
    createFeedback,
  ]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isAddMode) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for 30 seconds
    timeoutRef.current = setTimeout(() => {
      triggerAutoSave();
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isAddMode,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    overallRating,
    communicationRating,
    recommendation,
    comments,
    triggerAutoSave,
  ]);

  // Manual save function (can be called immediately)
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await triggerAutoSave();
  }, [triggerAutoSave]);

  return { saveNow, isSaving: isSavingRef.current, triggerAutoSave };
};

export default useAutoSaveFeedback;
