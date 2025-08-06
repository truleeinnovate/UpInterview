import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const FeedbackForm = ({ tab, page, isEditMode }) => {
  const location = useLocation();
  const feedbackData = location.state?.feedback || {};
  const skillsData = feedbackData.skills || [];
  const overallImpressionTabData = feedbackData.overallImpression || {};

  const [overallRating, setOverallRating] = useState(overallImpressionTabData.overallRating || 0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [skillRatings, setSkillRatings] = useState(skillsData.map(skill => ({ skill: skill.skillName, rating: skill.rating, comments: skill.note })) || [{ skill: '', rating: 0, comments: '' }]);
  const [questionsAsked, setQuestionsAsked] = useState(['']);
  const [comments, setComments] = useState(overallImpressionTabData.note || '');
  const [recommendation, setRecommendation] = useState(overallImpressionTabData.recommendation || 'Maybe');

  const renderStarRating = (rating, setRating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-6 h-6 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
            disabled={!isEditMode}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleAddSkill = () => {
    if (isEditMode) {
      setSkillRatings([...skillRatings, { skill: '', rating: 0, comments: '' }]);
    }
  };

  const handleRemoveSkill = (index) => {
    if (isEditMode && skillRatings.length > 1) {
      setSkillRatings(skillRatings.filter((_, i) => i !== index));
    }
  };

  const handleSkillChange = (index, field, value) => {
    if (isEditMode) {
      const updatedSkills = skillRatings.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      );
      setSkillRatings(updatedSkills);
    }
  };

  const handleAddQuestion = () => {
    if (isEditMode) {
      setQuestionsAsked([...questionsAsked, '']);
    }
  };

  const handleRemoveQuestion = (index) => {
    if (isEditMode && questionsAsked.length > 1) {
      setQuestionsAsked(questionsAsked.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, value) => {
    if (isEditMode) {
      const updatedQuestions = questionsAsked.map((question, i) => 
        i === index ? value : question
      );
      setQuestionsAsked(updatedQuestions);
    }
  };

  const submitFeedback = () => {
    if (isEditMode) {
      const feedbackData = {
        overallRating,
        communicationRating,
        skillRatings,
        questionsAsked,
        comments,
        recommendation
      };
      console.log('Feedback submitted:', feedbackData);
      // Here you would typically send the data to your backend
      alert('Feedback submitted successfully!');
    }
  };

  const saveFeedback = async () => {
    if (isEditMode) {
      const feedbackData = {
        overallRating,
        communicationRating,
        skills: skillRatings.map(skill => ({
          skillName: skill.skill,
          rating: skill.rating,
          note: skill.comments
        })),
        questionFeedback: questionsAsked.map(question => ({
          question,
          answer: '',
          rating: 0
        })),
        generalComments: comments,
        overallImpression: {
          overallRating,
          recommendation,
          note: comments
        }
      };
      console.log('Feedback saved as draft:', feedbackData);
      
      try {
        // Assuming we have a feedback ID from the initial data
        const feedbackId = feedbackData._id || location.state?.feedback?._id;
        if (feedbackId) {
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/feedback/${feedbackId}`, feedbackData);
          if (response.data.success) {
            alert('Feedback saved as draft successfully!');
          } else {
            alert('Failed to save feedback as draft: ' + response.data.message);
          }
        } else {
          alert('No feedback ID found, cannot save draft.');
        }
      } catch (error) {
        console.error('Error saving feedback draft:', error);
        alert('Error saving feedback as draft.');
      }
    }
  };

  // Button component for consistency
  const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', style = {}, type = 'button' }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2 text-sm'
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={!isEditMode}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={style}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mx-4">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
        <h3 className="text-lg font-medium text-gray-900">Interview Feedback</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating {isEditMode && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            {renderStarRating(overallRating, setOverallRating)}
            <span className="ml-2 text-sm text-gray-600">{overallRating}/5</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Rating {isEditMode && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            {renderStarRating(communicationRating, setCommunicationRating)}
            <span className="ml-2 text-sm text-gray-600">{communicationRating}/5</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Skill Ratings {isEditMode && <span className="text-red-500">*</span>}
            </label>
            {isEditMode && (
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              size="sm"
              style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
              className="hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Skill
            </Button>
            )}
          </div>
          
          {isEditMode ? (
          <div className="space-y-3">
            {skillRatings.map((skill, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={skill.skill}
                    onChange={(e) => handleSkillChange(index, 'skill', e.target.value)}
                    disabled={!isEditMode}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Skill"
                  />
                  <div className="flex items-center">
                    {renderStarRating(skill.rating, (rating) => handleSkillChange(index, 'rating', rating))}
                    <span className="ml-2 text-sm text-gray-600">{skill.rating}/5</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={skill.comments}
                      onChange={(e) => handleSkillChange(index, 'comments', e.target.value)}
                      disabled={!isEditMode}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Comments"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 hover:text-red-700"
                      disabled={skillRatings.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="space-y-3">
  {skillRatings.map((skill, index) => (
    <div key={index} className="p-3 bg-gray-50 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="text-sm text-gray-800">
          {skill.skill}
        </div>
        <div className="flex items-center">
          {renderStarRating(skill.rating)}
          <span className="ml-2 text-sm text-gray-600">{skill.rating}/5</span>
        </div>
        <div className="text-sm text-gray-600">
          {skill.comments || 'No comments'}
        </div>
      </div>
    </div>
  ))}
</div>

          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Questions Asked {isEditMode && <span className="text-red-500">*</span>}
            </label>
            {isEditMode && (
            <Button
              type="button"
              onClick={handleAddQuestion}
              variant="outline"
              size="sm"
              style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
              className="hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Question
            </Button>
            )}
          </div>
          
          { isEditMode ? (
          <div className="space-y-2">
            {questionsAsked.map((question, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  disabled={!isEditMode}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Question asked"
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  disabled={questionsAsked.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          ) : (
            <div className="space-y-2">
  {questionsAsked.map((question, index) => (
    <div key={index} className="flex items-center space-x-2">
      <div className="text-sm text-gray-800">
        {question || "Not Provided"}
      </div>
    </div>
  ))}
</div>

          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Comments {isEditMode && <span className="text-red-500">*</span>}
          </label>
          { isEditMode ? (
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={!isEditMode}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            placeholder="Additional comments"
          />
          ) : (
            <div className="text-sm text-gray-800">
              {comments || "Not Provided"}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendation {isEditMode && <span className="text-red-500">*</span>}
          </label>
          { isEditMode ? (
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={!isEditMode}
          >
            <option value="Yes">Hire</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
          </select>
          ) : (
            <div className="text-sm text-gray-800">
              {recommendation || "Not Provided"}
            </div>
          )}
        </div>
        
      { isEditMode && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={saveFeedback}
            variant="outline"
            style={{ borderColor: 'rgb(33, 121, 137)', color: 'rgb(33, 121, 137)' }}
            className="hover:bg-gray-50"
          >
            Save Draft
          </Button>
          <Button
            onClick={submitFeedback}
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
            className="text-white hover:opacity-90"
          >
            Submit Feedback
          </Button>
        </div>
      )}
      </div>
    </div>
  );
};

export default FeedbackForm;