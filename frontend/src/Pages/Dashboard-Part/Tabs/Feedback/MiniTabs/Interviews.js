//<----v1.0.0---Venkatesh-----add isEditMode prop
// v1.0.1 - Ashok - Improved responsiveness

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import SchedulerSectionComponent from "./InterviewMiniTabs/SchedulerSection";
import InterviewerSectionComponent from "./InterviewMiniTabs/InterviewerSection";
import { Video } from "lucide-react";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
import { useLocation } from "react-router-dom";
import { extractUrlData } from "../../../../../apiHooks/useVideoCall";
import { useInterviews } from "../../../../../apiHooks/useInterviews";
import { useFeedbackData } from "../../../../../apiHooks/useFeedbacks";
import { useMockInterviewById } from "../../../../../apiHooks/useMockInterviews";
import useAutoSaveFeedback from "../../../../../apiHooks/useAutoSaveFeedback";

import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { flattenQuestionFeedback } from "../../../../videoCall/FeedbackForm";

const interviewMiniTabsList = [
  {
    id: 1,
    // name: "Scheduler Questions",
    name: "Preselected Questions",
  },
  {
    id: 2,
    // name: "Interviewer Questions",
    name: "Interviewer - added Questions",
  },
];

//<----v1.0.0---

// Question Bank Props
// interviewerSectionData,
// setInterviewerSectionData,
// removedQuestionIds,
// setRemovedQuestionIds,
// isQuestionBankOpen,
// setIsQuestionBankOpen,
// handleAddQuestionToRound,
// handleRemoveQuestion,
// handleToggleMandatory,
// Preselected Questions Responses Props
// preselectedQuestionsResponses,
// setPreselectedQuestionsResponses,
// handlePreselectedQuestionResponse,
// autoSaveQuestions,
// triggerAutoSave,

