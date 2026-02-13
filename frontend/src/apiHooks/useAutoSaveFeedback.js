// useAutoSaveFeedback.js
// Custom hook for auto-saving feedback with debouncing

import { useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { config } from "../config.js";
import { useCreateFeedback, useUpdateFeedback } from "./useFeedbacks.js";

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
  isLoaded = true, // New prop to prevent saving before data is loaded
}) => {
  const timeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isSavingRef = useRef(false);

  // Keep isLoaded in a ref to access in callbacks without dependency changes
  const isLoadedRef = useRef(isLoaded);
  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // Use refs to hold the latest data to avoid stale closures in setTimeout/callbacks
  const dataRef = useRef({
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
    feedbackId
  });

  // Update data ref whenever dependencies change
  useEffect(() => {
    dataRef.current = {
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
      feedbackId
    };
  }, [
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
    feedbackId
  ]);

  const { mutateAsync: createFeedback } = useCreateFeedback();
  const { mutateAsync: updateFeedback } = useUpdateFeedback();

  // Helper to convert UI answer type to backend format
  const toBackendAnswerType = (ui) => {
    if (ui === "Fully Answered") return "correct";
    if (ui === "Partially Answered") return "partial";
    if (ui === "Not Answered") return "incorrect";
    return "not answered";
  };

  // Prepare feedback payload using the current data from ref
  const prepareFeedbackPayload = useCallback(() => {
    const data = dataRef.current;

    return {
      type: "draft",
      tenantId: data.tenantId || undefined,
      ownerId: data.ownerId || undefined,
      interviewRoundId: data.interviewRoundId || undefined,
      candidateId: data.candidateId || undefined,
      positionId: data.positionId || undefined,
      interviewerId: data.interviewerId || undefined,
      skills:
        data.skillRatings && data.skillRatings.length > 0
          ? data.skillRatings.map((skill) => ({
            skillName: skill.skill,
            rating: skill.rating,
            note: skill.comments || "",
          }))
          : undefined,
      questionFeedback: [
        // Interviewer section questions
        // For new interviewer-added questions, send full question object
        // For existing ones, send _id (InterviewQuestions ID) for backend matching
        ...(data.interviewerSectionData || []).map((question) => ({
          questionId: question.addedBy === "interviewer" && !question.originalData
            ? question
            : (question._id || question.questionId || question.id),
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
        // IMPORTANT: Send _id (InterviewQuestions ID) as questionId, NOT
        // questionId (QuestionBank ID), because the backend answerMap keys
        // by questionId and looks up by InterviewQuestions._id
        ...(data.preselectedQuestionsResponses || []).map((response) => ({
          questionId:
            typeof response === "string"
              ? response
              : response?._id || response?.questionId || response?.id || "",
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
      isMockInterview: data.isMockInterview,
      generalComments: data.comments || "",
      overallImpression: {
        overallRating: data.overallRating || 0,
        communicationRating: data.communicationRating || 0,
        recommendation: data.recommendation || "Maybe",
        note: "",
      },
      status: "draft",
      feedbackCode: data.feedbackCode,
    };
  }, []);

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    const currentPayload = prepareFeedbackPayload();
    // We remove fields that might be indeterminate or not relevant for change detection if needed
    // But JSON stringify is usually fine for deep comparison of simple objects
    const currentDataString = JSON.stringify(currentPayload);
    const lastDataString = lastSavedDataRef.current;

    return currentDataString !== lastDataString ? currentPayload : null;
  }, [prepareFeedbackPayload]);

  const triggerAutoSave = useCallback(() => {
    if (!isAddMode) return;

    // Clear any existing timeout to ensure we debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;

      // Block save if data is not loaded yet
      if (!isLoadedRef.current) {
        // console.log("Skipping auto-save: Data not loaded yet");
        return;
      }

      const payload = prepareFeedbackPayload();

      // Initialize baseline if not set (first run after load)
      if (!lastSavedDataRef.current) {
        console.log("Initializing auto-save baseline (no save)");
        lastSavedDataRef.current = JSON.stringify(payload);
        return;
      }

      const changedPayload = hasDataChanged();

      // If no changes, don't save. 
      if (!changedPayload) {
        return;
      }

      const finalPayload = changedPayload;
      const currentFeedbackId = dataRef.current.feedbackId;

      console.log(`🔄 Triggering auto-save... ID: ${currentFeedbackId || 'New'}`);

      try {
        isSavingRef.current = true;
        let response;

        if (currentFeedbackId) {
          response = await updateFeedback({ feedbackId: currentFeedbackId, feedbackData: finalPayload });
        } else {
          response = await createFeedback(finalPayload);
        }

        if (response && (response.data?.success || response.success)) {
          lastSavedDataRef.current = JSON.stringify(finalPayload);
          console.log("✅ Auto-save successful");
          // Note: Don't invalidate cache here — it would trigger a refetch that
          // resets form state (notesBool, selections etc). The initial GET on
          // page load already populates the form with previously saved data.
        }
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, 1000); // 1 second debounce
  }, [isAddMode, prepareFeedbackPayload, hasDataChanged, createFeedback, updateFeedback]);

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
    // We still depend on props to reset the timer when user types
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
  // This is what the component calls as 'autoSaveQuestions'
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await triggerAutoSave();
  }, [triggerAutoSave]);

  return { saveNow, isSaving: isSavingRef.current, triggerAutoSave };
};

export default useAutoSaveFeedback;
