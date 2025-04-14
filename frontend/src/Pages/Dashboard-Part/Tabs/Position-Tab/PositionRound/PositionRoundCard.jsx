import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Calendar,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
  User,
  ExternalLink
} from 'lucide-react';
// import { FaChevronUp, FaSearch } from 'react-icons/fa';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';

import { Button } from '../../CommonCode-AllTabs/ui/button';
import axios from 'axios';
import toast from "react-hot-toast";
import { useCustomContext } from '../../../../../Context/Contextfetch';

const PositionRoundCard = ({
  round,
  interviewData,
  canEdit,
  onEdit,
  isActive = false,
  hideHeader = false
}) => {

  const {
    assessmentData,
  } = useCustomContext();

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sectionQuestions, setSectionQuestions] = useState({});
  // console.log("sectionQuestions", sectionQuestions);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const interview = interviewData;
  const isInterviewCompleted = interview?.status === 'Completed' || interview?.status === 'Cancelled';


  const fetchSectionsAndQuestions = async (assessmentId) => {
    try {
      // Fetch the assessment data once
      setIsLoadingSections(true);
      const response = assessmentData.find(pos => pos._id === assessmentId);
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}`);
      const assessment = response;

      // Get all section IDs and prepare section questions
      const newSectionQuestions = {};
      const newExpandedSections = {};

      assessment.Sections.forEach(section => {
        newExpandedSections[section._id] = false; // Expand all sections by default
        newSectionQuestions[section._id] = section.Questions || []; // Set questions for each section
      });

      // Update states with the fetched data
      setExpandedSections(newExpandedSections);
      setSectionQuestions(newSectionQuestions);
    } catch (error) {
      console.error('Error fetching sections and questions:', error);
      // Optionally set an error state for each section
      setSectionQuestions(prev => ({
        ...prev,
        // Since we don't have access to section IDs, set a generic error state
        error: 'Failed to load questions'
      }));
    } finally {
      // NEW: Set global loading state to false
      setIsLoadingSections(false);
    }
  };

  useEffect(() => {
    if (round.assessmentId) {
      fetchSectionsAndQuestions(round.assessmentId)
    }

  }, [round.assessmentId])



  const toggleSection = async (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    // Fetch questions if the section is being expanded and questions are not already loaded
    if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
      await fetchQuestionsForSection(sectionId);
    }
  };

  const toggleAllSections = (expand) => {
    const newExpandedSections = {};
    Object.keys(expandedSections).forEach(sectionId => {
      newExpandedSections[sectionId] = expand;
    });
    setExpandedSections(newExpandedSections);

    // If expanding all sections, fetch questions for any sections that don't have them loaded
    if (expand) {
      Object.keys(newExpandedSections).forEach(async sectionId => {
        if (!sectionQuestions[sectionId]) {
          await fetchQuestionsForSection(sectionId);
        }
      });
    }
  };

  const fetchQuestionsForSection = async (sectionId) => {
    try {
      const response = assessmentData.find(pos => pos._id === round.assessmentId)
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentTemplate.assessmentId}`);
      const assessment = response;

      const section = assessment.Sections.find(s => s._id === sectionId);
      if (!section) {
        throw new Error('Section not found');
      }

      setSectionQuestions(prev => ({
        ...prev,
        [sectionId]: section.Questions
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      setSectionQuestions(prev => ({
        ...prev,
        [sectionId]: 'error'
      }));
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const handleStatusChange = async (newStatus, reason = null) => {
    const roundData = {
      status: newStatus,
      completedDate: newStatus === "Completed",
      rejectionReason: reason || null,
    };

    const payload = {
      interviewId: interview._id,
      round: { ...roundData, },
      roundId: round._id,
      isEditing: true, // Always set isEditing to true
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/interview/save-round`,
        payload
      );
      console.log("Status updated:", response.data);
      // Show success toast
      toast.success(`Round status updated to ${newStatus}`, {
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleConfirmStatusChange = () => {
    if (confirmAction) {
      handleStatusChange(confirmAction);
    }
    setShowConfirmModal(false);
  };

  const handleReject = (reason) => {
    handleStatusChange("Rejected", reason);
    setShowRejectionModal(false);
  };

  // const handleRemoveInterviewer = (interviewerId) => {
  //   const updatedRound = {
  //     interviewers: round.interviewers.filter(id => id !== interviewerId)
  //   };
  // };

  // Get interviewers based on interviewerType
  const internalInterviewers =
    round?.interviewerType === "internal" ? round?.interviewers || [] : [];

  const externalInterviewers =
    round?.interviewerType === "external" ? round?.interviewers || [] : [];

  // Get questions
  const questions = round?.questions || [];
  console.log("questions", questions);


  // Check if round is active (can be modified)
  const isRoundActive = round.status !== 'Completed' && round.status !== 'Cancelled' && round.status !== 'Rejected' && !isInterviewCompleted;

  // Check if round has feedback
  const hasFeedback = round?.detailedFeedback || (round?.feedbacks && round.feedbacks.length > 0);

  // Check if this is an instant interview (scheduled within 15 minutes of creation)
  const isInstantInterview = () => {
    if (!round.scheduledDate) return false;

    const scheduledTime = new Date(round.scheduledDate).getTime();
    const creationTime = new Date(interview?.createdAt || '').getTime();

    // If scheduled within 30 minutes of creation, consider it instant
    return scheduledTime - creationTime < 30 * 60 * 1000;
  };

  return (
    <>
      <div className={`bg-white rounded-lg ${!hideHeader && 'shadow-md'} overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="p-5">
          {/* Tabs */}
          {hasFeedback && (
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Round Details
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Feedback
                </button>

              </nav>
            </div>
          )}

          {activeTab === 'details' && (
            <>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4 sm:grid-cols-1">
                <div>

                  <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scheduled: {formatDate(round.scheduledDate)}</span>
                    {isInstantInterview() && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Instant
                      </span>
                    )}
                  </div>
                  {round.completedDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Completed: {formatDate(round.completedDate)}</span>
                    </div>
                  )}
                  {round.duration && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration: {round.duration} minutes</span>
                    </div>
                  )}
                </div>
                {round.assessmentId ? <div></div>
                  : <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Interviewers</h4>
                      <button
                        onClick={() => setShowInterviewers(!showInterviewers)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {showInterviewers ? 'Hide' : 'Show'}
                        {showInterviewers ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </button>
                    </div>

                    {showInterviewers && (
                      <div className="space-y-2">
                        {internalInterviewers.length > 0 && (
                          <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <User className="h-3 w-3 mr-1" />
                              <span>Internal ({internalInterviewers.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {internalInterviewers.map(interviewer => (
                                <div key={interviewer._id} className="flex items-center">
                                  <InterviewerAvatar interviewer={interviewer} size="sm" />
                                  <span className="ml-1 text-xs text-gray-600">
                                    {interviewer.name}
                                  </span>
                                  {/* {isRoundActive && canEdit && (
                                  <button
                                    onClick={() => handleRemoveInterviewer(interviewer._id)}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )} */}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {externalInterviewers.length > 0 && (
                          <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span>External ({externalInterviewers.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {externalInterviewers.map(interviewer => (
                                <div key={interviewer._id} className="flex items-center">
                                  <InterviewerAvatar interviewer={interviewer} size="sm" />
                                  <span className="ml-1 text-xs text-gray-600">
                                    {interviewer.name}
                                  </span>
                                  {/* {isRoundActive && canEdit && (
                                  <button
                                    onClick={() => handleRemoveInterviewer(interviewer._id)}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )} */}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                }
              </div>

              {(questions?.length > 0 || round.assessmentId) && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Questions</h4>
                    <button
                      onClick={() => setShowQuestions(!showQuestions)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {showQuestions ? 'Hide' : 'Show'}
                      {showQuestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                    </button>
                  </div>

                  {showQuestions && round.assessmentId && (
                    <div className="mt-4">
                      {/* NEW: Added Expand All/Collapse All buttons */}
                      {/* <div className="flex justify-end space-x-2 mb-4">
                        <button
                          type="button"
                          onClick={() => toggleAllSections(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Expand All
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAllSections(false)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Collapse All
                        </button>
                      </div> */}

                      {/* NEW: Added global loading state */}
                      {isLoadingSections ? (
                        <div className="flex justify-center items-center py-4">
                          <p className="text-sm text-gray-500">Loading sections...</p>
                          <div className="ml-2 w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                        </div>
                      ) : sectionQuestions.error ? (
                        <div className="pl-4 py-2">
                          <p className="text-sm text-red-500">{sectionQuestions.error}</p>
                          <button
                            type="button"
                            onClick={() => fetchSectionsAndQuestions(round.assessmentId)}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                          >
                            Retry Loading
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {assessmentData.find(a => a._id === round.assessmentId)?.Sections.map((section) => (
                            <div key={section._id} className="border rounded-md shadow-sm p-4 bg-gray-50">
                              <button
                                type="button"
                                onClick={() => toggleSection(section._id)}
                                className="flex justify-between items-center w-full"
                              >
                                <span className="font-medium text-gray-800">{section.SectionName}</span>
                                {/* <FaChevronUp className={`transform transition-transform ${expandedSections[section._id] ? '' : 'rotate-180'} text-gray-500`} /> */}
                              </button>

                              {expandedSections[section._id] && (
                                <div className="mt-4 space-y-3">
                                  {sectionQuestions[section._id] === 'error' ? (
                                    <div className="pl-4 py-2">
                                      <p className="text-sm text-red-500">Failed to load questions. Please try again.</p>
                                      <button
                                        type="button"
                                        onClick={() => fetchQuestionsForSection(section._id)}
                                        className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                                      >
                                        Retry Loading
                                      </button>
                                    </div>
                                  ) : sectionQuestions[section._id] ? (
                                    sectionQuestions[section._id].length > 0 ? (
                                      sectionQuestions[section._id].map((question, idx) => (
                                        <div
                                          key={question._id || idx}
                                          className="border rounded-md shadow-sm overflow-hidden bg-white"
                                        >
                                          <div
                                            onClick={() => setExpandedQuestions(prev => ({
                                              ...prev,
                                              [question._id]: !prev[question._id]
                                            }))}
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-gray-600">{idx + 1}.</span>
                                              <p className="text-sm text-gray-700">{question.snapshot?.questionText || 'No question text'}</p>
                                            </div>
                                            <ChevronDown
                                              className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[question._id] ? 'transform rotate-180' : ''}`}
                                            />
                                          </div>

                                          {expandedQuestions[question._id] && (
                                            <div className="px-4 py-3 bg-gray-50">
                                              <div className="flex justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-medium text-gray-500">Type:</span>
                                                  <span className="text-sm text-gray-700">
                                                    {question.snapshot?.questionType || 'Not specified'}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-medium text-gray-500">Score:</span>
                                                  <span className="text-sm text-gray-700">
                                                    {question.snapshot?.score || '0'}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-6">
                                                {question.snapshot?.options?.length > 0 && (
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-500">Options:</span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                      {question.snapshot.options.map((option, optionIdx) => (
                                                        <div
                                                          key={optionIdx}
                                                          className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border border-gray-200"
                                                        >
                                                          {option}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-2 mt-2">
                                                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Correct Answer:</span>
                                                <span className="text-sm text-gray-700">
                                                  {question.snapshot?.correctAnswer || 'Not specified'}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="pl-4 py-2">
                                        <p className="text-sm text-gray-500">No questions available for this section.</p>
                                      </div>
                                    )
                                  ) : (
                                    <div className="pl-4 py-2">
                                      <p className="text-sm text-gray-500">Loading questions...</p>
                                      <div className="mt-2 w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {showQuestions && !round.assessmentId && questions.length > 0 && (
                    <div className="space-y-2">
                      {questions.map((question) => (
                        <div key={question._id} className="text-sm text-gray-600">
                          • {question.snapshot?.questionText || "No question text available"}
                        </div>
                      ))}
                    </div>
                  )}





                </div>
              )}


              {isRoundActive && (
                <div className="mt-6 flex justify-end space-x-3">
                  {canEdit && (
                    <Button
                      onClick={onEdit}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Round
                    </Button>
                  )}




                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">
              Are you sure you want to {confirmAction.toLowerCase()} this round?
            </h3>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                No, Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmStatusChange}>
                Yes, Confirm
              </Button>
            </div>
          </div>
        </div>
      )}




    </>
  );
};

// RoundCard.propTypes = {
//   round: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     mode: PropTypes.string.isRequired,
//     status: PropTypes.string.isRequired,
//     scheduledDate: PropTypes.string,
//     completedDate: PropTypes.string,
//     duration: PropTypes.number,
//     interviewers: PropTypes.arrayOf(PropTypes.string).isRequired,
//     questions: PropTypes.arrayOf(PropTypes.string).isRequired,
//     detailedFeedback: PropTypes.string,
//     feedbacks: PropTypes.array
//   }).isRequired,
//   interviewId: PropTypes.string.isRequired,
//   canEdit: PropTypes.bool.isRequired,
//   onEdit: PropTypes.func.isRequired,
//   isActive: PropTypes.bool,
//   hideHeader: PropTypes.bool
// };

export default PositionRoundCard;