const InterviewsMiniTabComponent = ({
  custom,
  // interviewData,
  isAddMode,
  roundDetails,
  interviewRoundId,
  tab,
  page,
  closePopup,
  data,
  isEditMode,
  isViewMode,
  interviewType,
  roundId,
  decodedData,
}) => {
  const location = useLocation();
  const locationFeedback = location.state?.feedback;
  useScrollLock(true);

  // Question Bank State Management
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const currentTenantId = tokenPayload?.tenantId;
  const currentOwnerId = tokenPayload?.userId;

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );
  const { useInterviewDetails } = useInterviews();


  // Validation errors state
  const [errors, setErrors] = useState({
    overallRating: "",
    communicationRating: "",
    skills: "",
    comments: "",
    questions: "",
  });

  // Feedback query (existing)
  const {
    data: feedbackDatas,
    isLoading: feedbackLoading,
    isError: feedbackError,
  } = useFeedbackData({
    roundId: isViewMode ? roundId : !urlData.isCandidate ? urlData.interviewRoundId : null,
    // interviewerId: !urlData.isCandidate ? urlData.interviewerId : null,
    interviewerId: !urlData?.isCandidate && !urlData?.isSchedule ? urlData?.interviewerId : null,

    interviewType: urlData?.interviewType || interviewType,
  });

  // console.log("feedbackDatas feedbackDatas", feedbackDatas)

  const isMockInterview = urlData?.interviewType ? urlData?.interviewType === "mockinterview" : interviewType || locationFeedback?.isMockInterview;

  // ✅ ALWAYS call hooks
  const {
    mockInterview: mockinterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId || roundId : null,
    enabled: !isMockInterview,
  });

  const candidateData = isMockInterview
    ? mockinterview
    : interviewData?.candidateId || {};

  const positionData = isMockInterview ? {} : interviewData?.positionId || {};

  const interviewRoundData =
    interviewData || mockinterview || {};

  const feedbackData = useMemo(() => {
    const raw = locationFeedback || feedbackDatas || {};
    // If the API response has a feedbacks array, merge the first feedback's
    // fields into the top level so code can read feedbackData.questionFeedback,
    // feedbackData.skills, feedbackData.overallImpression, etc. directly.
    if (Array.isArray(raw?.feedbacks) && raw.feedbacks.length > 0) {
      const fb = raw.feedbacks[0];
      return {
        ...raw,
        // Merge feedback-specific fields that code reads from top level
        _id: fb._id,
        // Normalize questionFeedback: backend may return {preselected, interviewerAdded} object
        questionFeedback: Array.isArray(fb.questionFeedback)
          ? fb.questionFeedback
          : (fb.questionFeedback && typeof fb.questionFeedback === "object"
            ? [...(fb.questionFeedback.preselected || []), ...(fb.questionFeedback.interviewerAdded || [])]
            : []),
        skills: fb.skills,
        overallImpression: fb.overallImpression,
        generalComments: fb.generalComments,
        status: fb.status,
      };
    }
    return raw;
  }, [locationFeedback, feedbackDatas, isViewMode]);

  const getDefaultTab = () => {
    // If mock interview → default to Interviewer Questions (id: 2)
    if (urlData?.interviewType || interviewType === "mockinterview" || feedbackData?.isMockInterview === true) {
      return 2;
    }

    // If schedule mode → interviewer tab hidden → force 1
    if (urlData?.isSchedule) {
      return 1;
    }

    return 1;
  };

  console.log("feedbackData?.isMockInterview", feedbackData?.isMockInterview)

  const [interviewMiniTab, setInterviewMiniTab] = useState(getDefaultTab);


  // const feedbackData = React.useMemo(() => locationFeedback || {}, [locationFeedback]);
  const feedbackId =
    feedbackData?._id ||
    (Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0
      ? feedbackData.feedbacks[0]?._id
      : null);
  const [autoSaveFeedbackId, setAutoSaveFeedbackId] = useState(feedbackId);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (feedbackId) {
      setAutoSaveFeedbackId(feedbackId);
    }
  }, [feedbackId]);

  const triggerDebouncedSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSaveQuestions();
    }, 500);
  };

  console.log("feedbackData", feedbackData)

  // const getInterviewerSectionData = useCallback(() => {
  //   // Get merged question feedback from the feedbacks array (API response structure)
  //   let mergedQuestions = feedbackData?.questionFeedback;
  //   if (!mergedQuestions && Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0) {
  //     mergedQuestions = feedbackData.feedbacks[0].questionFeedback;
  //   }

  //   // Get interviewer-added questions from interviewQuestions
  //   const interviewerQuestions = feedbackData?.interviewQuestions?.interviewerAddedQuestions || [];

  //   // If no interviewer-added questions exist, return empty
  //   if (!interviewerQuestions || interviewerQuestions.length === 0) return [];

  //   // Map backend answer types to UI values
  //   const mapAnswerType = (type) => {
  //     if (type === "correct") return "Fully Answered";
  //     if (type === "partial") return "Partially Answered";
  //     if (type === "incorrect" || type === "not answered")
  //       return "Not Answered";
  //     return "Not Answered";
  //   };

  //   // For each interviewer-added question, find its saved feedback from the merged list
  //   return interviewerQuestions.map((q) => {
  //     const savedFeedback = mergedQuestions?.find(
  //       (mq) => String(mq._id) === String(q._id)
  //     );

  //     return {
  //       ...q,
  //       questionId: q.questionId || q._id,
  //       isAnswered: mapAnswerType(savedFeedback?.candidateAnswer?.answerType),
  //       isLiked: savedFeedback?.interviewerFeedback?.liked || "",
  //       whyDislike: savedFeedback?.interviewerFeedback?.dislikeReason || "",
  //       note: savedFeedback?.interviewerFeedback?.note || "",
  //       notesBool: !!savedFeedback?.interviewerFeedback?.note,
  //       // Preserve original data for reference
  //       originalData: q,
  //     };
  //   });
  // }, [feedbackData]);

  const getInterviewerSectionData = useCallback(() => {
    // 1. Try to get questions from the specific feedback object (if editing/viewing)
    //    Use flattenQuestionFeedback to handle both array and {preselected, interviewerAdded} formats
    let questions = flattenQuestionFeedback(feedbackData?.questionFeedback);

    // 2. If not found, check if feedbackData is a wrapper with a 'feedbacks' array
    if (questions.length === 0 && Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0) {
      questions = flattenQuestionFeedback(feedbackData.feedbacks[0].questionFeedback);
    }

    // 3. If still not found (e.g., new feedback), get from interviewQuestions (interviewer added)
    if (questions.length === 0) {
      questions = feedbackData?.interviewQuestions?.interviewerAddedQuestions || [];
    }

    if (!questions || questions.length === 0) return [];

    console.log("questions questions", questions);

    const allQuestions =
      Array.isArray(questions)
        ? questions.filter((q) => q?.addedBy === "interviewer")
        : [];

    return allQuestions.map((q) => {
      // Map backend answer types to UI values
      const mapAnswerType = (type) => {
        if (type === "correct") return "Fully Answered";
        if (type === "partial") return "Partially Answered";
        if (type === "incorrect" || type === "not answered")
          return "Not Answered";
        return "Not Answered";
      };

      return {
        ...q,
        questionId: q.questionId || q._id,
        isAnswered: mapAnswerType(q.candidateAnswer?.answerType),
        isLiked: q.interviewerFeedback?.liked || "",
        whyDislike: q.interviewerFeedback?.dislikeReason || "",
        note: q.interviewerFeedback?.note || "",
        notesBool: !!q.interviewerFeedback?.note,
        // Preserve original data for reference
        originalData: q,
      };
    });
  }, [feedbackData]);

  const [interviewerSectionData, setInterviewerSectionData] = useState(() => getInterviewerSectionData());

  // Only sync on initial data load (not on refetch during active editing)
  const hasInitialLoadRef = useRef(false);

  useEffect(() => {
    if (hasInitialLoadRef.current) return; // Already loaded, skip
    const data = getInterviewerSectionData();
    if (data.length > 0 || feedbackData?.interviewQuestions) {
      setInterviewerSectionData(data);
      hasInitialLoadRef.current = true;
    }
  }, [getInterviewerSectionData, feedbackData]);

  // Properly initialize preselected questions with full question data and responses
  // Properly initialize preselected questions with full question data and responses
  const getPreselectedQuestionsResponses = useCallback(() => {
    const preselectedQuestions =
      feedbackData?.interviewQuestions?.preselectedQuestions || [];

    // Get merged question feedback from the correct path in the API response
    let mergedQuestions = feedbackData?.questionFeedback;
    if (!mergedQuestions && Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0) {
      mergedQuestions = feedbackData.feedbacks[0].questionFeedback;
    }

    return preselectedQuestions.map((question) => {
      // Find existing feedback for this question by matching _id
      const existingFeedback = mergedQuestions?.find(
        (f) => String(f._id) === String(question._id)
      );

      return {
        // Include the full question data
        ...question,
        // Response data with proper defaults
        isAnswered: existingFeedback?.candidateAnswer?.answerType
          ? existingFeedback.candidateAnswer.answerType === "correct"
            ? "Fully Answered"
            : existingFeedback.candidateAnswer.answerType === "partial"
              ? "Partially Answered"
              : "Not Answered"
          : "Not Answered",
        isLiked: existingFeedback?.interviewerFeedback?.liked || "",
        whyDislike:
          existingFeedback?.interviewerFeedback?.dislikeReason || "",
        note: existingFeedback?.interviewerFeedback?.note || "",
        notesBool: !!existingFeedback?.interviewerFeedback?.note,
        answer: existingFeedback?.candidateAnswer?.submittedAnswer || "",
      };
    });
  }, [feedbackData]);

  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState(() => getPreselectedQuestionsResponses());

  // Only sync on initial data load
  const hasPreselectedLoadRef = useRef(false);

  useEffect(() => {
    if (hasPreselectedLoadRef.current) return; // Already loaded, skip
    const data = getPreselectedQuestionsResponses();
    if (data.length > 0 || feedbackData?.interviewQuestions) {
      setPreselectedQuestionsResponses(data);
      hasPreselectedLoadRef.current = true;
    }
  }, [getPreselectedQuestionsResponses, feedbackData]);

  // Clear specific error when user interacts with field
  const clearError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  console.log("feedbackData interviewRoundData", interviewRoundData);

  const {
    saveNow: autoSaveQuestions,
  } = useAutoSaveFeedback({
    isAddMode,
    isEditMode,
    isLoaded: !!feedbackData?._id || feedbackLoading === false,
    interviewRoundId:
      interviewRoundId ||
      urlData?.interviewRoundId ||
      decodedData?.interviewRoundId,
    tenantId: currentTenantId,
    interviewerId: decodedData?.interviewerId || urlData?.interviewerId,
    interviewerSectionData,
    preselectedQuestionsResponses,
    skillRatings: [],
    // overallRating,
    // communicationRating,
    // recommendation,
    // comments,
    candidateId: candidateData?._id || undefined,
    positionId:
      positionData?._id ||
      decodedData?.positionId ||
      urlData?.positionId ||
      undefined,
    ownerId: currentOwnerId,
    feedbackId: autoSaveFeedbackId,
    isMockInterview: urlData?.interviewType === "mockinterview" || false,

    feedbackCode:
      urlData?.interviewType === "mockinterview" ? interviewRoundData?.mockInterviewCode + "-001" :
        (interviewRoundData?.interviewCode
          ? `${interviewRoundData.interviewCode}-00${interviewRoundData?.rounds?.[0]?.sequence || ""}`
          : "") || "",
    // feedbackCode:
    //   feedbackData?.rounds[0]?.interviewCode ||
    //   "" + "-" + feedbackData?.rounds[0]?.sequence ||
    //   "",
  });

  // Question Bank Handler Functions
  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      if (typeof setInterviewerSectionData === "function") {
        setInterviewerSectionData((prevList) => {
          if (prevList.some((q) => q.questionId === question.questionId)) {
            return prevList;
          }
          const newList = [
            ...prevList,
            {
              ...question,
              addedBy: "interviewer",
              mandatory: "false", // Default to false when adding a new question
              snapshot: {
                ...question.snapshot,
                addedBy: "interviewer",
                mandatory: "false",
              },
            },
          ];

          // Clear questions error if questions are added
          if (newList.length > 0) {
            clearError("questions");
          }

          // Trigger immediate save after adding question
          // Trigger immediate save after adding question
          triggerDebouncedSave();
          // autoSaveQuestions();

          return newList;
        });
      } else {
        console.warn(
          "setInterviewerSectionData is not a function, cannot add question to round",
        );
      }
    }
  };

  const handleRemoveQuestion = (questionId) => {
    // console.log("Removing question:", questionId);

    // Remove question from interviewer section data
    setInterviewerSectionData((prev) =>
      prev.filter((q) => (q.questionId || q.id) !== questionId),
    );

    // Add to removed question IDs
    setRemovedQuestionIds((prev) => [...prev, questionId]);

    // Trigger auto-save
    // triggerAutoSave();
    // Trigger auto-save
    // triggerAutoSave();
    triggerDebouncedSave();
  };

  const handleToggleMandatory = (questionId) => {
    // console.log("Toggling mandatory for question:", questionId);

    // Toggle mandatory status for the question
    setInterviewerSectionData((prev) => {
      // console.log("Previous state:", prev);
      const updated = prev.map((q) => {
        if ((q.questionId || q.id) === questionId) {
          // console.log("Found question to toggle:", q);
          const newMandatory = q.mandatory === "true" ? "false" : "true";
          // console.log("New mandatory value:", newMandatory);
          return {
            ...q,
            mandatory: newMandatory,
            snapshot: q.snapshot
              ? {
                ...q.snapshot,
                mandatory: newMandatory,
              }
              : undefined,
          };
        }
        return q;
      });
      // console.log("Updated state:", updated);
      return updated;
    });
  };

  // const [interviewerSectionData, setInterviewerSectionData] = useState( [...selectedCandidate.interviewData?.questionFeedback]);
  // const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  // const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  // Question Bank Handler Functions
  // const handleAddQuestionToRound = (question) => {
  //   if (question && question.questionId && question.snapshot) {
  //     if (typeof setInterviewerSectionData === "function") {
  //       setInterviewerSectionData((prevList) => {
  //         if (prevList.some((q) => q.questionId === question.questionId)) {
  //           return prevList;
  //         }
  //         const newList = [
  //           ...prevList,
  //           {
  //             ...question,
  //             addedBy: "interviewer",
  //             mandatory: "false", // Default to false when adding a new question
  //             snapshot: {
  //               ...question.snapshot,
  //               addedBy: "interviewer",
  //               mandatory: "false",
  //             },
  //           },
  //         ];

  //         // Clear questions error if questions are added
  //         // if (newList.length > 0) {
  //         //   clearError('questions');
  //         // }

  //         // Trigger auto-save after adding question
  //         setTimeout(() => autoSaveQuestions(), 500);

  //         return newList;
  //       });
  //     } else {
  //       console.warn(
  //         "setInterviewerSectionData is not a function, cannot add question to round",
  //       );
  //     }
  //   }
  // };

  // const handleRemoveQuestion = (questionId) => {
  //   // Remove question from interviewer section data
  //   setInterviewerSectionData((prev) =>
  //     prev.filter((q) => (q.questionId || q.id) !== questionId),
  //   );

  //   // Add to removed question IDs
  //   setRemovedQuestionIds((prev) => [...prev, questionId]);

  //   // Trigger auto-save after removing question
  //   setTimeout(() => autoSaveQuestions(), 500);
  // };

  // const handleToggleMandatory = (questionId) => {
  //   // Toggle mandatory status for the question
  //   setInterviewerSectionData((prev) => {
  //     const updated = prev.map((q) => {
  //       if ((q.questionId || q.id) === questionId) {
  //         const newMandatory = q.mandatory === "true" ? "false" : "true";

  //         return {
  //           ...q,
  //           mandatory: newMandatory,
  //           snapshot: q.snapshot
  //             ? {
  //                 ...q.snapshot,
  //                 mandatory: newMandatory,
  //               }
  //             : undefined,
  //         };
  //       }
  //       return q;
  //     });

  //     // Trigger auto-save after toggling mandatory
  //     setTimeout(() => autoSaveQuestions(), 500);
  //     return updated;
  //   });
  // };

  // Preselected Questions Responses Handler Functions
  const handlePreselectedQuestionResponse = (questionId, responseData) => {
    setPreselectedQuestionsResponses((prev) => {
      const existingIndex = prev.findIndex((q) => q.questionId === questionId);
      if (existingIndex !== -1) {
        // Update existing response
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...responseData };
        return updated;
      } else {
        // Add new response
        return [...prev, { questionId, ...responseData }];
      }
    });
  };

  console.log(
    "preselectedQuestionsResponses preselectedQuestionsResponses",
    preselectedQuestionsResponses,
  );

  const meetingId = interviewData?.interviewRound?.meetingId;

  const handleTabChange = (tab) => {
    setInterviewMiniTab(tab);
  };
  //----v1.0.0--->

  const InterviewDisplayData = () => {
    switch (interviewMiniTab) {
      case 1:
        return (
          <SchedulerSectionComponent
            isEditMode={isEditMode}
            isAddMode={isAddMode}
            interviewdata={feedbackData}
            isViewMode={isViewMode}
            roundId={roundId}
            interviewType={interviewType}
            preselectedQuestionsResponses={preselectedQuestionsResponses}
            setPreselectedQuestionsResponses={setPreselectedQuestionsResponses}
            handlePreselectedQuestionResponse={
              handlePreselectedQuestionResponse
            }
            isSchedule={urlData?.isSchedule}
            triggerAutoSave={autoSaveQuestions}
          />
        ); //<----v1.0.0---
      case 2:
        return (
          <InterviewerSectionComponent
            closePopup={closePopup}
            tab={tab}
            page={page}
            isAddMode={isAddMode}
            isEditMode={isEditMode}
            isViewMode={isViewMode}
            // Question Bank Props
            interviewerSectionData={interviewerSectionData || []}
            setInterviewerSectionData={setInterviewerSectionData}

            preselectedQuestionsResponses={preselectedQuestionsResponses}
            // setPreselectedQuestionsResponses={setPreselectedQuestionsResponses}
            // handlePreselectedQuestionResponse={
            //   handlePreselectedQuestionResponse
            // }
            removedQuestionIds={removedQuestionIds}
            setRemovedQuestionIds={setRemovedQuestionIds}
            isQuestionBankOpen={isQuestionBankOpen}
            setIsQuestionBankOpen={setIsQuestionBankOpen}
            handleAddQuestionToRound={handleAddQuestionToRound}
            handleRemoveQuestion={handleRemoveQuestion}
            handleToggleMandatory={handleToggleMandatory}
            interviewData={interviewRoundData}
            decodedData={decodedData}
            triggerAutoSave={autoSaveQuestions}
            feedbackDataResponse={feedbackData}
          />
        ); //<----v1.0.0---
      default:
        return "";
    }
  };

  //<----v1.0.0----
  return (
    // v1.0.1 <-----------------------------------------------------------
    <div>
      {!custom && isAddMode && (
        <div className="mb-6">
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  meetingId,
                  // decodedData.meetLink
                  // interviewData?.meetingId,
                  "_blank",
                )
              }
              className="text-sm bg-custom-blue hover:bg-custom-blue/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start Meeting
            </button>
          </div>
        </div>
      )}
      {/* v1.0.1 <------------------------------------------------------------------------- */}
      {/* <ul className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2">
        {interviewMiniTabsList.map((each) => (
          <li
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
              interviewMiniTab === each.id
                ? "bg-[#227a8a] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(each.id)}
            key={each.id}
          >
            {each.name}
          </li>
        ))}
      </ul> */}
      <ul
        className="flex items-center gap-2 cursor-pointer md:text-sm px-2 mt-2 mb-4 
             overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        {interviewMiniTabsList
          .filter((each) => {
            const isMock =
              isMockInterview;

            if (urlData?.isSchedule && each.id === 2) return false;
            if (isMock && each.id === 1) return false;

            return true;
          })
          .map((each) => (
            <li
              key={each.id}
              className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors flex-shrink-0 ${interviewMiniTab === each.id
                ? "bg-[#227a8a] text-white"
                : "text-gray-700 hover:bg-gray-100"
                }`}
              onClick={() => handleTabChange(each.id)}
            >
              {each.name}
            </li>
          ))}
      </ul>
      {/* v1.0.1 -------------------------------------------------------------------------> */}

      <div className="px-2 py-2">{InterviewDisplayData()}</div>
    </div>
    // v1.0.1 ----------------------------------------------------------->
  );
};
//----v1.0.0---->

export default InterviewsMiniTabComponent;
