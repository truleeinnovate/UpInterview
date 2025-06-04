/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  FileText,
  User,
  Info,
  Edit
} from 'lucide-react';



import InterviewerAvatar from './InterviewerAvatar';
import { useCustomContext } from '../../Context/Contextfetch';
import { useInterviewerDetails } from '../../utils/CommonFunctionRoundTemplates';
import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';

const RoundCard = ({
  round,
  onEdit,
  isActive = false,
  hideHeader = false,
}) => {

  const {

    sectionQuestions,
    questionsLoading,
    questionsError,
    fetchQuestionsForAssessment,
    setSectionQuestions,
  } = useCustomContext();

  const [showQuestions, setShowQuestions] = useState(false);
  const [showInterviewers, setShowInterviewers] = useState(false);


  const [expandedQuestions, setExpandedQuestions] = useState({});
  // const [sectionQuestions, setSectionQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const { resolveInterviewerDetails } = useInterviewerDetails();

  
  





  useEffect(() => {
   
    fetchQuestionsForAssessment(round?.assessmentId)
  }, [round.assessmentId])



  // const toggleSection = async (sectionId) => {
  //   setExpandedSections(prev => ({
  //     ...prev,
  //     [sectionId]: !prev[sectionId]
  //   }));

  //   if (!expandedSections[sectionId] && !sectionQuestions[sectionId] && !sectionQuestions.noSections && !sectionQuestions.error) {
  //     await fetchQuestionsForAssessment(round?.assessmentId);
  //     // await fetchAssessmentData(formData.assessmentTemplate[0].assessmentId)
  //   }
  // };


  // Fetch question details when showing questions


  const toggleSection = async (sectionId) => {
    // First close all questions in this section if we're collapsing
    if (expandedSections[sectionId]) {
      const newExpandedQuestions = { ...expandedQuestions };
      const section = sectionQuestions[sectionId];
      if (section && section.questions) {
        section.questions.forEach(question => {
          newExpandedQuestions[question._id] = false;
        });
      }
      setExpandedQuestions(newExpandedQuestions);
    }

    // Then toggle the section
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    // Fetch questions if expanding and not already loaded
    if (!expandedSections[sectionId] && !sectionQuestions[sectionId] && !sectionQuestions.noSections && !sectionQuestions.error) {
      await fetchQuestionsForAssessment(round?.assessmentId);
    }
  };

  const toggleShowQuestions = () => {
    if (showQuestions) {
      // Collapse all when hiding
      setExpandedSections({});
      setExpandedQuestions({});
    }
    setShowQuestions(!showQuestions);
  };



  // const fetchQuestionDetails = useCallback(async () => {
  //   if (!showQuestions || !round.assessmentQuestions?.length) return;

  //   setLoadingQuestions(true);
  //   try {
  //     const questionIds = [...new Set(
  //       round.assessmentQuestions
  //         .map(q => q.questionId)
  //         .filter(id => id?.length > 0) // More robust empty check
  //     )];

  //     if (!questionIds.length) {
  //       console.error('No valid question IDs found');
  //       return;
  //     }

  //     const questions = await Promise.all(
  //       questionIds.map(async (questionId) => {
  //         try {
  //           const response = await axios.get(
  //             `${config.REACT_APP_API_URL}/assessment-questions/${questionId}`
  //           );
  //           return response.data?.data;
  //         } catch (error) {
  //           console.error(`Error fetching question ${questionId}:`, error.message);
  //           return null;
  //         }
  //       })
  //     );

  //     // Create map with full question data
  //     const questionsMap = questions.reduce((acc, question) => {
  //       if (question?._id && question?.snapshot) {
  //         acc[question._id] = {
  //           ...question.snapshot, // Spread snapshot properties
  //           _id: question._id     // Preserve question ID
  //         };
  //       }
  //       return acc;
  //     }, {});

  //     if (!Object.keys(questionsMap).length) {
  //       console.error('No valid questions found');
  //       return;
  //     }

  //     setQuestionDetails(questionsMap);
  //   } catch (error) {
  //     console.error('Fetch error:', error.message);
  //   } finally {
  //     setLoadingQuestions(false);
  //   }
  // }, [showQuestions, round.assessmentQuestions]);



  // Reset question details when round changes



  // Fetch questions when showing them
  // useEffect(() => {
  //   if (showQuestions && round.assessmentQuestions?.length > 0) {
  //     fetchQuestionDetails();
  //   }
  // }, [fetchQuestionDetails, showQuestions, round.assessmentQuestions]);

  return (
    <div className={`bg-white rounded-lg ${!hideHeader && 'shadow-md'} overflow-hidden ${isActive ? 'ring-2 ring-custom-blue' : ''}`}>
      <div className="p-5">

        

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
            <div className="space-y-2">
              {round.interviewType === 'assessment' ? (
                <>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Template: {round.assessmentTemplate?.[0]?.assessmentName}</span>
                  </div>
                </>
              ) : (
                <>
                  {round?.roundTitle !== 'Assessment' &&
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span>Interviewer Type: {round.interviewerType}</span>
                    </div>
                  }
                </>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Duration: {round?.interviewDuration} minutes</span>
              </div>


            </div>
          </div>

          {/* Right Column */}
          <div>
            {round.roundTitle === 'Technical' && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Interviewers</h4>
                  <button
                    onClick={() => setShowInterviewers(!showInterviewers)}
                    className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
                  >
                    {showInterviewers ? 'Hide' : 'Show'}
                    {showInterviewers ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </button>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {round?.internalInterviewers.length} interviewer{resolveInterviewerDetails(round?.internalInterviewers || []).length !== 1 ? 's' : ''}
                  </span>
                </div>

                {showInterviewers && round?.internalInterviewers && (
                  <div className="flex flex-wrap gap-2">
                    {resolveInterviewerDetails(round?.internalInterviewers || []).map((interviewer, index) => (

                      <div key={index} className="flex items-center">
                        <InterviewerAvatar interviewer={interviewer} size="sm" />
                        <span className="ml-1 text-xs text-gray-600">
                          {interviewer.name}
                        </span>
                      </div>

                    ))}
                  </div>
                )}

              </>
            )}
          </div>
        </div>

        {round.roundTitle === 'Technical' && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Questions</h4>
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
              >
                {showQuestions ? 'Hide' : 'Show'}
                {showQuestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>
            </div>

            {showQuestions && round?.questions && (
              <div className="space-y-2">
                {round?.questions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {round.questions.map((question, qIndex) => {
                      const isMandatory = question?.mandatory === "true";
                      const questionText = question?.snapshot?.questionText || 'No Question Text Available';
                      return (
                        <li
                          key={qIndex}
                          className="text-sm text-gray-600"
                        >
                          <span className="">
                            {/* {qIndex + 1}. */}
                            • {questionText || "No question text available"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-gray-500 flex justify-center">No questions added yet.</p>
                )}

              </div>
            )}
          </div>
        )}

        {round.roundTitle === 'Assessment' && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Assessment Questions</h4>
              <button
                onClick={toggleShowQuestions}
                className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
              >
                {showQuestions ? 'Hide' : 'Show'}
                {showQuestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>
            </div>

            {showQuestions && (
              <div className="space-y-4">
                {questionsLoading ? (
                  <div className="text-center py-4">
                    <span className="text-gray-600">Loading questions...</span>
                  </div>
                ) :
                  (
                    <div className="space-y-4">
                      {/* Check if sectionQuestions is properly structured */}
                      {Object.keys(sectionQuestions).length > 0 ? (
                        Object.entries(sectionQuestions).map(([sectionId, sectionData]) => {
                          // Find section details from assessmentData
                          // const selectedAssessment = assessmentData.find(
                          //   a => a._id === formData.assessmentTemplate[0].assessmentId
                          // );

                          // const section = selectedAssessment?.Sections?.find(s => s._id === sectionId);

                          return (
                            <div key={sectionId} className="border rounded-md shadow-sm p-4">
                              <button
                                onClick={() => toggleSection(sectionId)}
                                className="flex justify-between items-center w-full"
                              >
                                <span className="font-medium">
                                  {sectionData?.sectionName || 'Unnamed Section'}
                                </span>
                                <ChevronUp
                                  className={`transform transition-transform ${expandedSections[sectionId] ? '' : 'rotate-180'
                                    }`}
                                />
                              </button>

                              {expandedSections[sectionId] && (
                                <div className="mt-4 space-y-3">
                                  {Array.isArray(sectionData.questions) && sectionData.questions.length > 0 ? (
                                    sectionData.questions.map((question, idx) => (
                                      <div
                                        key={question._id || idx}
                                        className="border rounded-md shadow-sm overflow-hidden"
                                      >
                                        <div
                                          onClick={() =>
                                            setExpandedQuestions(prev => ({
                                              ...prev,
                                              [question._id]: !prev[question._id]
                                            }))
                                          }
                                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-600">
                                              {idx + 1}.
                                            </span>
                                            <p className="text-sm text-gray-700">
                                              {question.snapshot?.questionText || 'No question text'}
                                            </p>
                                          </div>
                                          <ChevronDown
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[question._id]
                                              ? 'transform rotate-180'
                                              : ''
                                              }`}
                                          />
                                        </div>

                                        {expandedQuestions[question._id] && (
                                          <div className="px-4 py-3">
                                            <div className="flex justify-between mb-2">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-500">
                                                  Type:
                                                </span>
                                                <span className="text-sm text-gray-700">
                                                  {question.snapshot?.questionType || 'Not specified'}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-500">
                                                  Score:
                                                </span>
                                                <span className="text-sm text-gray-700">
                                                  {question.snapshot?.score || '0'}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Display question options if MCQ */}
                                            {question.snapshot?.questionType === 'MCQ' && (
                                              <div className="mt-2">
                                                <span className="text-sm font-medium text-gray-500">
                                                  Options:
                                                </span>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                  {question.snapshot?.options?.map((option, optIdx) => (
                                                    <div
                                                      key={optIdx}
                                                      //  className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                      className={`text-sm p-2 rounded border ${option === question.snapshot.correctAnswer
                                                        ? 'bg-green-50 border-green-200 text-green-800'
                                                        : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                      {option}
                                                      {option === question.snapshot.correctAnswer && (
                                                        <span className="ml-2 text-green-600">✓</span>
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
                                                  {question.snapshot?.difficultyLevel || 'Not specified'}
                                                </span>
                                              </div>
                                              <div>
                                                <span className="text-xs font-medium text-gray-500">
                                                  Skills:
                                                </span>
                                                <span className="text-xs text-gray-700 ml-1">
                                                  {question.snapshot?.skill?.join(', ') || 'None'}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      No questions found in this section
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No sections available for this assessment
                        </div>
                      )}
                    </div>
                  )
                }
              </div>
            )}
          </div>
        )}
      </div>

      <div className="m-4 flex justify-end space-x-3">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Round
          </Button>
        </div>
    </div>
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