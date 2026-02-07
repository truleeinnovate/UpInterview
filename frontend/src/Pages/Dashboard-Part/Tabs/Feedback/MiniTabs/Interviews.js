//<----v1.0.0---Venkatesh-----add isEditMode prop
// v1.0.1 - Ashok - Improved responsiveness

import React, { useMemo, useState } from "react";
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

const InterviewsMiniTabComponent = ({
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
  decodedData,
  // autoSaveQuestions,
  // triggerAutoSave,
}) => {
  const location = useLocation();
  const locationFeedback = location.state?.feedback;
  useScrollLock(true);
  const [interviewMiniTab, setInterviewMiniTab] = useState(1);
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
    roundId: !urlData.isCandidate ? urlData.interviewRoundId : null,
    interviewerId: !urlData.isCandidate ? urlData.interviewerId : null,
    interviewType: urlData?.interviewType,
  });

  const isMockInterview = urlData?.interviewType === "mockinterview";

  // ✅ ALWAYS call hooks
  const {
    mockInterview: mockinterview,
    isMockLoading,
    isError: isMockError,
  } = useMockInterviewById({
    mockInterviewRoundId: isMockInterview ? urlData.interviewRoundId : null,
    enabled: isMockInterview, // ✅ THIS LINE
    // mockInterviewId: null,
  });

  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: interviewError,
  } = useInterviewDetails({
    roundId: !isMockInterview ? urlData.interviewRoundId : null,
    enabled: !isMockInterview,
  });

  const candidateData = isMockInterview
    ? mockinterview
    : interviewData?.candidateId || {};

  const positionData = isMockInterview ? {} : interviewData?.positionId || {};

  const feedbackData = useMemo(() => {
    return locationFeedback || feedbackDatas || {};
  }, [locationFeedback, feedbackDatas]);

  // const feedbackData = React.useMemo(() => locationFeedback || {}, [locationFeedback]);
  const feedbackId =
    feedbackData?._id ||
    (Array.isArray(feedbackData?.feedbacks) && feedbackData.feedbacks.length > 0
      ? feedbackData.feedbacks[0]?._id
      : null);
  const [autoSaveFeedbackId, setAutoSaveFeedbackId] = useState(feedbackId);

  const [interviewerSectionData, setInterviewerSectionData] = useState(() => {
    if (!feedbackData?.questionFeedback) return [];

    return feedbackData.questionFeedback.map((q) => {
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
  });

  // Properly initialize preselected questions with full question data and responses
  const [preselectedQuestionsResponses, setPreselectedQuestionsResponses] =
    useState(() => {
      const preselectedQuestions =
        feedbackData?.interviewQuestions?.preselectedQuestions || [];

      return preselectedQuestions.map((question) => {
        // Find existing feedback for this question
        const existingFeedback = feedbackData?.questionFeedback?.find(
          (f) => f.questionId === (question.questionId || question._id),
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
    });

  // Clear specific error when user interacts with field
  const clearError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  console.log("feedbackData autoSaveQuestions", feedbackData);

  const {
    saveNow: autoSaveQuestions,
    // saveNow,
    // : autoSaveQuestions,
    // isSaving: autoSaveQuestions,
    // triggerAutoSave,
  } = useAutoSaveFeedback({
    isAddMode,
    isEditMode,
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
      feedbackData?.rounds?.[0]?.interviewCode ||
      "" + "-" + (feedbackData?.rounds?.[0]?.sequence || ""),
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
          setTimeout(() => autoSaveQuestions(), 500);
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
    setTimeout(() => autoSaveQuestions(), 500);
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
            preselectedQuestionsResponses={preselectedQuestionsResponses}
            setPreselectedQuestionsResponses={setPreselectedQuestionsResponses}
            handlePreselectedQuestionResponse={
              handlePreselectedQuestionResponse
            }
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
            // preselectedQuestionsResponses={preselectedQuestionsResponses}
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
            interviewData={interviewData}
            decodedData={decodedData}
            triggerAutoSave={autoSaveQuestions}
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
      {isAddMode && (
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
        {interviewMiniTabsList.map((each) => (
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
