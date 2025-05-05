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

  const [showQuestions, setShowQuestions] = useState(false);
  const [showInterviewers, setShowInterviewers] = useState(false);
  const [questionDetails, setQuestionDetails] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const { resolveInterviewerDetails } = useInterviewerDetails();

  // console.log("sectionQuestions", sectionQuestions);


  useEffect(() => {
    setShowQuestions(false);
    setShowInterviewers(false);
    setExpandedQuestions({});
    setExpandedSections({});
  }, [round]);



  const fetchQuestionsForAssessment = async (assessmentId) => {

    if (!assessmentId) {
      return null;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}`);
      const assessmentQuestions = response.data;

      // console.log('Full assessment questions structure:', assessmentQuestions);

      // Extract sections directly from the response
      const sections = assessmentQuestions.sections || [];

      // Check for empty sections or questions
      if (sections.length === 0 || sections.every(section => !section.questions || section.questions.length === 0)) {
        console.warn('No sections or questions found for assessment:', assessmentId);
        setSectionQuestions({ noQuestions: true });
        return;
      }

      // Create section questions mapping with all section data
      const newSectionQuestions = {};

      sections.forEach((section) => {
        if (!section._id) {
          console.warn('Section missing _id:', section);
          return;
        }

        // Store complete section data including sectionName, passScore, totalScore
        newSectionQuestions[section._id] = {
          sectionName: section?.sectionName,
          passScore: Number(section.passScore || 0),
          totalScore: Number(section.totalScore || 0),
          questions: (section.questions || []).map(q => ({
            _id: q._id,
            questionId: q.questionId,
            source: q.source || 'system',
            score: Number(q.score || q.snapshot?.score || 0),
            order: q.order || 0,
            customizations: q.customizations || null,
            snapshot: {
              questionText: q.snapshot?.questionText || '',
              questionType: q.snapshot?.questionType || '',
              score: Number(q.snapshot?.score || q.score || 0),
              options: Array.isArray(q.snapshot?.options) ? q.snapshot.options : [],
              correctAnswer: q.snapshot?.correctAnswer || '',
              difficultyLevel: q.snapshot?.difficultyLevel || '',
              hints: Array.isArray(q.snapshot?.hints) ? q.snapshot.hints : [],
              skill: Array.isArray(q.snapshot?.skill) ? q.snapshot.skill : [],
              tags: Array.isArray(q.snapshot?.tags) ? q.snapshot.tags : [],
              technology: Array.isArray(q.snapshot?.technology) ? q.snapshot.technology : [],
              questionNo: q.snapshot?.questionNo || ''
            }
          }))
        };
      });

      // Verify that at least one section has questions
      const hasQuestions = Object.values(newSectionQuestions).some(section => section.questions.length > 0);
      if (!hasQuestions) {
        console.warn('No sections with questions found for assessment:', assessmentId);
        setSectionQuestions({ noQuestions: true });
        return;
      }

      // Set the section questions state
      setSectionQuestions(newSectionQuestions);
      console.log('Updated sectionQuestions:', newSectionQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setSectionQuestions({ error: 'Failed to load questions' });
    }
  };

  useEffect(() => {
    setSectionQuestions({});
    fetchQuestionsForAssessment(round?.assessmentId)
  }, [round.assessmentId])



  const toggleSection = async (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    if (!expandedSections[sectionId] && !sectionQuestions[sectionId] && !sectionQuestions.noSections && !sectionQuestions.error) {
      await fetchQuestionsForAssessment(round?.assessmentId);
      // await fetchAssessmentData(formData.assessmentTemplate[0].assessmentId)
    }
  };


  // Fetch question details when showing questions
  const fetchQuestionDetails = useCallback(async () => {
    if (!showQuestions || !round.assessmentQuestions?.length) return;

    setLoadingQuestions(true);
    try {
      const questionIds = [...new Set(
        round.assessmentQuestions
          .map(q => q.questionId)
          .filter(id => id?.length > 0) // More robust empty check
      )];

      if (!questionIds.length) {
        console.error('No valid question IDs found');
        return;
      }

      const questions = await Promise.all(
        questionIds.map(async (questionId) => {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/assessment-questions/${questionId}`
            );
            return response.data?.data;
          } catch (error) {
            console.error(`Error fetching question ${questionId}:`, error.message);
            return null;
          }
        })
      );

      // Create map with full question data
      const questionsMap = questions.reduce((acc, question) => {
        if (question?._id && question?.snapshot) {
          acc[question._id] = {
            ...question.snapshot, // Spread snapshot properties
            _id: question._id     // Preserve question ID
          };
        }
        return acc;
      }, {});

      if (!Object.keys(questionsMap).length) {
        console.error('No valid questions found');
        return;
      }

      setQuestionDetails(questionsMap);
    } catch (error) {
      console.error('Fetch error:', error.message);
    } finally {
      setLoadingQuestions(false);
    }
  }, [showQuestions, round.assessmentQuestions]);

  // Reset question details when round changes
  useEffect(() => {
    setQuestionDetails({});
  }, [round.assessmentTemplate]);

  // Fetch questions when showing them
  useEffect(() => {
    if (showQuestions && round.assessmentQuestions?.length > 0) {
      fetchQuestionDetails();
    }
  }, [fetchQuestionDetails, showQuestions, round.assessmentQuestions]);

  return (
    <div className={`bg-white rounded-lg ${!hideHeader && 'shadow-md'} overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="p-5">
        {/* {!hideHeader && ( */}
          {/* <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mr-2">
                {round.roundName}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="mr-2">{round.interviewType}</span>
                <span>•</span>
                <span className="mx-2">{round.interviewMode}</span>
              </div>
            </div>
          </div> */}
        {/* )} */}

        {/* {hideHeader && isActive && ( */}
          {/* <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mr-2">
                {round.roundName}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="mr-2">{round.interviewType}</span>
                <span>•</span>
                <span className="mx-2">{round.interviewMode}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditRound(round)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-custom-blue hover:text-custom-blue/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Round
              </button>
            </div>
          </div> */}
        {/* // )} */}

       
                    <div className="mt-6 flex justify-end space-x-3">
               
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
                  {round?.roundName !== 'Assessment' &&
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
            {round.roundName === 'Technical' && (
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
                    {round?.interviewers.length} interviewers{resolveInterviewerDetails(round?.interviewers).length !== 1 ? 's' : ''}
                  </span>
                </div>

                {showInterviewers && round.interviewers && (
                  <div className="flex flex-wrap gap-2">
                    {resolveInterviewerDetails(round?.interviewers).map((interviewer, index) => (

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

        {round.roundName === 'Technical' && (
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

            {showQuestions && round.interviewQuestionsList && (
              <div className="space-y-2">
                {round?.interviewQuestionsList.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {round.interviewQuestionsList.map((question, qIndex) => {
                      const isMandatory = question?.mandatory === "true";
                      const questionText = question?.snapshot?.questionText || 'No Question Text Available';
                      return (
                        <li
                          key={qIndex}
                          className="text-sm text-gray-600"

                        >
                          <span className="text-gray-900 font-medium">
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

        {round.roundName === 'Assessment' && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Assessment Questions</h4>
              <button
                onClick={() => setShowQuestions(!showQuestions)}
                className="text-sm text-custom-blue hover:text-custom-blue/80 flex items-center"
              >
                {showQuestions ? 'Hide' : 'Show'}
                {showQuestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>
            </div>

            {showQuestions && (
              <div className="space-y-4">
                {loadingQuestions ? (
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
    </div>
  );
};

// RoundCard.propTypes = {
//   round: PropTypes.shape({
//     roundName: PropTypes.string,
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