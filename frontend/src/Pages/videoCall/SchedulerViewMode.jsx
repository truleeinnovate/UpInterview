import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  User,
  Briefcase,
  Calendar
} from "lucide-react";
import TechnicalSkillsAssessment from "../Dashboard-Part/Tabs/Feedback/TechnicalSkillsAssessment.jsx";
import QuestionCard, { EmptyState } from "../../Components/QuestionCard.jsx";
import { Button } from "../../Components/Buttons/Button.jsx";
import { extractUrlData } from "../../apiHooks/useVideoCall.js";
import { useLocation } from "react-router-dom";

// Replicating the StarRating component from FeedbackForm.jsx
const StarRating = ({ rating, onChange, size = 'md', isReadOnly = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !isReadOnly && onChange && onChange(star)}
          disabled={isReadOnly}
          className={`transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`${sizeClasses[size]} ${star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
              }`}
          />
        </button>
      ))}
    </div>
  );
};

export const SchedulerViewMode = ({ feedbackData, isViewMode }) => {
  // Handle multiple feedbacks if they exist
  const feedbacks = Array.isArray(feedbackData?.feedbacks)
    ? feedbackData.feedbacks
    : (feedbackData?._id ? [feedbackData] : []);
  const location = useLocation();
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(0);
  const activeFeedback = feedbacks[activeFeedbackIndex];

  // Extract URL data once
  const urlData = useMemo(
    () => extractUrlData(location.search),
    [location.search],
  );

  // Mock interview flag
  const isMockInterview = urlData?.interviewType ? urlData?.interviewType === "mockinterview" : feedbackData?.isMockInterview;

  // Initial form state (matching FeedbackForm structure)
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    roundTitle: '',
    interviewerName: '',
    interviewDate: '',
    isMockInterview: false,
    overallRating: 0,
    communicationRating: 0,
    recommendation: 'Maybe',
    skillRatings: [],
    technicalSkills: {
      strong: [],
      good: [],
      basic: [],
      noExperience: []
    },
    skillOrder: [],
    questionsAsked: [],
    strengths: [''],
    areasForImprovement: [''],
    additionalComments: '',
    cultureFit: 0,
    willingnessToLearn: 0
  });

  // Data normalization logic (similar to FeedbackForm load logic)
  useEffect(() => {
    if (!activeFeedback) return;

    const candidate = feedbackData?.candidate || {};
    const candidateName = `${candidate.FirstName || ""} ${candidate.LastName || ""}`.trim() || activeFeedback.candidateName || "";

    const position = feedbackData?.position || {};
    const positionTitle = position.title || activeFeedback.position || "";

    const round = feedbackData?.interviewRound || {};
    const roundTitle = round.roundTitle || activeFeedback.roundTitle || "";

    // Normalize technicalSkills from backend array to UI object if needed
    const rawTS = activeFeedback.technicalSkills || [];
    const technicalSkills = { strong: [], good: [], basic: [], noExperience: [] };
    const skillOrder = activeFeedback.skillOrder || [];

    if (Array.isArray(rawTS)) {
      rawTS.forEach(s => {
        if (s.level && technicalSkills[s.level]) {
          technicalSkills[s.level].push(s.skillName);
          if (!skillOrder.includes(s.skillName)) skillOrder.push(s.skillName);
        }
      });
    } else if (typeof rawTS === 'object' && rawTS !== null) {
      Object.assign(technicalSkills, rawTS);
    }

    const impression = activeFeedback.overallImpression || {};

    setFormData({
      candidateName,
      position: positionTitle,
      roundTitle,
      interviewerName: activeFeedback.interviewerId?.name || "",
      interviewDate: activeFeedback.createdAt ? new Date(activeFeedback.createdAt).toISOString().split('T')[0] : "",
      isMockInterview: !!isMockInterview,
      overallRating: impression.overallRating || 0,
      communicationRating: impression.communicationRating || 0,
      recommendation: impression.recommendation || 'Maybe',
      skillRatings: (activeFeedback.technicalCompetency || []).map(s => ({
        skillName: s.skillName || s.skill,
        rating: s.rating || 0,
        notes: s.notes || s.note || ""
      })),
      technicalSkills,
      skillOrder,
      strengths: activeFeedback.strengths || [''],
      areasForImprovement: activeFeedback.areasForImprovement || [''],
      additionalComments: activeFeedback.additionalComments || activeFeedback.generalComments || "",
      cultureFit: impression.cultureFit || 0,
      willingnessToLearn: impression.willingnessToLearn || 0
    });
  }, [activeFeedback, feedbackData, isMockInterview]);

  const isReadOnly = true;

  // Context-specific variables for QuestionCard/TechnicalSkillsAssessment
  const questionsWithFeedback = useMemo(() => {
    const rawQF = activeFeedback?.questionFeedback || [];
    const interviewQuestions = feedbackData?.interviewQuestions || {};

    // Combine preselected + interviewer-added questions to get snapshots
    const allRoundQuestions = [
      ...(interviewQuestions.preselectedQuestions || []),
      ...(interviewQuestions.interviewerAddedQuestions || []),
    ];

    const questionDetailsMap = {};
    allRoundQuestions.forEach((q) => {
      const id = q.questionId || q._id;
      if (id) questionDetailsMap[id] = q.snapshot || q;
    });

    return (Array.isArray(rawQF) ? rawQF : []).map(qf => ({
      ...qf,
      snapshot: qf.snapshot || questionDetailsMap[qf.questionId] || {}
    }));
  }, [activeFeedback, feedbackData?.interviewQuestions]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Info */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formData.candidateName}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {formData.position}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formData.roundTitle}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
              Submitted
            </span>
          </div>
        </div>
      </div> */}

      {/* Multiple Feedback Tabs */}
      {feedbacks.length > 1 && (
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          {feedbacks.map((fb, idx) => (
            <button
              key={fb._id || idx}
              onClick={() => setActiveFeedbackIndex(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFeedbackIndex === idx
                ? "bg-white text-[rgb(33,121,137)] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Feedback from {fb.interviewerId?.name || `Interviewer ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Main Form Content - Exact Replication of FeedbackForm.jsx */}
      <div className="bg-white rounded-lg px-6 py-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 space-y-8">

          {/* Basic Information */}
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Candidate Name</label>
                <input type="text" disabled value={formData.candidateName} className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input type="text" disabled value={formData.position} className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Round Title</label>
                <input type="text" disabled value={formData.roundTitle} className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer Name</label>
                <input type="text" disabled value={formData.interviewerName} className="w-full px-3 py-2 border border-blue-50 bg-blue-50/20 text-gray-700 font-medium rounded-md cursor-not-allowed" />
              </div>
            </div>
          </div> */}

          {/* Technical Skills Assessment */}
          <div className="border-t border-gray-200 pt-8">
            <TechnicalSkillsAssessment
              formData={formData}
              setFormData={setFormData}
              isReadOnly={true}
            />
          </div>

          {/* Technical Competency Ratings */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Competency Ratings</h3>
            <div className="space-y-4">
              {formData.skillRatings.map((skill, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="text"
                        value={skill.skillName}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50"
                      />
                      <div className="flex items-center gap-2">
                        <StarRating rating={skill.rating} isReadOnly={true} />
                        <span className="text-sm text-gray-600 min-w-[50px]">
                          {skill.rating > 0 ? `${skill.rating}/5` : 'Rate'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={skill.notes}
                      readOnly
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Asked */}
          {/* <div className="border-t border-gray-200 pt-8">
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Questions Asked</label>
              <span className="text-xs text-gray-500 mt-1 block">
                {questionsWithFeedback.length} question(s) with feedback
              </span>
            </div>
            <div className="space-y-4">
              {questionsWithFeedback.length > 0 ? (
                questionsWithFeedback.map((question) => (
                  <QuestionCard
                    key={question.questionId || question._id}
                    question={question}
                    mode="view"
                    isViewMode={true}
                  />
                ))
              ) : (
                <EmptyState message="No questions available" subMessage="Questions with feedback will appear here" />
              )}
            </div>
          </div> */}

          {/* Strengths */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
            <div className="space-y-3">
              {formData.strengths.map((strength, index) => (
                <input
                  key={index}
                  type="text"
                  value={strength}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50"
                />
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
            <div className="space-y-3">
              {formData.areasForImprovement.map((area, index) => (
                <input
                  key={index}
                  type="text"
                  value={area}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50"
                />
              ))}
            </div>
          </div>

          {/* Additional Ratings */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Culture Fit</label>
                <div className="flex items-center gap-3">
                  <StarRating rating={formData.cultureFit} isReadOnly={true} />
                  <span className="text-sm text-gray-600">
                    {formData.cultureFit > 0 ? `${formData.cultureFit}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Willingness to Learn</label>
                <div className="flex items-center gap-3">
                  <StarRating rating={formData.willingnessToLearn} isReadOnly={true} />
                  <span className="text-sm text-gray-600">
                    {formData.willingnessToLearn > 0 ? `${formData.willingnessToLearn}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Rating</label>
                <div className="flex items-center gap-3">
                  <StarRating rating={formData.communicationRating} isReadOnly={true} />
                  <span className="text-sm text-gray-600">
                    {formData.communicationRating > 0 ? `${formData.communicationRating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                <div className="flex items-center gap-3">
                  <StarRating rating={formData.overallRating} size="lg" isReadOnly={true} />
                  <span className="text-sm text-gray-600">
                    {formData.overallRating > 0 ? `${formData.overallRating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation</label>
                <select disabled value={formData.recommendation} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Maybe">Maybe</option>
                  <option value="No Hire">No Hire</option>
                  <option value="Strong No Hire">Strong No Hire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Comments</h3>
            <textarea
              value={formData.additionalComments}
              readOnly
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-50"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
