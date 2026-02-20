// v1.0.0 - Ashok - removed show and hide toggle
/* v1.0.1 - Ashok - fixed the sequence issue and when the view is Horizontal
   click on delete deleting the card but not closing the delete confirmation popup
*/

/* 
   v1.0.2 - Ashok - fixed z-index issue and added createPortal using this
   lets you render a React component into a different part of the DOM
   outside its parent hierarchy.
*/
// v1.0.3 - Ashok - Improved responsiveness
// v1.0.4 - Ashok - Fixed style issues

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
// v1.0.2 <--------------------------------------------------
import { createPortal } from "react-dom";
// v1.0.2 -------------------------------------------------->

import {
  Clock,
  // Users,
  ChevronUp,
  ChevronDown,
  FileText,
  User,
  XCircle,
  // Info,
  Edit,
  ExternalLink,
  Calendar,
} from "lucide-react";

// import toast from "react-hot-toast";
import InterviewerAvatar from "./InterviewerAvatar";
// import { useCustomContext } from "../../Context/Contextfetch";
// import { useInterviewerDetails } from "../../utils/CommonFunctionRoundTemplates";
import { Button } from "../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button";
import { useAssessments } from "../../apiHooks/useAssessments";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates";
import { notify } from "../../services/toastService";

const RoundCard = ({
  round,
  onEdit,
  isActive = false,
  hideHeader = false,
  template,
}) => {
  //console.log("rounds---",round.interviewers)

  // const { deleteRoundMutation } = useInterviewTemplates();
  const { deleteRound } = useInterviewTemplates();
  const { fetchAssessmentQuestions } = useAssessments();

  const handleDeleteRound = async () => {
    // console.log("round", round);
    try {
      await deleteRound(round?._id);
      // v1.0.1 <----------------------------------------------------------------------
      setShowDeleteConfirmModal(false); // close the modal here
      // v1.0.1 ---------------------------------------------------------------------->
      notify.success("Round deleted successfully");
    } catch (error) {
      console.error("Error deleting round:", error);
      notify.error("Failed to delete round");
    }
  };

  const [showQuestions, setShowQuestions] = useState(false);
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (showQuestions && round?.assessmentId) {
      // const data = fetchAssessmentQuestions(round.assessmentId);
      // setSectionQuestions(data)
      setQuestionsLoading(true);
      fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
        if (data) {
          setQuestionsLoading(false);
          setSectionQuestions(data?.sections);
          // Only initialize toggleStates if it's empty or length doesn't match sections
          // setToggleStates((prev) => {
          //   if (prev.length !== data.sections.length) {
          //     return new Array(data.sections.length).fill(false);
          //   }
          //   return prev; // Preserve existing toggle states
          // });
        } else {
          console.error("Error fetching assessment questions:", error);
          setQuestionsLoading(false);
        }
      });
    }
  }, [showQuestions, round?.assessmentId]);

  // Get interviewers based on interviewerType
  const internalInterviewers =
    round?.interviewerType === "Internal" ? round?.interviewers || [] : [];

  const externalInterviewers =
    round?.interviewerType === "External" ? round?.interviewers || [] : [];

  // Fetch question details when showing questions

  const toggleSection = async (sectionId) => {
    // First close all questions in this section if we're collapsing
    if (expandedSections[sectionId]) {
      const newExpandedQuestions = { ...expandedQuestions };
      const section = sectionQuestions[sectionId];
      if (section && section.questions) {
        section.questions.forEach((question) => {
          newExpandedQuestions[question._id] = false;
        });
      }
      setExpandedQuestions(newExpandedQuestions);
    }

    // Then toggle the section
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));

    // Fetch questions if expanding and not already loaded
    // if (!expandedSections[sectionId] && !sectionQuestions[sectionId] && !sectionQuestions.noSections && !sectionQuestions.error) {
    //   await fetchAssessmentQuestions(round?.assessmentId);
    // }
  };

  const toggleShowQuestions = () => {
    if (showQuestions) {
      // Collapse all when hiding
      setExpandedSections({});
      setExpandedQuestions({});
    }
    setShowQuestions(!showQuestions);
  };

  // v1.0.0 <---------------------------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if this is an instant interview (scheduled within 15 minutes of creation)
  const isInstantInterview = () => {
    if (!round.scheduledDate) return false;

    const scheduledTime = new Date(round?.scheduledDate).getTime();
    const creationTime = new Date(round?.createdAt || "").getTime();

    // If scheduled within 30 minutes of creation, consider it instant
    return scheduledTime - creationTime < 30 * 60 * 1000;
  };
  // v1.0.0 --------------------------------------------------------------------->
  return (
    <>
      <div
        className={`bg-white rounded-lg ${!hideHeader && "shadow-md"
          } overflow-hidden ${isActive ? "ring-2 ring-custom-blue p-2" : ""}`}
      >
        {/* v1.0.0 <----------------------- */}
        <div className="sm:p-4 p-5">
          {/* v1.0.0 -----------------------> */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Details
              </h4>
              <div className="space-y-2">
                {round.interviewType === "assessment" ? (
                  <>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>
                        Template:{" "}
                        {round.assessmentTemplate?.[0]?.assessmentName}
                      </span>
                    </div>
                  </>
                ) : (
                  <></>
                  // <>
                  //   {round?.roundTitle !== 'Assessment' &&
                  //     <div className="flex items-center text-sm text-gray-500">
                  //       <User className="h-4 w-4 mr-1" />
                  //       <span>Interviewer Type: {round.interviewerType}</span>
                  //     </div>
                  //   }
                  // </>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {/* v1.0.0 <------------------------------------------------------------------ */}
                  <span>Scheduled: {formatDate(round?.updatedAt)}</span>
                  {/* v1.0.0 ------------------------------------------------------------------> */}
                  {isInstantInterview() && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Instant
                    </span>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Duration: {round?.duration} Minutes</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {round.roundTitle !== "Assessment" && (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">
                      {showInterviewers && (
                        <>
                          <span>{round?.interviewerType || ""}</span>
                          <span>
                            {round?.interviewerGroupName ? " Group" : ""}
                          </span>
                        </>
                      )}{" "}
                      Interviewers
                    </h4>

                    {/* v1.0.0 <---------------------------------------------------------------------------------------------------------- */}
                    {/* <button
                    onClick={() => setShowInterviewers(!showInterviewers)}
                    className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                  >
                    {showInterviewers ? 'Hide' : 'Show'}
                    {showInterviewers ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </button> */}
                    {/* v1.0.0 ----------------------------------------------------------------------------------------------------------> */}
                  </div>

                  {/* {showInterviewers && round?.interviewers && ( */}
                  {/* v1.0.0 <------------------------------------------------------------- */}
                  {round?.interviewers && (
                    // v1.0.0  -------------------------------------------------------------->
                    <div className="space-y-2">
                      {internalInterviewers.length > 0 && (
                        <div>
                          <div className="flex items-center text-xs gap-2 text-gray-500 mb-2 mt-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>
                                {/* Internal ({round?.interviewers.length}) */}
                                {round?.interviewers.length} Interviewer
                                {round?.interviewers.length !== 1 ? "s" : ""}
                              </span>
                            </span>
                            {round?.interviewerGroupName && (
                              <div className="flex items-center   gap-1 text-xs text-gray-500 ">
                                <span>Group Name: </span>
                                <span className="text-black ">
                                  {round?.interviewerGroupName
                                    ? round?.interviewerGroupName
                                    : ""}
                                </span>
                              </div>
                            )}
                          </div>
                          {showInterviewers && round.interviewers && (
                            <div className="flex flex-wrap gap-2">
                              {round?.interviewers.map((interviewer, index) => (
                                <div key={index} className="flex items-center">
                                  <InterviewerAvatar
                                    interviewer={interviewer}
                                    size="sm"
                                  />
                                  <span className="ml-1 text-xs text-gray-600">
                                    {/* {interviewer.name} */}
                                    {interviewer?.firstName +
                                      " " +
                                      interviewer?.lastName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {externalInterviewers.length > 0 && (
                        <div>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span>
                              External ({externalInterviewers.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {externalInterviewers.map((interviewer) => (
                              <div
                                key={interviewer._id}
                                className="flex items-center"
                              >
                                <InterviewerAvatar
                                  interviewer={interviewer}
                                  size="sm"
                                />
                                <span className="ml-1 text-xs text-gray-600">
                                  {interviewer.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {externalInterviewers.length === 0 &&
                        round?.interviewerType === "External" && (
                          <span className="text-gray-600 text-xs">
                            No External Interviewers selected
                          </span>
                        )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {round.roundTitle !== "Assessment" &&
            round?.questions?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Interview Questions
                  </h4>
                  <button
                    onClick={() => setShowQuestions(!showQuestions)}
                    className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                  >
                    {showQuestions ? "Hide" : "Show"}
                    {showQuestions ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </button>
                </div>

                {showQuestions && round?.questions && (
                  <div className="space-y-2">
                    {round?.questions.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {round.questions.map((question, qIndex) => {
                          const isMandatory = question?.mandatory === "true";
                          const questionText =
                            question?.snapshot?.questionText ||
                            "No Question Text Available";
                          return (
                            <li key={qIndex} className="text-sm text-gray-600">
                              <span className="">
                                {/* {qIndex + 1}. */}•{" "}
                                {questionText || "No Question Text Available"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-2 text-gray-500 flex justify-center">
                        No Questions added yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          {round.roundTitle === "Assessment" && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Assessment Questions
                </h4>
                <button
                  onClick={toggleShowQuestions}
                  className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                >
                  {showQuestions ? "Hide" : "Show"}
                  {showQuestions ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>

              {showQuestions && (
                <div className="space-y-4">
                  {questionsLoading ? (
                    <div className="text-center py-4 skeleton-animation border rounded-md shadow-sm">
                      <span className="text-gray-600">
                        Loading questions...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Check if sectionQuestions is properly structured */}
                      {Object.keys(sectionQuestions).length > 0 ? (
                        Object.entries(sectionQuestions).map(
                          ([sectionId, sectionData]) => {
                            // Find section details from assessmentData
                            // const selectedAssessment = assessmentData.find(
                            //   a => a._id === formData.assessmentTemplate[0].assessmentId
                            // );

                            // const section = selectedAssessment?.Sections?.find(s => s._id === sectionId);

                            return (
                              <div
                                key={sectionId}
                                className="border rounded-md shadow-sm p-4"
                              >
                                <button
                                  onClick={() => toggleSection(sectionId)}
                                  className="flex justify-between items-center w-full"
                                >
                                  <span className="font-medium">
                                    {sectionData?.sectionName
                                      ? sectionData?.sectionName
                                        .charAt(0)
                                        .toUpperCase() +
                                      sectionData?.sectionName.slice(1)
                                      : "Unnamed Section"}
                                  </span>
                                  <ChevronUp
                                    className={`transform transition-transform ${expandedSections[sectionId]
                                      ? ""
                                      : "rotate-180"
                                      }`}
                                  />
                                </button>

                                {expandedSections[sectionId] && (
                                  <div className="mt-4 space-y-3">
                                    {Array.isArray(sectionData.questions) &&
                                      sectionData.questions.length > 0 ? (
                                      sectionData.questions.map(
                                        (question, idx) => (
                                          <div
                                            key={question._id || idx}
                                            className="border rounded-md shadow-sm overflow-hidden"
                                          >
                                            <div
                                              onClick={() =>
                                                setExpandedQuestions(
                                                  (prev) => ({
                                                    ...prev,
                                                    [question._id]:
                                                      !prev[question._id],
                                                  })
                                                )
                                              }
                                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-600">
                                                  {idx + 1}.
                                                </span>
                                                <p className="text-sm text-gray-700">
                                                  {question.snapshot
                                                    ?.questionText ||
                                                    "No question text"}
                                                </p>
                                              </div>
                                              <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[
                                                  question._id
                                                ]
                                                  ? "transform rotate-180"
                                                  : ""
                                                  }`}
                                              />
                                            </div>

                                            {expandedQuestions[
                                              question._id
                                            ] && (
                                                <div className="px-4 py-3">
                                                  <div className="flex justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-500">
                                                        Type:
                                                      </span>
                                                      <span className="text-sm text-gray-700">
                                                        {question.snapshot
                                                          ?.questionType ||
                                                          "Not specified"}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-500">
                                                        Score:
                                                      </span>
                                                      <span className="text-sm text-gray-700">
                                                        {question.snapshot
                                                          ?.score || "0"}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {/* Display question options if MCQ */}
                                                  {/* {question.snapshot
                                                    ?.questionType === "MCQ" && (
                                                      <div className="mt-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Options:
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                                          {question.snapshot?.options?.map(
                                                            (option, optIdx) => (
                                                              <div
                                                                key={optIdx}
                                                                //  className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                                className={`text-sm p-2 rounded border ${option ===
                                                                  question.snapshot
                                                                    .correctAnswer
                                                                  ? "bg-green-50 border-green-200 text-green-800"
                                                                  : "bg-gray-50 border-gray-200"
                                                                  }`}
                                                              >
                                                                {option}
                                                                {option ===
                                                                  question.snapshot
                                                                    .correctAnswer && (
                                                                    <span className="ml-2 text-green-600">
                                                                      ✓
                                                                    </span>
                                                                  )}
                                                              </div>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    )} */}
                                                      {question.snapshot?.questionType === "MCQ" && (
                                                        <div className="mt-2">
                                                          <span className="text-sm font-medium text-gray-500">
                                                            Options:
                                                          </span>
                                                          <div className="grid grid-cols-2 gap-2 mt-1">
                                                            {question.snapshot?.options?.map((option, optIdx) => (
                                                              <div
                                                                key={option._id || optIdx}
                                                                className={`text-sm p-2 rounded border ${
                                                                  option.isCorrect
                                                                    ? "bg-green-50 border-green-200 text-green-800"
                                                                    : "bg-gray-50 border-gray-200 text-gray-700"
                                                                }`}
                                                              >
                                                                {option.optionText}
                                                                {option.isCorrect && (
                                                                  <span className="ml-2 text-green-600 font-bold">
                                                                    ✓
                                                                  </span>
                                                                )}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}

                                                  {/* Display correct answer */}
                                                  {/* <div className="mt-2">
                                                                  <span className="text-sm font-medium text-gray-500">
                                                                    Correct Answer:
                                                                  </span>
                                                                  <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                                                    {question.snapshot?.correctAnswer || 'Not specified'}
                                                                  </div>
                                                                </div> */}

                                                  {/* Additional question metadata */}
                                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <div>
                                                      <span className="text-xs font-medium text-gray-500">
                                                        Difficulty:
                                                      </span>
                                                      <span className="text-xs text-gray-700 ml-1">
                                                        {question.snapshot
                                                          ?.difficultyLevel ||
                                                          "Not specified"}
                                                      </span>
                                                    </div>
                                                    <div>
                                                      <span className="text-xs font-medium text-gray-500">
                                                        Skills:
                                                      </span>
                                                      <span className="text-xs text-gray-700 ml-1">
                                                        {question.snapshot?.skill?.join(
                                                          ", "
                                                        ) || "None"}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="text-center py-4 text-gray-500">
                                        No Questions found in this section
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No sections available for this Assessment
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* v1.0.4 <----------------------------------------------------------- */}
        <div
          className="mt-6 pt-4 border-t border-gray-100 w-full flex gap-2 whitespace-nowrap sm:justify-start md:justify-start justify-end"
        // className="m-4 flex justify-end space-x-3"
        >
          {template?.type !== "standard" && (
            <>
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit <span className="sm:hidden inline ml-1">Round</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Delete <span className="sm:hidden inline ml-1">Round</span>
              </Button>
            </>
          )}
        </div>
        {/* v1.0.4 -----------------------------------------------------------> */}
      </div>
      {/* v1.0.2 <--------------------------------------------------- */}
      {/* {showDeleteConfirmModal && (
        // <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div
          className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Are you sure you want to delete this round?
            </h3>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteRound}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )} */}
      {showDeleteConfirmModal &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            style={{ pointerEvents: "auto" }}
          >
            {/* v1.0.0 <------------------------------------------------ */}
            <div className="bg-white p-5 rounded-lg shadow-md m-4">
              <h3 className="text-lg font-semibold mb-6">
                Are you sure you want to delete this round?
              </h3>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRound}>
                  Delete
                </Button>
              </div>
            </div>
            {/* v1.0.0 <------------------------------------------------ */}
          </div>,
          document.body
        )}
      {/* v1.0.2 ---------------------------------------------------> */}
    </>
  );
};

// RoundCard.propTypes = {
//   round: PropTypes.shape({
//     roundTitle: PropTypes.string,
//     interviewType: PropTypes.string,
//     interviewMode: PropTypes.string,
//     interviewDuration: PropTypes.any,
//     instructions: PropTypes.string,
//     interviewerType: PropTypes.string,
//     assessmentTemplate: PropTypes.arrayOf(PropTypes.shape({
//       assessmentId: PropTypes.string,
//       assessmentName: PropTypes.string
//     })),
//     interviewers: PropTypes.arrayOf(PropTypes.oneOfType([
//       PropTypes.string,
//       PropTypes.shape({
//         interviewerId: PropTypes.string,
//         interviewerName: PropTypes.string
//       })
//     ])),
//     questions: PropTypes.arrayOf(PropTypes.string),
//     assessmentQuestions: PropTypes.arrayOf(PropTypes.shape({
//       sectionName: PropTypes.string,
//       questionId: PropTypes.string,
//       snapshot: PropTypes.arrayOf(PropTypes.shape({
//         questionText: PropTypes.string,
//         questionType: PropTypes.string,
//         score: PropTypes.number,
//         options: PropTypes.arrayOf(PropTypes.string),
//         correctAnswer: PropTypes.string
//       }))
//     })),
//     createdAt: PropTypes.string
//   }).isRequired,
//   isActive: PropTypes.bool,
//   hideHeader: PropTypes.bool,
//   toggleRound: PropTypes.func
// };

export default RoundCard;
