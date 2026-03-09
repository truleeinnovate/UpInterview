// useAutoSaveFeedback.js
// Custom hook for auto-saving feedback with proper debouncing & pending-save pattern

import { useEffect, useRef, useCallback } from "react";
import { useCreateFeedback, useUpdateFeedback } from "./useFeedbacks.js";

const DEBOUNCE_MS = 2000; // 2 seconds of idle before saving

const useAutoSaveFeedback = ({
  isAddMode,
  isEditMode,
  interviewRoundId,
  tenantId,
  interviewerId,
  interviewerSectionData,
  preselectedQuestionsResponses,
  skillRatings,
  technicalSkills,
  strengths,
  areasForImprovement,
  overallRating,
  communicationRating,
  recommendation,
  cultureFit,
  willingnessToLearn,
  comments,
  candidateId,
  positionId,
  ownerId,
  feedbackCode,
  isMockInterview,
  feedbackId,
  isLoaded = true,
  onFeedbackCreated,
}) => {
  const debounceTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const abortControllerRef = useRef(null);
  const baselineInitializedRef = useRef(false);

  // Keep isLoaded in a ref to access in callbacks without dependency changes
  const isLoadedRef = useRef(isLoaded);
  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // Use refs to hold the latest data to avoid stale closures
  const dataRef = useRef({
    interviewRoundId,
    tenantId,
    interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    technicalSkills,
    strengths,
    areasForImprovement,
    overallRating,
    communicationRating,
    recommendation,
    cultureFit,
    willingnessToLearn,
    comments,
    candidateId,
    positionId,
    ownerId,
    feedbackCode,
    isMockInterview,
    feedbackId,
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
      technicalSkills,
      strengths,
      areasForImprovement,
      overallRating,
      communicationRating,
      recommendation,
      cultureFit,
      willingnessToLearn,
      comments,
      candidateId,
      positionId,
      ownerId,
      feedbackCode,
      isMockInterview,
      feedbackId,
    };
  }, [
    interviewRoundId,
    tenantId,
    interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    technicalSkills,
    strengths,
    areasForImprovement,
    overallRating,
    communicationRating,
    recommendation,
    cultureFit,
    willingnessToLearn,
    comments,
    candidateId,
    positionId,
    ownerId,
    feedbackCode,
    isMockInterview,
    feedbackId,
  ]);

  const { mutateAsync: createFeedback } = useCreateFeedback();
  const { mutateAsync: updateFeedback } = useUpdateFeedback();

  // Helper to convert UI answer type to backend format
  const toBackendAnswerType = (ui) => {
    if (ui === "Fully Answered") return "correct";
    if (ui === "Partially Answered") return "partial";
    if (ui === "Not Answered") return "not answered";
    return "not answered";
  };

  // Prepare feedback payload using the current data from ref
  const prepareFeedbackPayload = useCallback(() => {
    const data = dataRef.current;

    const formattedTechnicalSkills = [];
    if (data.technicalSkills) {
      if (data.technicalSkills.strong) {
        data.technicalSkills.strong.forEach((s) =>
          formattedTechnicalSkills.push({
            skillName: s,
            level: "strong",
            rating: 5,
            note: "Strong",
          })
        );
      }
      if (data.technicalSkills.good) {
        data.technicalSkills.good.forEach((s) =>
          formattedTechnicalSkills.push({
            skillName: s,
            level: "good",
            rating: 4,
            note: "Good",
          })
        );
      }
      if (data.technicalSkills.basic) {
        data.technicalSkills.basic.forEach((s) =>
          formattedTechnicalSkills.push({
            skillName: s,
            level: "basic",
            rating: 3,
            note: "Basic",
          })
        );
      }
      if (data.technicalSkills.noExperience) {
        data.technicalSkills.noExperience.forEach((s) =>
          formattedTechnicalSkills.push({
            skillName: s,
            level: "noExperience",
            rating: 1,
            note: "No Experience",
          })
        );
      }
    }

    return {
      type: "draft",
      tenantId: data.tenantId || undefined,
      ownerId: data.ownerId || undefined,
      interviewRoundId: data.interviewRoundId || undefined,
      candidateId: data.candidateId || undefined,
      positionId: data.positionId || undefined,
      interviewerId: data.interviewerId || undefined,

      // Structured Technical Skills
      technicalSkills: formattedTechnicalSkills,

      // Technical Competency (Star Ratings)
      technicalCompetency:
        data.skillRatings && data.skillRatings.length > 0
          ? data.skillRatings
              .filter(
                (skill) =>
                  (skill.skill || skill.skillName) &&
                  (skill.skill || skill.skillName).trim() !== ""
              )
              .map((skill) => ({
                skillName: skill.skillName || skill.skill,
                rating: skill.rating || 0,
                notes: skill.notes || skill.comments || "",
              }))
          : [],

      questionFeedback: [
        ...(data.interviewerSectionData || []).map((question) => ({
          questionId:
            question.addedBy === "interviewer" && !question.originalData
              ? question
              : question._id || question.questionId || question.id,
          candidateAnswer: {
            answerType: toBackendAnswerType(
              question.isAnswered || "Not Answered"
            ),
            submittedAnswer: "",
          },
          interviewerFeedback: {
            liked: question.isLiked || "none",
            note: question.note || undefined,
            dislikeReason: question.whyDislike || undefined,
          },
        })),
        ...(data.preselectedQuestionsResponses || []).map((response) => ({
          questionId:
            typeof response === "string"
              ? response
              : response?._id ||
                response?.questionId ||
                response?.id ||
                "",
          candidateAnswer: {
            answerType: toBackendAnswerType(
              response.isAnswered || "Not Answered"
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

      // Questions Asked (detailed)
      questionsAsked: [
        ...(data.interviewerSectionData || []).map((question) => ({
          questionId: question._id || question.questionId || question.id,
          question: question.question,
          candidateAnswer: {
            answerType: toBackendAnswerType(
              question.isAnswered || "Not Answered"
            ),
            submittedAnswer: "",
          },
          interviewerFeedback: {
            liked: question.isLiked || "none",
            dislikeReason: question.whyDislike || undefined,
            note: question.note || undefined,
          },
          answered:
            question.isAnswered &&
            question.isAnswered !== "Not Answered",
          notes: question.note || "",
        })),
      ],

      isMockInterview: data.isMockInterview,
      strengths: (data.strengths || []).filter((s) => s && s.trim()),
      areasForImprovement: (data.areasForImprovement || []).filter(
        (s) => s && s.trim()
      ),
      generalComments: data.comments || "",
      additionalComments: data.comments || "",

      overallImpression: {
        overallRating: data.overallRating || 0,
        recommendation: data.recommendation || "Maybe",
        note: data.comments || "",
        cultureFit: data.cultureFit || 0,
        willingnessToLearn: data.willingnessToLearn || 0,
        communicationRating: data.communicationRating || 0,
      },
      status: "draft",
      feedbackCode: data.feedbackCode,
    };
  }, []);

  // ─── Core save function (no debounce, runs immediately) ──────────────
  const performSave = useCallback(async () => {
    // Block save if data is not loaded yet
    if (!isLoadedRef.current) {
      return;
    }

    const payload = prepareFeedbackPayload();

    // Initialize baseline if not set (first run after load) — don't save yet
    if (!baselineInitializedRef.current) {
      console.log("Initializing auto-save baseline (no save)");
      lastSavedDataRef.current = JSON.stringify(payload);
      baselineInitializedRef.current = true;
      return;
    }

    // Check if data has actually changed
    const currentDataString = JSON.stringify(payload);
    if (currentDataString === lastSavedDataRef.current) {
      return; // No changes
    }

    // If already saving, mark pending so we re-save after current finishes
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    const currentFeedbackId = dataRef.current.feedbackId;
    console.log(
      `🔄 Triggering auto-save... ID: ${currentFeedbackId || "New"}`
    );

    // Abort any stale in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      isSavingRef.current = true;
      let response;

      if (currentFeedbackId) {
        response = await updateFeedback({
          feedbackId: currentFeedbackId,
          feedbackData: payload,
        });
      } else {
        response = await createFeedback(payload);
        // Propagate newly created feedback ID back to the parent component
        const newId = response?.data?._id || response?._id;
        if (newId) {
          dataRef.current.feedbackId = newId;
          if (typeof onFeedbackCreated === "function") {
            onFeedbackCreated(newId);
          }
        }
      }

      if (response && (response.data?.success || response.success)) {
        // Snapshot the payload we just saved so we can diff against it next time
        lastSavedDataRef.current = JSON.stringify(
          prepareFeedbackPayload()
        );
        console.log("✅ Auto-save successful");
      }
    } catch (error) {
      // Ignore abort errors (expected when we cancel stale requests)
      if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") {
        return;
      }
      console.error("❌ Auto-save failed:", error);
    } finally {
      isSavingRef.current = false;

      // If another change arrived while we were saving, fire again immediately
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        // Use setTimeout(0) to avoid recursive stack growth
        setTimeout(() => performSave(), 0);
      }
    }
  }, [prepareFeedbackPayload, createFeedback, updateFeedback, onFeedbackCreated]);

  // ─── Debounced trigger (resets timer on every call) ──────────────────
  const triggerAutoSave = useCallback(() => {
    if (!isAddMode && !isEditMode) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, DEBOUNCE_MS);
  }, [isAddMode, isEditMode, performSave]);

  // ─── Auto-trigger on dependency changes ──────────────────────────────
  useEffect(() => {
    if (!isAddMode && !isEditMode) return;

    // Reset the debounce timer every time any tracked field changes
    triggerAutoSave();

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    isAddMode,
    isEditMode,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings,
    technicalSkills,
    strengths,
    areasForImprovement,
    overallRating,
    communicationRating,
    recommendation,
    cultureFit,
    willingnessToLearn,
    comments,
    triggerAutoSave,
  ]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Manual save function (can be called immediately, e.g. on Submit)
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await performSave();
  }, [performSave]);

  return { saveNow, isSaving: isSavingRef.current, triggerAutoSave };
};

export default useAutoSaveFeedback;
